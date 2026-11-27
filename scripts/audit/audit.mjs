#!/usr/bin/env node
/**
 * Browser and served-HTML audit for ticket #33 — P1 verification.
 *
 * This is NOT a second gate: `npm test` remains the single HTTP suite and stays
 * browser-free. This script proves the behaviour that only a browser can show
 * (keyboard operation, focus management, reduced motion, layout stability,
 * breakpoints, axe rule scan) and independently scans the real served HTML of
 * the P1 route matrix for gated claims and tracking surfaces.
 *
 * Usage:
 *   node scripts/audit/audit.mjs                 # build p1, serve on 3133, audit
 *   node scripts/audit/audit.mjs --no-build      # reuse the existing .next
 *   node scripts/audit/audit.mjs --base-url URL  # audit an already-running server
 *
 * Evidence: `docs/build/p1-audit/audit-results.json` + screenshots under
 * `docs/build/p1-audit/screens/`. The report `docs/build/p1-audit.md` cites
 * both. Exit code 0 only when every assertion passes.
 */
import fs from "node:fs"
import path from "node:path"

import { chromium } from "playwright-core"

import {
  AUDIT_DIR,
  AXE_BIN,
  CHROME_BIN,
  DEFAULT_SITE_PORT,
  HOSTNAME,
  SCREENS_DIR,
  analyseClaims,
  analyseClearedFacts,
  analyseLinks,
  analyseMedia,
  analysePrivacy,
  analyseStructuredData,
  assertNoFindings,
  auditRoutes,
  buildScenario,
  currentCommit,
  fetchDocument,
  fetchSitemapPaths,
  log,
  packageVersion,
  relative,
  startServer,
  timestamp,
  writeJson,
} from "./lib.mjs"

const SCENARIO = "p1"

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2)
const argValue = (name) => {
  const index = argv.indexOf(name)
  return index >= 0 ? argv[index + 1] : undefined
}
const reuseBaseUrl = argValue("--base-url")
const noBuild = argv.includes("--no-build")
const baseUrl = (reuseBaseUrl ?? `http://${HOSTNAME}:${DEFAULT_SITE_PORT}`).replace(
  /\/+$/u,
  ""
)
const needsServer = !reuseBaseUrl
const skipBuild = noBuild && needsServer

// ---------------------------------------------------------------------------
// Tiny assertion collector
// ---------------------------------------------------------------------------

/** @type {{ label: string, findings: object[] }[]} */
const checks = []

/**
 * Record one named check.
 * @param {string} label
 * @param {object[]} findings
 */
function record(label, findings) {
  checks.push({ label, findings })
}

/** Assert one boolean condition and return a readable finding. */
function expectThat(condition, label, detail) {
  if (!condition) record(label, [{ key: "assertion", detail }])
}

/** @type {Record<string, unknown>} */
const results = { meta: {}, routes: {}, claims: {}, privacy: {}, a11y: {} }

// ---------------------------------------------------------------------------
// Browser helpers
// ---------------------------------------------------------------------------

function launchBrowser() {
  return chromium.launch({
    headless: true,
    executablePath: CHROME_BIN,
    ...(process.getuid?.() === 0 ? { args: ["--no-sandbox"] } : {}),
  })
}

/** Focused-element description, including the computed focus ring. */
const focusInfo = () =>
  document.activeElement
    ? (() => {
        const active = document.activeElement
        const style = getComputedStyle(active)
        return {
          tag: active.tagName.toLowerCase(),
          id: active.id,
          text: (active.textContent ?? "").trim().replace(/\s+/gu, " ").slice(0, 60),
          ariaLabel: active.getAttribute("aria-label"),
          href: active.getAttribute("href"),
          ariaExpanded: active.getAttribute("aria-expanded"),
          ariaControls: active.getAttribute("aria-controls"),
          focusVisible: active.matches(":focus-visible"),
          outlineStyle: style.outlineStyle,
          outlineWidth: style.outlineWidth,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow,
        }
      })()
    : null

