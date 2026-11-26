import Link from "next/link"

import type {
  ContactCtaBlock,
  CredentialsBlock,
  DomainesBlock,
  DomainDocument,
  HeroBlock,
  IntroBlock,
  PageDocument,
  QualificationsBlock,
  SectionsBlock,
  StepsBlock,
} from "@/lib/content/types"
import { getDomainPath } from "@/lib/site/domaines"
import {
  getLiveQualificationsClaim,
  QUALIFICATIONS_POSITION,
} from "@/lib/site/realisations"
import { getRubrique } from "@/lib/site/rubriques"

/**
 * Réalisations — the credentials-led page body (ticket #24).
 *
 * Trame, in the decided order (docs/content/realisations-strategy.md §2.2):
 * hero with the `Références sur demande` statement → intro → the service rows
 * (published domains only) → the qualifications position → the references
 * block → how a project is documented once permissions exist → the method →
 * the contact CTA.
 *
 * Two rules drive the composition:
 * - **Absent over placeholder (DEV-006):** a block whose content is missing is
 *   omitted, never filled with an empty frame or "à venir" copy.
 * - **The gate is authoritative:** the service rows derive from the published
 *   domain set, the qualification block prints the ONEE wording only when
 *   `lib/site/claims.ts` says the claim is live, and no client name, logo,
 *   quote, amount or project photograph can render — the data does not exist
 *   and must not be invented.
 */

/** Section heading text used when the content does not carry a title. */
const FALLBACK_TITLES = {
  domains: "Ce que nous réalisons",
  qualifications: "Nos qualifications",
  references: "Références",
  method: "De l’étude à la réception",
} as const

/**
 * CTA rendering: `mailto:` links are plain anchors (they leave the site), all
 * other CTAs are internal routes handled by the Next router.
 */
function CtaLink({
  href,
  children,
  variant = "secondary",
}: {
  readonly href: string
  readonly children: React.ReactNode
  readonly variant?: "primary" | "secondary"
}) {
  const className =
    variant === "primary"
      ? "inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-surface transition-colors hover:bg-ink/85"
      : "inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/25 px-6 py-3 text-[13px] font-medium text-ink transition-colors hover:border-ink"

  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a href={href} className={className}>
        {children}
        <span aria-hidden="true">→</span>
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  )
}

