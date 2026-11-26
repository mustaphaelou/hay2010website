/**
 * Idempotent development/bootstrap seed for the embedded Payload database
 * (ticket #29 foundation, extended by ticket #30 to reproduce the fixture
 * corpus exactly).
 *
 * Run with `npm run seed` and a reachable `DATABASE_URL`:
 *
 *   export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5530/hay2010
 *   export PAYLOAD_SECRET=dev-only
 *   npm run migrate && npm run seed
 *
 * What it creates:
 * - the three launch accounts (`lib/payload/seed-accounts.ts`);
 * - two **test-only** media records with rights evidence — one pending, one
 *   cleared — used by the CMS verification suite to prove the rights gate and
 *   the revocation behaviour. The launch corpus itself has no photography
 *   (content model §10.2: "the seed leaves all media empty") and these records
 *   are never referenced by the seeded pages;
 * - the fixture corpus: the six page globals and the two utility pages' publish
 *   state, the five domain records (three published, two gated drafts), the job
 *   openings (drafts at launch, exactly like the `p1` fixture scenario);
 * - nothing invented: every string comes from `content/fixtures/site.json`, the
 *   code-owned claims (`lib/site/facts.ts`) or code-owned constants.
 *
 * The gate states are read from `content/fixtures/scenarios/p1.json`, the same
 * launch state the fixture provider serves in `npm test`, so a CMS build and a
 * fixture build render the same site (`npm run test:cms` compares them).
 *
 * It is idempotent: an existing account, media record, global or collection
 * record is left alone, so re-running the seed never duplicates or overwrites
 * an edit made in the admin. It writes through the Local API (never raw SQL),
 * so the collection hooks (media rights validation, publish gates) run exactly
 * as they do in production. `overrideAccess: true` is required because the seed
 * has no authenticated user.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

import { getPayload } from "payload"

import config from "../payload.config"
import { SEED_ACCOUNTS, seedPassword } from "../lib/payload/seed-accounts"
import { COMPANY } from "../lib/site/company"
import { LINK_TARGETS } from "../lib/payload/link-targets"
import { paragraphsToRichText } from "../lib/payload/rich-text"
import type { Media } from "../payload-types"

/** Payload instance as returned by `getPayload` (the seed's only client). */
type PayloadClient = Awaited<ReturnType<typeof getPayload>>

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

/* ------------------------------------------------------------------------- *
 * Fixture corpus (content/fixtures/site.json + scenarios/p1.json)
 * ------------------------------------------------------------------------- */

interface FixtureBlock {
  readonly kind: string
  readonly [key: string]: unknown
}

interface FixturePage {
  readonly title?: string
  readonly description?: string
  readonly blocks: readonly FixtureBlock[]
}

interface FixtureDomain {
  readonly slug: string
  readonly title: string
  readonly summary?: string
  readonly description?: string
  readonly blocks: readonly FixtureBlock[]
}

interface FixtureJob {
  readonly slug: string
  readonly title: string
  readonly contractType: string
  readonly location: string
  readonly department?: string
  readonly experience?: string
  readonly summary: string
  readonly status: "open" | "closed"
  readonly featured?: boolean
  readonly postedAt?: string
  readonly closingAt?: string
}

interface FixtureSite {
  readonly pages: Readonly<Record<string, FixturePage>>
  readonly domains: readonly FixtureDomain[]
  readonly actualites: readonly unknown[]
  readonly jobs: readonly FixtureJob[]
  readonly media: readonly unknown[]
}

interface FixtureGate {
  readonly published: boolean
}

interface FixtureScenario {
  readonly rubriques: Readonly<Record<string, FixtureGate>>
  readonly domains: Readonly<Record<string, FixtureGate>>
  readonly jobs?: Readonly<Record<string, FixtureGate>>
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T
}

/* ------------------------------------------------------------------------- *
 * Fixture mapping helpers
 * ------------------------------------------------------------------------- */

