import { COMPANY } from "@/lib/site/company"
import type { IntroBlock } from "@/lib/content/types"

/**
 * À propos — identity and positioning block.
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
