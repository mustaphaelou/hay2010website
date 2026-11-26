/**
 * CMS content source — the Payload implementation of the #21 `ContentSource`
 * seam (docs/build/content-seam.md §9, extended by #30).
 *
 * This file is the ONLY module in the app that talks to Payload. It is loaded
 * through a dynamic `import()` from `lib/content/index.ts`, so a fixture build
 * and the whole `npm test` suite never bundle or boot a database. It is
 * activated by `CONTENT_SOURCE=cms` + `DATABASE_URL` (+ `PAYLOAD_SECRET` for
 * the admin), as documented in docs/build/cms.md.
 *
 * #30 maps the structured globals/collections of docs/content/content-model.md
 * §5 onto the seam's block union:
 *
 *   homepage     → Accueil document (hero, intro, domaines, repères, réalisations
 *                  teaser, engagements, contact CTA)
 *   entreprise   → À propos document (intro + chapters + contact CTA)
 *   metiers      → domain index document (intro + domain list placement)
 *   realisations → Réalisations document (hero, intro, services, qualifications,
 *                  references, documentation, method, contact CTA)
 *   contact      → Contact document (intro, email band, sections, steps)
 *   carrieres    → Carrières document (hero + culture intro)
 *   domaines     → domain documents (presentation, prestations, methods, CTA)
 *   jobs         → open job openings (published + open + not past `closingAt`)
 *   communiques  → actualités (none while the code-owned `actualitesLive` gate
 *                  is false)
 *
 * Gate semantics are the seam's contract (docs/build/content-seam.md §5): the
 * provider applies the code-owned tier gates BEFORE the CMS publish state —
 * a record published in the admin never opens a code-owned gate. That is what
 * makes the P2/P3 pages and the two gated domains impossible to open from the
 * admin, and it is asserted by docs/build/cms.md's verification suite.
 *
 * Code-owned content injected here on purpose (never CMS-editable):
 * - the repères band (`lib/site/facts.ts`);
 * - the qualifications block placement (`lib/site/realisations.ts`);
 * - the F-113 careers channel and the legal pages' publish state;
 * - link destinations (the admin stores a target enum, `lib/payload/link-targets.ts`).
 */
import type { Payload } from "payload"
import type { Config } from "@/payload-types"
import type {
  ActualiteDocument,
  CareersChannel,
  ContentBlock,
  ContentLink,
  ContentSource,
  DomainDocument,
  HeroBlock,
  JobOpening,
  MediaRecord,
  PageDocument,
  PublishState,
  RubriqueKey,
  SectionsBlock,
  StepsBlock,
} from "@/lib/content/types"
import { REPERES } from "@/lib/site/facts"
import {
  DOMAIN_KEYS,
  DOMAIN_GATES,
  LEGAL_PAGE_KEYS,
  PAGE_GLOBALS,
  RUBRIQUE_LABELS,
  domainGateOpen,
  domainGateReason,
  rubriqueGateReason,
  tierAllowsPublication,
} from "@/lib/payload/content-map"
import { resolveLinkTarget } from "@/lib/payload/link-targets"
import { richTextToParagraphs, richTextToPlainText } from "@/lib/payload/rich-text"
import { RUBRIQUE_ROUTES } from "@/lib/payload/revalidate"

/** A global slug of the generated config (page trames + gated listing). */
type PageGlobal = keyof Config["globals"]

/** F-113 closed state: questions go to contact@, no CV invitation (fail closed). */
const CAREERS_CHANNEL_CLOSED: CareersChannel = Object.freeze({
  recruitmentMailboxLive: false,
})

/** `actualitesLive` is code-owned and false at launch (content model §6). */
const ACTUALITES_LIVE = false

/** One Payload client per server process (it owns the Postgres pool). */
let payloadPromise: Promise<Payload> | null = null

