import type {
  ContactCtaBlock,
  ContentLink,
  CredentialsBlock,
  DomainDocument,
  DomainesBlock,
  EngagementsBlock,
  HeroBlock,
  IntroBlock,
  MediaRecord,
  PageDocument,
  ReperesBlock,
} from "@/lib/content/types"

import { HomeHero } from "@/components/home/home-hero"
import {
  HomeContactCta,
  HomeDomaines,
  HomeEngagements,
  HomeIntro,
  HomeRealisations,
  HomeReperes,
} from "@/components/home/home-sections"

/**
 * The Accueil composition (ticket #23).
 *
 * The CDC order is structural, not editorial: the sections are assembled in the
 * decided order (hero → intro → domain blocks → repères → réalisations teaser →
 * engagements → contact CTA) and a block absent from the document is omitted
 * rather than replaced by a placeholder (DEV-006). No careers teaser, no news
 * teaser, no video band and no selected-project cards exist on this page.
 *
 * Domain blocks are rendered from the published domain set the page passes in,
 * so a gated domain never appears; the À propos link is derived from the
 * published set too, never from raw content.
 */
export function HomePage({
  page,
  domains,
  heroMedia,
  aProposLink,
}: {
  readonly page: PageDocument
  readonly domains: readonly DomainDocument[]
  /** Cleared hero photograph resolved through the seam; `null` → type hero. */
  readonly heroMedia: MediaRecord | null
  /** Published À propos link; `null` while that gate is closed. */
  readonly aProposLink: ContentLink | null
}) {
  const hero =
    page.blocks.find((block): block is HeroBlock => block.kind === "hero") ??
    null
  const intro =
    page.blocks.find((block): block is IntroBlock => block.kind === "intro") ??
    null
  const domaines =
    page.blocks.find(
      (block): block is DomainesBlock => block.kind === "domaines"
    ) ?? null
  const reperes =
    page.blocks.find(
      (block): block is ReperesBlock => block.kind === "reperes"
    ) ?? null
  const realisations =
    page.blocks.find(
      (block): block is CredentialsBlock => block.kind === "credentials"
    ) ?? null
  const engagements =
    page.blocks.find(
      (block): block is EngagementsBlock => block.kind === "engagements"
    ) ?? null
  const contactCta =
    page.blocks.find(
      (block): block is ContactCtaBlock => block.kind === "contact-cta"
    ) ?? null

  return (
    <>
      <HomeHero block={hero} media={heroMedia} title={page.title ?? ""} />

      {intro ? <HomeIntro block={intro} link={aProposLink} /> : null}

      {domaines ? <HomeDomaines block={domaines} domains={domains} /> : null}

      {reperes && reperes.items.length > 0 ? (
        <HomeReperes items={reperes.items} />
      ) : null}

      {realisations ? <HomeRealisations block={realisations} /> : null}

      {engagements && engagements.items.length > 0 ? (
        <HomeEngagements items={engagements.items} />
      ) : null}

      {contactCta ? <HomeContactCta block={contactCta} /> : null}
    </>
  )
}
