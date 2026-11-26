import { requirePublishedRubrique } from "@/lib/site/gates"

/**
 * Domaines d'activité — index stub shipped by #21; the index and its published
 * domain list are ticket #22. The gate check keeps the route absent when the
 * rubrique is closed.
 */
export default async function Page() {
  await requirePublishedRubrique("domaines-activite")
  return null
}
