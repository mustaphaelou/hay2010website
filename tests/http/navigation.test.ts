import { describe, expect, it } from "vitest"

import { assertCanonicalDocument, fetchPage, textOf } from "./helpers"
import { scenario } from "./scenarios"
import {
  desktopNavigation,
  drawerNavigation,
  drawerTrigger,
  expectLinks,
  expectNoGatedLinks,
  internalLinksIn,
  internalHrefs,
  linksIn,
  mobileDrawer,
} from "./surfaces"

/**
 * Navigation over HTTP — ticket #21 acceptance:
 * - the desktop row renders the published rubriques in CDC order, Accueil
 *   first, the current section marked (`aria-current="page"`);
 * - tier composition follows the scenario (5 at P1, 7 at P2, 8 at P3);
 * - the mobile drawer mirrors the row with a real dialog, an accessible
 *   trigger and no gated entries;
 * - the footer is driven by the same published set;
 * - a closed gate disappears from every surface.
 *
 * The expected lists live in `tests/http/scenarios.ts`, derived from the
 * decided IA/spec rather than from the code under test.
 */
describe(`navigation (${scenario.name})`, () => {
  it("renders the desktop row exactly as the CDC tier defines it", async () => {
    const page = await fetchPage("/")
    assertCanonicalDocument(page)

    const links = internalLinksIn(desktopNavigation(page))
    expectLinks(links, scenario.navigation, "desktop navigation")

    // Flat row, no dropdowns: no trigger and no nested list in the row.
    const row = desktopNavigation(page)
    expect(row.querySelectorAll("button")).toHaveLength(0)
    expect(row.querySelectorAll('[aria-haspopup="true"]')).toHaveLength(0)
    expect(row.querySelectorAll("nav")).toHaveLength(0)
  })

  it("keeps Accueil first and Contact last", async () => {
    const page = await fetchPage("/")
    const links = internalLinksIn(desktopNavigation(page))
    expect(links[0].href).toBe("/")
    expect(links[0].label).toBe("Accueil")
    expect(links[links.length - 1].href).toBe("/contact")
  })

  it("marks the current section with aria-current on an inner page", async () => {
    // Pick a built route that maps to a navigation item: an exact page route if
    // one is open, otherwise the parent of a published domain.
    const exact = scenario.openRoutes.find((route) =>
      scenario.navigation.some((item) => item.href === route && route !== "/")
    )
    const domainRoute = scenario.openRoutes.find((route) =>
      route.startsWith("/domaines-activite/")
    )
    const route = exact ?? domainRoute
    expect(route, "the scenario must expose a built inner page").toBeDefined()

    const page = await fetchPage(route as string)
    expect(page.status).toBe(200)
    assertCanonicalDocument(page)

    const expectedSection = exact
      ? exact
      : "/domaines-activite"
    const links = desktopNavigation(page).querySelectorAll("a[href]")
    const current = links.filter((anchor) => anchor.getAttribute("aria-current") === "page")
    expect(current, `exactly one row item must be current on ${route}`).toHaveLength(1)
    expect(current[0].getAttribute("href")).toBe(expectedSection)
    expect(textOf(current[0])).toBe(
      scenario.navigation.find((item) => item.href === expectedSection)?.label
    )
  })

  it("renders the drawer with an accessible trigger and the same items", async () => {
    const page = await fetchPage("/")
    const trigger = drawerTrigger(page)
    const drawer = mobileDrawer(page)

    expect(trigger.getAttribute("type")).toBe("button")
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(trigger.getAttribute("aria-label")).toBeTruthy()
    expect(trigger.getAttribute("aria-controls")).toBe(drawer.getAttribute("id"))

    // Closed by default: a native dialog without `open` is display:none, so it
    // is inert to keyboard and screen readers until the trigger opens it.
    expect(drawer.getAttribute("open")).toBeFalsy()
    expect(drawer.tagName.toLowerCase()).toBe("dialog")

    const links = internalLinksIn(drawerNavigation(page))
    expectLinks(links, scenario.navigation, "drawer navigation")

    // Close affordance for keyboard and pointer users.
    const closeButton = drawer.querySelector('button[aria-label="Fermer le menu"]')
    expect(closeButton, "the drawer must render a close button").not.toBeNull()
    expect(closeButton?.getAttribute("type")).toBe("button")

    // The drawer repeats the cleared contact channel, never a gated one.
    const mailtos = drawer.querySelectorAll('a[href^="mailto:"]')
    expect(mailtos).toHaveLength(1)
    expect(mailtos[0].getAttribute("href")).toBe("mailto:contact@hay2010.ma")
  })

  it("lists the footer links from the same published set", async () => {
    const page = await fetchPage("/")
    const { footer } = assertCanonicalDocument(page)

    const expected = [...scenario.navigation, ...scenario.utilities]
    const footerLinks = internalLinksIn(footer)
    expectLinks(footerLinks, expected, "footer links")
    expectNoGatedLinks(linksIn(footer), scenario.gatedRoutes, "footer")
  })

  it("leaks no gated route into any rendered link", async () => {
    for (const route of [...scenario.openRoutes, ""]) {
      const page = await fetchPage(route === "" ? "/" : route)
      expect(page.status, `published route ${route} must be served`).toBe(200)
      expectNoGatedLinks(
        internalHrefs(page).map((href) => ({ href, label: "" })),
        scenario.gatedRoutes,
        `links rendered on ${route || "/"}`
      )
    }
  })

  it("renders no gated link on the 404 page either", async () => {
    const page = await fetchPage("/chemin-inconnu")
    expect(page.status).toBe(404)
    expectNoGatedLinks(
      internalHrefs(page).map((href) => ({ href, label: "" })),
      scenario.gatedRoutes,
      "links rendered on the 404 page"
    )
  })
})
