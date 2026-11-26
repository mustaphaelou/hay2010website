import { describe, expect, it } from "vitest"

import {
  assertCanonicalDocument,
  assertNotFoundDocument,
  fetchPage,
  textOf,
  type CanonicalDocument,
} from "./helpers"
import {
  CAREERS_EMPTY_STATE,
  CAREERS_EXPIRED_OPENING_SLUG,
  CAREERS_EXPIRED_OPENING_TITLE,
  CAREERS_LIVE_CTA,
  CAREERS_NOTICE_FRAGMENT,
  CAREERS_PENDING_CTA,
  CAREERS_PENDING_LINE,
  CAREERS_SPONTANEOUS_BODY_FRAGMENT,
  CAREERS_SPONTANEOUS_TITLE,
  CAREERS_TITLE,
  scenario,
} from "./scenarios"
import {
  desktopNavigation,
  drawerNavigation,
  internalHrefs,
  linksIn,
} from "./surfaces"

/**
 * Carrières over HTTP — ticket #27 acceptance:
 * - the page is reachable from the footer and never from the primary navigation
 *   (desktop row or drawer): it is a utility page, not a CDC rubrique;
 * - openings render inline from the content source, with the approved honest
 *   empty state when there are none — never a placeholder and never a detail
 *   route;
 * - the apply-by-email route follows the F-113 gate: `contact@` (questions
 *   only) until the authorization covers `recrutement@`, then the careers
 *   mailbox with the approved notice and no blank CNDP reference;
 * - no application form, no CV upload, no `JobPosting` structured data;
 * - metadata is the approved unique title/description and never leaks a gated
 *   claim before the gate opens.
 *
 * The same bodies run in every fixture scenario (`scripts/test-http.mjs`), and
 * the two gate states are simulated by the corpus: `p1`/`p2`/`p3` keep F-113
 * closed, the `p1-recrutement` scenario opens it.
 */