/** Is a visible focus ring computed on the focused element? */
function hasVisibleRing(info) {
  const outlined =
    info.outlineStyle !== "none" &&
    info.outlineWidth !== "0px" &&
    info.outlineWidth !== "0"
  return info.focusVisible && (outlined || info.boxShadow !== "none")
}

const waitForFonts = (page) => page.evaluate(() => document.fonts.ready)

// ---------------------------------------------------------------------------
// 1. Served-HTML audit: claims, structured data, media, links, privacy, status
// ---------------------------------------------------------------------------

async function servedHtmlAudit() {
  log("scanning every P1 route served over HTTP (claims, media, links, privacy)")
  const sitemapPaths = await fetchSitemapPaths(baseUrl)
  const routes = auditRoutes(sitemapPaths)
  const published = new Set(sitemapPaths)
  const documents = new Map()
  const statuses = {}
  const claimFindings = []
  const claimExceptions = []
  const structuredDataFindings = []
  const mediaFindings = []
  const mediaAllowed = []
  const linkFindings = []
  const privacyByRoute = {}
  const privacyFindings = []

  // 1. Fetch the whole matrix first: the 404 set drives the link audit (a link
  // is gated only when its target is closed in this launch state).
  for (const route of routes) {
    const document = await fetchDocument(baseUrl, route)
    statuses[route] = {
      status: document.status,
      contentType: document.contentType,
    }
    documents.set(route, {
      html: document.html,
      status: document.status,
      setCookies: document.setCookies,
    })
  }
  /** Routes closed in this launch state (404 in the served matrix). */
  const gatedLinkTargets = routes.filter(
    (route) => statuses[route].status === 404
  )

  // 2. Scan every served document.
  for (const route of routes) {
    const { html } = documents.get(route)
    const claims = analyseClaims(html, { scenario: SCENARIO, route })
    claimFindings.push(...claims.findings.map((finding) => ({ route, ...finding })))
    claimExceptions.push(...claims.allowed.map((finding) => ({ route, ...finding })))

    structuredDataFindings.push(
      ...analyseStructuredData(html).map((finding) => ({ route, ...finding }))
    )

    const media = analyseMedia(html, { scenario: SCENARIO, route })
    mediaFindings.push(...media.findings.map((finding) => ({ route, ...finding })))
    mediaAllowed.push(...media.allowed.map((finding) => ({ route, ...finding })))

    const links = analyseLinks(html, {
      scenario: SCENARIO,
      route,
      gatedRoutes: gatedLinkTargets,
    })
    linkFindings.push(...links.findings.map((finding) => ({ route, ...finding })))

    const privacy = analysePrivacy(html, {
      setCookies: documents.get(route).setCookies ?? [],
    })
    if (privacy.length > 0) privacyByRoute[route] = privacy
    privacyFindings.push(...privacy.map((finding) => ({ route, ...finding })))
  }

  // Status matrix: the sitemap is the published set (200); every other audited
  // route is gated or unknown (404). No redirects and no 5xx allowed.
  const statusFindings = []
  for (const route of routes) {
    const expected = published.has(route) ? 200 : 404
    if (statuses[route].status !== expected) {
      statusFindings.push({
        route,
        expected,
        actual: statuses[route].status,
      })
    }
  }

  // The cleared facts must render where the decisions put them.
  const clearedFactFindings = analyseClearedFacts(documents)

  record("gated-claim absence", claimFindings)
  record("structured-data gated types/properties", structuredDataFindings)
  record("photograph/logo absence", mediaFindings)
  record("link audit (gated routes, phone, social, mailboxes)", linkFindings)
  record("no analytics/consent/form/cookie", privacyFindings)
  record("route status matrix", statusFindings)
  record("cleared facts render (no false-positive denylist)", clearedFactFindings)

  results.routes = { sitemapPaths, audited: routes, statuses }
  results.claims = {
    findings: claimFindings,
    documentedExceptions: claimExceptions,
    clearedFactsChecked: documents.size,
    structuredDataFindings,
    mediaFindings,
    mediaAllowed,
    linkFindings,
  }
  results.privacy = { byRoute: privacyByRoute, findings: privacyFindings }
  log(
    `served-HTML scan: ${routes.length} routes, ${claimFindings.length} claim finding(s), ` +
      `${privacyFindings.length} privacy finding(s), ${clearedFactFindings.length} cleared-fact finding(s)`
  )
}

