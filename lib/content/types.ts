/**
 * The content seam's domain types — the contract between rendering code and
 * the content source (fixture corpus today, embedded Payload CMS from #29).
 *
 * Rendering code (pages, header, footer, sitemap, metadata) only ever sees
 * these types. The shape is trame-oriented rather than CMS-oriented on
 * purpose: page tickets write blocks, #29/#30 translate Payload documents into
 * the same blocks, and no renderer renegotiates the union.
 *
 * Invariants the provider must keep (docs/build/content-seam.md):
 * - a document may exist while its gate is closed — gates are resolved by
 *   `getPublishState`, never by silently dropping documents;
 * - published listings (`listPublishedRubriques`, `listPublishedDomains`,
 *   `getActualites`) already exclude closed entries, so navigation, footer,
 *   sitemap and internal links cannot leak a gated route;
 * - `getDomain` returns `null` for a closed or unknown slug, so a domain route
 *   can `notFound()` without re-implementing the gate;
 * - media is only returned when its rights are cleared.
 */

/** Delivery tier of a rubrique — code-owned (docs/content/information-architecture.md). */
export type Tier = "P1" | "P2" | "P3"

/**
 * Stable keys of the eight CDC rubriques plus the P1 utility pages.
 * Keys are code-owned identifiers: they never change with copy edits.
 */
export type RubriqueKey =
  | "accueil"
  | "a-propos"
  | "domaines-activite"
  | "realisations"
  | "moyens-et-competences"
  | "references-et-partenaires"
  | "actualites"
  | "contact"
  | "carrieres"
  | "mentions-legales"
  | "politique-de-confidentialite"

/**
 * Publication gate of a rubrique or document.
 *
 * `reason` is editorial context for the admin (#30 shows the owner why a page
 * is closed). It is never rendered on the public site.
 */
export interface PublishState {
  readonly published: boolean
  readonly reason?: string
}

/** Route slug of a domaine d'activité, e.g. `eclairage-public`. */
export type DomainSlug = string

/** Identifier of a media record in the content source. */
export type MediaId = string

/** An internal link rendered from a content block. */
export interface ContentLink {
  readonly label: string
  readonly href: string
}

/** A labelled item: prestations, engagement rows, capability rows. */
export interface LabelledItem {
  readonly label: string
  readonly description?: string
}

/** A titled item: method blocks, values, quality commitments. */
export interface TitledItem {
  readonly title: string
  readonly body?: string
}

/** A fact pair: repères (only facts cleared by the facts register). */
export interface FactItem {
  readonly label: string
  readonly value: string
}

/** Homepage opening block (docs/homepage/README.md §3.1). */
export interface HeroBlock {
  readonly kind: "hero"
  readonly headline: string
  readonly tagline?: string
  /** Media id for the licensed hero; omitted → typographic fallback. */
  readonly mediaId?: MediaId
  readonly links: readonly ContentLink[]
}

/** Short company introduction with the link to À propos. */
export interface IntroBlock {
  readonly kind: "intro"
  readonly paragraphs: readonly string[]
  readonly link?: ContentLink
}

/** Domain page first block: presentation and needs. */
export interface PresentationBlock {
  readonly kind: "presentation"
  readonly paragraphs: readonly string[]
}

/** Domain page: confirmed prestations (never an unverified capability). */
export interface PrestationsBlock {
  readonly kind: "prestations"
  readonly title?: string
  readonly items: readonly LabelledItem[]
}

/** Domain page: methods, means and competences. */
export interface MethodsBlock {
  readonly kind: "methods"
  readonly title?: string
  readonly items: readonly TitledItem[]
}

/** Optional photo gallery — omitted entirely until rights are cleared. */
export interface PhotosBlock {
  readonly kind: "photos"
  readonly mediaIds: readonly MediaId[]
  readonly caption?: string
}

/** Optional associated réalisations — omitted at P1 (fiches are gated). */
export interface AssocieesBlock {
  readonly kind: "associees"
  readonly title?: string
  readonly items: readonly ContentLink[]
}

/** Homepage: the published domain blocks, rendered from the seam. */
export interface DomainesBlock {
  readonly kind: "domaines"
  readonly title?: string
}

/** Homepage: "repères" band, cleared facts only. */
export interface ReperesBlock {
  readonly kind: "reperes"
  readonly items: readonly FactItem[]
}

/** Homepage: text-only engagements (qualité, sécurité, délais). */
export interface EngagementsBlock {
  readonly kind: "engagements"
  readonly items: readonly TitledItem[]
}

/** Réalisations: credentials-led statement and service rows. */
export interface CredentialsBlock {
  readonly kind: "credentials"
  readonly statement: string
  readonly items: readonly LabelledItem[]
  readonly link?: ContentLink
}

/** A call to the cleared contact channel. */
export interface ContactCtaBlock {
  readonly kind: "contact-cta"
  readonly title: string
  readonly body?: string
  readonly link?: ContentLink
}

/** Generic titled prose sections (À propos, legal pages, careers intro). */
export interface SectionsBlock {
  readonly kind: "sections"
  readonly title?: string
  readonly items: readonly TitledItem[]
}

/** Carrières: openings listed inline by the owner (legacy page-document block). */
export interface OpeningsBlock {
  readonly kind: "openings"
  readonly title?: string
  readonly items: readonly LabelledItem[]
}

/**
 * A job opening rendered inline on `/carrieres` (forms doc §4.2).
 *
 * There is no detail route at launch: the slug identifies the record for the
 * content source (#30's jobs collection) and must never become a public URL
 * while `JobPosting` and `/carrieres/{slug}` stay forbidden (§4.8).
 */
