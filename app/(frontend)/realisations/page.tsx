import { requirePublishedRubrique } from "@/lib/site/gates"

/**
 * Réalisations — gate-guarded stub shipped by #21; the credentials-led page is
 * ticket #24. The fiche route `/realisations/{slug}` stays absent (gated off)
 * until three approved named case studies exist.
 */
export default async function Page() {
  await requirePublishedRubrique("realisations")
  return null
}