// ---------------------------------------------------------------------------
// 2. Keyboard-only pass
// ---------------------------------------------------------------------------

async function keyboardPass(browser) {
  log("keyboard-only pass (skip link, drawer open/trap/Escape/focus return, rings, aria-current)")
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    reducedMotion: "reduce",
    hasTouch: true,
  })
  const page = await context.newPage()
  const keyboard = {}

  try {
    // -- Skip link is the first Tab stop and lands on <main id="contenu">.
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" })
    await waitForFonts(page)
    await page.keyboard.press("Tab")
    const firstTab = await page.evaluate(focusInfo)
    keyboard.skipLink = firstTab
    expectThat(
      firstTab?.href === "#contenu",
      "skip-link-first-tab",
      `first Tab must focus the skip link, got ${JSON.stringify(firstTab)}`
    )
    expectThat(
      firstTab ? hasVisibleRing(firstTab) : false,
      "skip-link-focus-ring",
      `the skip link must show a visible focus ring, got ${JSON.stringify(firstTab)}`
    )
    await page.screenshot({
      path: path.join(SCREENS_DIR, "keyboard-skip-link-focus-360.png"),
    })
    await page.keyboard.press("Enter")
    await page.waitForFunction(() => document.activeElement?.id === "contenu")
    const afterSkip = await page.evaluate(() => ({
      id: document.activeElement?.id,
      tag: document.activeElement?.tagName.toLowerCase(),
      hash: location.hash,
    }))
    keyboard.afterSkipLinkEnter = afterSkip
    expectThat(
      afterSkip.id === "contenu" && afterSkip.tag === "main",
      "skip-link-moves-focus-to-main",
      `Enter on the skip link must move focus to <main id="contenu">, got ${JSON.stringify(afterSkip)}`
    )

    // -- The drawer trigger must be reachable by Tab, then open with Enter.
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" })
    await waitForFonts(page)
    /** @type {object[]} */
    const tabOrder = []
    /** @type {object | null} */
    let trigger = null
    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press("Tab")
      const info = await page.evaluate(focusInfo)
      tabOrder.push(info)
      if (info?.ariaExpanded !== null) {
        trigger = info
        break
      }
    }
    keyboard.tabOrder = tabOrder
    keyboard.trigger = trigger
    expectThat(
      trigger?.tag === "button" && trigger?.ariaExpanded === "false",
      "drawer-trigger-reachable-by-tab",
      `the drawer trigger must be reachable by Tab with aria-expanded="false", got ${JSON.stringify(trigger)}`
    )
    expectThat(
      trigger ? hasVisibleRing(trigger) : false,
      "drawer-trigger-focus-ring",
      `the drawer trigger must show a visible focus ring, got ${JSON.stringify(trigger)}`
    )
    expectThat(
      trigger?.ariaControls === "menu-mobile",
      "drawer-trigger-aria-controls",
      `the trigger must control #menu-mobile, got ${JSON.stringify(trigger?.ariaControls)}`
    )

    await page.keyboard.press("Enter")
    await page.waitForFunction(
      () => document.querySelector("#menu-mobile")?.open === true
    )
    const opened = await page.evaluate(() => {
      const dialog = document.querySelector("#menu-mobile")
      const control = document.querySelector("header button[aria-expanded]")
      return {
        open: dialog?.open === true,
        role: dialog?.getAttribute("role") ?? "dialog (native)",
        ariaLabel: dialog?.getAttribute("aria-label"),
        ariaExpanded: control?.getAttribute("aria-expanded"),
        focusInsideDialog: dialog?.contains(document.activeElement) ?? false,
        focusId: document.activeElement?.id,
        focusTag: document.activeElement?.tagName.toLowerCase(),
        bodyOverflow: document.body.style.overflow,
      }
    })
    keyboard.drawerOpen = opened
    expectThat(
      opened.open && opened.ariaExpanded === "true",
      "drawer-opens-with-enter",
      `Enter must open the drawer and set aria-expanded="true", got ${JSON.stringify(opened)}`
    )
    expectThat(
      opened.focusInsideDialog,
      "drawer-focus-enters",
      `focus must move inside the open dialog, got ${JSON.stringify(opened)}`
    )
    await page.screenshot({
      path: path.join(SCREENS_DIR, "keyboard-drawer-open-360.png"),
    })

    // -- Tab is trapped inside the modal dialog, both directions.
    const tabTrap = []
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press("Tab")
      tabTrap.push(
        await page.evaluate(() => ({
          inside: document.querySelector("#menu-mobile")?.contains(document.activeElement) ?? false,
          text: (document.activeElement?.textContent ?? "").trim().slice(0, 40),
        }))
      )
    }
    keyboard.tabTrap = tabTrap
    expectThat(
      tabTrap.every((step) => step.inside),
      "drawer-tab-trap-forward",
      `Tab must stay inside the drawer, got ${JSON.stringify(tabTrap)}`
    )
    const shiftTabTrap = []
    for (let index = 0; index < 5; index += 1) {
      await page.keyboard.press("Shift+Tab")
      shiftTabTrap.push(
        await page.evaluate(
          () =>
            document
              .querySelector("#menu-mobile")
              ?.contains(document.activeElement) ?? false
        )
      )
    }
    keyboard.shiftTabTrap = shiftTabTrap
    expectThat(
      shiftTabTrap.every(Boolean),
      "drawer-tab-trap-backward",
      `Shift+Tab must stay inside the drawer, got ${JSON.stringify(shiftTabTrap)}`
    )

    // -- Escape closes and returns focus to the trigger.
    await page.keyboard.press("Escape")
    await page.waitForFunction(() => {
      const dialog = document.querySelector("#menu-mobile")
      const control = document.querySelector("header button[aria-expanded]")
      return (
        dialog?.open === false &&
        control?.getAttribute("aria-expanded") === "false" &&
        document.body.style.overflow === ""
      )
    })
    const closed = await page.evaluate(() => {
      const dialog = document.querySelector("#menu-mobile")
      const control = document.querySelector("header button[aria-expanded]")
      return {
        open: dialog?.open === true,
        ariaExpanded: control?.getAttribute("aria-expanded"),
        focusReturnedToTrigger: document.activeElement === control,
        focusTag: document.activeElement?.tagName.toLowerCase(),
        bodyOverflow: document.body.style.overflow,
      }
    })
    keyboard.drawerClosed = closed
    expectThat(
      closed.open === false && closed.ariaExpanded === "false",
      "drawer-escape-closes",
      `Escape must close the drawer, got ${JSON.stringify(closed)}`
    )
    expectThat(
      closed.focusReturnedToTrigger,
      "drawer-focus-return",
      `focus must return to the trigger, got ${JSON.stringify(closed)}`
    )

    // -- Space also opens the trigger (native button activation).
    await page.keyboard.press("Space")
    await page.waitForFunction(
      () => document.querySelector("#menu-mobile")?.open === true
    )
    const spaceOpen = await page.evaluate(
      () => document.querySelector("#menu-mobile")?.open === true
    )
    keyboard.spaceOpens = spaceOpen
    expectThat(
      spaceOpen,
      "drawer-opens-with-space",
      "Space on the trigger must open the drawer"
    )
    await page.keyboard.press("Escape")
    await page.waitForFunction(
      () => document.querySelector("#menu-mobile")?.open === false
    )

    // -- aria-current on the current section (row + drawer), inner page and home.
    const ctxDesktop = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    })
    const desktop = await ctxDesktop.newPage()
    const ariaCurrent = {}
    await desktop.goto(`${baseUrl}/domaines-activite/eclairage-public`, {
      waitUntil: "networkidle",
    })
    await waitForFonts(desktop)
    ariaCurrent.innerPage = await desktop.evaluate(() => {
      const read = (selector) =>
        [...document.querySelectorAll(`${selector} a[aria-current]`)].map(
          (anchor) => ({
            label: (anchor.textContent ?? "").trim(),
            href: anchor.getAttribute("href"),
            current: anchor.getAttribute("aria-current"),
          })
        )
      return {
        row: read('nav[aria-label="Navigation principale"]'),
        drawer: read('nav[aria-label="Navigation mobile"]'),
      }
    })
    await desktop.goto(`${baseUrl}/`, { waitUntil: "networkidle" })
    await waitForFonts(desktop)
    ariaCurrent.home = await desktop.evaluate(() =>
      [...document.querySelectorAll('nav[aria-label="Navigation principale"] a[aria-current]')].map(
        (anchor) => ({
          label: (anchor.textContent ?? "").trim(),
          href: anchor.getAttribute("href"),
          current: anchor.getAttribute("aria-current"),
        })
      )
    )
    keyboard.ariaCurrent = ariaCurrent
    await ctxDesktop.close()

    const innerRow = ariaCurrent.innerPage.row
    expectThat(
      innerRow.length === 1 &&
        innerRow[0].href === "/domaines-activite" &&
        innerRow[0].current === "page",
      "aria-current-inner-page",
      `the domain child page must mark its parent section, got ${JSON.stringify(innerRow)}`
    )
    expectThat(
      ariaCurrent.home.length === 1 &&
        ariaCurrent.home[0].href === "/" &&
        ariaCurrent.home[0].current === "page",
      "aria-current-home",
      `the homepage must mark Accueil, got ${JSON.stringify(ariaCurrent.home)}`
    )

    // -- No horizontal overflow at the keyboard test width.
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    keyboard.overflow = overflow
    expectThat(
      overflow.scrollWidth <= overflow.clientWidth,
      "keyboard-viewport-no-overflow",
      `horizontal overflow at 360 px: ${JSON.stringify(overflow)}`
    )
  } finally {
    await context.close()
  }
  results.a11y.keyboard = keyboard
}

