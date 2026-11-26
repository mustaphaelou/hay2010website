import { withPayload } from "@payloadcms/next/withPayload"
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
 * used by metadata (#32) and by Payload's `serverURL` (admin cookie/CSRF origin).
 * It is baked into the image by the Docker build arg.
 *
 * The config is wrapped in `withPayload` (#29) because the embedded Payload
 * admin lives in this app (`app/(payload)`). It injects the empty `turbopack`
 * key Next 16 requires next to a `webpack` function, the `serverExternalPackages`
 * required by Payload's server packages (graphql, drizzle-kit, sharp, …) and the
 * admin theme negotiation headers. Do NOT hand-roll those, and do not add a
 * `webpack` block of your own.
 */
const nextConfig: NextConfig = {
  ...(process.env.NEXT_STANDALONE === "1"
    ? { output: "standalone" as const }
    : {}),
  // Do not advertise the framework in responses. This also suppresses Payload's
  // `X-Powered-By: Next.js, Payload` header on purpose: the site does not
  // advertise its stack (the verification suite asserts its absence).
  poweredByHeader: false,
  experimental: {
    /**
     * The app has no root `app/layout.tsx` (the embedded Payload admin in #29
     * brings its own root layout inside `app/(payload)`), so Next.js cannot
     * compose a global 404 from a single layout. This flag makes
     * `app/global-not-found.tsx` the routed 404 document for unmatched URLs;
     * `proxy.ts` rewrites closed gates to `/_not-found`, which serves the same
     * document with a 404 status.
     */
    globalNotFound: true,
  },
}

export default withPayload(nextConfig)
