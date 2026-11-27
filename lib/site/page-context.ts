/**
 * Page context — a page's model and its resolved metadata, read once.
 *
 * Before this helper every P1 page called its document getter in the page body
 * and again inside a private `xSeo()` helper to feed `PageJsonLd`, so one
 * render read the same document twice (`/contact` also read it twice for
 * metadata). The helper returns both together: `generateMetadata` and the page
 * body each call it once.
 *
 * The metadata output is unchanged — the same phrase/description rules run
 * through `resolvePageSeo` — so titles, descriptions, canonicals and JSON-LD
 * stay byte-identical.
 */
import type {
  DomainDocument,
  PageDocument,
  RubriqueKey,
} from "@/lib/content/types"
import { resolvePageSeo, type PageSeo } from "@/lib/seo"
import { getDomainPath } from "@/lib/site/domaines"
import { getPageDocument } from "@/lib/site/page-content"
import { getRubrique } from "@/lib/site/rubriques"

/** A page model and the metadata resolved from it. */
export interface PageContext<TModel> {
  /** The content document, or `null` when the source has none for this key. */
  readonly model: TModel | null
  /** Resolved page metadata (title, description, canonical, WebPage type). */
  readonly seo: PageSeo
}

/** Options for a rubrique page's metadata (the defaults reproduce the SEO table). */
export interface RubriquePageContextOptions {
  /** Canonical path; defaults to the registry route of the rubrique. */
  readonly path?: string
  /** Use the document title as the SEO phrase (homepage brand-first title). */
  readonly phraseFromDocument?: boolean
  /** Code-owned description override (the Carrières F-113 variant). */
  readonly description?: string
}

/**
 * Read a rubrique page document and resolve its metadata, in one seam read.
 *
 * The page file keeps its `requirePublishedRubrique()` guard as the first
 * statement; this helper is the model/metadata half that follows it.
 */
export async function getRubriquePageContext(
  key: RubriqueKey,
  options: RubriquePageContextOptions = {}
): Promise<PageContext<PageDocument>> {
  const model = await getPageDocument(key)

  return {
    model,
    seo: resolvePageSeo({
      path: options.path ?? getRubrique(key).href,
      phrase: options.phraseFromDocument ? model?.title : undefined,
      description: options.description ?? model?.description,
    }),
  }
}

/** Resolve a published domain document's metadata (no extra seam read). */
export function domainPageSeo(domain: DomainDocument): PageSeo {
  return resolvePageSeo({
    path: getDomainPath(domain.slug),
    phrase: domain.title,
    description: domain.description,
  })
}