/** Find the first block of a kind in a page fixture. */
function blockOf<T = FixtureBlock>(
  page: FixturePage | undefined,
  kind: string
): T | null {
  return (page?.blocks.find((block) => block.kind === kind) as T | undefined) ?? null
}

/** The code-owned link-target value for an href written in the fixture corpus. */
function targetOf(href: unknown): string | undefined {
  if (typeof href !== "string") return undefined
  const target = LINK_TARGETS.find((candidate) => candidate.href === href)
  if (!target) {
    throw new Error(
      `Seed: fixture link "${href}" has no code-owned link target in lib/payload/link-targets.ts.`
    )
  }
  return target.value
}

interface FixtureLink {
  readonly label: string
  readonly href: string
}

function linksOf(value: unknown): readonly FixtureLink[] {
  return Array.isArray(value) ? (value as FixtureLink[]) : []
}

function richTextOf(...values: ReadonlyArray<string | undefined>): ReturnType<typeof paragraphsToRichText> | undefined {
  const paragraphs = values.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
  return paragraphs.length > 0 ? paragraphsToRichText(paragraphs) : undefined
}

/** An array field with optional `id`: the seed never sets Payload ids. */
function withoutIds<T extends object>(items: readonly T[]): Array<Omit<T, "id">> {
  return items.map((item) => {
    const copy: Record<string, unknown> = { ...(item as Record<string, unknown>) }
    delete copy.id
    return copy as Omit<T, "id">
  })
}

/* ------------------------------------------------------------------------- *
 * Accounts and media
 * ------------------------------------------------------------------------- */

async function seedAccounts(payload: PayloadClient): Promise<void> {
  const password = seedPassword()
  for (const account of SEED_ACCOUNTS) {
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: account.email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      console.log(`seed: compte ${account.email} déjà présent`)
      continue
    }
    await payload.create({
      collection: "users",
      data: {
        email: account.email,
        name: account.name,
        password,
        role: account.role,
        active: true,
      },
      overrideAccess: true,
    })
    console.log(`seed: compte ${account.email} créé (${account.role})`)
  }
}

/** A generated solid-colour PNG, so the seed needs no binary asset in Git. */
async function generatePng(width: number, height: number, rgb: [number, number, number]) {
  const data = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: rgb[0], g: rgb[1], b: rgb[2] },
    },
  })
    .png()
    .toBuffer()
  return { data, mimetype: "image/png", size: data.length }
}

interface SeedMedia {
  readonly filename: string
  readonly alt: string
  readonly width: number
  readonly height: number
  readonly colour: [number, number, number]
  readonly rightsBasis: Media["rightsBasis"]
  readonly rightsStatus: Media["rightsStatus"]
  readonly data: Partial<
    Pick<
      Media,
      | "caption"
      | "credit"
      | "rightsReference"
      | "peoplePresent"
      | "releaseStatus"
      | "releaseReference"
      | "clientMarks"
      | "clientPermission"
      | "trademarkPermission"
    >
  >
}

/**
 * Two test-only media records. They are NOT launch photography: they prove the
 * rights gate (pending) and the publishing path/revocation (cleared) in
 * `npm run test:cms`. The seeded pages never reference them.
 */
const SEED_MEDIA: readonly SeedMedia[] = [
  {
    filename: "media-droits-en-attente.png",
    alt: "Visuel de test sur fond bleu — droits en attente de validation.",
    width: 1600,
    height: 1200,
    colour: [37, 99, 235],
    rightsBasis: "company-owned",
    rightsStatus: "pending",
    data: {
      credit: "HAY2010",
      peoplePresent: true,
      releaseStatus: "pending",
    },
  },
  {
    filename: "media-droits-valides.png",
    alt: "Visuel de test sur fond vert — droits validés, utilisable sur le site.",
    width: 1200,
    height: 800,
    colour: [22, 163, 74],
    rightsBasis: "company-owned",
    rightsStatus: "cleared",
    data: {
      credit: "HAY2010",
      rightsReference: "AUT-SEED-PROPRIETE-1",
      peoplePresent: false,
      releaseStatus: "not-required",
      clientMarks: false,
    },
  },
]

