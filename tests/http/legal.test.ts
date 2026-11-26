import type { HTMLElement } from "node-html-parser"
import { describe, expect, it } from "vitest"

import { scenario, UNKNOWN_ROUTE } from "./scenarios"

import {
  assertCanonicalDocument,
  assertNotFoundDocument,
  fetchPage,
  findAnalyticsSignals,
  findTrackingCookies,
  textOf,
  type CanonicalDocument,
  type PageDocument,
} from "./helpers"

/**
 * Legal pages over HTTP — ticket #28 acceptance.
 *
 * The copy is a decision, not site content: the identity block and the approved
 * prose come from `lib/legal/` (code-owned, never from the content source, so
 * the admin cannot edit them — #30 verifies). The suite reads the served
 * document only: it never imports the legal modules, so a page that stops
 * rendering the decision is caught here.
 *
 * Expected values are copied from the decision documents, not from the code:
 * - docs/company/facts-register.md §2.1 (identity strings);
 * - docs/legal/analytics-consent-legal-pages.md §4.2 (mentions légales),
 *   §4.3 (politique de confidentialité), §4.4 (cookies), §5.3 (retention),
 *   §5.4 (rights procedure);
 * - docs/seo/seo-metadata.md §3.3 (title and description per route);
 * - docs/spec/p1-website-build.md "Static rubriques" (Legal).
 */

const MENTIONS_PATH = "/mentions-legales"
const POLICY_PATH = "/politique-de-confidentialite"

/** Visible text of the document main landmark, whitespace-collapsed. */
function mainTextOf(canonical: CanonicalDocument): string {
  return textOf(canonical.main)
}

/** All visible text of the document body, whitespace-collapsed. */
function bodyTextOf(canonical: CanonicalDocument): string {
  return textOf(canonical.body)
}

/** Canonical link href, if the document declares one. */
function canonicalHrefOf(canonical: CanonicalDocument): string {
  return (
    canonical.head
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href")
      ?.trim() ?? ""
  )
}

/**
 * Consent-banner signals on a legal page.
 *
 * The generic `findConsentBanners` helper matches any attribute carrying the
 * word “cookie”, which is right for the homepage but would flag the legitimate
 * `#cookies` section this ticket must publish. A real banner shows up as a
 * dialog/overlay, a consent-manager component, or accept/refuse copy — assert
 * those markers instead.
 */
function findBannerSignals(page: PageDocument): string[] {
  const signals: string[] = []
  for (const element of page.document.querySelectorAll("body *")) {
    const role = element.getAttribute("role")
    const modal = element.getAttribute("aria-modal")
    const markers = ["id", "class", "aria-label", "data-testid"]
      .map((attribute) => element.getAttribute(attribute))
      .filter((value): value is string => Boolean(value))
      .join(" ")
    if (role === "dialog" || role === "alertdialog" || modal === "true") {
      signals.push(`overlay <${element.tagName.toLowerCase()}>`)
    }
    if (
      /consent|gdpr|tarteaucitron|axeptio|didomi|onetrust|usercentrics|klaro|borlabs|cookiebot|cookie-banner|cookie-notice/i.test(
        markers
      )
    ) {
      signals.push(`consent component <${element.tagName.toLowerCase()} ${markers}>`)
    }
  }
  const body = page.document.querySelector("body")
  const text = body ? textOf(body as HTMLElement) : ""
  if (
    /gérer mes cookies|tout accepter|accepter tous les cookies|refuser les cookies|j’accepte les cookies/i.test(
      text
    )
  ) {
    signals.push("consent-banner copy")
  }
  return signals
}

/** Every heading text of the main landmark, in document order. */
function headingTexts(canonical: CanonicalDocument): string[] {
  return canonical.main
    .querySelectorAll("h2")
    .map((heading) => textOf(heading))
}

/**
 * The identity block exactly as docs/company/facts-register.md §2.1 publishes
 * it. These strings are the register's `Value to publish` column, character
 * for character — a typo here is a legal defect, so they are asserted whole.
 */
const IDENTITY_VALUES = [
  "SOCIETE HAY 2010",
  "Société à responsabilité limitée (SARL)",
  "15 000 000 MAD",
  "Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc",
  "RC 87305 — Tribunal de commerce de Rabat",
  "001459327000056",
] as const