/** Lazily boot Payload with the repo config. Dynamic imports keep it CMS-only. */
async function getPayloadClient(): Promise<Payload> {
  if (!payloadPromise) {
    payloadPromise = (async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        throw new Error(
          "CONTENT_SOURCE=cms requires DATABASE_URL. Configure it in .env.local (see docs/build/cms.md) " +
            "or use CONTENT_SOURCE=fixture (défaut)."
        )
      }
      const { getPayload } = await import("payload")
      const { default: config } = await import("@payload-config")
      return getPayload({ config })
    })().catch((error: unknown) => {
      // Let a later request retry instead of caching a rejected promise forever.
      payloadPromise = null
      throw error
    })
  }
  return payloadPromise
}

/* ------------------------------------------------------------------------- *
 * Mapping helpers
 * ------------------------------------------------------------------------- */

/** A non-empty trimmed string, or `undefined`. */
function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined
}

/** The media id of an upload relation (id or populated document). */
function mediaId(value: unknown): string | undefined {
  if (typeof value === "number" || typeof value === "string") return String(value)
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id
    if (id !== undefined && id !== null) return String(id)
  }
  return undefined
}

/**
 * Normalise a Payload file URL for `next/image`.
 *
 * The local-disk fallback returns an absolute URL built from `serverURL`; an
 * absolute same-origin URL is treated as a remote image by Next, so it is
 * reduced to its pathname. Object-storage URLs (R2 public domain) stay
 * absolute — #32/#31 own the `images.remotePatterns` entry for that domain.
 */
function normalizeMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (!serverUrl) return url
  try {
    const parsed = new URL(url)
    const base = new URL(serverUrl)
    if (parsed.origin === base.origin) return `${parsed.pathname}${parsed.search}`
  } catch {
    // Relative URL: use as-is.
  }
  return url
}

/** Map a CMS media row to the seam record; `null` when rights are not cleared. */
function toMediaRecord(media: {
  id: number | string
  url?: string | null
  alt: string
  width?: number | null
  height?: number | null
  rightsStatus?: string | null
  rightsBasis?: string | null
  rightsReference?: string | null
  peoplePresent?: boolean | null
  releaseStatus?: string | null
  clientMarks?: boolean | null
  clientPermission?: boolean | null
  trademarkPermission?: boolean | null
}): MediaRecord | null {
  const cleared =
    media.rightsStatus === "cleared" &&
    (!media.peoplePresent || media.releaseStatus === "cleared") &&
    (!media.clientMarks ||
      (media.clientPermission === true && media.trademarkPermission === true))
  if (!cleared) return null

  const basis: MediaRecord["rights"]["basis"] =
    media.rightsBasis === "client-supplied"
      ? "authorised"
      : media.rightsBasis === "licensed"
        ? "licensed"
        : media.rightsBasis === "company-owned"
          ? "company-owned"
          : "unknown"

  return {
    id: String(media.id),
    src: normalizeMediaUrl(media.url),
    alt: media.alt,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
    rights: {
      status: "cleared",
      basis,
      permissionReference: media.rightsReference ?? undefined,
      peoplePresent: media.peoplePresent === true,
      releaseStatus: (media.releaseStatus as MediaRecord["rights"]["releaseStatus"]) ?? "not-required",
      clientMarks: media.clientMarks === true,
      clientPermission: media.clientPermission === true,
      trademarkPermission: media.trademarkPermission === true,
    },
  }
}

/** Reverse map route → rubrique key, for gate-aware internal links. */
const ROUTE_TO_KEY: ReadonlyMap<string, RubriqueKey> = new Map(
  (Object.entries(RUBRIQUE_ROUTES) as Array<[RubriqueKey, string]>).map(
    ([key, route]) => [route, key] as const
  )
)

/**
 * Resolve a CMS link (`label` + target enum) to a seam link.
 *
 * An internal link to a rubrique whose gate is closed is omitted: the site
 * never renders a hidden link (docs/build/content-seam.md §5). `mailto:` targets
 * are code-owned and always resolve.
 */
async function publishedLink(
  payload: Payload,
  label: unknown,
  target: unknown
): Promise<ContentLink | null> {
  const linkLabel = text(label)
  const href = resolveLinkTarget(target)
  if (!linkLabel || !href) return null
  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return { label: linkLabel, href }
  }
  const key = ROUTE_TO_KEY.get(href)
  if (key) {
    const state = await publishStateOf(payload, key)
    if (!state.published) return null
  }
  return { label: linkLabel, href }
}