async function seedMedia(payload: PayloadClient): Promise<void> {
  for (const definition of SEED_MEDIA) {
    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: definition.filename } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      console.log(`seed: média ${definition.filename} déjà présent`)
      continue
    }
    const file = await generatePng(definition.width, definition.height, definition.colour)
    const created = await payload.create({
      collection: "media",
      data: {
        alt: definition.alt,
        rightsBasis: definition.rightsBasis,
        rightsStatus: definition.rightsStatus,
        ...definition.data,
      },
      file: { ...file, name: definition.filename },
      overrideAccess: true,
    })
    console.log(`seed: média ${definition.filename} créé (${created.width}×${created.height})`)
  }
}

/* ------------------------------------------------------------------------- *
 * Globals — one per page trame, mapped from the fixture corpus
 * ------------------------------------------------------------------------- */

/** Does a previously seeded global already carry content? */
function globalHasContent(doc: unknown): boolean {
  if (!doc || typeof doc !== "object") return false
  const record = doc as Record<string, unknown>
  // `updatedAt` is only present after a first save.
  return typeof record.updatedAt === "string" && record.updatedAt.length > 0
}

/** Seed one global (published or draft) unless it already exists. */
async function seedGlobal(
  payload: PayloadClient,
  slug: "homepage" | "entreprise" | "metiers" | "realisations" | "contact" | "carrieres",
  data: Record<string, unknown>,
  status: "draft" | "published"
): Promise<void> {
  const existing = await payload.findGlobal({
    slug,
    draft: true,
    depth: 0,
    overrideAccess: true,
  })
  if (globalHasContent(existing)) {
    console.log(`seed: global ${slug} déjà présent (${status})`)
    return
  }
  await payload.updateGlobal({
    slug,
    data: { ...data, _status: status } as never,
    draft: status === "draft",
    overrideAccess: true,
  })
  console.log(`seed: global ${slug} créé (${status})`)
}

/** homepage ← fixture page `accueil` (ticket #23 trame). */
function homepageData(page: FixturePage): Record<string, unknown> {
  const hero = blockOf<{
    headline: string
    tagline?: string
    links?: readonly FixtureLink[]
  }>(page, "hero")
  const intro = blockOf<{ paragraphs: readonly string[] }>(page, "intro")
  const domaines = blockOf<{ title?: string }>(page, "domaines")
  const credentials = blockOf<{
    statement: string
    body?: string
    link?: FixtureLink
  }>(page, "credentials")
  const engagements = blockOf<{
    items: ReadonlyArray<{ title: string; body?: string }>
  }>(page, "engagements")
  const cta = blockOf<{
    title: string
    body?: string
    link?: FixtureLink
  }>(page, "contact-cta")

  if (!hero || !intro) throw new Error("seed: fixture accueil is missing its hero/intro")

  const heroLinks = linksOf(hero.links)
  const teaserLink = credentials?.link

  return {
    hero: {
      title: hero.headline,
      subtitle: hero.tagline,
      primaryCtaLabel: heroLinks[0]?.label,
      primaryCtaTarget: targetOf(heroLinks[0]?.href),
      secondaryCtaLabel: heroLinks[1]?.label,
      secondaryCtaTarget: targetOf(heroLinks[1]?.href),
    },
    intro: { body: richTextOf(...intro.paragraphs) },
    servicesBand: { title: domaines?.title },
    referencesTeaser: {
      fallbackText: richTextOf(credentials?.statement),
      body: credentials?.body,
      linkLabel: teaserLink?.label,
      linkTarget: targetOf(teaserLink?.href),
    },
    engagements: withoutIds(
      (engagements?.items ?? []).map((item) => ({
        title: item.title,
        body: item.body,
      }))
    ),
    contactCta: {
      title: cta?.title,
      body: richTextOf(cta?.body),
      ctaLabel: cta?.link?.label,
      ctaTarget: targetOf(cta?.link?.href),
    },
    seo: { description: page.description },
  }
}

