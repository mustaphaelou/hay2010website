import { describe, expect, it } from "vitest"

import {
  assertCanonicalDocument,
  fetchPage,
  findAnalyticsSignals,
  findConsentBanners,
  findTrackingCookies,
  textOf,
  type CanonicalDocument,
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

    expect(findConsentBanners(page)).toEqual([])
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
