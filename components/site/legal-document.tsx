import { LegalIdentityBlock } from "@/components/site/legal-identity"
import { LegalParagraphText } from "@/components/site/legal-text"
import { LAST_REVIEWED_LABEL } from "@/lib/legal/identity"
import { frenchTypography } from "@/lib/legal/typography"
import type {
  LegalBlock,
  LegalDocument,
  LegalTableBlock,
} from "@/lib/legal/types"

/**
 * The legal-notice renderer (ticket #28): one narrow printed-document column in
 * the site shell, sections numbered in code so the approved copy carries no
 * fragile section numbers, and no component of its own outside the brand
 * palette (ink / paper / body / line / orange / copper).
 *
 * It renders `LegalDocument` data only. The data is code-owned (`lib/legal/`),
 * never fetched from the content source, which is what makes the identity
 * block and the approved prose impossible to edit from the admin (#30).
 */

const bodyClassName = "text-[15px] leading-relaxed text-body sm:text-base"
const sectionHeadingClassName =
  "text-[clamp(20px,2.2vw,26px)] font-medium leading-tight tracking-[-0.01em] text-ink"
const subsectionHeadingClassName =
  "text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink"

function LegalTable({ block }: { readonly block: LegalTableBlock }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left text-[14px] leading-relaxed text-body">
        <caption className="sr-only">{frenchTypography(block.caption)}</caption>
        <thead>
          <tr className="border-b border-line">
            {block.head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="py-3 pr-4 align-bottom font-medium text-ink last:pr-0"
              >
                {frenchTypography(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr
              key={`row-${rowIndex}`}
              className="border-b border-line last:border-b-0"
            >
              {row.map((cell, cellIndex) => (
                <td key={`cell-${cellIndex}`} className="py-3 pr-4 align-top last:pr-0">
                  {frenchTypography(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Render the blocks of one section. Subsection numbers are derived here
 * (`2.1`, `2.2`, …) instead of being typed into the approved copy, so the
 * headings stay stable if a section is ever added.
 */
function SectionBlocks({
  blocks,
  sectionNumber,
}: {
  readonly blocks: readonly LegalBlock[]
  readonly sectionNumber: number
}) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "paragraphs":
            return (
              <div key={index} className="mt-5 space-y-4">
                {block.items.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className={bodyClassName}>
                    <LegalParagraphText paragraph={paragraph} />
                  </p>
                ))}
              </div>
            )
          case "list":
            return (
              <ul key={index} className={`mt-5 list-disc space-y-2 pl-5 ${bodyClassName}`}>
                {block.items.map((paragraph, paragraphIndex) => (
                  <li key={paragraphIndex}>
                    <LegalParagraphText paragraph={paragraph} />
                  </li>
                ))}
              </ul>
            )
          case "last-reviewed":
            return (
              <p key={index} className={`mt-5 ${bodyClassName}`}>
                {frenchTypography("Dernière mise à jour :")} {LAST_REVIEWED_LABEL}.
              </p>
            )
          case "identity":
            return <LegalIdentityBlock key={index} variant={block.variant} />
          case "table":
            return <LegalTable key={index} block={block} />
          case "subsection": {
            // Pure derivation (no render-time mutation): the n-th subsection
            // of this section is `2.1`, `2.2`, …
            const subsectionNumber =
              blocks
                .slice(0, index)
                .filter((candidate) => candidate.kind === "subsection").length + 1
            return (
              <div key={index} className="mt-8">
                <h3 className={subsectionHeadingClassName}>
                  {`${sectionNumber}.${subsectionNumber} `}
                  {frenchTypography(block.heading)}
                </h3>
                <SectionBlocks blocks={block.blocks} sectionNumber={sectionNumber} />
              </div>
            )
          }
        }
      })}
    </>
  )
}

/** A complete legal page: title, review date, intro and numbered sections. */
export function LegalPage({ document }: { readonly document: LegalDocument }) {
  return (
    <article className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="max-w-[70ch]">
        <p className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase">
          Informations légales
        </p>

        <h1 className="mt-4 text-[clamp(32px,4.6vw,56px)] font-light leading-[1.02] tracking-[-0.03em] text-ink">
          {frenchTypography(document.title)}
        </h1>

        <p className="mt-5 text-[13px] text-body">
          {frenchTypography("Dernière mise à jour :")} {LAST_REVIEWED_LABEL}
        </p>

        {document.intro ? (
          <div className="mt-8 space-y-4">
            {document.intro.map((paragraph, index) => (
              <p key={index} className={bodyClassName}>
                <LegalParagraphText paragraph={paragraph} />
              </p>
            ))}
          </div>
        ) : null}

        <hr className="mt-10 border-line" />

        <div className="mt-10 space-y-12">
          {document.sections.map((section, index) => (
            <section
              key={section.id ?? section.heading}
              id={section.id}
              className="scroll-mt-28"
            >
              <h2 className={sectionHeadingClassName}>
                {index + 1}. {frenchTypography(section.heading)}
              </h2>
              <SectionBlocks blocks={section.blocks} sectionNumber={index + 1} />
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
