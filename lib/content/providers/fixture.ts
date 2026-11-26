/**
 * Fixture provider — the default content source for development, the build
 * gate and the whole HTTP test strategy (spec: "Testing Decisions").
 *
 * It reads a JSON corpus tracked in `content/fixtures/`:
 * - `site.json` holds the documents (pages, domains, actualités, media);
 * - `scenarios/<name>.json` holds every publish gate for one site state.
 *
 * The scenario is selected by `CONTENT_SCENARIO` (default `p1`). Scenarios are
 * data, never `if` branches in components: opening or closing a gate is a JSON
 * edit. No database, no network, no filesystem access at request time — the
 * corpus is imported statically so it is bundled with the server build.
 */
import siteFixture from "@/content/fixtures/site.json"
import p1Scenario from "@/content/fixtures/scenarios/p1.json"
import p2Scenario from "@/content/fixtures/scenarios/p2.json"
import p3Scenario from "@/content/fixtures/scenarios/p3.json"
import p1GatesClosedScenario from "@/content/fixtures/scenarios/p1-gates-closed.json"
import p1RecrutementScenario from "@/content/fixtures/scenarios/p1-recrutement.json"
import p1HeroImageScenario from "@/content/fixtures/scenarios/p1-hero-image.json"

import type {
  ActualiteDocument,
  CareersChannel,
  ContentBlock,
  ContentSource,
  DomainDocument,
  JobOpening,
  MediaRecord,
  PageDocument,
  PublishState,
  RubriqueKey,
  Tier,
} from "@/lib/content/types"

/**
 * One gate scenario: the publish state of every rubrique, domain and job
 * opening, plus the simulated F-113 careers channel state. Everything here is
 * gate data, never copy — a scenario opens or closes a gate, it does not write
 * the page. The one test-only exception is the hero media hook (#23), which
 * exists solely to prove the image path while no licensed photo exists.
 */
interface ScenarioFixture {
  readonly tier: Tier
  readonly rubriques: Readonly<Record<string, PublishState>>
  readonly domains: Readonly<Record<string, PublishState>>
  readonly jobs?: Readonly<Record<string, PublishState>>
  readonly careers?: CareersChannel
  /**
   * Test-only content variant (#23): the cleared media id a page's hero must
   * carry in this corpus. Scenarios are gate maps; this single hook exists
   * because no licensed hero photograph exists at launch, so the image path is
   * proven by the `p1-hero-image` corpus instead of by the launch fixture. The
   * launch scenarios omit it and render the typographic fallback.
   */
  readonly heroMedia?: Readonly<Record<string, string>>
  /** Test-only media records supplied by the scenario (cleared ones only). */
  readonly media?: readonly MediaRecord[]
}

/** A job record as stored in the fixture corpus (state + opening metadata). */
interface JobFixture extends JobOpening {
  readonly status: "open" | "closed"
  readonly featured?: boolean
}

/** The documents shared by every scenario. */
interface SiteFixture {
  readonly pages: Readonly<
    Record<
      string,
      {
        readonly title?: string
        readonly description?: string
        readonly blocks: readonly ContentBlock[]
      }
    >
  >
  readonly domains: readonly {
    readonly slug: string
    readonly title: string
    readonly summary?: string
    readonly description?: string
    readonly blocks: readonly ContentBlock[]
  }[]
  readonly actualites: readonly {
    readonly slug: string
    readonly title: string
    readonly publishedAt?: string
    readonly blocks: readonly ContentBlock[]
  }[]
  readonly jobs: readonly JobFixture[]
  readonly media: readonly MediaRecord[]
}

/**
 * The scenarios the fixture provider accepts. Keeping the map explicit means
 * a mistyped `CONTENT_SCENARIO` fails loudly instead of silently serving the
 * launch state — a gate test must never pass against the wrong corpus.
 */
const SCENARIOS: Readonly<Record<string, ScenarioFixture>> = {
  p1: p1Scenario as unknown as ScenarioFixture,
  p2: p2Scenario as unknown as ScenarioFixture,
  p3: p3Scenario as unknown as ScenarioFixture,
  "p1-gates-closed": p1GatesClosedScenario as unknown as ScenarioFixture,
  "p1-recrutement": p1RecrutementScenario as unknown as ScenarioFixture,
  // Test-only hero image corpus (#23): the launch state plus one cleared hero
  // media record, proving the image path without shipping unlicensed imagery.
  "p1-hero-image": p1HeroImageScenario as unknown as ScenarioFixture,
}

const DEFAULT_SCENARIO = "p1"

/** The corpus is trusted build data: JSON modules are typed at this boundary. */
const SITE = siteFixture as unknown as SiteFixture

/** Resolved once per server process; scenarios never change at request time. */
let resolvedScenario: ScenarioFixture | null = null
let resolvedScenarioName: string | null = null

function getScenario(): ScenarioFixture {
  if (resolvedScenario) return resolvedScenario

  const name =
    (process.env.CONTENT_SCENARIO ?? DEFAULT_SCENARIO).trim() ||
    DEFAULT_SCENARIO
  const scenario = SCENARIOS[name]
  if (!scenario) {
    throw new Error(
      `Unknown CONTENT_SCENARIO "${name}". Known scenarios: ${Object.keys(SCENARIOS).join(", ")}.`
    )
  }

  resolvedScenario = scenario
  resolvedScenarioName = name
  return scenario
}

/** Name of the active fixture scenario — useful in docs/tests, never rendered. */
export function getScenarioName(): string {
  getScenario()
  return resolvedScenarioName ?? DEFAULT_SCENARIO
}

