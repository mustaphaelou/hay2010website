import Link from "next/link"
import type { ReactNode } from "react"

import { getLiveClaimsForDomain, type ApprovedClaim } from "@/lib/site/claims"
import type {
  ContactCtaBlock,
  DomainDocument,
  MethodsBlock,
  PresentationBlock,
  PrestationsBlock,
} from "@/lib/content/types"

/**
 * A published domaine d'activité page body, built on the fixed CDC trame
 * (docs/spec/p1-website-build.md §"Domaines d'activité and prestations"):
 *
 *   presentation and needs → confirmed prestations → methods/means/competences
 *   → contact CTA
 *
 * The optional photo and associated-réalisations blocks of the CDC trame are
 * absent at P1 (DEV-006): this renderer simply does not render them — no
 * placeholder, no empty frame. Blocks come from the content source in their
 * render order; a block whose content is absent is omitted, never filled.
 *
 * Section headings come from the page content (`title`), with the CDC trame
 * wording as a code-owned fallback for interface labels.
 */
const FALLBACK_LABELS = {
  presentation: "Présentation et besoins",
  prestations: "Prestations confirmées",
  methods: "Méthode, moyens et compétences",
} as const

function TrameSection({
  id,
  label,
  children,
}: {
  readonly id: string
  readonly label: string
  readonly children: ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className="border-t border-line pt-8 lg:grid lg:grid-cols-12 lg:gap-6 lg:pt-10"
    >
      <h2
        id={id}
        className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase lg:col-span-3"
      >
        {label}
      </h2>
      <div className="mt-5 lg:col-span-9 lg:mt-0">{children}</div>
    </section>
  )
}

function Presentation({ block }: { readonly block: PresentationBlock }) {
  return (
    <div className="max-w-[62ch] space-y-5">
      {block.paragraphs.map((paragraph, index) => (
        <p
          key={paragraph}
          className={
            index === 0
              ? "text-lg leading-relaxed text-ink lg:text-xl"
              : "text-base leading-relaxed text-body lg:text-lg"
          }
        >
          {paragraph}
        </p>
      ))}
    </div>
  )
}

function Prestations({ block }: { readonly block: PrestationsBlock }) {
  return (
    <ol className="border-t border-line/70">
      {block.items.map((item, index) => (
        <li
          key={item.label}
          className="grid gap-2 border-b border-line/70 py-6 sm:grid-cols-[2.5rem_1fr] sm:gap-4"
        >
          <p
            aria-hidden="true"
            className="font-heading text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase sm:pt-1"
          >
            {String(index + 1).padStart(2, "0")}
          </p>
          <div>
            <h3 className="font-heading text-lg font-medium text-ink lg:text-xl">
              {item.label}
            </h3>
            {item.description ? (
              <p className="mt-2 max-w-[56ch] text-body">{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

function Methods({ block }: { readonly block: MethodsBlock }) {
  return (
    <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
      {block.items.map((item) => (
        <li key={item.title} className="border-t border-line/70 pt-4">
          <h3 className="font-heading text-base font-medium text-ink lg:text-lg">
            {item.title}
          </h3>
          {item.body ? (
            <p className="mt-2 max-w-[48ch] text-body">{item.body}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function ApprovedClaims({ claims }: { readonly claims: readonly ApprovedClaim[] }) {
  return (
    <>
      {claims.map((claim) => (
        <TrameSection
          key={claim.key}
          id={`domaine-${claim.key}`}
          label={claim.title}
        >
          <p className="max-w-[62ch] text-body">{claim.wording}</p>
        </TrameSection>
      ))}
    </>
  )
}

function ContactCta({ block }: { readonly block: ContactCtaBlock }) {
  return (
    <section aria-labelledby="domaine-contact" className="bg-orange px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
      <h2
        id="domaine-contact"
        className="max-w-[24ch] font-heading text-[clamp(1.75rem,3.4vw,2.75rem)] leading-tight font-light tracking-[-0.02em] text-ink"
      >
        {block.title}
      </h2>

      {block.body ? (
        <p className="mt-4 max-w-[52ch] text-ink">{block.body}</p>
      ) : null}

      {block.link ? (
        <Link
          href={block.link.href}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-ink/90"
        >
          {block.link.label}
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </section>
  )
}

/** The published domain page body. */
export function DomainePage({ domain }: { readonly domain: DomainDocument }) {
  const claims = getLiveClaimsForDomain(domain.slug)
  const blocks: ReactNode[] = []

  for (const block of domain.blocks) {
    switch (block.kind) {
      case "presentation":
        blocks.push(
          <TrameSection
            key="presentation"
            id="domaine-presentation"
            label={block.title ?? FALLBACK_LABELS.presentation}
          >
            <Presentation block={block} />
          </TrameSection>
        )
        break
      case "prestations":
        blocks.push(
          <TrameSection
            key="prestations"
            id="domaine-prestations"
            label={block.title ?? FALLBACK_LABELS.prestations}
          >
            <Prestations block={block} />
          </TrameSection>
        )
        break
      case "methods":
        blocks.push(
          <TrameSection
            key="methods"
            id="domaine-methode"
            label={block.title ?? FALLBACK_LABELS.methods}
          >
            <Methods block={block} />
          </TrameSection>
        )
        break
      case "contact-cta":
        // Gated claims sit with the qualifications, before the closing CTA.
        blocks.push(<ApprovedClaims key="claims" claims={claims} />)
        blocks.push(<ContactCta key="contact" block={block} />)
        break
      default:
        // The CDC photo and associated-réalisations blocks are omitted at P1
        // (DEV-006); an unknown/absent block is skipped, never filled.
        break
    }
  }

  return (
    <article className="mx-auto max-w-[1440px] px-5 pt-16 pb-24 lg:px-10 lg:pt-24 lg:pb-32">
      <h1 className="max-w-[20ch] font-heading text-[clamp(2.5rem,7vw,5rem)] leading-[0.98] font-light tracking-[-0.035em] text-ink">
        {domain.title}
      </h1>

      <div className="mt-14 space-y-14 lg:mt-20 lg:space-y-20">{blocks}</div>
    </article>
  )
}