// ---------------------------------------------------------------------------
// 3. Reduced motion + control
// ---------------------------------------------------------------------------

async function motionPass(browser) {
  log("reduced-motion pass (reduce disables, no-preference control still animates)")
  const motion = {}

  const readMotion = async (reducedMotion) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion,
    })
    const page = await context.newPage()
    try {
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" })
      await waitForFonts(page)
      return await page.evaluate(() => {
        const heroCopy = document.querySelector(".accueil-hero-copy")
        const heroImage = document.querySelector(".accueil-hero-media img")
        const hoverLink = document.querySelector("header nav a")
        const copyStyle = heroCopy ? getComputedStyle(heroCopy) : null
        const linkStyle = hoverLink ? getComputedStyle(hoverLink) : null
        return {
          reduceMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
          heroCopyAnimations: heroCopy ? heroCopy.getAnimations().length : null,
          heroImageAnimations: heroImage ? heroImage.getAnimations().length : null,
          heroCopyAnimationName: copyStyle?.animationName ?? null,
          heroCopyAnimationDuration: copyStyle?.animationDuration ?? null,
          linkTransitionDuration: linkStyle?.transitionDuration ?? null,
        }
      })
    } finally {
      await context.close()
    }
  }

  const reduced = await readMotion("reduce")
  const normal = await readMotion("no-preference")
  motion.reduce = reduced
  motion.noPreference = normal

  expectThat(
    reduced.reduceMatches && normal.reduceMatches === false,
    "motion-media-query",
    `matchMedia must follow the emulated preference, got reduce=${JSON.stringify(reduced)} no-preference=${JSON.stringify(normal)}`
  )
  expectThat(
    reduced.heroCopyAnimations === 0 &&
      (reduced.heroCopyAnimationName === "none" ||
        reduced.heroCopyAnimationDuration === "0s" ||
        /^[01](?:\.0+)?e-0\d+s$/u.test(reduced.heroCopyAnimationDuration ?? "")),
    "reduced-motion-disables-hero",
    `reduced motion must neutralise the hero animation, got ${JSON.stringify(reduced)}`
  )
  expectThat(
    normal.heroCopyAnimations >= 1 &&
      /accueil-rise/u.test(normal.heroCopyAnimationName ?? ""),
    "no-preference-keeps-motion",
    `the no-preference control must keep the hero animation (otherwise the reduce assertion is vacuous), got ${JSON.stringify(normal)}`
  )
  results.a11y.motion = motion
}

