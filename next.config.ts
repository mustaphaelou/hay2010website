import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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

export default nextConfig
