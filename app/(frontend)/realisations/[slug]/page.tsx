import { requirePublishedCaseStudy } from "@/lib/site/gates"

/**
 * /realisations/{slug} — the gated named-case-study detail route (ticket #24).
 *
 * The data model for a named case study exists in the seam types
 * (`CaseStudyDocument`, `lib/content/types.ts`), but no record may publish
 * until three approved named case studies exist with their client permission,
 * rights-cleared cover and people releases (realisations strategy §4, content
 * model §5 `projects`). `CASE_STUDIES_LIVE` therefore stays false at P1:
 *
 * - `resolveRouteGate()` closes the family, so `proxy.ts` rewrites every
 *   `/realisations/{slug}` request to the server-rendered branded 404;
 * - `requirePublishedCaseStudy()` is the render-side guard (first statement, per
 *   content-seam §5) for any rendering that bypasses the proxy;
 * - the family is absent from navigation, the footer, the sitemap and every
 *   internal link, and this route renders no content at all.
 *
 * When the family opens, this file becomes the case-study trame — the guard is
 * the only place that decides renderability, so no page copy or sitemap entry
 * can appear before the gate and the permissions do.
 */
export default async function Page() {
  await requirePublishedCaseStudy()
  return null
}
