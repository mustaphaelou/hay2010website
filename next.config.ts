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
 *
 * Legacy WordPress redirects (#32, docs/seo/seo-metadata.md §7.2): the 301 map
 * lives here because `redirects()` runs before `proxy.ts`, so a permanent
 * equivalent wins before any 410/query logic. `statusCode: 301` is deliberate —
 * `permanent: true` would emit 308. Both slash and no-slash sources are listed
 * so the redirect matches before Next's trailing-slash normaliser; `/contact`
 * itself is never a source (it is the 200 target). 410s cannot be expressed
 * here and live in `proxy.ts` (§7.3).
 */

/** One legacy equivalent kept for value: old path → decided new route. */
interface LegacyRedirect {
  readonly source: string
  readonly destination: string
}

const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  // Old pages → the P1 equivalents (both slash variants + case variants).
  { source: "/company", destination: "/a-propos" },
  { source: "/company/", destination: "/a-propos" },
  { source: "/services", destination: "/domaines-activite" },
  { source: "/services/", destination: "/domaines-activite" },
  // The four demo service children have no HAY2010 equivalent: the honest
  // destination is the domain index, which explains the four real services.
  { source: "/services/pre-construction", destination: "/domaines-activite" },
  { source: "/services/pre-construction/", destination: "/domaines-activite" },
  {
    source: "/services/general-construction",
    destination: "/domaines-activite",
  },
  {
    source: "/services/general-construction/",
    destination: "/domaines-activite",
  },
  { source: "/services/plumbing", destination: "/domaines-activite" },
  { source: "/services/plumbing/", destination: "/domaines-activite" },
  { source: "/services/painting", destination: "/domaines-activite" },
  { source: "/services/painting/", destination: "/domaines-activite" },
  // Portfolio archive `/project` is a 301; `/project/{slug}` records are 410s
  // in proxy.ts (§7.3), so the exact archive is listed before any wildcard.
  { source: "/projects", destination: "/realisations" },
  { source: "/projects/", destination: "/realisations" },
  { source: "/project", destination: "/realisations" },
  { source: "/project/", destination: "/realisations" },
  // Slash variant of the new contact page; `/contact` stays the 200 target.
  { source: "/contact/", destination: "/contact" },
  // Old sitemap surfaces → the one canonical sitemap.
  { source: "/sitemaps.xml", destination: "/sitemap.xml" },
  { source: "/sitemaps.xml/", destination: "/sitemap.xml" },
  { source: "/sitemap_index.xml", destination: "/sitemap.xml" },
  { source: "/sitemap_index.xml/", destination: "/sitemap.xml" },
  { source: "/wp-sitemap.xml", destination: "/sitemap.xml" },
  { source: "/wp-sitemap.xml/", destination: "/sitemap.xml" },
  { source: "/page-sitemap1.xml", destination: "/sitemap.xml" },
  { source: "/page-sitemap1.xml/", destination: "/sitemap.xml" },
  { source: "/post-sitemap1.xml", destination: "/sitemap.xml" },
  { source: "/post-sitemap1.xml/", destination: "/sitemap.xml" },
  { source: "/category-sitemap1.xml", destination: "/sitemap.xml" },
  { source: "/category-sitemap1.xml/", destination: "/sitemap.xml" },
  // File paths with a trailing slash normalise to the file (§7.5).
  { source: "/robots.txt/", destination: "/robots.txt" },
  { source: "/sitemap.xml/", destination: "/sitemap.xml" },
] as const

/*
 * The case variants (`/Company/`, `/SERVICES/`, `/PROJECTS/`, `/CONTACT/`) and
 * the legacy query redirects (`/?p=143`, `/?s=…`) are handled in `proxy.ts`
 * instead: Next's redirect sources match case-insensitively, so a `/CONTACT`
 * source would also match `/contact` and self-redirect, and a redirect cannot
 * drop the incoming query string. Both need exact path matching and a clean
 * `Location`, which the proxy gives.
 */

const nextConfig: NextConfig = {
  ...(process.env.NEXT_STANDALONE === "1"
    ? { output: "standalone" as const }
    : {}),
  // Do not advertise the framework in responses. This also suppresses Payload's
  // `X-Powered-By: Next.js, Payload` header on purpose: the site does not
  // advertise its stack (the verification suite asserts its absence).
  poweredByHeader: false,
  // The canonical form has no trailing slash (§2.3). The automatic normaliser
  // is disabled so the explicit legacy slash sources above can answer with a
  // single 301 instead of a 308→301 chain; `proxy.ts` then applies the generic
  // 308 normalisation for every other path (§2.3, §7.7).
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
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
  async redirects() {
    return [
      ...LEGACY_REDIRECTS.map((redirect) => ({
        source: redirect.source,
        destination: redirect.destination,
        statusCode: 301 as const,
      })),
    ]
  },
  async headers() {
    // Developer surfaces are never indexable: defense in depth with robots.txt
    // and the admin layout's `noindex` (SEO §3.8/§6.3). Public pages carry no
    // X-Robots-Tag; staging adds it to every response in proxy.ts.
    return ["/admin/:path*", "/api/:path*", "/preview/:path*"].map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }))
  },
}

export default withPayload(nextConfig)
