import { requirePublishedRubrique } from "@/lib/site/gates"

/**
 * Accueil — route and gate owned by #21; the homepage sections are ticket #23.
 *
 * The gate check comes first: if the Accueil gate is closed the route returns
 * the 404 page, never a hollow shell. #23 replaces the empty body with the
 * decided trames; it must keep the `requirePublishedRubrique` first line.
 */
export default async function Page() {
  await requirePublishedRubrique("accueil")
  return null
}
