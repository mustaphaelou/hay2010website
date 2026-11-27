/**
 * CMS verification suite for ticket #30 — runs only through `npm run test:cms`
 * against a disposable `postgres:16-alpine` (port 5530), a production build made
 * with `CONTENT_SOURCE=cms`, and the seeded fixture corpus.
 *
 * It asserts the observable surface over HTTP, the same seam the rest of the
 * suite uses: status codes, JSON bodies and rendered documents. No page or
 * server module is imported; the only non-HTTP checks live in
 * `schema.test.ts` (static schema/migration guards) and `storage-config.test.ts`
 * (pure object-storage configuration).
 *
 * The fixture-vs-CMS parity comparison runs in `scripts/test-cms.mjs` BEFORE
 * this suite (the suite mutates the seeded content on purpose), so the parity
 * phase always compares two pristine corpora.
 *
 * Mutation order matters: each `it` documents the state it leaves behind; later
 * tests restore what they changed so the suite stays re-runnable on one seed.
 */
import { beforeAll, describe, expect, it } from "vitest"

import { SEED_ACCOUNTS, seedPassword } from "../../lib/payload/seed-accounts"

const BASE_URL = (process.env.CMS_TEST_BASE_URL ?? "http://127.0.0.1:3130").replace(/\/+$/, "")
const PASSWORD = seedPassword()

/** Guardian of the fixture corpus: the launch strings the seed must reproduce. */
const FIXTURE = {
  homepageTitle: "Éclairage public et électrification à Rabat",
  homepageHeroTagline:
    "Depuis plus de 10 ans, HAY2010 accompagne les collectivités et les entreprises dans leurs projets d’éclairage public et d’électrification.",
  aProposChapter: "Activité et périmètre",
  domainesIndexTitle: "Nos domaines d’activité",
  realisationsHeadline: "Références sur demande.",
  contactIntroFragment: "Le site ne comporte pas de formulaire.",
  careerEmptyState: "Aucune offre n’est ouverte pour le moment.",
  publishedDomains: [
    "eclairage-public",
    "installations-electriques",
    "infrastructures-reseaux-electriques",
  ],
  gatedDomains: ["energies-renouvelables", "fourniture-equipements"],
} as const

const CLEARED_MEDIA_FILENAME = "media-droits-valides.png"
const PENDING_MEDIA_FILENAME = "media-droits-en-attente.png"

type Role = "developer" | "owner" | "editor"
type Session = string

interface RestList<T> {
  docs: T[]
  totalDocs: number
}

interface RestGlobal<T> {
  result?: T
}

interface GlobalHomepage {
  hero: {
    title: string
    subtitle?: string | null
    image?: (number | null) | { id: number } | null
  }
  seo: { description?: string | null }
  _status?: string
}

interface RestDomaine {
  id: number
  slug: string
  title: string
  summary?: string | null
  _status?: string
  presentation?: { title?: string | null; body?: unknown }
  prestations?: { title?: string | null; items?: Array<{ label: string; description?: string | null }> | null }
  methods?: { title?: string | null; items?: Array<{ title: string; body?: string | null }> | null }
  contactCta?: { title?: string | null }
  seo?: { description?: string | null }
}

interface RestJob {
  id: number
  title: string
  slug: string
  openingStatus: string
  applicationEmail?: string | null
  _status?: string
}

interface RestMedia {
  id: number
  filename: string
  rightsStatus: string
  url?: string
  sizes?: Record<string, { url?: string }>
}

interface RestProject {
  id: number
}

interface RestCommunique {
  id: number
}