export interface JobOpening {
  readonly slug: string
  /** Job title, e.g. « Électricien HTA-BT ». */
  readonly title: string
  /** Contract type: `CDI`, `CDD`, `Stage` or `Alternance`. */
  readonly contractType: string
  /** Work location; the default is the registered base, `Rabat`. */
  readonly location: string
  readonly department?: string
  readonly experience?: string
  /** Two-to-three-line summary shown on the card. */
  readonly summary: string
  /** ISO date (`YYYY-MM-DD`); rendered as a date, never as a countdown. */
  readonly postedAt?: string
  /** ISO closing date; a record past it is not an opening any more. */
  readonly closingAt?: string
}

/**
 * Careers application channel — the F-113 gate (forms doc §4.4).
 *
 * `recrutement@hay2010.ma` is an approved but gated channel: it may not be
 * published, nor may the page invite CVs, before the CNDP F-113 authorization
 * covers the mailbox (facts register §2.3/§3). The switch is data, not code:
 * the fixture provider reads it from a scenario, the CMS provider (#29/#30)
 * keeps it code-owned deployment configuration and never lets the admin open
 * it (content model §3/§5.1).
 */
export interface CareersChannel {
  /** True only when F-113 covers `recrutement@hay2010.ma`. */
  readonly recruitmentMailboxLive: boolean
  /**
   * The real CNDP authorization reference. Required while the mailbox is live:
   * the notice renders only with a real number and date, never a blank `n°`
   * (forms doc §4.9). Absent means the channel fails closed.
   */
  readonly authorization?: {
    readonly number: string
    readonly date: string
  }
}

/**
 * Every block the fixed trames can render. A block is optional: an absent
 * block is omitted, never replaced by a placeholder (spec rule DEV-006).
 */
export type ContentBlock =
  | HeroBlock
  | IntroBlock
  | PresentationBlock
  | PrestationsBlock
  | MethodsBlock
  | PhotosBlock
  | AssocieesBlock
  | DomainesBlock
  | ReperesBlock
  | EngagementsBlock
  | CredentialsBlock
  | ContactCtaBlock
  | SectionsBlock
  | OpeningsBlock

/** A page document, addressed by its rubrique key. */
export interface PageDocument {
  readonly key: RubriqueKey
  /**
   * Document title used by the page h1 / metadata (decided French copy).
   * Optional while a page only has its route: page tickets #22–#28 add it.
   */
  readonly title?: string
  /**
   * Meta description, 120–160 characters (SEO doc §3). Added by the page
   * ticket that writes the copy; #32 wires it into the metadata system.
   */
  readonly description?: string
  /** Blocks in render order; the renderer omits anything absent. */
  readonly blocks: readonly ContentBlock[]
}

/** A published domaine d'activité document (route `/domaines-activite/{slug}`). */
export interface DomainDocument {
  readonly slug: DomainSlug
  /** Full CDC title, e.g. « Éclairage public ». */
  readonly title: string
  /** Meta description, 120–160 characters (added by the domain page ticket). */
  readonly description?: string
  readonly blocks: readonly ContentBlock[]
}

/** A published actualité (P3; the model exists, the corpus is empty at P1). */
export interface ActualiteDocument {
  readonly slug: string
  readonly title: string
  /** ISO date of publication, when the content source records one. */
  readonly publishedAt?: string
  readonly blocks: readonly ContentBlock[]
}

/** Permission state of a media asset (content model §7). */
export interface MediaRights {
  readonly status: "cleared" | "pending" | "revoked"
  readonly basis: "company-owned" | "purchased" | "licensed" | "authorised" | "unknown"
  readonly permissionReference?: string
  readonly peoplePresent: boolean
  readonly releaseStatus: "cleared" | "pending" | "not-required"
  readonly clientMarks: boolean
  readonly clientPermission?: boolean
  readonly trademarkPermission?: boolean
}

/** A media record. Only cleared records are returned by the seam. */
export interface MediaRecord {
  readonly id: MediaId
  readonly src?: string
  readonly alt: string
  readonly width?: number
  readonly height?: number
  readonly rights: MediaRights
}

/**
 * The only door between rendering code and content (spec: "Single content
 * seam"). Fixture and CMS providers implement exactly this interface.
 */
export interface ContentSource {
  /** Publish gate of a rubrique — the routing/navigation gate. */
  getPublishState(key: RubriqueKey): Promise<PublishState>
  /** Rubriques whose gate is open, in the provider's order. */
  listPublishedRubriques(): Promise<readonly RubriqueKey[]>
  /** Page document by rubrique key; a closed page may still have a document. */
  getPage(key: RubriqueKey): Promise<PageDocument | null>
  /** Domains whose gate is open. */
  listPublishedDomains(): Promise<readonly DomainDocument[]>
  /** A published domain by slug; `null` when closed or unknown. */
  getDomain(slug: DomainSlug): Promise<DomainDocument | null>
  /** Published actualités (empty at P1). */
  getActualites(): Promise<readonly ActualiteDocument[]>
  /**
   * Published, currently open job openings, already filtered and ordered:
   * a record renders only when its publish gate is open and it is still open
   * (status open, closing date absent or in the future); order is `featured`
   * first, then `postedAt` descending (forms doc §4.2).
   */
  getOpenJobs(): Promise<readonly JobOpening[]>
  /** F-113 careers application channel state; fails closed when unknown. */
  getCareersChannel(): Promise<CareersChannel>
  /** A media record whose rights are cleared; `null` otherwise. */
  getMedia(id: MediaId): Promise<MediaRecord | null>
}