// ---------------------------------------------------------------------------
// 4. Layout stability (CLS) + same-origin request audit
// ---------------------------------------------------------------------------

const CLS_INIT_SCRIPT = () => {
  window.__cls = 0
  window.__shifts = []
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue
      window.__cls += entry.value
      window.__shifts.push({
        value: Number(entry.value.toFixed(4)),
        startTime: Math.round(entry.startTime),
      })
    }
  }).observe({ type: "layout-shift", buffered: true })
}

async function stabilityPass(browser, publishedRoutes) {
  log("CLS pass (PerformanceObserver on every published route) + same-origin requests")
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const cls = {}
  const network = {}
  const failures = []
  const externalFailures = []
  const failedRequests = []

  try {
    for (const route of publishedRoutes) {
      const page = await context.newPage()
      /** @type {string[]} */
      const requested = []
      /** @type {string[]} */
      const failed = []
      page.on("request", (request) => requested.push(request.url()))
      page.on("requestfailed", (request) =>
        failed.push(`${request.url()} (${request.failure()?.errorText ?? "?"})`)
      )
      await page.addInitScript(CLS_INIT_SCRIPT)
      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: "load" })
        await waitForFonts(page)
        // Cover late font/image shifts beyond the 500 ms input window.
        await page.waitForTimeout(2_500)
        const measured = await page.evaluate(() => ({
          cls: Number(window.__cls.toFixed(4)),
          shifts: window.__shifts,
        }))
        cls[route] = measured
        if (measured.cls >= 0.1) {
          failures.push({ route, cls: measured.cls, shifts: measured.shifts })
        }
        const external = requested.filter(
          (url) => !url.startsWith(baseUrl) && !url.startsWith("data:")
        )
        network[route] = {
          requests: requested.length,
          external,
          failed,
        }
        externalFailures.push(...external.map((url) => ({ route, url })))
        failedRequests.push(...failed.map((url) => ({ route, url })))
      } finally {
        await page.close()
      }
    }
  } finally {
    await context.close()
  }

  record("CLS under 0.1 on every published route", failures)
  record("no third-party request on any published route", externalFailures)
  record("no failed request on any published route", failedRequests)
  results.a11y.cls = cls
  results.a11y.network = network
}

