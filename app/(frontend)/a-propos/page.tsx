import { requirePublishedRubrique } from "@/lib/site/gates"

/**
 * À propos — gate-guarded stub shipped by #21; the page trames and copy are
 * ticket #25. Returning `null` is deliberate: no placeholder or "coming soon"
 * content, and the page still renders the real shell and metadata.
 */
export default async function Page() {
  await requirePublishedRubrique("a-propos")
  return null
}