/** Gather a hero block from a CMS hero group (only when it carries a title). */
async function mapHero(
  payload: Payload,
  hero:
    | {
        title?: string | null
        subtitle?: string | null
        image?: unknown
        primaryCtaLabel?: string | null
        primaryCtaTarget?: string | null
        secondaryCtaLabel?: string | null
        secondaryCtaTarget?: string | null
      }
    | null
    | undefined
): Promise<HeroBlock | null> {
  const headline = text(hero?.title)
  if (!headline) return null
  const links = [
    await publishedLink(payload, hero?.primaryCtaLabel, hero?.primaryCtaTarget),
    await publishedLink(payload, hero?.secondaryCtaLabel, hero?.secondaryCtaTarget),
  ].filter((link): link is ContentLink => link !== null)
  return {
    kind: "hero",
    headline,
    tagline: text(hero?.subtitle),
    mediaId: mediaId(hero?.image),
    links,
  }
}

/** Gather the optional contact CTA band; it requires a title. */
async function mapContactCta(
  payload: Payload,
  cta:
    | {
        title?: string | null
        body?: unknown
        ctaLabel?: string | null
        ctaTarget?: string | null
      }
    | null
    | undefined,
  fallbackLink?: { label: string; target: string }
): Promise<ContentBlock | null> {
  const title = text(cta?.title)
  if (!title) return null
  const link = fallbackLink
    ? await publishedLink(payload, cta?.ctaLabel ?? fallbackLink.label, cta?.ctaTarget ?? fallbackLink.target)
    : await publishedLink(payload, cta?.ctaLabel, cta?.ctaTarget)
  return {
    kind: "contact-cta",
    title,
    body: richTextToPlainText(cta?.body) || undefined,
    link: link ?? undefined,
  }
}

/** Build a `sections` block from a titled item array. */
function mapSections(
  title: unknown,
  items: ReadonlyArray<{ title?: string | null; body?: string | null }> | null | undefined
): SectionsBlock | null {
  const blockTitle = text(title)
  const mapped = (items ?? [])
    .map((item) => ({ title: text(item.title), body: text(item.body) }))
    .filter((item): item is { title: string; body: string | undefined } => Boolean(item.title))
    .map((item) => ({ title: item.title, body: item.body }))
  if (!blockTitle && mapped.length === 0) return null
  return { kind: "sections", title: blockTitle, items: mapped }
}

/** Build a `steps` block from a titled item array. */
function mapSteps(
  title: unknown,
  items: ReadonlyArray<{ title?: string | null; body?: string | null }> | null | undefined
): StepsBlock | null {
  const stepTitle = text(title)
  const mapped = (items ?? [])
    .map((item) => ({ title: text(item.title), body: text(item.body) }))
    .filter((item): item is { title: string; body: string | undefined } => Boolean(item.title))
    .map((item) => ({ title: item.title, body: item.body }))
  if (!stepTitle && mapped.length === 0) return null
  return { kind: "steps", title: stepTitle, items: mapped }
}

/* ------------------------------------------------------------------------- *
 * Page mapping (global → PageDocument)
 * ------------------------------------------------------------------------- */

interface PageDraft {
  readonly title?: string
  readonly description?: string
  readonly blocks: ContentBlock[]
}

