/**
 * CMS verification suite — runs only through `npm run test:cms` against a
 * disposable `postgres:16-alpine` (port 5529), a production build made with
 * `CONTENT_SOURCE=cms`, and the seeded dev accounts.
 *
 * It asserts the observable surface of ticket #29 over HTTP, the same seam the
 * rest of the suite uses: status codes, cookies, JSON bodies and rendered
 * documents. No page or server module is imported; the only non-HTTP checks are
 * the pure object-storage configuration tests in `storage-config.test.ts`.
 *
 * Mutation order matters here: the role/media tests change the seeded records
 * the earlier read-only assertions depend on, so each `it` documents what state
 * it leaves behind.
 */
import { beforeAll, describe, expect, it } from "vitest"

import { SEED_ACCOUNTS, seedPassword } from "../../lib/payload/seed-accounts"

const BASE_URL = (process.env.CMS_TEST_BASE_URL ?? "http://127.0.0.1:3129").replace(/\/+$/, "")

const PENDING_MEDIA_FILENAME = "media-droits-en-attente.png"
const CLEARED_MEDIA_FILENAME = "media-droits-valides.png"

const PASSWORD = seedPassword()

/** One logged-in staff session: the `name=value` cookie pair. */
interface Session {
  readonly cookie: string
}

function account(role: "developer" | "owner" | "editor") {
  const found = SEED_ACCOUNTS.find((candidate) => candidate.role === role)
  if (!found) throw new Error(`No seed account for role ${role}`)
  return found
}

function headers(init: Record<string, string> = {}): Record<string, string> {
  return { "Accept-Language": "fr", ...init }
}

/**
 * Headers of an authenticated request.
 *
 * Payload signs the session in the `payload-token` cookie, and its CSRF
 * strategy only accepts a cookie JWT when the request proves same-origin
 * provenance (`Origin` allow-filled from `serverURL`, or `Sec-Fetch-Site`).
 * A browser sends both; a bare HTTP client must too, otherwise the request is
 * silently treated as anonymous — which would make every role test vacuous.
 */
function authenticatedHeaders(session: Session): Record<string, string> {
  return headers({
    Cookie: session.cookie,
    Origin: BASE_URL,
    "Sec-Fetch-Site": "same-origin",
  })
}

/** Resolve a Payload file URL (absolute on the local-disk fallback) against the server. */
function absoluteUrl(value: string): string {
  return value.startsWith("http") ? value : `${BASE_URL}${value}`
}

/** Read the `payload-token` cookie pair out of a login response. */
function tokenCookie(response: Response): string {
  const cookies = (
    response.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.()
  if (!cookies?.length) throw new Error("login response carried no Set-Cookie header")
  const token = cookies.find((cookie) => cookie.startsWith("payload-token="))
  if (!token) throw new Error(`login response carried no payload-token cookie: ${cookies.join(" | ")}`)
  return token.split(";")[0]
}

async function login(role: "developer" | "owner" | "editor"): Promise<Session> {
  const user = account(role)
  const response = await fetch(`${BASE_URL}/api/users/login`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email: user.email, password: PASSWORD }),
  })
  expect(response.status, `${role} login must succeed`).toBe(200)
  return { cookie: tokenCookie(response) }
}