/** A minimal Lexical paragraph document, the shape the seed writes too. */
function richText(text: string): Record<string, unknown> {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: null,
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          direction: null,
          textFormat: 0,
          children: [
            {
              type: "text",
              text,
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

function account(role: Role) {
  const found = SEED_ACCOUNTS.find((candidate) => candidate.role === role)
  if (!found) throw new Error(`No seed account for role ${role}`)
  return found
}

/** Log a staff account in and return its JWT (the REST Authorization scheme). */
async function login(role: Role): Promise<Session> {
  const response = await fetch(`${BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept-Language": "fr" },
    body: JSON.stringify({ email: account(role).email, password: PASSWORD }),
  })
  expect(response.status, `${role} login must succeed`).toBe(200)
  const body = (await response.json()) as { token?: string }
  expect(body.token, `${role} login must return a JWT`).toBeTruthy()
  return body.token as string
}

function headers(session: Session | null, extra: Record<string, string> = {}): Record<string, string> {
  return {
    "Accept-Language": "fr",
    ...(session ? { Authorization: `JWT ${session}` } : {}),
    ...extra,
  }
}

/** Authenticated JSON request against the Payload REST API. */
async function rest(
  session: Session | null,
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<Response> {
  const requestHeaders = headers(session)
  if (init.body !== undefined) requestHeaders["Content-Type"] = "application/json"
  return fetch(`${BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: requestHeaders,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
}

/** A public document request (what a visitor receives). */
async function page(path: string): Promise<{ status: number; html: string }> {
  const response = await fetch(`${BASE_URL}${path}`, { headers: { "Accept-Language": "fr" } })
  return { status: response.status, html: await response.text() }
}

/**
 * Poll a public page until `predicate` holds.
 *
 * Payload's `afterChange` hooks revalidate Next's cached route asynchronously:
 * a PATCH can return before the re-render lands, so one immediate GET can race
 * the revalidation (observed once in 35 runs of the media-rights tests). A
 * bounded poll keeps the assertion strict — the expected state must appear
 * within the bound — instead of sleeping for a fixed delay or weakening it.
 */
async function waitForPage(
  path: string,
  predicate: (result: { status: number; html: string }) => boolean,
  { attempts = 20, delayMs = 250 }: { attempts?: number; delayMs?: number } = {}
): Promise<{ status: number; html: string }> {
  let result = await page(path)
  for (let attempt = 0; attempt < attempts && !predicate(result); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    result = await page(path)
  }
  return result
}

async function restJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

async function getGlobal<T>(session: Session | null, slug: string): Promise<T> {
  const response = await rest(session, `/api/globals/${slug}`)
  expect(response.status).toBe(200)
  // A global GET returns the document itself; a global POST wraps it in
  // `{ message, result }`.
  const body = await restJson<T & RestGlobal<T>>(response)
  return (body.result ?? body) as T
}

async function patchGlobal(session: Session, slug: string, body: unknown): Promise<Response> {
  // Payload's REST surface updates a global with POST (not PATCH).
  return rest(session, `/api/globals/${slug}`, { method: "POST", body })
}

async function listCollection<T>(session: Session | null, collection: string, query = ""): Promise<T[]> {
  const response = await rest(session, `/api/${collection}?limit=100&depth=0${query}`)
  expect(response.status, `${collection} list must answer 200`).toBe(200)
  const body = await restJson<RestList<T>>(response)
  return body.docs
}

async function findDomaine(slug: string): Promise<RestDomaine> {
  const domains = await listCollection<RestDomaine>(developer, "domaines", "&draft=true")
  const found = domains.find((domain) => domain.slug === slug)
  if (!found) throw new Error(`Seeded domain ${slug} not found`)
  return found
}

async function findMedia(filename: string): Promise<RestMedia> {
  const media = await listCollection<RestMedia>(developer, "media")
  const found = media.find((record) => record.filename === filename)
  if (!found) throw new Error(`Seeded media ${filename} not found`)
  return found
}

let developer: Session
let owner: Session
let editor: Session

beforeAll(async () => {
  developer = await login("developer")
  owner = await login("owner")
  editor = await login("editor")
})

describe("embedded admin and gate visibility", () => {
  it("serves the admin login page on the same origin, in French", async () => {
    const shell = await page("/admin")
    expect(shell.status).toBe(200)
    expect(shell.html).toContain("admin/login")

    const login = await page("/admin/login")
    expect(login.status).toBe(200)
    expect(login.html).toMatch(/<html[^>]*\blang="fr"/)
    expect(login.html).toContain("<title>Se connecter — HAY2010</title>")
  })

  it("lists the code-owned gated pages with their reason on the dashboard", async () => {
    const response = await fetch(`${BASE_URL}/admin`, { headers: headers(developer) })
    expect(response.status).toBe(200)
    const html = await response.text()

    expect(html).toContain("<title>Tableau de bord — HAY2010</title>")
    // Panel 1 — the gated pages and their reasons (ticket #30 acceptance).
    expect(html).toContain("Barrières de publication (code-owned)")
    expect(html).toContain("Moyens et compétences")
    expect(html).toContain("Palier P2")
    expect(html).toContain("Palier P3")
    // The code-owned domain gate is listed with its reason too.
    expect(html).toContain("palier solaire")
    // Panel 2 — the code-owned constants are displayed read-only, never as fields.
    expect(html).toContain("Constantes code-owned")
    expect(html).toContain("SOCIETE HAY 2010")
    expect(html).toContain("caseStudiesLive")
    expect(html).toContain("actualitesLive")
    expect(html).toContain("recrutementMailboxLive")
  })

  it("does not advertise the framework on the public site", async () => {
    const response = await fetch(`${BASE_URL}/`, { headers: { "Accept-Language": "fr" } })
    expect(response.status).toBe(200)
    expect(response.headers.get("x-powered-by")).toBeNull()
  })
})

describe("anonymous access is denied where it must be", () => {
  it("rejects anonymous reads of accounts and anonymous writes", async () => {
    const users = await rest(null, "/api/users")
    expect(users.status).toBe(403)

    const writeDomain = await rest(null, "/api/domaines", {
      method: "POST",
      body: { slug: "eclairage-public", title: "x" },
    })
    expect(writeDomain.status).toBe(403)

    const writeGlobal = await rest(null, "/api/globals/homepage", {
      method: "POST",
      body: { hero: { title: "x" } },
    })
    expect(writeGlobal.status).toBe(403)
  })

  it("returns the published page corpus to anonymous readers only", async () => {
    const homepage = await rest(null, "/api/globals/homepage")
    expect(homepage.status).toBe(200)
    const homepageBody = await restJson<GlobalHomepage>(homepage)
    expect(homepageBody.hero.title).toBe(FIXTURE.homepageTitle)
    expect(homepageBody._status).toBe("published")

    const domains = await listCollection<RestDomaine>(null, "domaines")
    expect(domains.map((domain) => domain.slug).sort()).toEqual([...FIXTURE.publishedDomains].sort())

    const media = await listCollection<RestMedia>(null, "media")
    expect(media.map((record) => record.filename)).toEqual([CLEARED_MEDIA_FILENAME])

    // Every opening is a draft at launch: nothing leaks to the public API.
    const jobs = await listCollection<RestJob>(null, "jobs")
    expect(jobs).toEqual([])

    // Gated domains are invisible to anonymous readers even by slug lookup.
    for (const slug of FIXTURE.gatedDomains) {
      const response = await rest(
        null,
        `/api/domaines?where[slug][equals]=${encodeURIComponent(slug)}`
      )
      expect(response.status).toBe(200)
      const body = await restJson<RestList<RestDomaine>>(response)
      expect(body.docs, `${slug} must not leak`).toEqual([])
    }
  })
})

describe("the seeded corpus renders on the P1 route matrix", () => {
  it("renders the homepage copy, repères and réalisations teaser", async () => {
    const home = await page("/")
    expect(home.status).toBe(200)
    expect(home.html).toContain(FIXTURE.homepageTitle)
    expect(home.html).toContain(FIXTURE.homepageHeroTagline)
    // The repères band is code-owned (approved facts), printed by the provider.
    expect(home.html).toContain("Plus de 10 ans d’expérience")
    expect(home.html).toContain("Références sur demande.")
    // The CMS corpus carries no photography at launch: typographic hero fallback.
    expect(home.html).not.toContain(CLEARED_MEDIA_FILENAME)
  })

  it("renders À propos chapters and the domain index/list", async () => {
    const about = await page("/a-propos")
    expect(about.status).toBe(200)
    expect(about.html).toContain(FIXTURE.aProposChapter)
    expect(about.html).toContain("Mission, vision et valeurs")

    const index = await page("/domaines-activite")
    expect(index.status).toBe(200)
    expect(index.html).toContain(FIXTURE.domainesIndexTitle)
    for (const slug of FIXTURE.publishedDomains) {
      expect(index.html).toContain(`/domaines-activite/${slug}`)
    }
    for (const slug of FIXTURE.gatedDomains) {
      expect(index.html).not.toContain(`/domaines-activite/${slug}`)
    }

    const domain = await page("/domaines-activite/eclairage-public")
    expect(domain.status).toBe(200)
    expect(domain.html).toContain("Prestations confirmées")
    expect(domain.html).toContain("Études d’exécution")
  })

  it("renders Réalisations, Contact and Carrières from the seeded corpus", async () => {
    const realisations = await page("/realisations")
    expect(realisations.status).toBe(200)
    expect(realisations.html).toContain(FIXTURE.realisationsHeadline)
    expect(realisations.html).toContain("Références sur demande.")

    const contact = await page("/contact")
    expect(contact.status).toBe(200)
    expect(contact.html).toContain(FIXTURE.contactIntroFragment)
    expect(contact.html).toContain("contact@hay2010.ma")

    const carrieres = await page("/carrieres")
    expect(carrieres.status).toBe(200)
    expect(carrieres.html).toContain(FIXTURE.careerEmptyState)
    // F-113 stays closed: the gated mailbox is never published.
    expect(carrieres.html).not.toContain("recrutement@hay2010.ma")
  })

  it("keeps the legal pages code-owned and the gated routes closed", async () => {
    const mentions = await page("/mentions-legales")
    expect(mentions.status).toBe(200)
    expect(mentions.html).toContain("RC 87305")
    // No CMS global exists for the legal pages: the identity cannot be edited.
    expect((await rest(developer, "/api/globals/mentions-legales")).status).toBe(404)

    for (const route of [
      "/domaines-activite/energies-renouvelables",
      "/domaines-activite/fourniture-equipements",
      "/moyens-et-competences",
      "/references-et-partenaires",
      "/actualites",
    ]) {
      const gated = await page(route)
      expect(gated.status, `${route} must stay gated`).toBe(404)
      expect(gated.html).toContain("Page introuvable")
    }

    // #32 builds absolute URLs from the build-time origin; in this test that is
    // the disposable server origin (production bakes https://hay2010.ma).
    const sitemap = await page("/sitemap.xml")
    expect(sitemap.status).toBe(200)
    expect(sitemap.html).toContain(`${BASE_URL}/domaines-activite/eclairage-public`)
    expect(sitemap.html).not.toContain("energies-renouvelables")
  })
})

describe("the owner edits, publishes and unpublishes content", () => {
  it("edits page copy and it appears without a rebuild (revalidation)", async () => {
    const before = await getGlobal<GlobalHomepage>(owner, "homepage")
    const originalSubtitle = before.hero.subtitle ?? null
    const marker = "Texte réédité par le propriétaire (contrôle #30)."

    const update = await patchGlobal(owner, "homepage", {
      hero: { subtitle: marker },
      _status: "published",
    })
    expect(update.status).toBe(200)

    // No rebuild happened between the PATCH and this GET: the Payload
    // afterChange hook invalidated the route (revalidatePath/revalidateTag).
    const home = await page("/")
    expect(home.status).toBe(200)
    expect(home.html).toContain(marker)

    // Restore the seeded copy for the rest of the suite.
    const restore = await patchGlobal(owner, "homepage", {
      hero: { subtitle: originalSubtitle },
      _status: "published",
    })
    expect(restore.status).toBe(200)
    expect((await page("/")).html).not.toContain(marker)
  })

  it("edits a domaine and its prestations, then unpublishes without deleting", async () => {
    const domain = await findDomaine("installations-electriques")
    const marker = "Prestation rééditée (contrôle #30)."
    const originalPrestations = domain.prestations?.items ?? []
    const editedItems = [
      { label: marker, description: "Description de la prestation rééditée." },
      ...originalPrestations.slice(1).map((item) => ({
        label: item.label,
        description: item.description,
      })),
    ]

    const edit = await rest(owner, `/api/domaines/${domain.id}`, {
      method: "PATCH",
      body: { prestations: { items: editedItems }, _status: "published" },
    })
    expect(edit.status).toBe(200)
    const editedPage = await page("/domaines-activite/installations-electriques")
    expect(editedPage.status).toBe(200)
    expect(editedPage.html).toContain(marker)

    // Unpublish: the route 404s, the record stays in the database.
    const unpublish = await rest(owner, `/api/domaines/${domain.id}`, {
      method: "PATCH",
      body: { _status: "draft" },
    })
    expect(unpublish.status).toBe(200)
    expect((await page("/domaines-activite/installations-electriques")).status).toBe(404)

    // Republish and restore the seeded prestations.
    const restore = await rest(owner, `/api/domaines/${domain.id}`, {
      method: "PATCH",
      body: {
        prestations: {
          items: originalPrestations.map((item) => ({ label: item.label, description: item.description })),
        },
        _status: "published",
      },
    })
    expect(restore.status).toBe(200)
    const restored = await page("/domaines-activite/installations-electriques")
    expect(restored.status).toBe(200)
    expect(restored.html).not.toContain(marker)
  })

  it("unpublishes a page and republishes it, keeping the record", async () => {
    const unpublish = await patchGlobal(owner, "homepage", { _status: "draft" })
    expect(unpublish.status).toBe(200)
    expect((await page("/")).status).toBe(404)

    // The draft is still there (nothing was deleted) but is not public.
    const draft = await getGlobal<GlobalHomepage>(developer, "homepage?draft=true")
    expect(draft.hero.title).toBe(FIXTURE.homepageTitle)

    const republish = await patchGlobal(owner, "homepage", { _status: "published" })
    expect(republish.status).toBe(200)
    const home = await page("/")
    expect(home.status).toBe(200)
    expect(home.html).toContain(FIXTURE.homepageTitle)
  })

  it("publishes and closes a job opening", async () => {
    const created = await rest(owner, "/api/jobs", {
      method: "POST",
      body: {
        title: "Contrôle #30 — offre publiée",
        slug: "controle-30-offre",
        openingStatus: "open",
        contractType: "CDI",
        location: "Rabat",
        summary: "Offre créée par la suite de vérification.",
        _status: "draft",
      },
    })
    expect([200, 201]).toContain(created.status)
    const { doc } = await restJson<{ doc: RestJob }>(created)

    const publish = await rest(owner, `/api/jobs/${doc.id}`, {
      method: "PATCH",
      body: { _status: "published" },
    })
    expect(publish.status).toBe(200)
    const carrieres = await page("/carrieres")
    expect(carrieres.html).toContain("Contrôle #30 — offre publiée")

    const unpublish = await rest(owner, `/api/jobs/${doc.id}`, {
      method: "PATCH",
      body: { _status: "draft" },
    })
    expect(unpublish.status).toBe(200)
    expect((await page("/carrieres")).html).not.toContain("Contrôle #30 — offre publiée")

    // A published opening past its closing date is not an opening any more:
    // the content provider filters it even if the record stays published.
    const expired = await rest(owner, "/api/jobs", {
      method: "POST",
      body: {
        title: "Contrôle #30 — offre échue",
        slug: "controle-30-offre-echue",
        openingStatus: "open",
        contractType: "CDD",
        summary: "Offre échue.",
        postedAt: "2025-11-01",
        closingAt: "2026-01-31",
      },
    })
    expect([200, 201]).toContain(expired.status)
    const expiredDoc = (await restJson<{ doc: RestJob }>(expired)).doc
    const publishExpired = await rest(owner, `/api/jobs/${expiredDoc.id}`, {
      method: "PATCH",
      body: { _status: "published" },
    })
    expect(publishExpired.status).toBe(200)
    expect((await page("/carrieres")).html).not.toContain("Contrôle #30 — offre échue")

    // Cleanup: the developer can permanently delete what the owner created.
    expect((await rest(developer, `/api/jobs/${expiredDoc.id}`, { method: "DELETE" })).status).toBe(200)
    const remove = await rest(developer, `/api/jobs/${doc.id}`, { method: "DELETE" })
    expect(remove.status).toBe(200)
  })

  it("denies the owner permanent deletion", async () => {
    const domain = await findDomaine("eclairage-public")
    expect((await rest(owner, `/api/domaines/${domain.id}`, { method: "DELETE" })).status).toBe(403)

    const media = await findMedia(CLEARED_MEDIA_FILENAME)
    expect((await rest(owner, `/api/media/${media.id}`, { method: "DELETE" })).status).toBe(403)
  })

  it("keeps the editor draft-only", async () => {
    // A draft job the developer created: the editor may edit it, never publish it.
    const created = await rest(developer, "/api/jobs", {
      method: "POST",
      body: {
        title: "Contrôle #30 — brouillon contributeur",
        slug: "controle-30-brouillon",
        openingStatus: "open",
        contractType: "CDI",
        summary: "Brouillon.",
        _status: "draft",
      },
    })
    expect([200, 201]).toContain(created.status)
    const { doc } = await restJson<{ doc: RestJob }>(created)

    try {
      const edit = await rest(editor, `/api/jobs/${doc.id}`, {
        method: "PATCH",
        body: { summary: "Brouillon modifié par le contributeur." },
      })
      expect(edit.status).toBe(200)

      const publish = await rest(editor, `/api/jobs/${doc.id}`, {
        method: "PATCH",
        body: { _status: "published" },
      })
      expect(publish.status).toBe(403)

      // The same lock exists on the page globals (a global has no draft list of
      // its own, so publishing one is the risky operation).
      const publishGlobal = await patchGlobal(editor, "homepage", { _status: "published" })
      expect(publishGlobal.status).toBe(403)
    } finally {
      expect((await rest(developer, `/api/jobs/${doc.id}`, { method: "DELETE" })).status).toBe(200)
    }
  })
})

describe("code-owned constants cannot be edited from the admin", () => {
  it("drops a forbidden domain route key (developer-only field)", async () => {
    const domain = await findDomaine("eclairage-public")
    const attempt = await rest(owner, `/api/domaines/${domain.id}`, {
      method: "PATCH",
      body: { slug: "energies-renouvelables" },
    })
    // Field-level access drops the value silently on an update (200) or rejects
    // it (400); what must never happen is the stored key changing.
    expect([200, 400]).toContain(attempt.status)

    const after = await findDomaine("eclairage-public")
    expect(after.slug).toBe("eclairage-public")
    expect((await findDomaineById(after.id)).slug).toBe("eclairage-public")
  })

  it("refuses an owner-created domain (structural change is developer-only)", async () => {
    const attempt = await rest(owner, "/api/domaines", {
      method: "POST",
      body: { slug: "fourniture-equipements", title: "Tentative" },
    })
    expect(attempt.status).toBe(403)
  })

  it("drops a forbidden job application email (F-113 is code-owned)", async () => {
    const jobs = await listCollection<RestJob>(developer, "jobs", "&draft=true")
    const job = jobs[0]
    const attempt = await rest(owner, `/api/jobs/${job.id}`, {
      method: "PATCH",
      body: { applicationEmail: "candidature@exemple.test" },
    })
    expect([200, 400]).toContain(attempt.status)

    const after = await restJson<RestJob>(await rest(developer, `/api/jobs/${job.id}`))
    expect(after.applicationEmail).toBe("contact@hay2010.ma")
  })

  it("ignores an unknown field (identity, navigation, gates and SEO are not modelled)", async () => {
    const attempt = await patchGlobal(owner, "homepage", {
      navLabel: "Libellé pirate",
      legalIdentity: "Identité pirate",
      agrementLive: true,
    })
    expect(attempt.status).toBe(200)
    const after = await getGlobal<Record<string, unknown>>(owner, "homepage")
    expect(after).not.toHaveProperty("navLabel")
    expect(after).not.toHaveProperty("legalIdentity")
    expect(after).not.toHaveProperty("agrementLive")
  })
})

async function findDomaineById(id: number): Promise<RestDomaine> {
  const response = await rest(developer, `/api/domaines/${id}?depth=0`)
  expect(response.status).toBe(200)
  return restJson<RestDomaine>(response)
}

describe("media without a recorded permission cannot reach published content", () => {
  it("blocks publishing a page whose image rights are pending", async () => {
    const pending = await findMedia(PENDING_MEDIA_FILENAME)
    const attempt = await patchGlobal(owner, "homepage", {
      hero: { image: pending.id },
      _status: "published",
    })
    expect(attempt.status).toBe(400)
    expect(JSON.stringify(await restJson(attempt))).toContain("hero.image")

    const homepage = await getGlobal<GlobalHomepage>(owner, "homepage")
    expect(homepage.hero.image ?? null).toBeNull()
  })

  it("does not let the owner clear restricted media (people present)", async () => {
    const pending = await findMedia(PENDING_MEDIA_FILENAME)
    const attempt = await rest(owner, `/api/media/${pending.id}`, {
      method: "PATCH",
      body: {
        rightsStatus: "cleared",
        releaseStatus: "cleared",
        releaseReference: "AUT-OWNER-INTERDIT",
      },
    })
    expect([200, 400]).toContain(attempt.status)

    const after = await findMedia(PENDING_MEDIA_FILENAME)
    expect(after.rightsStatus).toBe("pending")
  })

  it("publishes the image once the developer records the permission", async () => {
    const pending = await findMedia(PENDING_MEDIA_FILENAME)
    const clear = await rest(developer, `/api/media/${pending.id}`, {
      method: "PATCH",
      body: {
        rightsStatus: "cleared",
        rightsReference: "AUT-TEST-PROPRIETE-30",
        releaseStatus: "cleared",
        releaseReference: "AUT-TEST-AUTORISATION-30",
      },
    })
    expect(clear.status).toBe(200)

    const attach = await patchGlobal(owner, "homepage", {
      hero: { image: pending.id },
      _status: "published",
    })
    expect(attach.status).toBe(200)

    const home = await waitForPage("/", (result) =>
      result.html.includes(PENDING_MEDIA_FILENAME)
    )
    expect(home.status).toBe(200)
    expect(home.html).toContain(PENDING_MEDIA_FILENAME)
  })

  it("hides an already-published image when its rights are revoked", async () => {
    const media = await findMedia(PENDING_MEDIA_FILENAME)
    const revoke = await rest(developer, `/api/media/${media.id}`, {
      method: "PATCH",
      body: { rightsStatus: "revoked" },
    })
    expect(revoke.status).toBe(200)

    // Observable behaviour per the decided rule: the image disappears from the
    // published page (the hero falls back to the typographic treatment), without
    // any rebuild — the media afterChange hook invalidated the route.
    const home = await waitForPage("/", (result) =>
      !result.html.includes(PENDING_MEDIA_FILENAME)
    )
    expect(home.status).toBe(200)
    expect(home.html).not.toContain(PENDING_MEDIA_FILENAME)
    expect(home.html).toContain(FIXTURE.homepageTitle)
  })

  it("restores the launch state (cleared media, no hero image)", async () => {
    const media = await findMedia(PENDING_MEDIA_FILENAME)
    const restoreRights = await rest(developer, `/api/media/${media.id}`, {
      method: "PATCH",
      body: { rightsStatus: "cleared" },
    })
    expect(restoreRights.status).toBe(200)

    const detach = await patchGlobal(owner, "homepage", {
      hero: { image: null },
      _status: "published",
    })
    expect(detach.status).toBe(200)
    const restored = await waitForPage("/", (result) =>
      !result.html.includes(PENDING_MEDIA_FILENAME)
    )
    expect(restored.html).not.toContain(PENDING_MEDIA_FILENAME)
  })
})

describe("gated families cannot be opened from the admin", () => {
  it("keeps a published code-gated domain hidden from the public site", async () => {
    const domain = await findDomaine("energies-renouvelables")

    // The owner fills the draft trame and publishes it: the CMS write succeeds,
    // but the code-owned gate keeps the record out of every public surface.
    const fill = await rest(owner, `/api/domaines/${domain.id}`, {
      method: "PATCH",
      body: {
        title: "Énergies renouvelables",
        summary: "Fiche préparée par l’éditeur.",
        presentation: {
          title: "Présentation et besoins",
          body: richText("Copie préparée pour le contrôle #30."),
        },
        prestations: { title: "Prestations confirmées", items: [{ label: "Solaire" }] },
        methods: { title: "Méthode", items: [{ title: "Étude", body: "Étude technique." }] },
        contactCta: { title: "Un projet solaire ?" },
        seo: { description: "Description préparée pour le contrôle #30." },
      },
    })
    expect(fill.status).toBe(200)

    const publish = await rest(owner, `/api/domaines/${domain.id}`, {
      method: "PATCH",
      body: { _status: "published" },
    })
    expect(publish.status).toBe(200)

    // It is published in Payload…
    const staffView = await findDomaine("energies-renouvelables")
    expect(staffView._status).toBe("published")

    // …but the code-owned gate hides it from the site, the index and the sitemap.
    expect((await page("/domaines-activite/energies-renouvelables")).status).toBe(404)
    expect((await page("/domaines-activite")).html).not.toContain("energies-renouvelables")
    expect((await page("/sitemap.xml")).html).not.toContain("energies-renouvelables")

    // Restore the launch state: unpublished draft.
    const restore = await rest(owner, `/api/domaines/${domain.id}`, {
      method: "PATCH",
      body: { _status: "draft" },
    })
    expect(restore.status).toBe(200)
  })

  it("exposes the actualités model while its route stays gated", async () => {
    // The global exists (staff can read it) but has no public route (#30).
    const actualites = await rest(developer, "/api/globals/actualites")
    expect(actualites.status).toBe(200)

    const publish = await patchGlobal(developer, "actualites", {
      hero: { title: "Actualités" },
      intro: { body: richText("Introduction de la page actualités.") },
      _status: "published",
    })
    expect(publish.status).toBe(200)

    // Code-owned P3 gate: publishing the global cannot create the route.
    expect((await page("/actualites")).status).toBe(404)
    expect((await page("/sitemap.xml")).html).not.toContain("/actualites")

    const restore = await patchGlobal(developer, "actualites", { _status: "draft" })
    expect(restore.status).toBe(200)
  })

  it("publishes a communiqué only with the legal review, and keeps /actualites closed", async () => {
    const created = await rest(developer, "/api/communiques", {
      method: "POST",
      body: { title: "Contrôle #30 — communiqué", slug: "controle-30-communique", _status: "draft" },
    })
    expect([200, 201]).toContain(created.status)
    const { doc } = await restJson<{ doc: RestCommunique }>(created)

    try {
      const withoutReview = await rest(developer, `/api/communiques/${doc.id}`, {
        method: "PATCH",
        body: { _status: "published" },
      })
      expect(withoutReview.status).toBe(400)

      const reviewed = await rest(developer, `/api/communiques/${doc.id}`, {
        method: "PATCH",
        body: {
          legalReviewed: true,
          legalReviewRef: "REVUE-CONTROLE-30",
          _status: "published",
        },
      })
      expect(reviewed.status).toBe(200)

      // Even a published, legally reviewed communiqué cannot reach the public
      // site while `actualitesLive` is false (code-owned gate).
      expect((await page("/actualites")).status).toBe(404)

      // The annual cap is six: fill the year, then assert the seventh publish
      // is refused by the validation hook (content model §5.2). The already
      // published communiqué is dated first so the calendar-year count is exact.
      const dated = await rest(developer, `/api/communiques/${doc.id}`, {
        method: "PATCH",
        body: { publishedAt: "2026-05-01" },
      })
      expect(dated.status).toBe(200)
      const createdIds: number[] = [doc.id]
      for (let index = 0; index < 5; index += 1) {
        const extra = await rest(developer, "/api/communiques", {
          method: "POST",
          body: {
            title: `Contrôle #30 — communiqué ${index + 2}`,
            slug: `controle-30-communique-${index + 2}`,
            publishedAt: "2026-06-01",
            legalReviewed: true,
            legalReviewRef: "REVUE-CONTROLE-30",
            _status: "published",
          },
        })
        expect([200, 201]).toContain(extra.status)
        createdIds.push((await restJson<{ doc: RestCommunique }>(extra)).doc.id)
      }

      const seventh = await rest(developer, "/api/communiques", {
        method: "POST",
        body: {
          title: "Contrôle #30 — septième communiqué",
          slug: "controle-30-communique-7",
          publishedAt: "2026-07-01",
          legalReviewed: true,
          legalReviewRef: "REVUE-CONTROLE-30",
          _status: "published",
        },
      })
      expect(seventh.status).toBe(400)

      // Cleanup every created communiqué (developer-only permanent delete).
      for (const createdId of createdIds) {
        expect((await rest(developer, `/api/communiques/${createdId}`, { method: "DELETE" })).status).toBe(200)
      }
    } catch (error) {
      // Best-effort cleanup on failure so the suite is re-runnable.
      await rest(developer, `/api/communiques/${doc.id}`, { method: "DELETE" })
      throw error
    }
  })

  it("refuses to publish a named case study without the recorded permissions", async () => {
    const domain = await findDomaine("eclairage-public")
    const created = await rest(developer, "/api/projects", {
      method: "POST",
      body: {
        title: "Contrôle #30 — étude de cas",
        slug: "controle-30-etude",
        services: [domain.id],
        _status: "draft",
      },
    })
    expect([200, 201]).toContain(created.status)
    const { doc } = await restJson<{ doc: RestProject }>(created)

    try {
      // An anonymized card requires its evidence reference.
      const anonymous = await rest(developer, `/api/projects/${doc.id}`, {
        method: "PATCH",
        body: { _status: "published" },
      })
      expect(anonymous.status).toBe(400)

      // A named card requires the written client authorisation and reference.
      const named = await rest(developer, `/api/projects/${doc.id}`, {
        method: "PATCH",
        body: { clientName: "Client de contrôle" },
      })
      expect(named.status).toBe(200)

      const blocked = await rest(developer, `/api/projects/${doc.id}`, {
        method: "PATCH",
        body: { _status: "published" },
      })
      expect(blocked.status).toBe(400)

      const permission = await rest(developer, `/api/projects/${doc.id}`, {
        method: "PATCH",
        body: { clientPermission: true, clientPermissionRef: "AUT-CONTROLE-30" },
      })
      expect(permission.status).toBe(200)

      const published = await rest(developer, `/api/projects/${doc.id}`, {
        method: "PATCH",
        body: { _status: "published" },
      })
      expect(published.status).toBe(200)

      // The case-study family stays gated at P1 (`caseStudiesLive` false).
      expect((await page("/realisations/controle-30-etude")).status).toBe(404)
    } finally {
      expect((await rest(developer, `/api/projects/${doc.id}`, { method: "DELETE" })).status).toBe(200)
    }
  })
})
