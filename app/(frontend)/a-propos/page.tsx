import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AProposIdentity } from "./sections"
import { getContentSource } from "@/lib/content"
import type { IntroBlock, PageDocument } from "@/lib/content/types"
import { requirePublishedRubrique } from "@/lib/site/gates"

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

/** The page document, read through the one content seam. */
async function getAProposDocument(): Promise<PageDocument | null> {
  const source = await getContentSource()
  return source.getPage(KEY)
}

/**
 * Unique metadata for the page. #32 completes the site-wide metadata system;
 * until then the page supplies its own keyword-led title and description from
 * the document, so the rendered head is already unique and truthful.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getAProposDocument()
  if (!page?.title) return {}

  return {
    title: `${page.title} — HAY2010`,
    description: page.description,
  }
}

export default async function Page() {
  await requirePublishedRubrique("a-propos")

  const page = await getAProposDocument()
  if (!page) notFound()

  return (
    <>
      {page.blocks.map((block, index) =>
        block.kind === "intro" ? (
          <AProposIdentity
            key={`${block.kind}-${index}`}
            title={page.title ?? ""}
            block={block as IntroBlock}
          />
        ) : null
      )}
    </>
  )
}