/** entreprise ← fixture page `a-propos` (ticket #25 trame). */
function entrepriseData(page: FixturePage): Record<string, unknown> {
  const intro = blockOf<{ paragraphs: readonly string[] }>(page, "intro")
  const contactCta = blockOf<{
    title: string
    body?: string
    link?: FixtureLink
  }>(page, "contact-cta")
  const chapters = page.blocks
    .filter((block) => block.kind === "sections")
    .map((block) => {
      const section = block as unknown as {
        title?: string
        items: ReadonlyArray<{ title: string; body?: string }>
      }
      return {
        title: section.title,
        items: withoutIds(
          section.items.map((item) => ({ title: item.title, body: item.body }))
        ),
      }
    })

  return {
    hero: { title: page.title },
    intro: { body: richTextOf(...(intro?.paragraphs ?? [])) },
    chapters: withoutIds(chapters),
    contactCta: {
      title: contactCta?.title,
      body: richTextOf(contactCta?.body),
      ctaLabel: contactCta?.link?.label,
      ctaTarget: targetOf(contactCta?.link?.href),
    },
    seo: { description: page.description },
  }
}

/** metiers ← fixture page `domaines-activite` (ticket #22 trame). */
function metiersData(page: FixturePage): Record<string, unknown> {
  const intro = blockOf<{ paragraphs: readonly string[] }>(page, "intro")
  return {
    title: page.title,
    intro: { body: richTextOf(...(intro?.paragraphs ?? [])) },
    seo: { description: page.description },
  }
}

/** realisations ← fixture page `realisations` (ticket #24 trame). */
function realisationsData(page: FixturePage): Record<string, unknown> {
  const hero = blockOf<{
    headline: string
    tagline?: string
    links?: readonly FixtureLink[]
  }>(page, "hero")
  const intro = blockOf<{
    paragraphs: readonly string[]
    link?: FixtureLink
  }>(page, "intro")
  const domaines = blockOf<{ title?: string }>(page, "domaines")
  const qualifications = blockOf<{ title?: string }>(page, "qualifications")
  const references = blockOf<{
    title?: string
    statement: string
    body?: string
    items: ReadonlyArray<{ label: string; description?: string }>
    link?: FixtureLink
  }>(page, "credentials")
  const documentation = blockOf<{
    title?: string
    items: ReadonlyArray<{ title: string; body?: string }>
  }>(page, "sections")
  const method = blockOf<{
    title?: string
    items: ReadonlyArray<{ title: string; body?: string }>
  }>(page, "steps")
  const contactCta = blockOf<{
    title: string
    body?: string
    link?: FixtureLink
  }>(page, "contact-cta")

  const heroLinks = linksOf(hero?.links)

  return {
    title: page.title,
    hero: {
      title: hero?.headline,
      subtitle: hero?.tagline,
      primaryCtaLabel: heroLinks[0]?.label,
      primaryCtaTarget: targetOf(heroLinks[0]?.href),
      secondaryCtaLabel: heroLinks[1]?.label,
      secondaryCtaTarget: targetOf(heroLinks[1]?.href),
    },
    intro: {
      body: richTextOf(...(intro?.paragraphs ?? [])),
      linkLabel: intro?.link?.label,
      linkTarget: targetOf(intro?.link?.href),
    },
    servicesBand: { title: domaines?.title },
    qualifications: { title: qualifications?.title },
    references: {
      title: references?.title,
      fallbackText: richTextOf(references?.statement),
      body: references?.body,
      items: withoutIds(
        (references?.items ?? []).map((item) => ({
          label: item.label,
          description: item.description,
        }))
      ),
      linkLabel: references?.link?.label,
      linkTarget: targetOf(references?.link?.href),
    },
    documentation: {
      title: documentation?.title,
      items: withoutIds(
        (documentation?.items ?? []).map((item) => ({
          title: item.title,
          body: item.body,
        }))
      ),
    },
    method: {
      title: method?.title,
      items: withoutIds(
        (method?.items ?? []).map((item) => ({ title: item.title, body: item.body }))
      ),
    },
    contactCta: {
      title: contactCta?.title,
      body: richTextOf(contactCta?.body),
      ctaLabel: contactCta?.link?.label,
      ctaTarget: targetOf(contactCta?.link?.href),
    },
    seo: { description: page.description },
  }
}

