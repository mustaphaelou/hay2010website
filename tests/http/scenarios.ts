/**
 * Scenario expectations — the independent source of truth for the HTTP suite.
 *
 * These lists are derived from the decided documents, not from the code under
 * test: CDC tier composition and navigation order
 * (docs/spec/p1-website-build.md "Rubriques, gates and navigation",
 * docs/content/information-architecture.md §Navigation), the published domain
 * set (IA §Domaines d'activité), and the sitemap rule (SEO §6.2). The fixture
 * corpus in `content/fixtures/` encodes the same intent as data; if fixture and
 * docs drift, this suite goes red — that is the point.
 *
 * `scripts/test-http.mjs` starts the production server once per scenario with
 * `CONTENT_SCENARIO=<name>` and runs the whole suite with
 * `TEST_HTTP_SCENARIO=<name>`, so the same test body proves both sides of a
 * gate: the scenario where the route is open and the one where it is closed.
 */

export type ScenarioName =
  "p1" | "p2" | "p3" | "p1-gates-closed" | "p1-hero-image"

export const SCENARIO_NAMES: readonly ScenarioName[] = [
  "p1",
  "p2",
  "p3",
  "p1-gates-closed",
  "p1-hero-image",
]

export const SCENARIO: ScenarioName = (() => {
  const name = (process.env.TEST_HTTP_SCENARIO ?? "p1").trim() || "p1"
  if (!SCENARIO_NAMES.includes(name as ScenarioName)) {
    throw new Error(
      `Unknown TEST_HTTP_SCENARIO "${name}". The orchestrator only starts the known scenarios: ${SCENARIO_NAMES.join(", ")}.`
    )
  }
  return name as ScenarioName
})()

export interface ExpectedNavItem {
  readonly label: string
  readonly href: string
}

export interface ScenarioExpectation {
  readonly name: ScenarioName
  /** Desktop row + drawer navigation, CDC order (tier-dependent). */
  readonly navigation: readonly ExpectedNavItem[]
  /** Footer/drawer utility links that exist in this scenario. */
  readonly utilities: readonly ExpectedNavItem[]
  /** Domains whose gate is open (routes expected 200). */
  readonly publishedDomains: readonly string[]
  /** Domains whose gate is closed (routes expected 404). */
  readonly gatedDomains: readonly string[]
  /** Built routes expected to return 200 in this scenario. */
  readonly openRoutes: readonly string[]
  /** Closed routes expected to return the 404 page. */
  readonly gatedRoutes: readonly string[]
  /** Exact sitemap paths, absolute path part (`""` is the homepage). */
  readonly sitemapPaths: readonly string[]
  /**
   * Homepage hero state of this corpus: `true` when the content carries a
   * rights-cleared documentary image, `false` for the typographic fallback
   * (the launch state — no licensed photograph exists yet, #23).
   */
  readonly heroImage: boolean
}

/** The five P1 rubriques — CDC order, Accueil first. */
const P1_NAVIGATION: readonly ExpectedNavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Domaines d’activité", href: "/domaines-activite" },
  { label: "Réalisations", href: "/realisations" },
  { label: "Contact", href: "/contact" },
]

/** P2 inserts Moyens then Références before Contact (IA §Navigation). */
const P2_NAVIGATION: readonly ExpectedNavItem[] = [
  P1_NAVIGATION[0],
  P1_NAVIGATION[1],
  P1_NAVIGATION[2],
  P1_NAVIGATION[3],
  { label: "Moyens", href: "/moyens-et-competences" },
  { label: "Références", href: "/references-et-partenaires" },
  P1_NAVIGATION[4],
]

/** P3 inserts Actualités before Contact. */
const P3_NAVIGATION: readonly ExpectedNavItem[] = [
  P1_NAVIGATION[0],
  P1_NAVIGATION[1],
  P1_NAVIGATION[2],
  P1_NAVIGATION[3],
  { label: "Moyens", href: "/moyens-et-competences" },
  { label: "Références", href: "/references-et-partenaires" },
  { label: "Actualités", href: "/actualites" },
  P1_NAVIGATION[4],
]

/** The three P1 domains (IA §Domaines d'activité). */
const P1_DOMAINS = [
  "eclairage-public",
  "installations-electriques",
  "infrastructures-reseaux-electriques",
] as const

/** The two gated domains. */
const GATED_DOMAINS = [
  "energies-renouvelables",
  "fourniture-equipements",
] as const

/** The five P1 rubriques' routes. */
const P1_ROUTES = P1_NAVIGATION.map((item) => item.href)

/**
 * The legal utility pages are P1 pages delivered by #28; an email-first contact
 * page must link the privacy policy, so they are published in every scenario.
 */
const LEGAL_ROUTES = [
  "/mentions-legales",
  "/politique-de-confidentialite",
] as const

/** Footer/drawer utilities published at P1 (#28; Carrières joins with #27). */
const LEGAL_UTILITIES: readonly ExpectedNavItem[] = [
  { label: "Mentions légales", href: "/mentions-legales" },
  {
    label: "Politique de confidentialité",
    href: "/politique-de-confidentialite",
  },
]

/** Carrières is footer-only and lands with #27: it stays gated until then. */
const GATED_UTILITY_ROUTES = ["/carrieres"] as const

const domainPath = (slug: string) => `/domaines-activite/${slug}`