/** The page opener: title, the approved reference statement and the intro. */
function RealisationsHero({
  title,
  hero,
  intro,
}: {
  readonly title: string
  readonly hero?: HeroBlock
  readonly intro?: IntroBlock
}) {
  return (
    <section
      aria-labelledby="realisations-titre"
      className="border-b border-line bg-surface"
    >
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-12 md:gap-8 md:px-10 md:py-24">
        <div className="md:col-span-4">
          <div className="h-px w-12 bg-ink" aria-hidden="true" />
          <h1
            id="realisations-titre"
            className="mt-6 font-heading text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.02] font-light tracking-[-0.03em] text-ink"
          >
            {title}
          </h1>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          {hero?.headline ? (
            <p className="text-[clamp(1.4rem,2.6vw,2.1rem)] leading-[1.24] font-light tracking-[-0.02em] text-ink">
              {hero.headline}
            </p>
          ) : null}

          {/* Hero CTAs first, then the intro prose and its text link
              (strategy §2.2: hero carries the two CTAs, the intro follows). */}
          {hero && hero.links.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-3">
              {hero.links.map((link, index) => (
                <li key={`${link.label}-${link.href}`}>
                  <CtaLink href={link.href} variant={index === 0 ? "primary" : "secondary"}>
                    {link.label}
                  </CtaLink>
                </li>
              ))}
            </ul>
          ) : null}

          {intro && intro.paragraphs.length > 0 ? (
            <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-body md:text-base">
              {intro.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {intro?.link ? (
            <p className="mt-8">
              <Link
                href={intro.link.href}
                className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-[13px] font-medium text-ink transition-colors hover:border-ink"
              >
                {intro.link.label}
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/**
 * The service rows: exactly the published domains, in CDC order.
 *
 * The set comes from the seam, not from the page document, so a gated domain
 * can never appear here and a newly published domain joins the rows without a
 * code change. Each row is a text row, not a project card: the page is
 * credentials-led, and no project is published (DEV-001).
 */
function RealisationsServices({
  block,
  domains,
}: {
  readonly block: DomainesBlock
  readonly domains: readonly DomainDocument[]
}) {
  if (domains.length === 0) return null

  return (
    <section
      aria-labelledby="realisations-domaines"
      className="border-b border-line bg-background"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <p
              aria-hidden="true"
              className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase"
            >
              01
            </p>
            <h2
              id="realisations-domaines"
              className="mt-4 max-w-[18ch] text-[clamp(30px,4vw,54px)] leading-[1.02] font-light tracking-[-0.03em] text-ink"
            >
              {block.title ?? FALLBACK_TITLES.domains}
            </h2>
          </div>

          <ul className="border-t border-line md:col-span-7 md:col-start-6">
            {domains.map((domain, index) => (
              <li
                key={domain.slug}
                className="grid gap-4 border-b border-line py-6 sm:grid-cols-[3rem_1fr_auto] sm:items-baseline sm:gap-6"
              >
                <span
                  aria-hidden="true"
                  className="font-heading text-sm font-semibold tracking-[0.1em] text-copper"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-heading text-[17px] font-medium tracking-[-0.01em] text-ink md:text-[18px]">
                    {domain.title}
                  </h3>
                  {domain.summary ? (
                    <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-body">
                      {domain.summary}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={getDomainPath(domain.slug)}
                  className="w-fit border-b border-ink/30 pb-1 text-[13px] font-medium text-ink transition-colors hover:border-ink"
                >
                  En savoir plus
                  <span aria-hidden="true"> →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/**
 * The qualifications position.
 *
 * With the ONEE claim gate open, the approved wording renders verbatim from
 * `lib/site/claims.ts`. While it is closed — the P1 state — the block prints
 * the code-owned honest position instead: no agrément, certification or
 * "entreprise agréée" wording, no placeholder. The switch is the claim's
 * `live` flag, never a copy edit.
 */
function RealisationsQualifications({
  block,
}: {
  readonly block: QualificationsBlock
}) {
  const claim = getLiveQualificationsClaim()
  const title = claim?.title ?? block.title ?? FALLBACK_TITLES.qualifications

  return (
    <section
      aria-labelledby="realisations-qualifications"
      className="border-b border-line bg-ink text-surface"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:grid-cols-12 md:gap-8 md:px-10 md:py-28">
        <div className="md:col-span-4">
          <p
            aria-hidden="true"
            className="text-[10.5px] font-semibold tracking-[0.2em] text-orange uppercase"
          >
            02
          </p>
          <h2
            id="realisations-qualifications"
            className="mt-4 max-w-[18ch] text-[clamp(30px,4vw,54px)] leading-[1.02] font-light tracking-[-0.03em] text-surface"
          >
            {title}
          </h2>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          {claim ? (
            <>
              <p className="max-w-[58ch] text-lg leading-relaxed text-surface">
                {claim.wording}
              </p>
              <p className="mt-8">
                <Link
                  href={getRubrique("a-propos").href}
                  className="inline-flex items-center gap-2 border-b border-surface/40 pb-1 text-[13px] font-medium text-surface transition-colors hover:border-surface"
                >
                  En savoir plus sur l’entreprise
                  <span aria-hidden="true">→</span>
                </Link>
              </p>
            </>
          ) : (
            <div className="max-w-[58ch] space-y-5 text-sm leading-relaxed text-surface/75 md:text-base">
              {QUALIFICATIONS_POSITION.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * The references block: the approved fallback wording, what a reference
 * request covers, and the mailto CTA. No card, no client name, no logo.
 */
function RealisationsReferences({ block }: { readonly block: CredentialsBlock }) {
  return (
    <section
      aria-labelledby="realisations-references"
      className="border-b border-line bg-surface"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:grid-cols-12 md:gap-8 md:px-10 md:py-28">
        <div className="md:col-span-4">
          <p
            aria-hidden="true"
            className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase"
          >
            03
          </p>
          <h2
            id="realisations-references"
            className="mt-4 max-w-[18ch] text-[clamp(30px,4vw,54px)] leading-[1.02] font-light tracking-[-0.03em] text-ink"
          >
            {block.title ?? FALLBACK_TITLES.references}
          </h2>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <p className="text-[clamp(1.4rem,2.6vw,2.1rem)] leading-[1.24] font-light tracking-[-0.02em] text-ink">
            {block.statement}
          </p>
          {block.body ? (
            <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-body">
              {block.body}
            </p>
          ) : null}

          {block.items.length > 0 ? (
            <dl className="mt-10 border-t border-line">
              {block.items.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8"
                >
                  <dt className="font-heading text-sm font-medium text-ink">
                    {item.label}
                  </dt>
                  {item.description ? (
                    <dd className="max-w-[56ch] text-sm leading-relaxed text-body">
                      {item.description}
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          ) : null}

          {block.link ? (
            <p className="mt-10">
              <CtaLink href={block.link.href} variant="primary">
                {block.link.label}
              </CtaLink>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/**
 * How a project would be documented once permissions exist.
 *
 * Plain prose about the permission rules (facts register §6, strategy §7) —
 * the page explains the process instead of pretending the cleared projects
 * exist. Absent content is omitted (DEV-006).
 */
function RealisationsDocumentation({
  block,
}: {
  readonly block: SectionsBlock
}) {
  if (!block.title || block.items.length === 0) return null

  return (
    <section
      aria-labelledby="realisations-documentation"
      className="border-b border-line bg-background"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:grid-cols-12 md:gap-8 md:px-10 md:py-28">
        <div className="md:col-span-4">
          <p
            aria-hidden="true"
            className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase"
          >
            04
          </p>
          <h2
            id="realisations-documentation"
            className="mt-4 max-w-[18ch] text-[clamp(30px,4vw,54px)] leading-[1.02] font-light tracking-[-0.03em] text-ink"
          >
            {block.title}
          </h2>
        </div>

        <ul className="border-t border-line md:col-span-7 md:col-start-6">
          {block.items.map((item) => (
            <li key={item.title} className="border-b border-line py-6">
              <h3 className="font-heading text-[17px] font-medium tracking-[-0.01em] text-ink md:text-[18px]">
                {item.title}
              </h3>
              {item.body ? (
                <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-body">
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

/** The method block: four delivery steps, rendered as an ordered list. */
function RealisationsMethod({ block }: { readonly block: StepsBlock }) {
  if (!block.title || block.items.length === 0) return null

  return (
    <section
      aria-labelledby="realisations-methode"
      className="border-b border-line bg-ink text-surface"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:grid-cols-12 md:gap-8 md:px-10 md:py-28">
        <div className="md:col-span-4">
          <p
            aria-hidden="true"
            className="text-[10.5px] font-semibold tracking-[0.2em] text-orange uppercase"
          >
            05
          </p>
          <h2
            id="realisations-methode"
            className="mt-4 max-w-[18ch] text-[clamp(30px,4vw,54px)] leading-[1.02] font-light tracking-[-0.03em] text-surface"
          >
            {block.title}
          </h2>
        </div>

        <ol className="border-t border-surface/15 md:col-span-7 md:col-start-6">
          {block.items.map((item, index) => (
            <li
              key={item.title}
              className="grid gap-3 border-b border-surface/15 py-6 sm:grid-cols-[3rem_1fr] sm:gap-6"
            >
              <span
                aria-hidden="true"
                className="font-heading text-sm font-semibold tracking-[0.1em] text-orange"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-heading text-[17px] font-medium tracking-[-0.01em] text-surface md:text-[18px]">
                  {item.title}
                </h3>
                {item.body ? (
                  <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-surface/65">
                    {item.body}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** Closing band: the contact CTA to the cleared contact page. */
function RealisationsContactCta({ block }: { readonly block: ContactCtaBlock }) {
  return (
    <section aria-labelledby="realisations-contact" className="bg-orange text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-10 md:py-20">
        <div>
          <h2
            id="realisations-contact"
            className="max-w-[24ch] text-[clamp(28px,3.4vw,46px)] leading-[1.05] font-light tracking-[-0.03em]"
          >
            {block.title}
          </h2>
          {block.body ? (
            <p className="mt-4 max-w-[48ch] text-[14px] leading-relaxed text-ink">
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

/** The whole page body, from the page document plus the published domain set. */
export function RealisationsPage({
  page,
  domains,
}: {
  readonly page: PageDocument & { readonly title: string }
  readonly domains: readonly DomainDocument[]
}) {
  const hero = page.blocks.find((block): block is HeroBlock => block.kind === "hero")
  const intro = page.blocks.find(
    (block): block is IntroBlock => block.kind === "intro"
  )
  // Hero and intro render together as the opener; the remaining blocks keep
  // their content order (strategy §2.2).
  const contentBlocks = page.blocks.filter(
    (block) => block !== hero && block !== intro
  )

  return (
    <article>
      <RealisationsHero title={page.title} hero={hero} intro={intro} />

      {contentBlocks.map((block, index) => {
        switch (block.kind) {
          case "domaines":
            return <RealisationsServices key={`domaines-${index}`} block={block} domains={domains} />
          case "qualifications":
            return <RealisationsQualifications key={`qualifications-${index}`} block={block} />
          case "credentials":
            return <RealisationsReferences key={`references-${index}`} block={block} />
          case "sections":
            return <RealisationsDocumentation key={`documentation-${index}`} block={block} />
          case "steps":
            return <RealisationsMethod key={`methode-${index}`} block={block} />
          case "contact-cta":
            return <RealisationsContactCta key={`contact-${index}`} block={block} />
          default:
            // A block this trame does not know is omitted, never replaced by a
            // placeholder (DEV-006). #30 keeps the union and the renderer in sync.
            return null
        }
      })}
    </article>
  )
}