/** homepage → Accueil trame (ticket #23 order). */
async function mapHomepage(payload: Payload, doc: Config["globals"]["homepage"]): Promise<PageDraft> {
  const blocks: ContentBlock[] = []
  const hero = await mapHero(payload, doc.hero)
  if (hero) blocks.push(hero)

  const introParagraphs = richTextToParagraphs(doc.intro?.body)
  if (introParagraphs.length) {
    blocks.push({ kind: "intro", paragraphs: introParagraphs })
  }

  const servicesBandTitle = text(doc.servicesBand?.title)
  if (servicesBandTitle) {
    blocks.push({ kind: "domaines", title: servicesBandTitle })
  }

  // Code-owned approved facts — never CMS-editable (content model §3).
  blocks.push({ kind: "reperes", items: REPERES.map((fact) => ({ ...fact })) })

  const teaser = doc.referencesTeaser
  const statement = richTextToPlainText(teaser?.fallbackText)
  if (statement) {
    const teaserLink = await publishedLink(
      payload,
      teaser?.linkLabel,
      teaser?.linkTarget ?? "realisations"
    )
    blocks.push({
      kind: "credentials",
      statement,
      body: text(teaser?.body),
      items: [],
      link: teaserLink ?? undefined,
    })
  }

  if (Array.isArray(doc.engagements) && doc.engagements.length > 0) {
    blocks.push({
      kind: "engagements",
      items: doc.engagements
        .map((item) => ({ title: text(item.title), body: text(item.body) }))
        .filter((item): item is { title: string; body: string | undefined } => Boolean(item.title)),
    })
  }

  const cta = await mapContactCta(payload, doc.contactCta)
  if (cta) blocks.push(cta)

  return {
    title: text(doc.hero?.title),
    description: text(doc.seo?.description),
    blocks,
  }
}

/** entreprise → À propos trame (ticket #25: intro, chapters, contact CTA). */
async function mapEntreprise(
  payload: Payload,
  doc: Config["globals"]["entreprise"]
): Promise<PageDraft> {
  const blocks: ContentBlock[] = []
  const introParagraphs = richTextToParagraphs(doc.intro?.body)
  if (introParagraphs.length) {
    blocks.push({ kind: "intro", paragraphs: introParagraphs })
  }

  for (const chapter of doc.chapters ?? []) {
    const block = mapSections(chapter.title, chapter.items)
    if (block) blocks.push(block)
  }

  const cta = await mapContactCta(payload, doc.contactCta)
  if (cta) blocks.push(cta)

  return { title: text(doc.hero?.title), description: text(doc.seo?.description), blocks }
}

/** metiers → domain index trame (intro + domain-list placement). */
function mapMetiers(doc: Config["globals"]["metiers"]): PageDraft {
  const blocks: ContentBlock[] = []
  const introParagraphs = richTextToParagraphs(doc.intro?.body)
  if (introParagraphs.length) {
    blocks.push({ kind: "intro", paragraphs: introParagraphs })
  }
  // Placement marker: the list itself is derived from the published domains.
  blocks.push({ kind: "domaines" })
  return { title: text(doc.title), description: text(doc.seo?.description), blocks }
}

/** realisations → credentials-led Réalisations trame (ticket #24 order). */
async function mapRealisations(
  payload: Payload,
  doc: Config["globals"]["realisations"]
): Promise<PageDraft> {
  const blocks: ContentBlock[] = []

  const hero = await mapHero(payload, doc.hero)
  if (hero) blocks.push(hero)

  const introParagraphs = richTextToParagraphs(doc.intro?.body)
  if (introParagraphs.length) {
    const introLink = await publishedLink(payload, doc.intro?.linkLabel, doc.intro?.linkTarget)
    blocks.push({
      kind: "intro",
      paragraphs: introParagraphs,
      link: introLink ?? undefined,
    })
  }

  const servicesBandTitle = text(doc.servicesBand?.title)
  if (servicesBandTitle) {
    blocks.push({ kind: "domaines", title: servicesBandTitle })
  }

  // Placement marker: the qualifications content is code-owned and gated by
  // `agrementLive` (lib/site/realisations.ts); the trame renders the block title.
  blocks.push({ kind: "qualifications", title: text(doc.qualifications?.title) })

  const references = doc.references
  const statement = richTextToPlainText(references?.fallbackText)
  if (statement) {
    const link = await publishedLink(
      payload,
      references?.linkLabel,
      references?.linkTarget ?? "references-mailto"
    )
    const items = (references?.items ?? []).map((item) => ({
      label: text(item.label) ?? "",
      description: text(item.description),
    }))
    blocks.push({
      kind: "credentials",
      title: text(references?.title),
      statement,
      body: text(references?.body),
      items: items.filter((item) => item.label.length > 0),
      link: link ?? undefined,
    })
  }

  const documentation = mapSections(doc.documentation?.title, doc.documentation?.items)
  if (documentation) blocks.push(documentation)

  const method = mapSteps(doc.method?.title, doc.method?.items)
  if (method) blocks.push(method)

  const cta = await mapContactCta(payload, doc.contactCta)
  if (cta) blocks.push(cta)

  return { title: text(doc.title), description: text(doc.seo?.description), blocks }
}