// ---------------------------------------------------------------------------
// 5. Breakpoints 360 / 768 / 1024 / 1440
// ---------------------------------------------------------------------------

const BREAKPOINT_WIDTHS = [360, 768, 1024, 1440]
const SCREENSHOT_ROUTES = ["/", "/realisations"]

async function breakpointsPass(browser, publishedRoutes) {
  log("breakpoint pass (360/768/1024/1440: no horizontal overflow, screenshots)")
  const overflow = {}
  const failures = []

  for (const width of BREAKPOINT_WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: width < 768 ? 800 : 900 },
      reducedMotion: "reduce",
    })
    try {
      for (const route of publishedRoutes) {
        const page = await context.newPage()
        try {
          await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" })
          await waitForFonts(page)
          const measured = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }))
          overflow[`${route}@${width}`] = measured
          if (measured.scrollWidth > measured.clientWidth) {
            failures.push({ route, width, ...measured })
          }
        } finally {
          await page.close()
        }
      }

      for (const route of SCREENSHOT_ROUTES) {
        const page = await context.newPage()
        try {
          await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" })
          await waitForFonts(page)
          const slug = route === "/" ? "accueil" : route.replace(/^\//u, "").replace(/\//gu, "-")
          await page.screenshot({
            path: path.join(SCREENS_DIR, `${slug}-${width}.png`),
            fullPage: true,
            animations: "disabled",
          })
        } finally {
          await page.close()
        }
      }
    } finally {
      await context.close()
    }
  }

  record("no horizontal overflow at 360/768/1024/1440 px", failures)
  results.a11y.breakpoints = {
    widths: BREAKPOINT_WIDTHS,
    screenshotRoutes: SCREENSHOT_ROUTES,
    overflow,
    findings: failures,
  }
}

