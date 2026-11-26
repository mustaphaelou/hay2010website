import Link from "next/link"

import { COMPANY } from "@/lib/site/company"
import type {
  ContactCtaBlock,
  ContentLink,
  IntroBlock,
  TitledItem,
} from "@/lib/content/types"
import { cn } from "@/lib/utils"

/**
 * À propos — the institutional trame.
 *
 * Rendering is trame-oriented: prose comes from the content source, the
 * cleared claims around it (experience line, gérant line) are code-owned. No
 * section is ever rendered empty: a block without copy is omitted rather than
 * filled with a placeholder (spec rule DEV-006).
 */

/** Stable section heading ids, used by `aria-labelledby` on each landmark. */
function chapterId(index: number): string {
  return `a-propos-chapitre-${index + 1}`
}

/**
 * Identity and positioning block — the page opener.
 *
 * The prose is content-owned (fixture today, CMS from #29/#30); the approved
 * claims around it are code-owned: the experience line and the gérant line come
 * from `lib/site/company.ts` so the owner can never edit or extend them. The
 * gérant line is rendered name-and-title only — no portrait, no quote, no
 * biography, no dedicated page (facts register §2.1).
 */
export function AProposIdentity({
  title,
  block,
}: {
  title: string
  block: IntroBlock
}) {
  const [lead, ...body] = block.paragraphs

  return (
    <section aria-labelledby="a-propos-titre" className="bg-surface">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-12 md:gap-8 md:px-10 md:py-24">
        <div className="md:col-span-4">
          <div className="h-px w-12 bg-ink" aria-hidden="true" />
          <h1
            id="a-propos-titre"
            className="mt-6 text-[clamp(42px,6vw,84px)] leading-[0.96] font-light tracking-[-0.035em] text-ink"
          >
            {title}
          </h1>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          {lead ? (
            <p className="text-[clamp(22px,2.6vw,34px)] leading-[1.24] font-light tracking-[-0.02em] text-ink">
              {lead}
            </p>
          ) : null}

          {body.length > 0 ? (
            <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-body md:text-base">
              {body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {/*
           * Cleared facts rail: both strings are code-owned and approved
           * (facts register §2.1/§2.2), so they can never drift with copy edits.
           */}
          <p className="mt-10 border-t border-line pt-6 text-[13.5px] font-medium text-ink">
            {COMPANY.experienceLine} · {COMPANY.base}
          </p>

          {/*
           * Direction line, exactly as cleared. It stays a plain sentence, never
           * a card: no photo, quote, biography or "mot du gérant" page exists.
           */}
          <p className="mt-2 text-[13.5px] leading-relaxed text-body">
            {COMPANY.gerantLine}
          </p>
        </div>
      </div>
    </section>
  )
}

/**
 * One trame chapter: activity/perimeter, mission/vision/values, or the
 * qualité/sécurité/conformité block.
 *
 * Tones alternate across the trame (ink / paper / ink) to reuse the site's
 * section rhythm; the tone and the column count are design-owned and passed by
 * the page, never stored in the content source.
 */
export function AProposChapter({
  title,
  items,
  index,
  tone,
  columns = 1,
  certifications,
}: {
  title: string
  items: readonly TitledItem[]
  index: number
  tone: "paper" | "ink"
  columns?: 1 | 2
  /**
   * Extension point owned by the page: the canonical certifications link,
   * supplied only when the Références et partenaires rubrique is published and
   * has a page document. Absent at P1, so nothing renders here.
   */
  certifications?: ContentLink
}) {
  const ink = tone === "ink"
  const id = chapterId(index)
  const twoColumns = columns === 2

  return (
    <section
      aria-labelledby={id}
      className={cn(ink ? "bg-ink text-surface" : "bg-background text-ink")}
    >
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <p
              aria-hidden="true"
              className={cn(
                "text-[10.5px] font-semibold tracking-[0.2em] uppercase",
                ink ? "text-orange" : "text-copper"
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2
              id={id}
              className="mt-4 max-w-[18ch] text-[clamp(30px,4vw,54px)] leading-[1.02] font-light tracking-[-0.03em]"
            >
              {title}
            </h2>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <ul
              className={cn(
                twoColumns ? "grid gap-x-10 gap-y-8 sm:grid-cols-2" : "space-y-8"
              )}
            >
              {items.map((item) => (
                <li
                  key={item.title}
                  className={cn(
                    "border-t pt-5",
                    ink ? "border-surface/15" : "border-line"
                  )}
                >
                  <h3
                    className={cn(
                      "text-[17px] font-medium tracking-[-0.01em] md:text-[18px]",
                      ink ? "text-surface" : "text-ink"
                    )}
                  >
                    {item.title}
                  </h3>
                  {item.body ? (
                    <p
                      className={cn(
                        "mt-3 max-w-[52ch] text-[14px] leading-relaxed",
                        ink ? "text-surface/65" : "text-body"
                      )}
                    >
                      {item.body}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>

            {certifications ? (
              <p className="mt-10">
                <Link
                  href={certifications.href}
                  className={cn(
                    "inline-flex items-center gap-2 border-b pb-1 text-[13px] font-medium transition-colors",
                    ink
                      ? "border-surface/40 text-surface hover:border-surface"
                      : "border-ink/30 text-ink hover:border-ink"
                  )}
                >
                  {certifications.label}
                  <span aria-hidden="true">→</span>
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Closing call to the cleared contact channel (Contact is published at P1). */
export function AProposContactCta({ block }: { block: ContactCtaBlock }) {
  const id = "a-propos-contact"

  return (
    <section aria-labelledby={id} className="bg-orange text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-10 md:py-20">
        <div>
          <h2
            id={id}
            className="max-w-[22ch] text-[clamp(28px,3.4vw,46px)] leading-[1.05] font-light tracking-[-0.03em]"
          >
            {block.title}
          </h2>
          {block.body ? (
            <p className="mt-4 max-w-[48ch] text-[14px] leading-relaxed text-ink/75">
              {block.body}
            </p>
          ) : null}
        </div>

        {block.link ? (
          <Link
            href={block.link.href}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-surface transition-colors hover:bg-surface hover:text-ink"
          >
            {block.link.label}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </section>
  )
}