const PAGE_KEYS = new Set(Object.keys(SITE.pages))

function toPageDocument(key: RubriqueKey): PageDocument | null {
  if (!PAGE_KEYS.has(key)) return null
  const page = SITE.pages[key]
  return {
    key,
    title: page.title,
    description: page.description,
    blocks: page.blocks,
  }
}

/**
 * Apply the scenario's test-only hero media hook, if any (#23).
 *
 * Only the `heroMedia` entry of the active scenario changes a document; every
 * other scenario returns the shared corpus untouched, so the launch build keeps
 * the typographic fallback.
 */
function withScenarioHeroMedia(
  key: RubriqueKey,
  page: PageDocument
): PageDocument {
  const mediaId = getScenario().heroMedia?.[key]
  if (!mediaId) return page
  return {
    ...page,
    blocks: page.blocks.map((block) =>
      block.kind === "hero" ? { ...block, mediaId } : block
    ),
  }
}

function toDomainDocument(slug: string): DomainDocument | null {
  const domain = SITE.domains.find((candidate) => candidate.slug === slug)
  if (!domain) return null
  // Only cleared media may ever leave the seam: filter the photo blocks.
  return {
    slug: domain.slug,
    title: domain.title,
    summary: domain.summary,
    description: domain.description,
    blocks: domain.blocks,
  }
}

/** A job record still counts as an opening today (forms doc §4.2). */
function isJobStillOpen(job: JobFixture, now: number): boolean {
  if (job.status !== "open") return false
  if (!job.closingAt) return true
  const closing = Date.parse(`${job.closingAt}T23:59:59Z`)
  return Number.isFinite(closing) && closing >= now
}

/** Cards render `featured` first, then the most recently posted (§4.2). */
function compareJobs(a: JobFixture, b: JobFixture): number {
  if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1
  return (b.postedAt ?? "").localeCompare(a.postedAt ?? "")
}

/** Strip the record's internal state before it leaves the seam. */
function toJobOpening(job: JobFixture): JobOpening {
  return {
    slug: job.slug,
    title: job.title,
    contractType: job.contractType,
    location: job.location,
    department: job.department,
    experience: job.experience,
    summary: job.summary,
    postedAt: job.postedAt,
    closingAt: job.closingAt,
  }
}

function isMediaCleared(media: MediaRecord): boolean {
  const rights = media.rights
  if (rights.status !== "cleared") return false
  if (rights.peoplePresent && rights.releaseStatus !== "cleared") return false
  if (
    rights.clientMarks &&
    !(rights.clientPermission && rights.trademarkPermission)
  )
    return false
  return true
}

const fixtureSource: ContentSource = {
  async getPublishState(key: RubriqueKey): Promise<PublishState> {
    return (
      getScenario().rubriques[key] ?? {
        published: false,
        reason: "Rubrique inconnue du scénario.",
      }
    )
  },

  async listPublishedRubriques(): Promise<readonly RubriqueKey[]> {
    const rubriques = getScenario().rubriques
    return Object.keys(rubriques)
      .filter((key) => rubriques[key]?.published === true)
      .map((key) => key as RubriqueKey)
  },

  async getPage(key: RubriqueKey): Promise<PageDocument | null> {
    const page = toPageDocument(key)
    return page ? withScenarioHeroMedia(key, page) : null
  },

  async listPublishedDomains(): Promise<readonly DomainDocument[]> {
    const domains = getScenario().domains
    return SITE.domains
      .filter((domain) => domains[domain.slug]?.published === true)
      .map((domain) => toDomainDocument(domain.slug))
      .filter((domain): domain is DomainDocument => domain !== null)
  },

  async getDomain(slug: string): Promise<DomainDocument | null> {
    if (getScenario().domains[slug]?.published !== true) return null
    return toDomainDocument(slug)
  },

  async getActualites(): Promise<readonly ActualiteDocument[]> {
    // The P3 model exists from day one; the launch corpus is empty on purpose.
    return SITE.actualites.map((actualite) => ({
      slug: actualite.slug,
      title: actualite.title,
      publishedAt: actualite.publishedAt,
      blocks: actualite.blocks,
    }))
  },

  async getOpenJobs(): Promise<readonly JobOpening[]> {
    // Two filters compose, exactly like the CMS will: the publish gate (may this
    // record be public?) and the opening state (is the role still open?). The
    // launch corpus publishes no role; the "owner content" simulation scenarios
    // publish the drafted fixtures.
    const gates = getScenario().jobs ?? {}
    const now = Date.now()
    return SITE.jobs
      .filter((job) => gates[job.slug]?.published === true && isJobStillOpen(job, now))
      .sort(compareJobs)
      .map(toJobOpening)
  },

  async getCareersChannel(): Promise<CareersChannel> {
    // Fail closed: a scenario that does not say the F-113 gate is open gets the
    // questions-only state, and a live channel without its authorization
    // reference is not live (the page re-checks, forms doc §4.9).
    return getScenario().careers ?? { recruitmentMailboxLive: false }
  },

  async getMedia(id: string): Promise<MediaRecord | null> {
    // The scenario's test-only corpus wins, so a build can prove the hero image
    // path without putting unlicensed photography in the launch fixture (#23).
    const media =
      getScenario().media?.find((candidate) => candidate.id === id) ??
      SITE.media.find((candidate) => candidate.id === id)
    if (!media || !isMediaCleared(media)) return null
    return media
  },
}

/** The fixture implementation of the seam — a process-wide singleton. */
export function getFixtureContentSource(): ContentSource {
  return fixtureSource
}
