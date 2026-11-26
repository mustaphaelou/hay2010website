/**
 * Scenario expectations — the independent source of truth for the HTTP suite.
 *
 * These lists are derived from the decided documents, not from the code under
 * test: CDC tier composition and navigation order
 * (docs/spec/p1-website-build.md "Rubriques, gates and navigation",
 * docs/content/information-architecture.md §Navigation), the published domain
 * set (IA §Domaines d'activité), the careers page model and F-113 gate
 * (docs/forms/contact-careers-forms.md §4.4/§4.9), the approved metadata
 * (docs/seo/seo-metadata.md §3.3) and the sitemap rule (SEO §6.2). The fixture
 * corpus in `content/fixtures/` encodes the same intent as data; if fixture and
 * docs drift, this suite goes red — that is the point.
 *
 * `scripts/test-http.mjs` starts the production server once per scenario with
 * `CONTENT_SCENARIO=<name>` and runs the whole suite with
 * `TEST_HTTP_SCENARIO=<name>`, so the same test body proves both sides of a
 * gate: the scenario where the route is open and the one where it is closed.
 */

export type ScenarioName =
  | "p1"
  | "p2"
  | "p3"
  | "p1-gates-closed"
  | "p1-recrutement"

export const SCENARIO_NAMES: readonly ScenarioName[] = [
  "p1",
  "p2",
  "p3",
  "p1-gates-closed",
  "p1-recrutement",
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

/** One opening rendered inline on `/carrieres` (forms doc §4.2). */
export interface ExpectedJobOpening {
  /** Record slug — no public detail route exists while it is gated. */
  readonly slug: string
  readonly title: string
  readonly contractType: string
  readonly location: string
  /** A distinctive fragment of the card summary. */
  readonly summary: string
  /** The French rendering of `postedAt` (a date, never a countdown). */
  readonly postedOn: string
}

/** Careers application channel state and inline listings for one scenario. */
export interface ScenarioCareers {
  /** F-113 gate: may `recrutement@` be published and CVs invited? */
  readonly mailboxLive: boolean
  /** The real CNDP reference required by the live notice (never blank). */
  readonly authorization?: { readonly number: string; readonly date: string }
  /** Openings that must render inline, in order (`featured` first). */
  readonly openings: readonly ExpectedJobOpening[]
  /** Approved metadata description for this gate state (SEO doc §3.3). */
  readonly description: string
  /** Titles of job records that must never render (closed or past closing date). */
  readonly hiddenOpenings: readonly string[]
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
  /** Carrières gate state and inline listings. */
  readonly careers: ScenarioCareers
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
const GATED_DOMAINS = ["energies-renouvelables", "fourniture-equipements"] as const

/** The five P1 rubriques' routes. */
const P1_ROUTES = P1_NAVIGATION.map((item) => item.href)

/**
 * The legal utility pages are P1 pages delivered by #28; an email-first contact
 * page must link the privacy policy, so they are published in every scenario.
 */
const LEGAL_ROUTES = ["/mentions-legales", "/politique-de-confidentialite"] as const

/**
 * Carrières is a footer-only utility page (IA §Navigation): it is part of the
 * footer from P1 on and never enters the desktop row or the drawer's main
 * navigation.
 */
const CAREERS_ROUTE = "/carrieres"
const CAREERS_UTILITY: ExpectedNavItem = {
  label: "Carrières",
  href: CAREERS_ROUTE,
}

/** Published utilities in registry order: Carrières (#27), then legal (#28). */
const UTILITIES: readonly ExpectedNavItem[] = [
  CAREERS_UTILITY,
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
]

/** Approved Carrières metadata title (SEO doc §3.3, one brand suffix). */
export const CAREERS_TITLE = "Carrières et offres d’emploi — HAY2010"

/**
 * Approved metadata descriptions (SEO doc §3.3). The live description invites
 * a spontaneous application, so it is a gated claim until F-113 opens; the
 * pending description only points at the openings and the contact route.
 */
export const CAREERS_DESCRIPTION_PENDING =
  "Découvrez les offres d’emploi de HAY2010, entreprise d’éclairage public et d’électrification à Rabat, et la façon de nous contacter."
export const CAREERS_DESCRIPTION_LIVE =
  "Rejoignez HAY2010, entreprise d’éclairage public et d’électrification à Rabat. Consultez nos offres d’emploi et envoyez votre candidature spontanée."

/**
 * The owner-published fixture openings, in render order: `featured` first, then
 * `postedAt` descending (forms doc §4.2). The third fixture record is past its
 * closing date and must stay hidden even when published.
 */
export const CAREERS_OPENINGS: readonly ExpectedJobOpening[] = [
  {
    slug: "electricien-hta-bt",
    title: "Électricien HTA-BT",
    contractType: "CDI",
    location: "Rabat",
    summary: "Raccordement, pose et mise en service de réseaux HTA-BT",
    postedOn: "2 novembre 2026",
  },
  {
    slug: "chef-de-chantier-eclairage-public",
    title: "Chef de chantier éclairage public",
    contractType: "CDI",
    location: "Rabat",
    summary: "Encadrement des équipes de pose",
    postedOn: "10 novembre 2026",
  },
]

/** A published record whose closing date is past — never an opening (§4.2). */
export const CAREERS_EXPIRED_OPENING_TITLE = "Technicien CFO/CFA"
export const CAREERS_EXPIRED_OPENING_SLUG = "technicien-cfo-cfa"

/**
 * Approved fixed behaviour strings — forms doc §4.9. Hardcoded here (not
 * imported from the implementation) so the suite fails if the wording drifts.
 */
export const CAREERS_EMPTY_STATE = "Aucune offre n’est ouverte pour le moment."
export const CAREERS_PENDING_LINE =
  "Les candidatures ne sont pas ouvertes sur ce site pour le moment."
export const CAREERS_PENDING_CTA =
  "Une question sur nos offres ? Écrivez-nous à contact@hay2010.ma."
export const CAREERS_SPONTANEOUS_TITLE = "Candidature spontanée"
export const CAREERS_SPONTANEOUS_BODY_FRAGMENT =
  "Envoyez-nous votre CV et une courte présentation"
export const CAREERS_LIVE_CTA = "Postuler par e-mail"
export const CAREERS_NOTICE_FRAGMENT =
  "Les candidatures sont reçues à l’adresse indiquée sur cette page."

/** The CNDP reference the F-113 simulation publishes (fictitious on purpose). */
const SIMULATED_AUTHORIZATION = {
  number: "F113-SIMULATION",
  date: "01/01/2027",
} as const

/** F-113 closed: questions to contact@ only, no CV invitation (§4.4). */
const CAREERS_PENDING: ScenarioCareers = {
  mailboxLive: false,
  openings: [],
  hiddenOpenings: [],
  description: CAREERS_DESCRIPTION_PENDING,
}

/** F-113 closed but the owner published openings: still no CV invitation. */
const CAREERS_PENDING_WITH_OPENINGS: ScenarioCareers = {
  mailboxLive: false,
  openings: CAREERS_OPENINGS,
  hiddenOpenings: [CAREERS_EXPIRED_OPENING_TITLE],
  description: CAREERS_DESCRIPTION_PENDING,
}

/** F-113 granted: careers mailbox, spontaneous applications and the notice. */
const CAREERS_LIVE: ScenarioCareers = {
  mailboxLive: true,
  authorization: SIMULATED_AUTHORIZATION,
  openings: CAREERS_OPENINGS,
  hiddenOpenings: [CAREERS_EXPIRED_OPENING_TITLE],
  description: CAREERS_DESCRIPTION_LIVE,
}

const domainPath = (slug: string) => `/domaines-activite/${slug}`

/**
 * The named-case-study family `/realisations/{slug}` is gated at every tier
 * until three approved named case studies exist (realisations strategy §4,
 * spec §"Réalisations"). The gate is code-owned (`CASE_STUDIES_LIVE`), not a
 * fixture tier flag, so the same closed paths are expected in every scenario.
 */
export const GATED_CASE_STUDY_ROUTES = [
  "/realisations/projet-non-publie",
] as const

/** Sitemap: published rubriques with a page document + published domains. */
function sitemapPathsFor(
  pageRoutes: readonly string[],
  domains: readonly string[]
): readonly string[] {
  return [...pageRoutes.map((route) => (route === "/" ? "" : route)), ...domains.map(domainPath)]
}

export const EXPECTATIONS: Readonly<Record<ScenarioName, ScenarioExpectation>> = {
  /*
   * P1 launch state: five nav items, three domains, the Carrières utility page
   * and the legal utilities published (#27/#28). No opening is confirmed by the
   * owner, so the page renders its honest empty state; the F-113 careers channel
   * stays closed and no CV is invited.
   */
  p1: {
    name: "p1",
    navigation: P1_NAVIGATION,
    utilities: UTILITIES,
    publishedDomains: [...P1_DOMAINS],
    gatedDomains: [...GATED_DOMAINS],
    openRoutes: [
      ...P1_ROUTES,
      ...LEGAL_ROUTES,
      CAREERS_ROUTE,
      ...P1_DOMAINS.map(domainPath),
    ],
    gatedRoutes: [
      ...GATED_DOMAINS.map(domainPath),
      "/moyens-et-competences",
      "/references-et-partenaires",
      "/actualites",
      ...GATED_CASE_STUDY_ROUTES,
    ],
    sitemapPaths: sitemapPathsFor(
      [...P1_ROUTES, ...LEGAL_ROUTES, CAREERS_ROUTE],
      [...P1_DOMAINS]
    ),
    careers: CAREERS_PENDING,
  },

  /*
   * P2 gate simulation: seven nav items and all five domains open. The P2
   * rubriques have no page document yet, so they are in the row but not in the
   * sitemap — a route that cannot return 200 is never listed (SEO §6.2). The
   * owner-published openings simulate the populated Carrières state while
   * F-113 stays closed.
   */
  p2: {
    name: "p2",
    navigation: P2_NAVIGATION,
    utilities: UTILITIES,
    publishedDomains: [...P1_DOMAINS, ...GATED_DOMAINS],
    gatedDomains: [],
    openRoutes: [
      ...P1_ROUTES,
      ...LEGAL_ROUTES,
      CAREERS_ROUTE,
      ...[...P1_DOMAINS, ...GATED_DOMAINS].map(domainPath),
    ],
    gatedRoutes: ["/actualites", ...GATED_CASE_STUDY_ROUTES],
    sitemapPaths: sitemapPathsFor(
      [...P1_ROUTES, ...LEGAL_ROUTES, CAREERS_ROUTE],
      [...P1_DOMAINS, ...GATED_DOMAINS]
    ),
    careers: CAREERS_PENDING_WITH_OPENINGS,
  },

  /*
   * P3 gate simulation: eight nav items. Actualités is open in the row but has
   * no page document yet, so it stays out of the sitemap until its route ships.
   * Carrières keeps the populated openings and the F-113-closed channel from p2.
   */
  p3: {
    name: "p3",
    navigation: P3_NAVIGATION,
    utilities: UTILITIES,
    publishedDomains: [...P1_DOMAINS, ...GATED_DOMAINS],
    gatedDomains: [],
    openRoutes: [
      ...P1_ROUTES,
      ...LEGAL_ROUTES,
      CAREERS_ROUTE,
      ...[...P1_DOMAINS, ...GATED_DOMAINS].map(domainPath),
    ],
    gatedRoutes: [...GATED_CASE_STUDY_ROUTES],
    sitemapPaths: sitemapPathsFor(
      [...P1_ROUTES, ...LEGAL_ROUTES, CAREERS_ROUTE],
      [...P1_DOMAINS, ...GATED_DOMAINS]
    ),
    careers: CAREERS_PENDING_WITH_OPENINGS,
  },

  /*
   * Gate regression: the P1 launch state with one P1 rubrique (À propos) and
   * one P1 domain (Éclairage public) closed. Their routes exist and return 200
   * under p1, so a failure here proves the gate itself drove the 404. Carrières
   * stays open like p1 but publishes no opening: the honest empty state.
   */
  "p1-gates-closed": {
    name: "p1-gates-closed",
    navigation: [P1_NAVIGATION[0], P1_NAVIGATION[2], P1_NAVIGATION[3], P1_NAVIGATION[4]],
    utilities: UTILITIES,
    publishedDomains: ["installations-electriques", "infrastructures-reseaux-electriques"],
    gatedDomains: ["eclairage-public"],
    openRoutes: [
      "/",
      "/domaines-activite",
      "/realisations",
      "/contact",
      ...LEGAL_ROUTES,
      CAREERS_ROUTE,
      domainPath("installations-electriques"),
      domainPath("infrastructures-reseaux-electriques"),
    ],
    gatedRoutes: [
      "/a-propos",
      domainPath("eclairage-public"),
      ...GATED_DOMAINS.map(domainPath),
      ...GATED_CASE_STUDY_ROUTES,
    ],
    sitemapPaths: sitemapPathsFor(
      [
        "/",
        "/domaines-activite",
        "/realisations",
        "/contact",
        ...LEGAL_ROUTES,
        CAREERS_ROUTE,
      ],
      ["installations-electriques", "infrastructures-reseaux-electriques"]
    ),
    careers: CAREERS_PENDING,
  },

  /*
   * F-113-granted simulation (forms doc §2.3 "Public launch, F-113 ready"):
   * P1 plus the careers mailbox live and owner-published openings. The CNDP
   * reference is fictitious: it proves the page publishes `recrutement@`,
   * invites CVs by e-mail and renders the approved notice only with a real
   * number and date — never a blank `n°`.
   */
  "p1-recrutement": {
    name: "p1-recrutement",
    navigation: P1_NAVIGATION,
    utilities: UTILITIES,
    publishedDomains: [...P1_DOMAINS],
    gatedDomains: [...GATED_DOMAINS],
    openRoutes: [
      ...P1_ROUTES,
      ...LEGAL_ROUTES,
      CAREERS_ROUTE,
      ...P1_DOMAINS.map(domainPath),
    ],
    gatedRoutes: [
      ...GATED_DOMAINS.map(domainPath),
      "/moyens-et-competences",
      "/references-et-partenaires",
      "/actualites",
      ...GATED_CASE_STUDY_ROUTES,
    ],
    sitemapPaths: sitemapPathsFor(
      [...P1_ROUTES, ...LEGAL_ROUTES, CAREERS_ROUTE],
      [...P1_DOMAINS]
    ),
    careers: CAREERS_LIVE,
  },
}

export const scenario: ScenarioExpectation = EXPECTATIONS[SCENARIO]

/** Route that no page defines — used to observe the router's 404 document. */
export const UNKNOWN_ROUTE = "/cette-page-n-existe-pas"
