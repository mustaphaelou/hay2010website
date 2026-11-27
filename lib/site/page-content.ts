/**
 * Page-document lookup for page tickets — always through the content seam.
 *
 * Page files reach it through `lib/site/page-context.ts` after their gate guard
 * to read their own document (`title`, `description`, `blocks`). It never
 * touches a provider directly: `lib/content/index.ts` remains the only door to
 * content (docs/build/content-seam.md §1).
 */
import { getContentSource } from "@/lib/content"
import type { PageDocument, RubriqueKey } from "@/lib/content/types"

/** The page document for a rubrique key, or `null` when none exists. */
export async function getPageDocument(key: RubriqueKey): Promise<PageDocument | null> {
  const source = await getContentSource()
  return source.getPage(key)
}