const IDENTITY_LABELS = [
  "Capital social",
  "Siège social",
  "Registre du commerce",
  "ICE",
] as const

/**
 * Content that must never render on a legal page: an unfilled identity line, a
 * host line on the mentions légales, and the CNDP placeholder family. The
 * decision rules are explicit: blank fields are omitted, not printed (§4.2).
 */
const FORBIDDEN_ON_MENTIONS = [
  /directeur\s+(?:de\s+la\s+)?publication/i,
  /\bhébergeur\b/i,
  /\bhébergement\b/i,
  /\b(?:ovh|hetzner|coolify|scaleway|vps)\b/i,
  /\bRahhal\b|\bEssamlali\b|\bgérant\b|représentant\s+légal/i,
  /\+212|\btéléphone\b|\btél\./i,
  /\[●\]|à confirmer|à compléter|en cours de déclaration/i,
  /\bCNDP\b/i,
  /n°\s*(?:…|\.{3}|\[)/,
  /lorem ipsum|à venir|coming soon/i,
] as const

describe("/mentions-legales — ticket #28", () => {
  it("serves the page as a canonical French document", async () => {
    const page = await fetchPage(MENTIONS_PATH)
    expect(page.status, "the mentions légales must be published at P1").toBe(
      200
    )

    const canonical = assertCanonicalDocument(page)
    expect(canonical.html.getAttribute("lang")).toBe("fr")

    const headings = canonical.main.querySelectorAll("h1")
    expect(headings, "exactly one h1 per legal page").toHaveLength(1)
    expect(textOf(headings[0])).toMatch(/mentions légales/i)
  })

  it("carries the exact identity block from the facts register", async () => {
    const canonical = assertCanonicalDocument(await fetchPage(MENTIONS_PATH))
    const text = mainTextOf(canonical)

    for (const value of IDENTITY_VALUES) {
      expect(text, `the identity block must publish exactly "${value}"`).toContain(
        value
      )
    }

    for (const label of IDENTITY_LABELS) {
      expect(text, `the identity block must label "${label}"`).toContain(label)
    }
  })

  it("publishes no publication director, host line, filing placeholder, phone or legal representative", async () => {
    const canonical = assertCanonicalDocument(await fetchPage(MENTIONS_PATH))
    // body, not only main: a forbidden line must not hide in the footer either
    const text = bodyTextOf(canonical)

    for (const forbidden of FORBIDDEN_ON_MENTIONS) {
      expect(
        text,
        `the mentions légales must not render ${forbidden}`
      ).not.toMatch(forbidden)
    }
  })

  it("labels the publisher section with the site and the editor's mailbox", async () => {
    const page = await fetchPage(MENTIONS_PATH)
    const canonical = assertCanonicalDocument(page)

    const policyLinks = canonical.main.querySelectorAll('a[href^="/"]')
    const hrefs = policyLinks.map((link) => link.getAttribute("href"))
    expect(hrefs, "mentions légales must link the policy").toContain(
      POLICY_PATH
    )

    const mailtos = canonical.main
      .querySelectorAll('a[href^="mailto:"]')
      .map((link) => link.getAttribute("href"))
    expect(
      mailtos,
      "mentions légales must publish the cleared general mailbox"
    ).toContain("mailto:contact@hay2010.ma")
    expect(
      mailtos,
      "mentions légales must publish the law 09-08 rights mailbox"
    ).toContain("mailto:donnees@hay2010.ma")
  })

  it("renders the approved sections in order and shows the last-reviewed date", async () => {
    const canonical = assertCanonicalDocument(await fetchPage(MENTIONS_PATH))
    const headings = headingTexts(canonical)

    const expectedSections = [
      /éditeur du site/i,
      /propriété intellectuelle/i,
      /données personnelles/i,
      /cookies/i,
      /responsabilité/i,
      /droit applicable/i,
      /mise à jour/i,
    ]
    expect(
      headings,
      "the approved mentions légales sections must render, numbered, in order"
    ).toHaveLength(expectedSections.length)
    expectedSections.forEach((pattern, index) => {
      expect(headings[index], `section ${index + 1} heading`).toMatch(pattern)
    })

    const text = bodyTextOf(canonical)
    expect(text).toMatch(/dernière mise à jour\s*:\s*\d{1,2}\s+\S+\s+\d{4}/i)
    expect(text, "the last-reviewed date is the legal review date").toContain(
      "9 novembre 2026"
    )
  })

  it("declares its own canonical metadata", async () => {
    const canonical = assertCanonicalDocument(await fetchPage(MENTIONS_PATH))
    const { title, description } = canonical

    expect(title).toBe("Mentions légales — HAY2010")
    expect(description.length).toBeGreaterThanOrEqual(120)
    expect(description.length).toBeLessThanOrEqual(160)
    expect(description).toContain("SOCIETE HAY 2010")
    expect(
      canonicalHrefOf(canonical),
      "the canonical must be absolute on the apex origin, no trailing slash"
    ).toBe("https://hay2010.ma/mentions-legales")
  })

  it("renders no cookie table, consent banner, form or analytics", async () => {
    const page = await fetchPage(MENTIONS_PATH)
    const canonical = assertCanonicalDocument(page)
    const text = bodyTextOf(canonical)

    // Cookies are a section of the policy, not a second detailed notice here;
    // the mentions légales only summarise and link to it (§4.2).
    for (const cookie of ["__cf_bm", "cf_clearance", "_cfuvid", "payload-token"]) {
      expect(text, `the cookie table belongs to the policy, not here`).not.toContain(
        cookie
      )
    }

    expect(findBannerSignals(page)).toEqual([])
    expect(findAnalyticsSignals(page)).toEqual([])
    expect(findTrackingCookies(page.headers)).toEqual([])
    for (const selector of ["form", "input", "textarea", "select", "button"]) {
      expect(
        canonical.main.querySelectorAll(selector),
        `a legal page carries no <${selector}>`
      ).toHaveLength(0)
    }
  })
})

/**
 * Placeholders that must never ship on a public legal page: an unfilled CNDP
 * reference, a pending provider country, a publication director, a host line.
 * Publication rules, decision §4.3: empty fields are omitted, not printed.
 */
const FORBIDDEN_ON_POLICY = [
  /\[●\]|à confirmer|à compléter|en cours de déclaration/i,
  /directeur\s+(?:de\s+la\s+)?publication/i,
  /\[Hébergeur|Hébergeur du VPS/i,
  /récépissé n°|autorisation n°|CNDP n°/i,
  /\bF-\d{3}\b|D-\d{3}-\d{4}/,
  /n°\s*(?:…|\.{3}|\[)/,
  /lorem ipsum|à venir|coming soon/i,
] as const

describe("/politique-de-confidentialite — ticket #28", () => {
  it("serves the page as a canonical French document", async () => {
    const page = await fetchPage(POLICY_PATH)
    expect(page.status, "the privacy policy must be published at P1").toBe(200)

    const canonical = assertCanonicalDocument(page)
    expect(canonical.html.getAttribute("lang")).toBe("fr")

    const headings = canonical.main.querySelectorAll("h1")
    expect(headings, "exactly one h1 per legal page").toHaveLength(1)
    expect(textOf(headings[0])).toMatch(/politique de confidentialité/i)
  })

  it("carries the code-owned controller identity block", async () => {
    const canonical = assertCanonicalDocument(await fetchPage(POLICY_PATH))
    const text = mainTextOf(canonical)

    for (const value of IDENTITY_VALUES) {
      expect(
        text,
        `the controller block must publish exactly "${value}"`
      ).toContain(value)
    }

    const mailtos = canonical.main
      .querySelectorAll('a[href^="mailto:"]')
      .map((link) => link.getAttribute("href"))
    expect(
      mailtos,
      "the policy must publish the cleared general mailbox"
    ).toContain("mailto:contact@hay2010.ma")
    expect(
      mailtos,
      "the rights procedure must publish donnees@hay2010.ma"
    ).toContain("mailto:donnees@hay2010.ma")
  })

  it("renders the approved sections in the approved order", async () => {
    const canonical = assertCanonicalDocument(await fetchPage(POLICY_PATH))
    const headings = headingTexts(canonical)

    const expectedSections = [
      /responsable du traitement/i,
      /quelles données, pour quelles finalités et sur quelle base/i,
      /qui reçoit vos données/i,
      /transférées hors du maroc/i,
      /combien de temps conservons-nous/i,
      /quels sont vos droits/i,
      /cookies/i,
      /sécurité/i,
      /modifications/i,
      /contact/i,
    ]
    expect(
      headings,
      "the approved policy sections must render, numbered, in order"
    ).toHaveLength(expectedSections.length)
    expectedSections.forEach((pattern, index) => {
      expect(headings[index], `section ${index + 1} heading`).toMatch(pattern)
    })

    // §2 is the processing register: 2.1 … 2.6, numbered by the renderer.
    const subsections = canonical.main
      .querySelectorAll("h3")
      .map((heading) => textOf(heading))
    expect(subsections.length).toBeGreaterThanOrEqual(6)
    expect(subsections[0]).toMatch(/^2\.1\s+demandes de contact et de devis/i)
    expect(subsections[1]).toMatch(/^2\.2\s+candidatures/i)
    expect(subsections[2]).toMatch(/^2\.3\s+sécurité et journaux serveur/i)
    expect(subsections[3]).toMatch(/^2\.4\s+mesure d’audience/i)
    expect(subsections[4]).toMatch(/^2\.5\s+administration du site/i)
    expect(subsections[5]).toMatch(/^2\.6\s+cookies/i)

    expect(bodyTextOf(canonical)).toMatch(/dernière mise à jour\s*:\s*\d{1,2}\s+\S+\s+\d{4}/i)
  })

  it("carries cookies as a section of this page, with the launch-state table", async () => {
    const page = await fetchPage(POLICY_PATH)
    const canonical = assertCanonicalDocument(page)

    // §4.1: the anchor `/politique-de-confidentialite#cookies` must resolve.
    const cookiesSection = canonical.main.querySelector("#cookies")
    expect(cookiesSection, "the cookies section must carry its anchor").not.toBeNull()
    if (!cookiesSection) return

    expect(textOf(cookiesSection)).toMatch(/^7\.\s*cookies/i)

    const cookiesText = textOf(cookiesSection)
    for (const cookie of ["__cf_bm", "cf_clearance", "_cfuvid", "payload-token"]) {
      expect(cookiesText, `the launch cookie table must list ${cookie}`).toContain(
        cookie
      )
    }
    expect(cookiesText).toMatch(/aucun cookie de mesure d’audience/i)
    expect(cookiesText).toMatch(/ne requièrent pas de consentement/i)
    expect(cookiesText).toMatch(/ne bloque pas l’accès/i)

    // The analytics activation paragraph is state 2 of §4.4: not at launch.
    expect(cookiesText).not.toMatch(/lorsque cloudflare web analytics est activé/i)

    // No separate cookie page: the page tree fixes cookies inside the policy.
    assertNotFoundDocument(await fetchPage("/cookies"))
  })

  it("publishes the retention periods and the rights procedure", async () => {
    const canonical = assertCanonicalDocument(await fetchPage(POLICY_PATH))
    const text = bodyTextOf(canonical)

    for (const period of [
      "12 mois après le dernier échange",
      "6 mois après la décision",
      "12 mois maximum dans la CVthèque",
      "Journaux serveur et sécurité",
      "Compte d’administration",
      "Durée légale de conservation applicable",
    ]) {
      expect(text, `the retention table must state "${period}"`).toContain(period)
    }

    const mailtos = canonical.main
      .querySelectorAll('a[href^="mailto:"]')
      .map((link) => link.getAttribute("href"))
    expect(mailtos, "rights are exercised at donnees@hay2010.ma").toContain(
      "mailto:donnees@hay2010.ma"
    )

    for (const right of [
      /accès à vos données/i,
      /rectification des données inexactes ou incomplètes, dans un délai de 10 jours/i,
      /effacement et verrouillage/i,
      /opposition, pour des raisons légitimes/i,
      /retrait de votre consentement/i,
    ]) {
      expect(text, `the rights list must state ${right}`).toMatch(right)
    }
    expect(text).toMatch(/10 jours pour les rectifications/i)
    expect(text).toContain("www.cndp.ma")
    expect(text, "analytics is explicitly off at launch").toMatch(
      /mesure d’audience est désactivée à la mise en ligne/i
    )
  })

  it("publishes no placeholder, blank CNDP reference or internal filing code", async () => {
    const canonical = assertCanonicalDocument(await fetchPage(POLICY_PATH))
    const text = bodyTextOf(canonical)

    for (const forbidden of FORBIDDEN_ON_POLICY) {
      expect(text, `the policy must not render ${forbidden}`).not.toMatch(
        forbidden
      )
    }
  })

  it("declares its own canonical metadata, unique across the legal pages", async () => {
    const policy = assertCanonicalDocument(await fetchPage(POLICY_PATH))
    const mentions = assertCanonicalDocument(await fetchPage(MENTIONS_PATH))

    expect(policy.title).toBe("Politique de confidentialité — HAY2010")
    expect(policy.description.length).toBeGreaterThanOrEqual(120)
    expect(policy.description.length).toBeLessThanOrEqual(160)
    expect(policy.description).toContain("SOCIETE HAY 2010")
    expect(canonicalHrefOf(policy)).toBe(
      "https://hay2010.ma/politique-de-confidentialite"
    )

    expect(policy.title, "titles must be unique").not.toBe(mentions.title)
    expect(policy.description, "descriptions must be unique").not.toBe(
      mentions.description
    )
    expect(canonicalHrefOf(policy)).not.toBe(canonicalHrefOf(mentions))
  })

  it("renders no consent banner, form or analytics", async () => {
    const page = await fetchPage(POLICY_PATH)
    const canonical = assertCanonicalDocument(page)

    expect(findBannerSignals(page)).toEqual([])
    expect(findAnalyticsSignals(page)).toEqual([])
    expect(findTrackingCookies(page.headers)).toEqual([])
    for (const selector of ["form", "input", "textarea", "select", "button"]) {
      expect(
        canonical.main.querySelectorAll(selector),
        `the policy carries no <${selector}>`
      ).toHaveLength(0)
    }
  })
})

describe("legal pages across the P1 site — ticket #28", () => {
  it("links both legal pages from the footer of every published page", async () => {
    const routes = ["/", ...scenario.openRoutes.filter((route) => route !== "/")]

    for (const route of routes) {
      const page = await fetchPage(route)
      expect(page.status, `${route} must be served`).toBe(200)
      const canonical = assertCanonicalDocument(page)
      const footerHrefs = canonical.footer
        .querySelectorAll("a[href]")
        .map((anchor) => anchor.getAttribute("href") ?? "")

      expect(
        footerHrefs,
        `${route} must link the mentions légales from its footer`
      ).toContain(MENTIONS_PATH)
      expect(
        footerHrefs,
        `${route} must link the policy from its footer`
      ).toContain(POLICY_PATH)
    }
  })

  it("keeps the legal links in the 404 document footer", async () => {
    const notFound = await fetchPage(UNKNOWN_ROUTE)
    expect(notFound.status).toBe(404)
    const footer = notFound.document.querySelector("footer")
    expect(footer, "the 404 document keeps the site footer").not.toBeNull()
    if (!footer) return

    const footerHrefs = footer
      .querySelectorAll("a[href]")
      .map((anchor) => anchor.getAttribute("href") ?? "")
    expect(footerHrefs).toContain(MENTIONS_PATH)
    expect(footerHrefs).toContain(POLICY_PATH)
  })

  it("keeps titles, descriptions and canonicals unique across the published site", async () => {
    const home = assertCanonicalDocument(await fetchPage("/"))
    const mentions = assertCanonicalDocument(await fetchPage(MENTIONS_PATH))
    const policy = assertCanonicalDocument(await fetchPage(POLICY_PATH))

    const titles = [home.title, mentions.title, policy.title]
    expect(new Set(titles).size, "titles must be unique").toBe(titles.length)

    const descriptions = [home.description, mentions.description, policy.description]
    expect(
      new Set(descriptions).size,
      "descriptions must be unique"
    ).toBe(descriptions.length)

    for (const canonical of [mentions, policy]) {
      const href = canonicalHrefOf(canonical)
      expect(href, "canonical must be absolute on the apex origin").toMatch(
        /^https:\/\/hay2010\.ma\/[a-z-]+$/
      )
      const count = canonical.head.querySelectorAll('link[rel="canonical"]').length
      expect(count, "exactly one canonical per legal page").toBe(1)
    }
  })

  it("lists both legal pages in the sitemap exactly once", async () => {
    const sitemap = await fetchPage("/sitemap.xml")
    expect(sitemap.status).toBe(200)
    const locations = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1].trim()
    )
    for (const path of [MENTIONS_PATH, POLICY_PATH]) {
      const matches = locations.filter(
        (location) => new URL(location).pathname === path
      )
      expect(matches, `${path} must appear once in the sitemap`).toHaveLength(1)
    }
  })
})