/** contact → email-first Contact trame (ticket #26: no form, no channels at P1). */
async function mapContact(
  payload: Payload,
  doc: Config["globals"]["contact"]
): Promise<PageDraft> {
  const blocks: ContentBlock[] = []

  const introParagraphs = richTextToParagraphs(doc.intro?.body)
  if (introParagraphs.length) {
    blocks.push({ kind: "intro", paragraphs: introParagraphs })
  }

  // The email band carries no link field: the mailto and address are code-owned
  // and rendered by the component (lib/site/contact.ts, lib/site/company.ts).
  const ctaTitle = text(doc.contactCta?.title)
  if (ctaTitle) {
    blocks.push({
      kind: "contact-cta",
      title: ctaTitle,
      body: richTextToPlainText(doc.contactCta?.body) || undefined,
    })
  }

  const sections = mapSections(doc.sections?.title, doc.sections?.items)
  if (sections) blocks.push(sections)
  const steps = mapSteps(doc.steps?.title, doc.steps?.items)
  if (steps) blocks.push(steps)

  return { title: text(doc.title), description: text(doc.seo?.description), blocks }
}

/** carrieres → Carrières trame (hero + culture intro; jobs come from the collection). */
function mapCarrieres(doc: Config["globals"]["carrieres"]): PageDraft {
  const blocks: ContentBlock[] = []
  const headline = text(doc.hero?.title)
  if (headline) {
    blocks.push({
      kind: "hero",
      headline,
      tagline: text(doc.hero?.subtitle),
      links: [],
    })
  }
  const introParagraphs = richTextToParagraphs(doc.intro?.body)
  if (introParagraphs.length) {
    blocks.push({ kind: "intro", paragraphs: introParagraphs })
  }
  return {
    title: headline,
    description: text(doc.seo?.description),
    blocks,
  }
}

