import Link from "next/link"

import type {
  ContactCtaBlock,
  ContentLink,
  CredentialsBlock,
  DomainDocument,
  DomainesBlock,
  EngagementsBlock,
  FactItem,
  IntroBlock,
} from "@/lib/content/types"

/**
 * The non-hero sections of the Accueil trame (ticket #23), in CDC order:
 *
 *   intro → domain blocks → repères → réalisations teaser → engagements
 *   → contact CTA
 *
 * Prose, domain facts and links come from the content source; the section
 * labels of the fixed CDC trame are code-owned interface copy (like the domain
 * page trame labels) and never CMS-editable. Absent blocks are simply not
 * rendered (DEV-006): there is no placeholder frame and no empty section.
 */
const LABELS = {
  intro: "Qui sommes-nous",
  domainesFallback: "Nos domaines d’activité",
  reperes: "Repères",
  realisations: "Réalisations",
  engagements: "Nos engagements",
} as const

/** Short company introduction with the link to the published À propos page. */
export function HomeIntro({
  block,
  link,
}: {
  readonly block: IntroBlock
  /** Code-owned link to À propos, absent while that gate is closed. */
  readonly link: ContentLink | null
}) {
  const [lead, ...body] = block.paragraphs

  return (
    <section aria-labelledby="accueil-intro" className="bg-surface">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-12 md:gap-8 md:px-10 md:py-24">
        <div className="md:col-span-3">
          <h2
            id="accueil-intro"
            className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase"
          >
            {LABELS.intro}
          </h2>
          <div aria-hidden="true" className="mt-4 h-px w-10 bg-ink" />
        </div>

        <div className="md:col-span-8 md:col-start-5">
          {lead ? (
            <p className="text-[clamp(20px,2.6vw,32px)] leading-[1.3] font-light tracking-[-0.02em] text-ink">
              {lead}
            </p>
          ) : null}

          {body.length > 0 ? (
            <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-body md:text-base">
              {body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {link ? (
            <Link
              href={link.href}
              className="mt-8 inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              {link.label}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/**
 * The published domain blocks. The list is whatever the seam publishes, so a
 * gated domain is absent by construction — the homepage links no gated route.
 */
export function HomeDomaines({
  block,
  domains,
}: {
  readonly block: DomainesBlock
  readonly domains: readonly DomainDocument[]
}) {
  if (domains.length === 0) return null

  return (
    <section aria-labelledby="accueil-domaines" className="bg-ink text-surface">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <h2
          id="accueil-domaines"
          className="max-w-[18ch] text-[clamp(30px,4vw,54px)] leading-[1.02] font-light tracking-[-0.03em]"
        >
          {block.title ?? LABELS.domainesFallback}
        </h2>

        <ul className="mt-10 border-t border-surface/15">
          {domains.map((domain, index) => (
            <li key={domain.slug} className="border-b border-surface/15">
              <Link
                href={`/domaines-activite/${domain.slug}`}
                className="group flex items-baseline justify-between gap-6 py-6"
              >
                <div className="flex items-baseline gap-5">
                  <span
                    aria-hidden="true"
                    className="text-[10.5px] font-semibold tracking-[0.2em] text-orange uppercase"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium tracking-[-0.01em] text-surface lg:text-xl">
                      {domain.title}
                    </h3>
                    {domain.summary ? (
                      <p className="mt-2 max-w-[56ch] text-[14px] leading-relaxed text-surface/60">
                        {domain.summary}
                      </p>
                    ) : null}
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className="text-surface/40 transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/**
 * Repères band — only the facts the facts register clears. The band renders
 * what the content supplies and nothing else: no counter, no invented figure.
 */
export function HomeReperes({
  items,
}: {
  readonly items: readonly FactItem[]
}) {
  if (items.length === 0) return null

  return (
    <section
      aria-labelledby="accueil-reperes"
      className="border-y border-line bg-surface"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-10 md:py-12">
        <h2
          id="accueil-reperes"
          className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase"
        >
          {LABELS.reperes}
        </h2>

        <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="border-t border-line pt-3"
            >
              <dt className="text-[10.5px] font-medium tracking-[0.18em] text-body uppercase">
                {item.label}
              </dt>
              <dd className="mt-2 text-[15px] font-medium text-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/**
 * Réalisations teaser — credentials-led, not a portfolio. Until three approved
 * case studies exist, the block is the `Références sur demande` fallback with a
 * link to the published /realisations page: no cards, no project photography,
 * no detail route (docs/content/realisations-strategy.md §3).
 */
export function HomeRealisations({
  block,
}: {
  readonly block: CredentialsBlock
}) {
  return (
    <section aria-labelledby="accueil-realisations" className="bg-background">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-12 md:gap-8 md:px-10 md:py-24">
        <div className="md:col-span-4">
          <h2
            id="accueil-realisations"
            className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase"
          >
            {LABELS.realisations}
          </h2>
          <p className="mt-6 max-w-[16ch] text-[clamp(30px,3.6vw,48px)] leading-[1.05] font-light tracking-[-0.03em] text-ink">
            {block.statement}
          </p>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          {block.body ? (
            <p className="max-w-[52ch] text-[16px] leading-relaxed text-body">
              {block.body}
            </p>
          ) : null}

          {block.link ? (
            <Link
              href={block.link.href}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink/25 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              {block.link.label}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/**
 * Text-only engagements: qualité, sécurité, délais. No equipment, fleet or
 * certification claim — the facts register clears none of them.
 */
export function HomeEngagements({
  items,
}: {
  readonly items: EngagementsBlock["items"]
}) {
  if (items.length === 0) return null

  return (
    <section
      aria-labelledby="accueil-engagements"
      className="bg-ink text-surface"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <h2
          id="accueil-engagements"
          className="max-w-[18ch] text-[clamp(30px,4vw,54px)] leading-[1.02] font-light tracking-[-0.03em]"
        >
          {LABELS.engagements}
        </h2>

        <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.title} className="border-t border-surface/20 pt-5">
              <p
                aria-hidden="true"
                className="text-[10.5px] font-semibold tracking-[0.2em] text-orange uppercase"
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-lg font-medium text-surface">
                {item.title}
              </h3>
              {item.body ? (
                <p className="mt-3 max-w-[40ch] text-[14px] leading-relaxed text-surface/70">
                  {item.body}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** The orange closing band: ink text on orange, the only large accent surface. */
export function HomeContactCta({ block }: { readonly block: ContactCtaBlock }) {
  return (
    <section aria-labelledby="accueil-contact" className="bg-orange text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-10 md:py-20">
        <div>
          <h2
            id="accueil-contact"
            className="max-w-[24ch] text-[clamp(28px,3.4vw,46px)] leading-[1.05] font-light tracking-[-0.03em]"
          >
            {block.title}
          </h2>
          {block.body ? (
            <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-ink">
              {block.body}
            </p>
          ) : null}
        </div>

        {block.link ? (
          <Link
            href={block.link.href}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-surface hover:text-ink"
          >
            {block.link.label}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </section>
  )
}