/** Authenticated JSON request against the Payload REST API. */
async function rest(
  session: Session | null,
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<Response> {
  const requestHeaders = session ? authenticatedHeaders(session) : headers()
  if (init.body !== undefined) requestHeaders["Content-Type"] = "application/json"
  return fetch(`${BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: requestHeaders,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
}

async function restJson<T>(session: Session | null, path: string): Promise<{ status: number; json: T }> {
  const response = await rest(session, path)
  const json = (await response.json()) as T
  return { status: response.status, json }
}

interface RestList<T> {
  docs: T[]
  totalDocs: number
}

interface RestPage {
  id: number
  key: string
  _status?: string
}

interface RestMedia {
  id: number
  filename: string
  rightsStatus: string
  url?: string
  sizes?: Record<string, { url?: string }>
}

let developer: Session
let owner: Session
let editor: Session

beforeAll(async () => {
  developer = await login("developer")
  owner = await login("owner")
  editor = await login("editor")
})

/** Find the seeded Réalisations page (a draft) as staff. */
async function realisationsPage(session: Session): Promise<RestPage> {
  const query = new URLSearchParams({
    draft: "true",
    limit: "10",
    "where[key][equals]": "realisations",
  })
  const { status, json } = await restJson<RestList<RestPage>>(session, `/api/pages?${query}`)
  expect(status).toBe(200)
  expect(json.docs.length).toBe(1)
  return json.docs[0]
}

/** Find a seeded media record by filename (staff see pending rights). */
async function mediaByFilename(session: Session, filename: string): Promise<RestMedia> {
  const query = new URLSearchParams({ limit: "10", "where[filename][equals]": filename })
  const { status, json } = await restJson<RestList<RestMedia>>(session, `/api/media?${query}`)
  expect(status).toBe(200)
  expect(json.docs.length).toBe(1)
  return json.docs[0]
}

describe("embedded admin on the same origin", () => {
  it("serves the admin login page on the same origin, in French", async () => {
    // The admin is a client application: `/admin` answers 200 to everyone and
    // the anonymous session is routed to `/admin/login` by the shell, so both
    // URLs must be reachable on the site origin. `/admin/login` is the
    // server-rendered login document the assertion can read.
    const shell = await fetch(`${BASE_URL}/admin`, { headers: headers() })
    expect(shell.status).toBe(200)
    expect(new URL(shell.url).origin).toBe(new URL(BASE_URL).origin)
    expect(await shell.text()).toContain("admin/login")

    const login = await fetch(`${BASE_URL}/admin/login`, { headers: headers() })
    expect(login.status).toBe(200)
    expect(login.headers.get("content-type") ?? "").toContain("text/html")

    const html = await login.text()
    // Payload renders its document in the negotiated admin language.
    expect(html).toMatch(/<html[^>]*\blang="fr"/)
    expect(html).toContain("<title>Se connecter — HAY2010</title>")
  })

  it("does not advertise the framework on the public site", async () => {
    const response = await fetch(`${BASE_URL}/`, { headers: headers() })
    expect(response.status).toBe(200)
    expect(response.headers.get("x-powered-by")).toBeNull()
  })

  it("serves the authenticated admin dashboard to a logged-in owner", async () => {
    const response = await fetch(`${BASE_URL}/admin`, {
      headers: authenticatedHeaders(owner),
    })
    expect(response.status).toBe(200)
    const html = await response.text()
    expect(html).toContain("<title>Tableau de bord — HAY2010</title>")
  })
})

describe("anonymous access is denied where it must be", () => {
  it("rejects an anonymous users list", async () => {
    const response = await rest(null, "/api/users")
    expect(response.status).toBe(403)
  })

  it("rejects an anonymous write to pages", async () => {
    const response = await rest(null, "/api/pages", { method: "POST", body: { title: "x" } })
    expect(response.status).toBe(403)
  })

  it("rejects a wrong password", async () => {
    const response = await fetch(`${BASE_URL}/api/users/login`, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ email: account("owner").email, password: "not-the-password" }),
    })
    expect([401, 403]).toContain(response.status)
  })

  it("returns only published pages to anonymous readers", async () => {
    const { status, json } = await restJson<RestList<RestPage>>(null, "/api/pages?limit=50")
    expect(status).toBe(200)
    // Seeded: the four core pages and the three utility pages are published;
    // réalisations exists as a draft and must not leak.
    expect(json.docs.map((page) => page.key).sort()).toEqual([
      "a-propos",
      "accueil",
      "carrieres",
      "contact",
      "domaines-activite",
      "mentions-legales",
      "politique-de-confidentialite",
    ])
    for (const page of json.docs) expect(page._status).toBe("published")
  })

  it("returns only rights-cleared media to anonymous readers and serves its files", async () => {
    const { status, json } = await restJson<RestList<RestMedia>>(null, "/api/media?limit=50")
    expect(status).toBe(200)
    expect(json.docs.map((media) => media.filename)).toEqual([CLEARED_MEDIA_FILENAME])

    const cleared = json.docs[0]
    expect(cleared.rightsStatus).toBe("cleared")
    expect(cleared.url).toBeTruthy()

    if (cleared.url) {
      const file = await fetch(absoluteUrl(cleared.url))
      expect(file.status).toBe(200)
      expect(file.headers.get("content-type") ?? "").toContain("image/png")
    }

    // The generated sizes prove the sharp pipeline ran on the local fallback.
    const thumbnailUrl = cleared.sizes?.thumbnail?.url
    expect(thumbnailUrl).toBeTruthy()
    if (thumbnailUrl) {
      const thumbnail = await fetch(absoluteUrl(thumbnailUrl))
      expect(thumbnail.status).toBe(200)
    }

    // A rights-pending file is not served to an anonymous caller.
    const pending = await fetch(
      `${BASE_URL}/api/media/file/${encodeURIComponent(PENDING_MEDIA_FILENAME)}`
    )
    expect([403, 404]).toContain(pending.status)
  })
})

describe("a P1 route renders from the CMS through the adapter", () => {
  it("renders /a-propos with the navigation derived from CMS publish state", async () => {
    const response = await fetch(`${BASE_URL}/a-propos`, { headers: headers() })
    expect(response.status).toBe(200)
    const html = await response.text()

    // Published pages are in the navigation…
    expect(html).toContain('href="/a-propos"')
    expect(html).toContain('href="/domaines-activite"')
    expect(html).toContain('href="/contact"')
    // …the published utility pages are in the footer…
    expect(html).toContain('href="/carrieres"')
    expect(html).toContain('href="/mentions-legales"')
    expect(html).toContain('href="/politique-de-confidentialite"')
    // …and the CMS draft page is absent from every surface.
    expect(html).not.toContain('href="/realisations"')
  })

  it("serves the published Carrières page with its honest empty openings state", async () => {
    const response = await fetch(`${BASE_URL}/carrieres`, { headers: headers() })
    expect(response.status).toBe(200)
    const html = await response.text()
    // No opening is confirmed at launch (fixture p1 jobs gates): the page shows
    // the approved empty state, never a placeholder.
    expect(html).toContain("Aucune offre n’est ouverte pour le moment.")
    // F-113 is closed: questions go to the general mailbox, the careers mailbox
    // is a gated claim and must not appear (getCareersChannel fail-closed).
    expect(html).toContain("contact@hay2010.ma")
    expect(html).not.toContain("recrutement@hay2010.ma")
  })

  it("serves the published legal utility pages with the code-owned identity block", async () => {
    const mentions = await fetch(`${BASE_URL}/mentions-legales`, { headers: headers() })
    expect(mentions.status).toBe(200)
    const mentionsHtml = await mentions.text()
    // Identity is code-owned (lib/legal/), never from the CMS.
    expect(mentionsHtml).toContain("RC 87305")
    expect(mentionsHtml).toContain("001459327000056")

    const policy = await fetch(`${BASE_URL}/politique-de-confidentialite`, {
      headers: headers(),
    })
    expect(policy.status).toBe(200)
  })

  it("404s the CMS-draft page even though it exists in the database", async () => {
    const response = await fetch(`${BASE_URL}/realisations`, { headers: headers() })
    expect(response.status).toBe(404)
    const html = await response.text()
    expect(html).toContain("Page introuvable")
  })

  it("serves the published home page", async () => {
    const response = await fetch(`${BASE_URL}/`, { headers: headers() })
    expect(response.status).toBe(200)
  })
})

describe("roles separate the owner from the developer over HTTP", () => {
  it("denies the owner a delete (no permanent deletion)", async () => {
    const page = await realisationsPage(owner)
    const response = await rest(owner, `/api/pages/${page.id}`, { method: "DELETE" })
    expect(response.status).toBe(403)
  })

  it("lets the developer delete a draft, and keeps the owner unable to", async () => {
    const created = await rest(developer, "/api/pages", {
      method: "POST",
      body: { key: "moyens-et-competences", title: "Page de test de suppression", _status: "draft" },
    })
    expect([200, 201]).toContain(created.status)
    const createdJson = (await created.json()) as { doc: RestPage }

    const ownerDelete = await rest(owner, `/api/pages/${createdJson.doc.id}`, { method: "DELETE" })
    expect(ownerDelete.status).toBe(403)

    const developerDelete = await rest(developer, `/api/pages/${createdJson.doc.id}`, {
      method: "DELETE",
    })
    expect(developerDelete.status).toBe(200)
  })

  it("lets the editor edit a draft but never publish it", async () => {
    // A fresh draft without a cover, so the 403 comes from the role lock and not
    // from the media rights gate (which would answer 400 first).
    const created = await rest(developer, "/api/pages", {
      method: "POST",
      body: { key: "moyens-et-competences", title: "Brouillon du contributeur", _status: "draft" },
    })
    expect([200, 201]).toContain(created.status)
    const { doc } = (await created.json()) as { doc: RestPage }

    try {
      const edit = await rest(editor, `/api/pages/${doc.id}`, {
        method: "PATCH",
        body: { title: "Brouillon du contributeur (modifié)" },
      })
      expect(edit.status).toBe(200)

      const publish = await rest(editor, `/api/pages/${doc.id}`, {
        method: "PATCH",
        body: { _status: "published" },
      })
      expect(publish.status).toBe(403)
    } finally {
      await rest(developer, `/api/pages/${doc.id}`, { method: "DELETE" })
    }
  })
})

describe("media rights gate: no uncleared image on published content", () => {
  it("blocks the owner publishing a page whose cover is rights-pending", async () => {
    const page = await realisationsPage(owner)
    expect(page._status).toBe("draft")

    const publish = await rest(owner, `/api/pages/${page.id}`, {
      method: "PATCH",
      body: { _status: "published" },
    })
    expect(publish.status).toBe(400)
    const body = (await publish.json()) as { errors?: Array<{ path?: string }>; message?: string }
    expect(JSON.stringify(body)).toContain("cover")
  })

  it("refuses an incoherent rights clearance (missing release and reference)", async () => {
    const media = await mediaByFilename(developer, PENDING_MEDIA_FILENAME)
    const clear = await rest(developer, `/api/media/${media.id}`, {
      method: "PATCH",
      body: { rightsStatus: "cleared" },
    })
    expect(clear.status).toBe(400)
  })

  it("does not let the owner clear restricted media (people present)", async () => {
    const media = await mediaByFilename(developer, PENDING_MEDIA_FILENAME)
    const attempt = await rest(owner, `/api/media/${media.id}`, {
      method: "PATCH",
      body: {
        rightsStatus: "cleared",
        // The owner cannot write the release evidence either.
        releaseStatus: "cleared",
        releaseReference: "AUT-OWNER-INTERDIT",
      },
    })
    // The field-level access either rejects the value (400) or drops it
    // silently (200); what must never happen is the stored rights escalating.
    expect([200, 400]).toContain(attempt.status)

    const after = await mediaByFilename(developer, PENDING_MEDIA_FILENAME)
    expect(after.rightsStatus).toBe("pending")
  })

  it("accepts the publish once the developer records the permission", async () => {
    const media = await mediaByFilename(developer, PENDING_MEDIA_FILENAME)

    const clear = await rest(developer, `/api/media/${media.id}`, {
      method: "PATCH",
      body: {
        rightsStatus: "cleared",
        rightsReference: "AUT-TEST-PROPRIETE-1",
        releaseStatus: "cleared",
        releaseReference: "AUT-TEST-AUTORISATION-1",
      },
    })
    expect(clear.status).toBe(200)
    const cleared = (await clear.json()) as { doc: RestMedia }
    expect(cleared.doc.rightsStatus).toBe("cleared")

    const page = await realisationsPage(owner)
    const publish = await rest(owner, `/api/pages/${page.id}`, {
      method: "PATCH",
      body: { _status: "published" },
    })
    expect(publish.status).toBe(200)

    // The owner can unpublish what they published (no delete required).
    const unpublish = await rest(owner, `/api/pages/${page.id}`, {
      method: "PATCH",
      body: { _status: "draft" },
    })
    expect(unpublish.status).toBe(200)
  })

  it("denies the owner a media delete", async () => {
    const media = await mediaByFilename(developer, CLEARED_MEDIA_FILENAME)
    const response = await rest(owner, `/api/media/${media.id}`, { method: "DELETE" })
    expect(response.status).toBe(403)
  })
})
