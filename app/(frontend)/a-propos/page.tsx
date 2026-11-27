import type { Metadata } from "next"

import { AProposChapter, AProposContactCta, AProposIdentity } from "./sections"
import { PageJsonLd } from "@/components/seo/page-json-ld"
import { getContentSource } from "@/lib/content"
import type { ContentLink, PageDocument, SectionsBlock } from "@/lib/content/types"
import { pageMetadata } from "@/lib/seo"
import { requirePublishedRubrique } from "@/lib/site/gates"
import { getRubriquePageContext } from "@/lib/site/page-context"
import { getRubrique } from "@/lib/site/rubriques"

/**
 * À propos — the institutional page (ticket #25).
 *
 * Trame (spec §"Static rubriques"): identity and positioning, activity and
 * perimeter, mission/vision/values, then the qualité/sécurité/conformité block.
 * Copy is content-owned (`content/fixtures/site.json` today, CMS from #29/#30);
 * the cleared claims (experience line, gérant line) stay code-owned in
 * `lib/site/company.ts`. No history claim, no team block, no photograph and no
 * certification claim is rendered while the facts register gates them.
 */

const KEY = "a-propos" as const

/**
 * A published page cannot ship without its title and description (SEO §3.5):
 * throw so a broken corpus fails the build instead of rendering an empty head.
 */
function requireCopy(
  page: PageDocument | null
): PageDocument & { readonly title: string; readonly description: string } {
  if (!page?.title || !page.description) {
    throw new Error(
      "The « À propos » document must carry a title and a description (docs/seo/seo-metadata.md §3)."
    )
  }
  return page as PageDocument & {
    readonly title: string
    readonly description: string
  }
}

/**
 * Extension point — the canonical certifications link (documented for the P2
 * « Références et partenaires » ticket).
 *
 * IA §Références et partenaires: certifications and agréments live canonically
 * in that P2 rubrique, and À propos carries a short link to it. At P1 the
 * rubrique is closed and has no page document, so this returns `null` and the
 * qualité/sécurité/conformité block renders no link at all — never a link to an
 * unpublished or unbuilt route.
 *
 * When the rubrique ships, publishing it in the content source AND giving it a
 * page document is enough for the link to appear: no code change is needed, and
 * the gate stays authoritative. The link is code-owned (registry label and
 * href), not a CMS field, so the owner can never point it somewhere else.
 */
async function getCertificationsLink(): Promise<ContentLink | null> {
  const source = await getContentSource()
  const [state, document] = await Promise.all([
    source.getPublishState("references-et-partenaires"),
    source.getPage("references-et-partenaires"),
  ])

  if (!state.published || !document) return null

  const rubrique = getRubrique("references-et-partenaires")
  return { label: rubrique.title, href: rubrique.href }
}

/**
 * The page model and its metadata, read once (#32). The keyword-led title
 * phrase is the code-owned launch default (SEO §3.3 adapted to `/a-propos`);
 * the description is the page model's decided copy.
 */
async function aProposContext() {
  return getRubriquePageContext(KEY)
}

export async function generateMetadata(): Promise<Metadata> {
  const { model, seo } = await aProposContext()
  requireCopy(model)
  return pageMetadata(seo)
}

/** A chapter block that can actually render (DEV-006: never a placeholder). */
type RenderableChapter = SectionsBlock & { readonly title: string }

function isRenderableChapter(
  block: PageDocument["blocks"][number]
): block is RenderableChapter {
  return (
    block.kind === "sections" &&
    typeof block.title === "string" &&
    block.title.length > 0 &&
    block.items.length > 0
  )
}

export default async function Page() {
  await requirePublishedRubrique("a-propos")

  const [{ model, seo }, certificationsLink] = await Promise.all([
    aProposContext(),
    getCertificationsLink(),
  ])
  const page = requireCopy(model)
  const chapters = page.blocks.filter(isRenderableChapter)

  return (
    <>
      <PageJsonLd seo={seo} />
      {page.blocks.map((block, blockIndex) => {
        if (block.kind === "intro") {
          return (
            <AProposIdentity
              key={`intro-${blockIndex}`}
              title={page.title}
              block={block}
            />
          )
        }

        if (isRenderableChapter(block)) {
          // Trame order (spec §"Static rubriques"): activity/perimeter first,
          // then mission/vision/values, then qualité/sécurité/conformité.
          const chapterIndex = chapters.indexOf(block)
          const isActivity = chapterIndex === 0
          // Design-owned trame rhythm: ink activity band, paper values, ink
          // compliance band. The content source never carries design decisions.
          const tone = chapterIndex % 2 === 0 ? "ink" : "paper"

          return (
            <AProposChapter
              key={`sections-${chapterIndex}`}
              title={block.title}
              items={block.items}
              index={chapterIndex}
              tone={tone}
              columns={isActivity ? 2 : 1}
              // The trame's third chapter is the qualité/sécurité/conformité
              // block, where IA §Références places the canonical certifications
              // link once that P2 page is live.
              certifications={
                chapterIndex === 2 ? (certificationsLink ?? undefined) : undefined
              }
            />
          )
        }

        if (block.kind === "contact-cta") {
          return <AProposContactCta key={`cta-${blockIndex}`} block={block} />
        }

        return null
      })}
    </>
  )
}
