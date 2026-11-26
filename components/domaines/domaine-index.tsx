import type { DomainDocument, PageDocument } from "@/lib/content/types"

import { DomaineList } from "@/components/domaines/domaine-list"

/**
 * The `/domaines-activite` index body.
 *
 * Short presentation from the page document, then the published-domain list.
 * The index deliberately carries no card grid, no calls to action that the
 * content does not define, and no mention of a gated domain: the list is
 * whatever the seam publishes (docs/build/content-seam.md §5).
 */
export function DomaineIndex({
  page,
  domains,
}: {
  readonly page: PageDocument
  readonly domains: readonly DomainDocument[]
}) {
  const paragraphs = page.blocks.flatMap((block) =>
    block.kind === "intro" ? block.paragraphs : []
  )
  const showsDomainList = page.blocks.some((block) => block.kind === "domaines")

  return (
    <article className="mx-auto max-w-[1440px] px-5 pt-16 pb-24 lg:px-10 lg:pt-24 lg:pb-32">
      <div className="max-w-[46rem]">
        <h1 className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] font-light tracking-[-0.03em] text-ink">
          {page.title}
        </h1>

        {paragraphs.length > 0 ? (
          <div className="mt-8 space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? "text-lg leading-relaxed text-ink lg:text-xl"
                    : "text-lg leading-relaxed text-body"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      {showsDomainList ? <DomaineList domains={domains} /> : null}
    </article>
  )
}