// ---------------------------------------------------------------------------
// 6. axe-core rule scan (WCAG 2.0/2.1 A/AA)
// ---------------------------------------------------------------------------

async function axePass(browser, publishedRoutes) {
  log("axe-core pass (WCAG 2.0/2.1 A/AA, every published route, reduced motion)")
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  })
  const byRoute = {}
  const violations = []

  try {
    for (const route of publishedRoutes) {
      const page = await context.newPage()
      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" })
        await waitForFonts(page)
        await page.addScriptTag({ path: AXE_BIN })
        const result = await page.evaluate(async () =>
          window.axe.run(document, {
            runOnly: {
              type: "tag",
              values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
            },
          })
        )
        byRoute[route] = {
          passes: result.passes.length,
          incomplete: result.incomplete.length,
          violations: result.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            nodes: violation.nodes.length,
          })),
          incompleteRules: result.incomplete.map((item) => item.id),
          incompleteNodes: result.incomplete.map((item) => ({
            id: item.id,
            impact: item.impact,
            nodes: item.nodes.length,
            targets: item.nodes.slice(0, 4).map((node) => node.target),
            html: item.nodes[0]?.html?.slice(0, 200) ?? null,
          })),
        }
        for (const violation of result.violations) {
          violations.push({ route, ...violation })
        }
      } finally {
        await page.close()
      }
    }
  } finally {
    await context.close()
  }

  record("axe-core WCAG 2.0/2.1 A/AA violations", violations)
  results.a11y.axe = byRoute
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let browser = null
/** @type {{ stop: () => Promise<void> } | null} */
let server = null

try {
  if (reuseBaseUrl) {
    log(`auditing the already-running server at ${baseUrl}`)
  } else if (skipBuild) {
    log(`reusing the existing .next build on ${baseUrl}`)
    server = await startServer({ scenario: SCENARIO, baseUrl })
  } else {
    buildScenario(SCENARIO, baseUrl)
    server = await startServer({ scenario: SCENARIO, baseUrl })
  }

  fs.mkdirSync(SCREENS_DIR, { recursive: true })

  results.meta = {
    ticket: 33,
    scenario: SCENARIO,
    commit: currentCommit(),
    timestamp: timestamp(),
    node: process.version,
    playwrightCore: packageVersion("playwright-core"),
    axeCore: packageVersion("axe-core"),
    chrome: CHROME_BIN,
    baseUrl,
    method:
      "production build served with `next start`; Chromium launched by playwright-core " +
      "(executablePath = cached Playwright Chromium 1255); every assertion runs against " +
      "the served artefact, never the dev server.",
  }

  browser = await launchBrowser()
  results.meta.chromiumVersion = browser.version()
  log(`Chromium ${browser.version()} (playwright-core ${results.meta.playwrightCore})`)

  await servedHtmlAudit()
  await keyboardPass(browser)
  await motionPass(browser)
  const publishedRoutes = [...new Set((await fetchSitemapPaths(baseUrl)).map((route) => route))]
  await stabilityPass(browser, publishedRoutes)
  await breakpointsPass(browser, publishedRoutes)
  await axePass(browser, publishedRoutes)

  results.pass = checks.every((check) => check.findings.length === 0)
  results.checks = checks
  writeJson(path.join(AUDIT_DIR, "audit-results.json"), results)

  const failed = checks.filter((check) => check.findings.length > 0)
  log(
    `${checks.length - failed.length}/${checks.length} audit checks passed — evidence ` +
      `${relative(path.join(AUDIT_DIR, "audit-results.json"))}`
  )
  for (const check of checks) {
    log(`  ${check.findings.length === 0 ? "PASS" : "FAIL"} ${check.label}`)
  }
  if (failed.length > 0) {
    assertNoFindings(failed)
  }
} finally {
  if (browser) await browser.close()
  if (server) await server.stop()
}

process.exitCode = 0
