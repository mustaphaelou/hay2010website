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

import type {
  ActualiteDocument,
  ContentBlock,
  ContentSource,
  DomainDocument,
  MediaRecord,
  PageDocument,
  PublishState,
  RubriqueKey,
  Tier,
} from "@/lib/content/types"

/** One gate scenario: the publish state of every rubrique and domain. */
interface ScenarioFixture {
  readonly tier: Tier
  readonly rubriques: Readonly<Record<string, PublishState>>
  readonly domains: Readonly<Record<string, PublishState>>
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
    readonly description?: string
    readonly blocks: readonly ContentBlock[]
  }[]
  readonly actualites: readonly {
    readonly slug: string
    readonly title: string
    readonly publishedAt?: string
    readonly blocks: readonly ContentBlock[]
  }[]
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
}

const DEFAULT_SCENARIO = "p1"

/** The corpus is trusted build data: JSON modules are typed at this boundary. */
const SITE = siteFixture as unknown as SiteFixture

/** Resolved once per server process; scenarios never change at request time. */
let resolvedScenario: ScenarioFixture | null = null
let resolvedScenarioName: string | null = null

function getScenario(): ScenarioFixture {
  if (resolvedScenario) return resolvedScenario

  const name = (process.env.CONTENT_SCENARIO ?? DEFAULT_SCENARIO).trim() || DEFAULT_SCENARIO
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

function toDomainDocument(slug: string): DomainDocument | null {
  const domain = SITE.domains.find((candidate) => candidate.slug === slug)
  if (!domain) return null
  // Only cleared media may ever leave the seam: filter the photo blocks.
  return {
    slug: domain.slug,
    title: domain.title,
    description: domain.description,
    blocks: domain.blocks,
  }
}

function isMediaCleared(media: MediaRecord): boolean {
  const rights = media.rights
  if (rights.status !== "cleared") return false
  if (rights.peoplePresent && rights.releaseStatus !== "cleared") return false
  if (rights.clientMarks && !(rights.clientPermission && rights.trademarkPermission)) return false
  return true
}

const fixtureSource: ContentSource = {
  async getPublishState(key: RubriqueKey): Promise<PublishState> {
    return getScenario().rubriques[key] ?? { published: false, reason: "Rubrique inconnue du scénario." }
  },

  async listPublishedRubriques(): Promise<readonly RubriqueKey[]> {
    const rubriques = getScenario().rubriques
    return Object.keys(rubriques)
      .filter((key) => rubriques[key]?.published === true)
      .map((key) => key as RubriqueKey)
  },

  async getPage(key: RubriqueKey): Promise<PageDocument | null> {
    return toPageDocument(key)
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

  async getMedia(id: string): Promise<MediaRecord | null> {
    const media = SITE.media.find((candidate) => candidate.id === id)
    if (!media || !isMediaCleared(media)) return null
    return media
  },
}

/** The fixture implementation of the seam — a process-wide singleton. */
export function getFixtureContentSource(): ContentSource {
  return fixtureSource
}