/** Sitemap: published rubriques with a page document + published domains. */
function sitemapPathsFor(
  pageRoutes: readonly string[],
  domains: readonly string[]
): readonly string[] {
  return [
    ...pageRoutes.map((route) => (route === "/" ? "" : route)),
    ...domains.map(domainPath),
  ]
}

const BASE_EXPECTATIONS: Readonly<
  Record<Exclude<ScenarioName, "p1-hero-image">, ScenarioExpectation>
> = {
  /*
   * P1 launch state: five nav items, three domains, no utility page yet.
   * Page routes are gate-guarded stubs in this ticket; their copy lands in
   * #22–#28 without changing this expectation (the route already exists).
   */
  p1: {
    name: "p1",
    navigation: P1_NAVIGATION,
    utilities: LEGAL_UTILITIES,
    publishedDomains: [...P1_DOMAINS],
    gatedDomains: [...GATED_DOMAINS],
    openRoutes: [...P1_ROUTES, ...LEGAL_ROUTES, ...P1_DOMAINS.map(domainPath)],
    gatedRoutes: [
      ...GATED_DOMAINS.map(domainPath),
      "/moyens-et-competences",
      "/references-et-partenaires",
      "/actualites",
      ...GATED_UTILITY_ROUTES,
    ],
    sitemapPaths: sitemapPathsFor(
      [...P1_ROUTES, ...LEGAL_ROUTES],
      [...P1_DOMAINS]
    ),
    heroImage: false,
  },

  /*
   * P2 gate simulation: seven nav items and all five domains open. The P2
   * rubriques have no page document yet, so they are in the row but not in the
   * sitemap — a route that cannot return 200 is never listed (SEO §6.2).
   */
  p2: {
    name: "p2",
    navigation: P2_NAVIGATION,
    utilities: LEGAL_UTILITIES,
    publishedDomains: [...P1_DOMAINS, ...GATED_DOMAINS],
    gatedDomains: [],
    openRoutes: [
      ...P1_ROUTES,
      ...LEGAL_ROUTES,
      ...[...P1_DOMAINS, ...GATED_DOMAINS].map(domainPath),
    ],
    gatedRoutes: ["/actualites", ...GATED_UTILITY_ROUTES],
    sitemapPaths: sitemapPathsFor(
      [...P1_ROUTES, ...LEGAL_ROUTES],
      [...P1_DOMAINS, ...GATED_DOMAINS]
    ),
    heroImage: false,
  },

  /*
   * P3 gate simulation: eight nav items. Actualités is open in the row but has
   * no page document yet, so it stays out of the sitemap until its route ships.
   */
  p3: {
    name: "p3",
    navigation: P3_NAVIGATION,
    utilities: LEGAL_UTILITIES,
    publishedDomains: [...P1_DOMAINS, ...GATED_DOMAINS],
    gatedDomains: [],
    openRoutes: [
      ...P1_ROUTES,
      ...LEGAL_ROUTES,
      ...[...P1_DOMAINS, ...GATED_DOMAINS].map(domainPath),
    ],
    gatedRoutes: [...GATED_UTILITY_ROUTES],
    sitemapPaths: sitemapPathsFor(
      [...P1_ROUTES, ...LEGAL_ROUTES],
      [...P1_DOMAINS, ...GATED_DOMAINS]
    ),
    heroImage: false,
  },

  /*
   * Gate regression: the P1 launch state with one P1 rubrique (À propos) and
   * one P1 domain (Éclairage public) closed. Their routes exist and return 200
   * under p1, so a failure here proves the gate itself drove the 404.
   */
  "p1-gates-closed": {
    name: "p1-gates-closed",
    navigation: [
      P1_NAVIGATION[0],
      P1_NAVIGATION[2],
      P1_NAVIGATION[3],
      P1_NAVIGATION[4],
    ],
    utilities: LEGAL_UTILITIES,
    publishedDomains: [
      "installations-electriques",
      "infrastructures-reseaux-electriques",
    ],
    gatedDomains: ["eclairage-public"],
    openRoutes: [
      "/",
      "/domaines-activite",
      "/realisations",
      "/contact",
      ...LEGAL_ROUTES,
      domainPath("installations-electriques"),
      domainPath("infrastructures-reseaux-electriques"),
    ],
    gatedRoutes: [
      "/a-propos",
      domainPath("eclairage-public"),
      ...GATED_DOMAINS.map(domainPath),
      ...GATED_UTILITY_ROUTES,
    ],
    sitemapPaths: sitemapPathsFor(
      ["/", "/domaines-activite", "/realisations", "/contact", ...LEGAL_ROUTES],
      ["installations-electriques", "infrastructures-reseaux-electriques"]
    ),
    heroImage: false,
  },
}

export const EXPECTATIONS: Readonly<Record<ScenarioName, ScenarioExpectation>> =
  {
    ...BASE_EXPECTATIONS,

    /*
     * #23 hero image state: the P1 launch gates with a cleared documentary image
     * supplied through the content seam (see content/fixtures/scenarios/
     * p1-hero-image.json). No licensed photograph exists at launch, so this
     * test-only corpus is how the image path is proven; `p1` keeps the
     * typographic fallback.
     */
    "p1-hero-image": {
      ...BASE_EXPECTATIONS.p1,
      name: "p1-hero-image",
      heroImage: true,
    },
  }

export const scenario: ScenarioExpectation = EXPECTATIONS[SCENARIO]

/** Route that no page defines — used to observe the router's 404 document. */
export const UNKNOWN_ROUTE = "/cette-page-n-existe-pas"
