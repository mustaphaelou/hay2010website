import { expect } from "vitest"
import type { HTMLElement } from "node-html-parser"

import type { PageDocument } from "./helpers"

/**
 * Shared assertions for the navigation surfaces.
 *
 * Everything here reads the served document: desktop row, drawer, footer and
 * 404 links. No component is imported and no class name is asserted.
 */

export interface ServedLink {
  readonly label: string
  readonly href: string
}

/** Links inside an element, in document order. */
export function linksIn(container: HTMLElement): ServedLink[] {
  return container.querySelectorAll("a[href]").map((anchor) => ({
    label: anchor.text.replace(/\s+/g, " ").trim(),
    href: anchor.getAttribute("href") ?? "",
  }))
}

/** Internal (root-relative) links inside an element, in document order. */
export function internalLinksIn(container: HTMLElement): ServedLink[] {
  return linksIn(container).filter((link) => link.href.startsWith("/"))
}

/** Unique internal hrefs anywhere in the document. */
export function internalHrefs(page: PageDocument): string[] {
  return [
    ...new Set(
      page.document
        .querySelectorAll("a[href]")
        .map((anchor) => anchor.getAttribute("href") ?? "")
        .filter((href) => href.startsWith("/"))
    ),
  ]
}

/** The desktop navigation row (the only nav labelled "Navigation principale"). */
export function desktopNavigation(page: PageDocument): HTMLElement {
  const nav = page.document.querySelector('nav[aria-label="Navigation principale"]')
  if (!nav) throw new Error("the document must render the desktop navigation row")
  return nav as HTMLElement
}

/** The mobile drawer, if rendered (a closed native dialog). */
export function mobileDrawer(page: PageDocument): HTMLElement {
  const drawer = page.document.querySelector("dialog")
  if (!drawer) throw new Error("the document must render the mobile drawer dialog")
  return drawer as HTMLElement
}

/** The drawer's navigation list (the nav labelled "Navigation mobile"). */
export function drawerNavigation(page: PageDocument): HTMLElement {
  const nav = mobileDrawer(page).querySelector('nav[aria-label="Navigation mobile"]')
  if (!nav) throw new Error("the drawer must render its navigation")
  return nav as HTMLElement
}

/** The drawer trigger button. */
export function drawerTrigger(page: PageDocument): HTMLElement {
  const trigger = page.document.querySelector("header button[aria-controls]")
  if (!trigger) throw new Error("the document must render the drawer trigger")
  return trigger as HTMLElement
}

/** The first `h1` text of a page, whitespace-collapsed. */
export function headingOf(page: PageDocument): string {
  return page.document.querySelector("h1")?.text.replace(/\s+/g, " ").trim() ?? ""
}

/** Assert a set of links matches the expected list exactly, in order. */
export function expectLinks(
  actual: readonly ServedLink[],
  expected: readonly { label: string; href: string }[],
  description: string
) {
  expect(
    actual.map((link) => link.href),
    `${description} (hrefs)`
  ).toEqual(expected.map((item) => item.href))
  expect(
    actual.map((link) => link.label),
    `${description} (labels)`
  ).toEqual(expected.map((item) => item.label))
}

/** Assert no link among `links` points at one of the gated routes. */
export function expectNoGatedLinks(
  links: readonly ServedLink[],
  gatedRoutes: readonly string[],
  description: string
) {
  const leaked = links.filter((link) =>
    gatedRoutes.some(
      (gated) => link.href === gated || link.href.startsWith(`${gated}/`)
    )
  )
  expect(
    leaked,
    `${description}: a gated route must not be linked (${gatedRoutes.join(", ")})`
  ).toEqual([])
}
