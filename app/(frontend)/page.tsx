import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageJsonLd } from "@/components/seo/page-json-ld"
import { HomePage } from "@/components/home/home-page"
import { getContentSource } from "@/lib/content"
import type { ContentLink, HeroBlock, PageDocument } from "@/lib/content/types"
import { getPublishedDomains } from "@/lib/site/domaines"
import { requirePublishedRubrique } from "@/lib/site/gates"
import { getRubriquePageContext } from "@/lib/site/page-context"
import { getPublishedRubriques } from "@/lib/site/rubriques"
import { pageMetadata } from "@/lib/seo"

/**
 * Accueil — the homepage (ticket #23).
 *
 * Composition per the cahier des charges, decided as variant A
 * (docs/homepage/README.md): hero (licensed documentary image when the content
 * carries one, typographic ink fallback otherwise) → intro → domain blocks →
 * repères → réalisations teaser → text-only engagements → contact CTA. No
 * careers teaser, no news teaser, no video, no selected-project cards.
 *
 * Everything content-like comes through the one content seam: the page document
 * (copy and blocks), the published domain set (domain blocks) and the media
 * record (hero photograph, only when rights-cleared). The published set also
 * decides whether the intro links À propos, so a closed gate can never leak
 * from the homepage.
 */

const KEY = "accueil" as const

/** A published page cannot ship without its title and description (SEO §3.5). */
function requireCopy(
  page: PageDocument | null
): PageDocument & { readonly title: string; readonly description: string } {
  if (!page?.title || !page.description) {
    throw new Error(
      "The « Accueil » document must carry a title and a description (docs/seo/seo-metadata.md §3)."
    )
  }
  return page as PageDocument & {
    readonly title: string
    readonly description: string
  }
}

/**
 * The page model and its metadata, read once. SEO §3.2/§3.3 fix the homepage
 * title as an absolute brand-first string (`HAY2010 — <phrase>`) and a 120–160
 * character description: the phrase and the description come from the page
 * model, the template/canonical/OG rules are `lib/seo`'s (#32).
 */
async function homepageContext() {
  return getRubriquePageContext(KEY, { path: "/", phraseFromDocument: true })
}

export async function generateMetadata(): Promise<Metadata> {
  const { model, seo } = await homepageContext()
  requireCopy(model)
  return pageMetadata(seo)
}

export default async function Page() {
  await requirePublishedRubrique("accueil")

  const source = await getContentSource()
  const [{ model, seo }, domains, rubriques] = await Promise.all([
    homepageContext(),
    getPublishedDomains(),
    getPublishedRubriques(),
  ])
  if (!model) notFound()

  const homepage = requireCopy(model)
  const heroBlock =
    homepage.blocks.find(
      (block): block is HeroBlock => block.kind === "hero"
    ) ?? null

  // Only a rights-cleared record leaves the seam; otherwise the hero falls back
  // to type on ink — never to a stock, generated or placeholder image.
  const heroMedia = heroBlock?.mediaId
    ? await source.getMedia(heroBlock.mediaId)
    : null

  // The intro link is code-owned and gated by the published set: while À propos
  // is closed the homepage renders no link to it (docs/build/content-seam.md §5).
  const aPropos = rubriques.find((rubrique) => rubrique.key === "a-propos")
  const aProposLink: ContentLink | null = aPropos
    ? { label: aPropos.navLabel, href: aPropos.href }
    : null

  return (
    <>
      <PageJsonLd seo={seo} />
      <HomePage
        page={homepage}
        domains={domains}
        heroMedia={heroMedia}
        aProposLink={aProposLink}
      />
    </>
  )
}