describe(`carrieres (${scenario.name})`, () => {
  async function fetchCareers(): Promise<CanonicalDocument> {
    const page = await fetchPage("/carrieres")
    expect(page.status, "the Carrières route must be published").toBe(200)
    return assertCanonicalDocument(page)
  }

  it("is reachable from the footer of every published page", async () => {
    for (const route of scenario.openRoutes) {
      const page = await fetchPage(route)
      expect(page.status, `${route} must be published`).toBe(200)
      const { footer } = assertCanonicalDocument(page)
      expect(
        linksIn(footer),
        `the footer of ${route} must link Carrières`
      ).toContainEqual({ label: "Carrières", href: "/carrieres" })
    }
  })

  it("is absent from the primary navigation", async () => {
    const canonical = await fetchCareers()

    expect(
      linksIn(desktopNavigation(canonical.page)).map((link) => link.href),
      "Carrières must never be in the desktop row"
    ).not.toContain("/carrieres")
    expect(
      linksIn(drawerNavigation(canonical.page)).map((link) => link.href),
      "Carrières must never be in the primary drawer navigation"
    ).not.toContain("/carrieres")

    const headings = canonical.main.querySelectorAll("h1")
    expect(headings, "the page must carry exactly one h1").toHaveLength(1)
    expect(textOf(headings[0])).toBe("Carrières")
  })

  it("explains the company with cleared facts only", async () => {
    const { page, main } = await fetchCareers()
    const mainText = textOf(main)

    expect(mainText).toContain("HAY2010")
    expect(mainText).toContain("éclairage public")
    expect(mainText).toContain("Plus de 10 ans d’expérience")

    // Facts register §3: no founding year, no generic "entreprise agréée".
    expect(page.html).not.toMatch(/depuis (?:19|20)\d{2}|créée en (?:19|20)\d{2}/i)
    expect(page.html).not.toMatch(/entreprise agréée/i)
  })

  it("lists the open roles inline, in the decided order", async () => {
    const { page, main } = await fetchCareers()
    const mainText = textOf(main)
    const cards = main.querySelectorAll("article h3").map((heading) => textOf(heading))

    expect(cards, "opening cards must equal the expected open roles, in order").toEqual(
      scenario.careers.openings.map((opening) => opening.title)
    )

    for (const opening of scenario.careers.openings) {
      expect(mainText, `card title ${opening.title}`).toContain(opening.title)
      expect(mainText, `contract type of ${opening.title}`).toContain(opening.contractType)
      expect(mainText, `location of ${opening.title}`).toContain(opening.location)
      expect(mainText, `summary of ${opening.title}`).toContain(opening.summary)
      expect(mainText, `posting date of ${opening.title}`).toContain(opening.postedOn)
    }

    // A published record past its closing date is not an opening (forms §4.2).
    for (const hidden of scenario.careers.hiddenOpenings) {
      expect(mainText, `closed record ${hidden} must not render`).not.toContain(hidden)
    }

    // No detail route exists: no card may link into `/carrieres/…`.
    const detailLinks = internalHrefs(page).filter((href) =>
      href.startsWith("/carrieres/")
    )
    expect(detailLinks, "no link may point at a job detail route").toEqual([])

    // An opening card carries an application/question CTA for the current gate.
    if (scenario.careers.openings.length > 0) {
      const expectedMailto = scenario.careers.mailboxLive
        ? 'a[href^="mailto:recrutement@hay2010.ma"]'
        : 'a[href="mailto:contact@hay2010.ma"]'
      const cardArticles = main.querySelectorAll("ul li article")
      expect(cardArticles, "each open role renders one card").toHaveLength(
        scenario.careers.openings.length
      )
      for (const card of cardArticles) {
        expect(
          card.querySelector(expectedMailto),
          "every card must carry the CTA of the current gate state"
        ).not.toBeNull()
      }
    }
  })

  it("renders the approved empty state when no role is open", async () => {
    const { main } = await fetchCareers()
    const mainText = textOf(main)

    if (scenario.careers.openings.length === 0) {
      expect(mainText).toContain(CAREERS_EMPTY_STATE)
      expect(
        main.querySelectorAll("article h3"),
        "the empty state must not render a card"
      ).toHaveLength(0)
    } else {
      expect(mainText).not.toContain(CAREERS_EMPTY_STATE)
    }
  })

  it("follows the F-113 application gate", async () => {
    const { page, main } = await fetchCareers()
    const mainText = textOf(main)

    if (scenario.careers.mailboxLive) {
      const authorization = scenario.careers.authorization
      expect(
        authorization,
        "a live careers channel must carry its CNDP reference"
      ).toBeDefined()

      expect(mainText).toContain(CAREERS_SPONTANEOUS_TITLE)
      expect(mainText).toContain(CAREERS_SPONTANEOUS_BODY_FRAGMENT)
      expect(mainText).toContain(CAREERS_LIVE_CTA)
      expect(mainText, "the address is visible as text").toContain(
        "recrutement@hay2010.ma"
      )
      expect(
        main.querySelectorAll('a[href^="mailto:recrutement@hay2010.ma"]').length,
        "the live CTA must use the careers mailbox"
      ).toBeGreaterThan(0)

      // The approved notice renders with the real reference, never a blank n°.
      expect(mainText).toContain(CAREERS_NOTICE_FRAGMENT)
      expect(mainText).toContain("autorisation CNDP n°")
      expect(mainText).toContain(authorization?.number)
      expect(mainText).toContain(authorization?.date)
      expect(page.html, "no blank CNDP placeholder may render").not.toMatch(
        /\[\s*●\s*\]|n°\s*(?:du\b|\.|,|$)/i
      )
      expect(mainText).toContain("politique-de-confidentialite")
    } else {
      // Questions only: the general mailbox, never the gated careers channel.
      expect(mainText).toContain(CAREERS_PENDING_LINE)
      expect(mainText).toContain(CAREERS_PENDING_CTA)
      expect(
        main.querySelectorAll('a[href="mailto:contact@hay2010.ma"]').length,
        "the pending CTA must use the general mailbox"
      ).toBeGreaterThan(0)

      expect(page.html, "recrutement@ must stay unpublished before F-113").not.toMatch(
        /recrutement@/i
      )
      expect(page.html, "no CV invitation before F-113").not.toMatch(
        /\bpostuler\b|lettre de motivation|\bCV\b|candidature spontanée/i
      )
      expect(page.html, "no CNDP reference before F-113").not.toMatch(
        /autorisation CNDP/i
      )
    }
  })

  it("renders no application form and no CV upload", async () => {
    const { page } = await fetchCareers()

    expect(page.document.querySelectorAll("form")).toHaveLength(0)
    expect(page.document.querySelectorAll("input")).toHaveLength(0)
    expect(page.document.querySelectorAll("textarea")).toHaveLength(0)
    expect(page.document.querySelectorAll("select")).toHaveLength(0)
    expect(page.html).not.toMatch(
      /téléverser|télécharger|déposer (?:un|votre) cv|joindre (?:un|votre) cv/i
    )
  })

  it("renders no JobPosting structured data", async () => {
    const { page } = await fetchCareers()

    expect(page.html).not.toMatch(/JobPosting/)
    for (const script of page.document.querySelectorAll(
      'script[type="application/ld+json"]'
    )) {
      expect(script.text, "no JobPosting in JSON-LD").not.toMatch(/JobPosting/)
    }
  })

  it("has no job detail route", async () => {
    const slugs = [
      ...scenario.careers.openings.map((opening) => opening.slug),
      CAREERS_EXPIRED_OPENING_SLUG,
      "offre-inexistante",
    ]
    for (const slug of slugs) {
      const page = await fetchPage(`/carrieres/${slug}`)
      assertNotFoundDocument(page)
    }
  })

  it("keeps gated claims and channels off the page", async () => {
    const { page } = await fetchCareers()

    // Facts register §2.3/§3: phone, socials and the private Gmail are gated.
    expect(page.html).not.toMatch(/\+212|\btéléphone\b|\btél\./i)
    expect(page.html).not.toMatch(/gmail/i)
    expect(page.html).not.toMatch(
      /facebook|linkedin|instagram|twitter|x\.com|youtube|tiktok/i
    )
    // No unverified certification, client or salary claim.
    expect(page.html).not.toMatch(/ONEE|agrément|certifié|certification/i)
    expect(page.html).not.toMatch(/client|référence sur demande/i)
    expect(page.html).not.toMatch(/salaire|rémunération/i)
  })

  it("serves unique, approved metadata", async () => {
    const canonical = await fetchCareers()

    expect(canonical.title).toBe(CAREERS_TITLE)
    expect(canonical.description).toBe(scenario.careers.description)
    expect(
      canonical.description.length,
      "the meta description must follow the 120–160 character rule (SEO §3)"
    ).toBeGreaterThanOrEqual(120)
    expect(canonical.description.length).toBeLessThanOrEqual(160)

    // The description never carries a claim the gate does not allow.
    if (!scenario.careers.mailboxLive) {
      expect(canonical.description).not.toMatch(
        /recrutement@|\bCV\b|candidature spontanée|CNDP/i
      )
    }

    // Unique across the published route matrix.
    for (const route of scenario.openRoutes) {
      if (route === "/carrieres") continue
      const other = assertCanonicalDocument(await fetchPage(route))
      expect(other.title, `title must be unique (${route})`).not.toBe(canonical.title)
      expect(other.description, `description must be unique (${route})`).not.toBe(
        canonical.description
      )
    }
  })
})
