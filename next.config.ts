import type { NextConfig } from "next"

/**
 * `output: "standalone"` is only enabled for the Docker image build.
 *
 * Next.js 16 does not support `next start` with standalone output, and the merge
 * gate (`npm test`, scripts/test-http.mjs) serves the production build with
 * `next start`. The Dockerfile sets `NEXT_STANDALONE=1` for the image build, so
 * the deployed artefact is a standalone server (`node server.js`) while the suite
 * keeps the supported `next start` path. Do not "simplify" this to an
 * unconditional `output` — it breaks the harness (verified on Next 16.4.6).
 *
 * `NEXT_PUBLIC_SERVER_URL` is a public build-time value: the canonical site URL
 * used by metadata (#32). It is baked into the image by the Docker build arg.
 */
const nextConfig: NextConfig = {
  ...(process.env.NEXT_STANDALONE === "1"
    ? { output: "standalone" as const }
    : {}),
  // Do not advertise the framework in responses.
  poweredByHeader: false,
}

export default nextConfig
