import type { MetadataRoute } from "next"

import { isStaging } from "@/lib/flags"
import { SITE } from "@/lib/seo/site"

/**
 * `robots.txt` — production rules (ticket #32, docs/seo/seo-metadata.md §6.1).
 *
 * Production:
 * - allow the whole public site;
 * - disallow the developer surfaces `/admin`, `/api/` and `/preview/` (defence
 *   in depth: those also carry `X-Robots-Tag`/`noindex`);
 * - advertise the absolute apex `/sitemap.xml`;
 * - never disallow `/_next/`, `/og/`, CSS/JS/images (crawlers need them to
 *   render and preview) nor the dead WordPress paths: a `Disallow` would stop
 *   crawlers from seeing the 404/410 status codes, which are what retires them.
 *
 * Staging keeps #31's noindex posture: a disallow-all file with no sitemap line.
 * The staging `proxy.ts` short-circuit answers `/robots.txt` before this route
 * runs, so this branch is defence in depth if the matcher ever changes. The
 * environment is read through `lib/flags.isStaging` (`SITE_ENV`), never
 * inferred from `NODE_ENV` — a staging deployment runs a production build.
 *
 * No `Crawl-delay`, `Host`, `Request-Rate` or `Clean-param`; AI crawlers are
 * allowed at launch (one decision, not a hidden block list).
 */
export default function robots(): MetadataRoute.Robots {
  if (isStaging()) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/preview/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
