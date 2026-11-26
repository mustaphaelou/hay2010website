# syntax=docker/dockerfile:1
#
# HAY2010 — production image.
#
# Decision: docs/hosting/deployment-decision.md §5. One ARM64 image, built in CI
# on `ubuntu-24.04-arm` (no QEMU, never `--platform=linux/amd64`), pushed to GHCR
# and pulled by Coolify. This file is architecture-neutral: it builds natively for
# whatever architecture the builder runs. `REQUIRE_ARM64=1` (set by CI) fails the
# build when the runner is not arm64, so a mislabelled runner cannot publish an
# amd64 image for an ARM64 host.
#
# Base image: node:22-bookworm-slim. Payload 3 requires Node >= 22.23.5; this base
# resolved to v22.23.5 when verified on 2026-11-26 — keep it at or above that
# floor and record the resolved version when bumping. Debian/glibc, not Alpine,
# so the prebuilt `sharp`/`@tailwindcss/oxide`/`@next/swc` binaries are used.

# ---------------------------------------------------------------------------
# Dependencies — full install (build needs devDependencies: TypeScript/Tailwind).
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ---------------------------------------------------------------------------
# Build — emits .next/standalone (only because NEXT_STANDALONE=1 is set).
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_STANDALONE=1
# Public, non-secret values baked into the build. SITE_ENV, FORMS_ENABLED and
# every secret are runtime variables set in Coolify: never bake them here.
ARG NEXT_PUBLIC_SERVER_URL=""
ARG APP_VERSION="dev"
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL} \
    APP_VERSION=${APP_VERSION}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Guard against a mislabelled runner publishing an amd64 image for an arm64 host.
ARG REQUIRE_ARM64=0
RUN node -e "if (process.env.REQUIRE_ARM64 === '1' && process.arch !== 'arm64') { console.error('expected arm64, got ' + process.arch); process.exit(1) }" \
 && npm run build

# ---------------------------------------------------------------------------
# Migrator — NOT part of the runtime image.
#
# With `output: "standalone"` the deployed image contains only traced runtime
# files: no Payload CLI, no `payload.config.ts`, no migration files. So Payload
# migrations cannot run in the app image and must never run on app start
# (decision §6.3). When #29/#30 land, build this stage as a separate tag and run
# it once before the new app container takes traffic:
#
#   docker build --target migrator -t <image>:<sha>-migrate .
#   docker run --rm --env-file … <image>:<sha>-migrate npx payload migrate
#
# Keep it before the runtime stage: the last stage is the default build target.
# ---------------------------------------------------------------------------
FROM builder AS migrator
WORKDIR /app
ENV NODE_ENV=production
CMD ["npx", "payload", "migrate"]

# ---------------------------------------------------------------------------
# Runtime — non-root, standalone server only, no build toolchain.
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ARG APP_VERSION="dev"
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    APP_VERSION=${APP_VERSION}

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs --home-dir /app nextjs \
 && mkdir -p /app/.next/cache \
 && chown -R nextjs:nodejs /app

# standalone output = server.js + traced node_modules. Next does not copy
# .next/static or public into it, so they are added here.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# The runtime image has no curl/wget, so the probe uses node's fetch.
# Either keep Coolify's dashboard health check disabled (Docker then uses this
# HEALTHCHECK) or configure a Coolify CMD check with the same command.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "server.js"]
