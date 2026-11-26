import { describe, expect, it } from "vitest"
import type { HTMLElement } from "node-html-parser"

import {
  assertCanonicalDocument,
  visibleTextOf,
  fetchPage,
  findAnalyticsSignals,
  findConsentBanners,
  findTrackingCookies,
  getSetCookies,
  isFrench,
  textOf,
  type CanonicalDocument,
} from "./helpers"
import { scenario } from "./scenarios"
import { internalLinksIn } from "./surfaces"

/**
 * The Contact page over HTTP — ticket #26 acceptance.
 *
 * The page is verified the way a visitor, a screen reader and a crawler see it:
 * the served production document only. The suite is scenario-agnostic because
 * /contact is a P1 rubrique that stays published in every fixture state; the
 * gated-channel assertions are what will fail if a phone, hours, map or social
 * link leaks in before the facts register clears it.
 *
 * Decision sources:
 * - docs/spec/p1-website-build.md "Static rubriques" (Contact);
 * - docs/forms/contact-careers-forms.md §2.3–2.4, §3.1, §3.14;
 * - docs/company/facts-register.md §2.1/§2.3 (only contact@, address, no phone,
 *   no map, no social, no recruitment mailbox at P1);
 * - docs/legal/analytics-consent-legal-pages.md §4.5/§6 (the short notice and
 *   the no-CNDP-number rule).
 */

/** The cleared public mailbox (facts register §2.3). */
const PUBLIC_MAILBOX = "contact@hay2010.ma"
const PUBLIC_MAILTO = `mailto:${PUBLIC_MAILBOX}`

/** The cleared registered address, register wording (facts register §2.1). */
const REGISTERED_ADDRESS = "Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc"

/** The contact page's approved metadata (docs/seo/seo-metadata.md §3.3). */
const CONTACT_TITLE = "Contact à Rabat — HAY2010"
const CONTACT_DESCRIPTION =
  "Contactez HAY2010 à Rabat : Local N° 21, Hay El Manzeh, Hay Er-Riad. Écrivez-nous pour vos projets d’éclairage public. Devis sur demande."

/** H2 section headings, in served order (generic content-blocks check). */
const SECTION_HEADINGS = [
  "Écrivez-nous",
  "Ce que votre e-mail doit contenir",
  "Ce qui se passe ensuite",
  "Siège social",
  "Données personnelles",
]

const GATED_CHANNEL_LINK =
  /(?:linkedin\.com|facebook\.com|instagram\.com|twitter\.com|x\.com|youtube\.com|tiktok\.com|wa\.me|google\.[a-z.]+\/maps|maps\.google|openstreetmap\.org|bing\.com\/maps|waze\.com)/i

/** Fetch /contact and assert the shared shell; returns the observable parts. */
async function fetchContact(): Promise<CanonicalDocument> {
  const page = await fetchPage("/contact")
  expect(page.status, "/contact is a published P1 rubrique").toBe(200)
  expect(page.headers.get("content-type") ?? "").toMatch(/text\/html/)
  return assertCanonicalDocument(page)
}

/** Anchors matching a predicate inside the page's main landmark. */
function mainAnchors(
  canonical: CanonicalDocument,
  predicate: (href: string) => boolean
): HTMLElement[] {
  return canonical.main
    .querySelectorAll("a[href]")
    .filter((anchor) => predicate(anchor.getAttribute("href") ?? ""))
}

function expectLedeText(main: HTMLElement, expected: string) {
  expect(textOf(main), `the contact page must state: ${expected}`).toContain(
    expected
  )
}