/** contact ← fixture page `contact` (ticket #26 trame). */
function contactData(page: FixturePage): Record<string, unknown> {
  const intro = blockOf<{ paragraphs: readonly string[] }>(page, "intro")
  const contactCta = blockOf<{ title: string; body?: string }>(page, "contact-cta")
  const sections = blockOf<{
    title?: string
    items: ReadonlyArray<{ title: string; body?: string }>
  }>(page, "sections")
  const steps = blockOf<{
    title?: string
    items: ReadonlyArray<{ title: string; body?: string }>
  }>(page, "steps")

  return {
    title: page.title,
    intro: { body: richTextOf(...(intro?.paragraphs ?? [])) },
    contactCta: {
      title: contactCta?.title,
      body: richTextOf(contactCta?.body),
    },
    sections: {
      title: sections?.title,
      items: withoutIds(
        (sections?.items ?? []).map((item) => ({ title: item.title, body: item.body }))
      ),
    },
    steps: {
      title: steps?.title,
      items: withoutIds(
        (steps?.items ?? []).map((item) => ({ title: item.title, body: item.body }))
      ),
    },
    seo: { description: page.description },
  }
}

/** carrieres ← fixture page `carrieres` (ticket #27 trame). */
function carrieresData(page: FixturePage): Record<string, unknown> {
  const hero = blockOf<{ headline: string; tagline?: string }>(page, "hero")
  const intro = blockOf<{ paragraphs: readonly string[] }>(page, "intro")
  return {
    hero: { title: hero?.headline, subtitle: hero?.tagline },
    intro: { body: richTextOf(...(intro?.paragraphs ?? [])) },
    seo: { description: page.description },
  }
}

async function seedGlobals(
  payload: PayloadClient,
  site: FixtureSite,
  scenario: FixtureScenario
): Promise<void> {
  const published = (key: string): "published" | "draft" =>
    scenario.rubriques[key]?.published === true ? "published" : "draft"

  await seedGlobal(payload, "homepage", homepageData(site.pages.accueil), published("accueil"))
  await seedGlobal(payload, "entreprise", entrepriseData(site.pages["a-propos"]), published("a-propos"))
  await seedGlobal(
    payload,
    "metiers",
    metiersData(site.pages["domaines-activite"]),
    published("domaines-activite")
  )
  await seedGlobal(
    payload,
    "realisations",
    realisationsData(site.pages.realisations),
    published("realisations")
  )
  await seedGlobal(payload, "contact", contactData(site.pages.contact), published("contact"))
  await seedGlobal(
    payload,
    "carrieres",
    carrieresData(site.pages.carrieres),
    published("carrieres")
  )
}

/* ------------------------------------------------------------------------- *
 * Collections — domains and jobs
 * ------------------------------------------------------------------------- */