/** Map one global to a page document (or `null` when it is not a page trame). */
async function getPageFromGlobal(
  payload: Payload,
  key: RubriqueKey,
  global: PageGlobal
): Promise<PageDocument | null> {
  let doc: unknown
  try {
    doc = await payload.findGlobal({
      slug: global,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
  } catch {
    return null
  }
  if (!doc) return null

  let draft: PageDraft
  switch (global) {
    case "homepage":
      draft = await mapHomepage(payload, doc as Config["globals"]["homepage"])
      break
    case "entreprise":
      draft = await mapEntreprise(payload, doc as Config["globals"]["entreprise"])
      break
    case "metiers":
      draft = mapMetiers(doc as Config["globals"]["metiers"])
      break
    case "realisations":
      draft = await mapRealisations(payload, doc as Config["globals"]["realisations"])
      break
    case "contact":
      draft = await mapContact(payload, doc as Config["globals"]["contact"])
      break
    case "carrieres":
      draft = mapCarrieres(doc as Config["globals"]["carrieres"])
      break
    default:
      return null
  }

  // A global that was never filled must not pretend to be a page: the route
  // then 404s instead of rendering an empty trame (#29's rule, kept by #30).
  if (!draft.title && draft.blocks.length === 0) return null

  return {
    key,
    title: draft.title,
    description: draft.description,
    blocks: draft.blocks,
  }
}

/** Domains collection row → domain document (seam contract). */
async function mapDomain(
  payload: Payload,
  doc: Config["collections"]["domaines"]
): Promise<DomainDocument> {
  const blocks: ContentBlock[] = []

  const presentationParagraphs = richTextToParagraphs(doc.presentation?.body)
  if (presentationParagraphs.length) {
    blocks.push({
      kind: "presentation",
      title: text(doc.presentation?.title),
      paragraphs: presentationParagraphs,
    })
  }

  const prestations = (doc.prestations?.items ?? [])
    .map((item) => ({ label: text(item.label), description: text(item.description) }))
    .filter((item): item is { label: string; description: string | undefined } => Boolean(item.label))
    .map((item) => ({ label: item.label, description: item.description }))
  if (prestations.length) {
    blocks.push({
      kind: "prestations",
      title: text(doc.prestations?.title),
      items: prestations,
    })
  }

  const methods = (doc.methods?.items ?? [])
    .map((item) => ({ title: text(item.title), body: text(item.body) }))
    .filter((item): item is { title: string; body: string | undefined } => Boolean(item.title))
    .map((item) => ({ title: item.title, body: item.body }))
  if (methods.length) {
    blocks.push({ kind: "methods", title: text(doc.methods?.title), items: methods })
  }

  const contactCta = await mapContactCta(payload, doc.contactCta)
  if (contactCta) blocks.push(contactCta)

  return {
    slug: String(doc.slug),
    title: doc.title,
    summary: text(doc.summary),
    description: text(doc.seo?.description),
    blocks,
  }
}

/* ------------------------------------------------------------------------- *
 * Publish state
 * ------------------------------------------------------------------------- */

/** Does the CMS hold a published version of the global behind a rubrique? */
async function globalIsPublished(payload: Payload, global: PageGlobal): Promise<boolean> {
  try {
    const doc = await payload.findGlobal({
      slug: global,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    return (doc as { _status?: string } | null)?._status === "published"
  } catch {
    return false
  }
}

/**
 * Publish state of one rubrique. The code-owned tier gate wins over the CMS
 * publish state: a P2/P3 page (and any future record for one) can never be
 * opened from the admin. The legal utility pages are code-owned and always
 * published at P1 (#28).
 */
async function publishStateOf(payload: Payload, key: RubriqueKey): Promise<PublishState> {
  if (!tierAllowsPublication(key)) {
    return {
      published: false,
      reason:
        rubriqueGateReason(key) ??
        "Palier fermé (barrière code-owned) : l’admin ne peut pas ouvrir cette page.",
    }
  }

  if (LEGAL_PAGE_KEYS.includes(key)) {
    // Code-owned prose and identity block (#28): nothing to publish in the CMS.
    return { published: true }
  }

  const global = PAGE_GLOBALS[key]
  if (!global) {
    return { published: false, reason: "Aucune page CMS pour cette rubrique." }
  }

  if (await globalIsPublished(payload, global)) return { published: true }

  return {
    published: false,
    reason: `Page non publiée dans le CMS (${RUBRIQUE_LABELS[key]}). Publiez-la depuis sa fiche pour la rendre visible ; la dépublication la retire sans la supprimer.`,
  }
}

/* ------------------------------------------------------------------------- *
 * ContentSource implementation
 * ------------------------------------------------------------------------- */

/** Build the `ContentSource` implementation bound to one Payload instance. */
export function createCmsContentSource(payload: Payload): ContentSource {
  return {
    async getPublishState(key: RubriqueKey): Promise<PublishState> {
      return publishStateOf(payload, key)
    },

    async listPublishedRubriques(): Promise<readonly RubriqueKey[]> {
      const keys = Object.keys(RUBRIQUE_ROUTES) as RubriqueKey[]
      const published: RubriqueKey[] = []
      for (const key of keys) {
        const state = await publishStateOf(payload, key)
        if (state.published) published.push(key)
      }
      // Registry order (the literal map above is written in CDC order).
      return published
    },

    async getPage(key: RubriqueKey): Promise<PageDocument | null> {
      // The legal utility pages are code-owned: they have no CMS document but
      // do have a published route (the sitemap needs the route marker).
      if (LEGAL_PAGE_KEYS.includes(key)) {
        return { key, blocks: [] }
      }
      if (!tierAllowsPublication(key)) return null
      const global = PAGE_GLOBALS[key]
      if (!global) return null
      return getPageFromGlobal(payload, key, global)
    },

    async listPublishedDomains(): Promise<readonly DomainDocument[]> {
      const result = await payload.find({
        collection: "domaines",
        where: { _status: { equals: "published" } },
        depth: 0,
        limit: 0,
        pagination: false,
        sort: "createdAt",
        overrideAccess: true,
      })
      const published = result.docs.filter((doc) => domainGateOpen(String(doc.slug)))
      return Promise.all(published.map((doc) => mapDomain(payload, doc)))
    },

    async getDomain(slug: string): Promise<DomainDocument | null> {
      // Validate the slug against the code-owned enum BEFORE querying: `slug` is
      // a Postgres enum column, and an unknown value would make the query throw
      // `invalid input value for enum` (500) instead of returning "unknown"
      // (404). Unknown and closed slugs must be indistinguishable.
      if (!DOMAIN_KEYS.some((domain) => domain.slug === slug)) return null
      // A code-owned gate hides the domain even when its CMS record exists and
      // is published: publishing can never open a gate (ticket #30 acceptance).
      if (!domainGateOpen(slug)) return null
      const result = await payload.find({
        collection: "domaines",
        where: {
          and: [
            { slug: { equals: slug } },
            { _status: { equals: "published" } },
          ],
        },
        depth: 0,
        limit: 1,
        pagination: false,
        overrideAccess: true,
      })
      const doc = result.docs[0]
      if (!doc) return null
      return mapDomain(payload, doc)
    },

    async getActualites(): Promise<readonly ActualiteDocument[]> {
      // Code-owned gate: the listing route and its entries stay hidden until
      // the developer opens `actualitesLive` (content model §6). The model and
      // the admin content exist; nothing leaves the seam while it is false.
      if (!ACTUALITES_LIVE) return []
      return []
    },

    async getOpenJobs(): Promise<readonly JobOpening[]> {
      const result = await payload.find({
        collection: "jobs",
        where: { _status: { equals: "published" } },
        depth: 0,
        limit: 0,
        pagination: false,
        overrideAccess: true,
      })
      const now = Date.now()
      const open = result.docs.filter((job) => {
        if (job.openingStatus !== "open") return false
        if (!job.closingAt) return true
        const closing = Date.parse(`${job.closingAt.slice(0, 10)}T23:59:59Z`)
        return Number.isFinite(closing) && closing >= now
      })
      open.sort((a, b) => {
        if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1
        return (b.postedAt ?? "").localeCompare(a.postedAt ?? "")
      })
      return open.map((job) => ({
        slug: job.slug,
        title: job.title,
        contractType: job.contractType,
        location: job.location ?? "Rabat",
        department: text(job.department),
        experience: text(job.experienceLevel),
        summary: job.summary,
        postedAt: text(job.postedAt)?.slice(0, 10),
        closingAt: text(job.closingAt)?.slice(0, 10),
      }))
    },

    async getCareersChannel(): Promise<CareersChannel> {
      // F-113 gate — code-owned deployment state, NEVER CMS-editable: opening
      // `recrutement@hay2010.ma` is a gated claim until the CNDP authorization
      // covers the mailbox (facts register §2.3/§3, forms doc §4.4/§4.9). At
      // launch the gate is closed: the page points at contact@ only and never
      // invites a CV. Opening it is a code change that carries the real
      // authorization number and date — not an admin action (#30/#34).
      return CAREERS_CHANNEL_CLOSED
    },

    async getMedia(id: string): Promise<MediaRecord | null> {
      const numericId = Number(id)
      if (!Number.isInteger(numericId) || numericId <= 0) return null
      try {
        const media = await payload.findByID({
          collection: "media",
          id: numericId,
          depth: 0,
          overrideAccess: true,
        })
        return toMediaRecord(media)
      } catch {
        return null
      }
    },
  }
}

/**
 * Entry point called by `lib/content/index.ts` for `CONTENT_SOURCE=cms`.
 * The returned source is a process-wide singleton (Payload owns the pool).
 */
export async function getCmsContentSource(): Promise<ContentSource> {
  const payload = await getPayloadClient()
  cmsSource ??= createCmsContentSource(payload)
  return cmsSource
}

let cmsSource: ContentSource | null = null

/** Exposed for the gate-reason assertions of the admin/verification suite. */
export { domainGateReason, DOMAIN_GATES }