describe(`contact page: email-first (${scenario.name})`, () => {
  it("serves the gate-guarded page as one canonical French document", async () => {
    const canonical = await fetchContact()

    expect(canonical.html.getAttribute("lang")).toBe("fr")
    expect(isFrench(canonical.title), `title is not French: ${canonical.title}`).toBe(
      true
    )

    const headings = canonical.main.querySelectorAll("h1")
    expect(headings, "the contact page must carry exactly one h1").toHaveLength(1)
    expect(textOf(headings[0])).toBe("Contact")
  })

  it("makes the cleared mailbox the primary action, as a working mailto", async () => {
    const canonical = await fetchContact()

    const mailtos = mainAnchors(canonical, (href) => href.startsWith("mailto:"))
    expect(
      mailtos.length,
      "the email action must be in the page content, not only in the footer"
    ).toBe(1)
    expect(mailtos[0].getAttribute("href")).toBe(PUBLIC_MAILTO)
    expect(textOf(mailtos[0])).toBe(PUBLIC_MAILBOX)

    // A mailto is "working" when it is the bare cleared mailbox: no subject,
    // body or recipient list that could change the destination silently.
    const href = mailtos[0].getAttribute("href") ?? ""
    expect(href.split("?")).toHaveLength(1)
    expect(href.slice("mailto:".length)).toBe(PUBLIC_MAILBOX)
  })

  it("never links a gated or private mailbox from the page", async () => {
    const canonical = await fetchContact()
    const hrefs = mainAnchors(canonical, (href) => href.startsWith("mailto:")).map(
      (anchor) => anchor.getAttribute("href") ?? ""
    )

    for (const href of hrefs) {
      expect(href, "only the cleared public mailbox may be linked").toBe(PUBLIC_MAILTO)
    }

    // Private fallback, rights mailbox and careers mailbox are not contact
    // channels on this page (facts register §2.3, §3).
    const text = textOf(canonical.body)
    expect(text).not.toMatch(/ste\.hay2010@gmail\.com/i)
    expect(text).not.toMatch(/recrutement@/i)
  })

  it("renders the cleared registered address as postal text", async () => {
    const canonical = await fetchContact()
    const text = textOf(canonical.main)

    expect(text).toContain("Siège social")
    expect(text, "the registered address must render verbatim").toContain(
      REGISTERED_ADDRESS
    )
    expect(
      canonical.main.querySelectorAll("address"),
      "the address must be marked up as postal text"
    ).toHaveLength(1)
  })

  it("renders no gated contact channel at P1", async () => {
    const canonical = await fetchContact()
    const text = textOf(canonical.main)
    const hrefs = mainAnchors(canonical, () => true).map(
      (anchor) => anchor.getAttribute("href") ?? ""
    )

    // Phone (facts register §2.3: gated).
    expect(hrefs.filter((href) => href.startsWith("tel:"))).toEqual([])
    expect(text).not.toMatch(/\+212|\(\s*0\d|\btéléphone\b|\btél\./i)

    // Opening hours (gated): no hours claim may render.
    expect(text).not.toMatch(/horaires?|ouvert\s+(?:du|le|de)/i)

    // Map (gated until the address is a confirmed public reception point):
    // no embedded third party and no map link.
    expect(canonical.main.querySelectorAll("iframe")).toHaveLength(0)
    expect(hrefs.filter((href) => GATED_CHANNEL_LINK.test(href))).toEqual([])
    expect(text).not.toMatch(/plan d’accès|carte interactive|nous trouver/i)

    // Social profiles (gated: no official account confirmed).
    expect(text).not.toMatch(/linkedin|facebook|instagram|twitter|youtube|tiktok/i)
    expect(
      hrefs.filter((href) => /social|profile|share/i.test(href)),
      "no social or share link may render"
    ).toEqual([])
  })

  it("renders no form element and stores nothing in the browser", async () => {
    const canonical = await fetchContact()
    const page = canonical.page

    for (const selector of ["form", "input", "textarea", "select"]) {
      expect(
        page.document.querySelectorAll(selector),
        `the email-first page must render no <${selector}>`
      ).toHaveLength(0)
    }
    expect(
      page.document.querySelectorAll('button[type="submit"]'),
      "no submit button may render"
    ).toHaveLength(0)

    // No client-side store is wired from this document (no form state to keep).
    expect(page.html).not.toMatch(/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/i)
  })

  it("loads no analytics, sets no tracking cookie and shows no consent banner", async () => {
    const canonical = await fetchContact()
    const page = canonical.page

    expect(findAnalyticsSignals(page)).toEqual([])
    expect(findConsentBanners(page)).toEqual([])
    expect(findTrackingCookies(page.headers)).toEqual([])
    // A plain server-rendered page must not need any cookie at all.
    expect(getSetCookies(page.headers)).toEqual([])
  })

  it("links the privacy policy and carries the short data notice", async () => {
    const canonical = await fetchContact()
    const text = textOf(canonical.main)

    const privacyLinks = mainAnchors(
      canonical,
      (href) => href === "/politique-de-confidentialite"
    )
    expect(privacyLinks, "the privacy policy must be linked from the page").toHaveLength(
      1
    )
    expect(textOf(privacyLinks[0])).toContain("Politique de confidentialité")

    // The approved short contact notice (legal decision §4.5), minus the CNDP
    // sentence: no receipt exists, so no declaration may be claimed.
    expect(text).toContain("Vos données sont traitées par SOCIETE HAY 2010")
    expect(text).toContain("conservées 12 mois après le dernier échange")
    expect(text).toContain("donnees@hay2010.ma")
    expect(text).not.toMatch(/CNDP/i)
    expect(text).not.toMatch(/n°\s*…|\[●\]/)
  })

  it("states plainly what is and is not collected", async () => {
    const canonical = await fetchContact()
    const text = textOf(canonical.main)

    // What is not collected: the site has no form, no message store and no
    // audience measurement. This is the honesty criterion of the ticket.
    expect(text).toMatch(/ne comporte pas de formulaire/i)
    expect(text).toMatch(/aucun cookie de suivi/i)
    expect(text).toMatch(/n’est pas (?:enregistré|stocké) par le site/i)

    // What is collected: the email correspondence itself, with the reason.
    expect(text).toMatch(/pour répondre à votre demande/i)
  })

  it("explains what to include in an email and what happens next", async () => {
    const canonical = await fetchContact()
    const text = textOf(canonical.main)

    // A genuine contact page helps a visitor write a useful first email.
    for (const expected of [
      "Ce que votre e-mail doit contenir",
      "demande de renseignement ou d’une demande de devis",
      "commune ou le site concerné",
      "plans, photos",
      "Ce qui se passe ensuite",
      "Nous vous répondons par e-mail",
    ]) {
      expectLedeText(canonical.main, expected)
    }

    // "What happens next" is an ordered sequence, not a bullet salad.
    const orderedLists = canonical.main.querySelectorAll("ol")
    expect(
      orderedLists.length,
      "the next-steps block must render as an ordered list"
    ).toBeGreaterThan(0)
    expect(text).not.toMatch(/formulaire bientôt|en construction|à venir/i)
  })

  it("renders the content blocks in the designed order", async () => {
    const canonical = await fetchContact()
    const headings = canonical.main
      .querySelectorAll("h2")
      .map((heading) => textOf(heading))

    expect(headings).toEqual(SECTION_HEADINGS)
  })

  it("keeps every gated claim out of the page", async () => {
    const canonical = await fetchContact()
    // Visible copy only: the JSON-LD graph legitimately carries the cleared
    // RC/ICE identifiers and the Organization entity (SEO §5.2).
    const text = visibleTextOf(canonical.body)

    // Facts register §2.2/§3: these may never render while their gates are
    // closed, and none of them belongs on a contact page.
    expect(text).not.toMatch(
      /agrément|ONEE|\bISO\b|certifié|entreprise agréée|leader|n°\s*1|meilleur/i
    )
    expect(text).not.toMatch(/depuis\s+(?:2004|2011)|créée en\s+2004|plus de 20 ans/i)
    expect(text).not.toMatch(/\bRC\s*\d+|\bICE\b|capital social/i)

    // No invented response time, quote or intervention promise.
    expect(text).not.toMatch(
      /(?:sous|dans|en)\s+(?:\d+|deux|trois|quarante-huit)\s*(?:heures?|h\b|jours?\s+ouvrés?)/i
    )
    expect(text).not.toMatch(/délai de réponse|réponse garantie|devis gratuit/i)

    // No client name, logo or testimonial surface.
    expect(text).not.toMatch(/témoignage|client\s*:|nos clients/i)
  })

  it("exposes unique, honest metadata for the route", async () => {
    const canonical = await fetchContact()
    const page = canonical.page

    expect(canonical.title).toBe(CONTACT_TITLE)
    expect(canonical.description).toBe(CONTACT_DESCRIPTION)
    expect(canonical.description.length).toBeGreaterThanOrEqual(120)
    expect(canonical.description.length).toBeLessThanOrEqual(170)
    expect(page.document.querySelectorAll("title")).toHaveLength(1)
    expect(canonical.title).not.toMatch(/HAY2010 — HAY2010|— —/)

    // Unique against the layout default and the other pages actually built in
    // this scenario (a scenario may close one of them, e.g. p1-gates-closed).
    const comparableRoutes = [
      "/",
      ...scenario.openRoutes.filter((route) => route !== "/" && route !== "/contact"),
    ].slice(0, 3)
    for (const route of comparableRoutes) {
      const other = await fetchPage(route)
      expect(other.status, `${route} must be served`).toBe(200)
      const otherTitle =
        other.document.querySelector("title")?.text.trim() ?? ""
      const otherDescription =
        other.document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content")
          ?.trim() ?? ""
      expect(otherTitle, `title must be unique (${route})`).not.toBe(
        canonical.title
      )
      expect(
        otherDescription,
        `description must be unique (${route})`
      ).not.toBe(canonical.description)
    }
  })

  it("links no gated route from the page", async () => {
    const canonical = await fetchContact()
    const hrefs = internalLinksIn(canonical.main).map((link) => link.href)
    const gated = new Set(scenario.gatedRoutes)

    expect(hrefs.filter((href) => gated.has(href))).toEqual([])
  })
})