/** Map one fixture domain to the `domaines` collection fields. */
function domainData(domain: FixtureDomain): Record<string, unknown> {
  const presentation = blockOf<{
    title?: string
    paragraphs: readonly string[]
  }>(domain, "presentation")
  const prestations = blockOf<{
    title?: string
    items: ReadonlyArray<{ label: string; description?: string }>
  }>(domain, "prestations")
  const methods = blockOf<{
    title?: string
    items: ReadonlyArray<{ title: string; body?: string }>
  }>(domain, "methods")
  const contactCta = blockOf<{
    title: string
    body?: string
    link?: FixtureLink
  }>(domain, "contact-cta")

  return {
    slug: domain.slug,
    title: domain.title,
    summary: domain.summary,
    presentation: {
      title: presentation?.title,
      body: richTextOf(...(presentation?.paragraphs ?? [])),
    },
    prestations: {
      title: prestations?.title,
      items: withoutIds(
        (prestations?.items ?? []).map((item) => ({
          label: item.label,
          description: item.description,
        }))
      ),
    },
    methods: {
      title: methods?.title,
      items: withoutIds(
        (methods?.items ?? []).map((item) => ({ title: item.title, body: item.body }))
      ),
    },
    contactCta: {
      title: contactCta?.title,
      body: richTextOf(contactCta?.body),
      ctaLabel: contactCta?.link?.label,
      ctaTarget: targetOf(contactCta?.link?.href),
    },
    seo: { description: domain.description },
  }
}

async function seedDomains(
  payload: PayloadClient,
  site: FixtureSite,
  scenario: FixtureScenario
): Promise<void> {
  for (const domain of site.domains) {
    const existing = await payload.find({
      collection: "domaines",
      where: { slug: { equals: domain.slug } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      console.log(`seed: domaine ${domain.slug} déjà présent`)
      continue
    }
    const status =
      scenario.domains[domain.slug]?.published === true ? "published" : "draft"
    await payload.create({
      collection: "domaines",
      data: { ...domainData(domain), _status: status } as never,
      draft: status === "draft",
      overrideAccess: true,
    })
    console.log(`seed: domaine ${domain.slug} créé (${status})`)
  }
}

/** Map one fixture job to the `jobs` collection fields. */
function jobData(job: FixtureJob): Record<string, unknown> {
  return {
    title: job.title,
    slug: job.slug,
    openingStatus: job.status,
    contractType: job.contractType,
    location: job.location,
    department: job.department,
    experienceLevel: job.experience,
    summary: job.summary,
    postedAt: job.postedAt,
    closingAt: job.closingAt,
    featured: job.featured === true,
    // Code-owned (F-113): contact@ until the CNDP gate opens (registre des faits §2.3).
    applicationEmail: COMPANY.email,
  }
}

async function seedJobs(
  payload: PayloadClient,
  site: FixtureSite,
  scenario: FixtureScenario
): Promise<void> {
  for (const job of site.jobs) {
    const existing = await payload.find({
      collection: "jobs",
      where: { slug: { equals: job.slug } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      console.log(`seed: offre ${job.slug} déjà présente`)
      continue
    }
    const status = scenario.jobs?.[job.slug]?.published === true ? "published" : "draft"
    await payload.create({
      collection: "jobs",
      data: { ...jobData(job), _status: status } as never,
      draft: status === "draft",
      overrideAccess: true,
    })
    console.log(`seed: offre ${job.slug} créée (${status})`)
  }
}

/* ------------------------------------------------------------------------- *
 * Main
 * ------------------------------------------------------------------------- */

async function main(): Promise<void> {
  const site = readJson<FixtureSite>("content/fixtures/site.json")
  const scenario = readJson<FixtureScenario>("content/fixtures/scenarios/p1.json")

  const payload = await getPayload({ config })
  await seedAccounts(payload)
  await seedMedia(payload)
  await seedGlobals(payload, site, scenario)
  await seedDomains(payload, site, scenario)
  await seedJobs(payload, site, scenario)
  console.log("seed: terminé — corpus du fixture p1 reproduit")
}

// Top-level await is required: `payload run` imports the module and then exits
// its process, so a floating `main()` promise would be killed before the first
// query. Exit explicitly to close the Postgres pool.
try {
  await main()
  process.exit(0)
} catch (error) {
  console.error("seed: échec")
  console.error(error)
  process.exit(1)
}
