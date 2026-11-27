#!/usr/bin/env node
/**
 * Lab performance audit for ticket #33 — mobile 4G budgets.
 *
 * Budgets from `docs/spec/p1-website-build.md` ("Accessibility, performance and
 * motion"): LCP < 2.5 s, CLS < 0.1, INP < 200 ms on mobile 4G.
 *
 * Method (from `.worktrees/notes/verification-tooling.md` §4):
 * - one production fixture build served with `next start` (never the dev server);
 * - our own cached Playwright Chromium is launched on a DevTools port and
 *   `npx lighthouse@13.6.0` attaches to it with `--port`. This skips
 *   `chrome-launcher`, which fails on this WSL2 host (EACCES under
 *   `/mnt/c/Users/...`); `CHROME_PATH` does not help;
 * - Lighthouse's default mobile preset (mobile form factor 412×823 dpr 1.75,
 *   simulated throttling rtt 150 ms / 1638 kbps / 4× CPU) measures LCP, CLS and
 *   TBT per route, three runs, median reported;
 * - **INP cannot be measured locally**: there is no field data (site not
 *   launched, no CrUX/RUM) and Lighthouse does not measure INP. TBT is reported
 *   as the lab proxy and the limitation is stated in the report — the INP
 *   criterion is NOT claimed as verified.
 *
 * Usage:
 *   node scripts/audit/lighthouse.mjs                    # all published routes
 *   node scripts/audit/lighthouse.mjs --runs 3           # explicit
 *   node scripts/audit/lighthouse.mjs --routes /,/contact
 *   node scripts/audit/lighthouse.mjs --base-url http://127.0.0.1:3133
 *   node scripts/audit/lighthouse.mjs --no-build         # reuse existing .next
 *
 * Evidence: `docs/build/p1-audit/lighthouse-results.json`.
 */
import { spawn, spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { chromium } from "playwright-core"

import {
  AUDIT_DIR,
  CHROME_BIN,
  DEFAULT_DEBUG_PORT,
  DEFAULT_SITE_PORT,
  HOSTNAME,
  buildScenario,
  currentCommit,
  delay,
  fetchSitemapPaths,
  log,
  packageVersion,
  projectRoot,
  startServer,
  timestamp,
  writeJson,
} from "./lib.mjs"

const SCENARIO = "p1"
const LIGHTHOUSE_VERSION = "13.6.0"
/**
 * Hard budgets are the measurable half of the acceptance targets (LCP, CLS).
 * INP has no local field data, so TBT is recorded as a lab proxy *warning*
 * against 200 ms — it is not a pass/fail assertion for INP.
 */
const BUDGETS = { lcpMs: 2_500, cls: 0.1, tbtProxyMs: 200 }

const argv = process.argv.slice(2)
const argValue = (name) => {
  const index = argv.indexOf(name)
  return index >= 0 ? argv[index + 1] : undefined
}
const reuseBaseUrl = argValue("--base-url")
const noBuild = argv.includes("--no-build")
const runs = Number(argValue("--runs") ?? "3")
const debugPort = Number(argValue("--debug-port") ?? DEFAULT_DEBUG_PORT)
const baseUrl = (reuseBaseUrl ?? `http://${HOSTNAME}:${DEFAULT_SITE_PORT}`).replace(
  /\/+$/u,
  ""
)
const profileDir = path.join(os.tmpdir(), `hay2010-audit-lighthouse-${process.pid}`)

// Lighthouse is a tool, not a repo dependency; npx resolves it into the
// workspace npm cache (the host cannot write outside the workspace).
if (!process.env.npm_config_cache) {
  process.env.npm_config_cache = path.join(projectRoot, "..", ".cache", "npm")
}

const SITE_PORT = new URL(baseUrl).port
const requestedRoutes = argValue("--routes")
  ?.split(",")
  .map((route) => route.trim())
  .filter(Boolean)

let browserProcess = null
/** @type {{ stop: () => Promise<void> } | null} */
let server = null

/** Launch our own Chromium on a debugging port (Lighthouse attaches to it). */
async function launchBrowserForLighthouse() {
  fs.rmSync(profileDir, { recursive: true, force: true })
  fs.mkdirSync(profileDir, { recursive: true })
  const chromeLog = fs.openSync(path.join(profileDir, "chrome.log"), "w")
  browserProcess = spawn(
    CHROME_BIN,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profileDir}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", chromeLog], detached: false }
  )
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`, {
        signal: AbortSignal.timeout(1_000),
      })
      if (response.ok) {
        return (await response.json()).Browser
      }
    } catch {
      // Not listening yet.
    }
    await delay(250)
  }
  throw new Error(
    `the audit Chromium did not open its DevTools port ${debugPort}; see ${profileDir}/chrome.log`
  )
}

/** Run one Lighthouse report and parse the metrics we report. */
function runLighthouse(route) {
  const output = path.join(profileDir, `lh-${Buffer.from(route).toString("hex").slice(0, 16)}.json`)
  const result = spawnSync(
    "npx",
    [
      "--yes",
      `lighthouse@${LIGHTHOUSE_VERSION}`,
      `${baseUrl}${route}`,
      `--port=${debugPort}`,
      "--quiet",
      "--only-categories=performance,accessibility",
      "--output=json",
      `--output-path=${output}`,
    ],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: process.env,
      timeout: 180_000,
    }
  )
  if (result.error) throw result.error
  if (result.status !== 0 || !fs.existsSync(output)) {
    throw new Error(
      `lighthouse failed for ${route} (status ${result.status})\n${(result.stderr ?? "").slice(-4_000)}`
    )
  }
  const report = JSON.parse(fs.readFileSync(output, "utf8"))
  fs.rmSync(output, { force: true })
  const numeric = (id) => report.audits?.[id]?.numericValue ?? null
  return {
    performanceScore: Math.round((report.categories?.performance?.score ?? 0) * 100),
    accessibilityScore: Math.round((report.categories?.accessibility?.score ?? 0) * 100),
    lcpMs: numeric("largest-contentful-paint"),
    cls: numeric("cumulative-layout-shift"),
    tbtMs: numeric("total-blocking-time"),
    fcpMs: numeric("first-contentful-paint"),
    speedIndexMs: numeric("speed-index"),
    totalByteWeight: numeric("total-byte-weight"),
    requestCount: numeric("network-requests"),
    formFactor: report.configSettings?.formFactor ?? null,
    throttlingMethod: report.configSettings?.throttlingMethod ?? null,
    throttling: report.configSettings?.throttling ?? null,
    lighthouseVersion: report.lighthouseVersion ?? null,
  }
}

/**
 * Synthetic Event-Timing proxy (sanity check only, never called INP): open the
 * drawer and close it with Escape at 4× CPU, and report the longest
 * `interactionId` event duration. There is no field data, so this can only
 * show that interactions remain responsive after load.
 */
async function measureEventTimingProxy(route) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_BIN,
    ...(process.getuid?.() === 0 ? { args: ["--no-sandbox"] } : {}),
  })
  try {
    const context = await browser.newContext({
      viewport: { width: 412, height: 823 },
    })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 })
    await page.addInitScript(() => {
      window.__eventTiming = []
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__eventTiming.push({
            name: entry.name,
            durationMs: Math.round(entry.duration),
            interactionId: entry.interactionId,
          })
        }
      }).observe({ type: "event", buffered: true, durationThreshold: 16 })
    })
    await page.goto(`${baseUrl}${route}`, { waitUntil: "load" })
    await page.waitForTimeout(2_500)
    await page.locator("header button[aria-expanded]").click()
    await page.waitForTimeout(500)
    await page.keyboard.press("Escape")
    await page.waitForTimeout(500)
    const events = await page.evaluate(() =>
      window.__eventTiming.filter((entry) => entry.interactionId > 0)
    )
    const maxInteractionMs = events.reduce(
      (max, entry) => Math.max(max, entry.durationMs),
      0
    )
    return {
      route,
      interactions: events.length,
      maxInteractionMs,
      events: events.slice(0, 10),
      caveat:
        "Synthetic interaction (drawer open + Escape) after load at 4× CPU; a sanity check, NOT a measured INP and not field data.",
    }
  } finally {
    await browser.close()
  }
}

/** Median of the numeric values. */
function median(values) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b)
  if (sorted.length === 0) return null
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

/** Keep one decimal for readability, no rounding of the verdict. */
const round = (value, digits = 2) =>
  value === null || value === undefined ? null : Number(value.toFixed(digits))

const report = {
  meta: {
    ticket: 33,
    commit: currentCommit(),
    timestamp: timestamp(),
    scenario: SCENARIO,
    site: baseUrl,
    sitePort: SITE_PORT,
    debugPort,
    runsPerRoute: runs,
    lighthouse: LIGHTHOUSE_VERSION,
    playwrightCore: packageVersion("playwright-core"),
    chromeExecutable: CHROME_BIN,
    method:
      "Lighthouse 13.6.0 attached with --port to our own cached Chromium (WSL " +
      "chrome-launcher workaround); default mobile emulation + simulated 4G throttling; " +
      "production build served by `next start`; median of " +
      runs +
      " runs per route.",
    budgets: BUDGETS,
    limitations: [
      "INP is NOT measured: no field data exists (site not launched, no CrUX/RUM) and Lighthouse does not measure INP. TBT is reported as the lab proxy only.",
      "LCP is optimistic: the page is served from localhost, so TTFB/TLS/CDN latency of the real host is absent.",
      "Lab throttling (Lighthouse simulated 4G, 4x CPU) is not a real device or network.",
      "No Safari/iOS engine was tested; Chromium only.",
    ],
  },
  routes: {},
  failures: [],
  warnings: [],
}

try {
  if (reuseBaseUrl) {
    log(`measuring the already-running server at ${baseUrl}`)
  } else if (noBuild) {
    log(`reusing the existing .next build on ${baseUrl}`)
    server = await startServer({ scenario: SCENARIO, baseUrl })
  } else {
    buildScenario(SCENARIO, baseUrl)
    server = await startServer({ scenario: SCENARIO, baseUrl })
  }

  const sitemapPaths = await fetchSitemapPaths(baseUrl)
  const published = sitemapPaths.filter((route) => route !== "/en")
  const routes = requestedRoutes?.length ? requestedRoutes : published
  for (const route of routes) {
    if (!published.includes(route)) {
      throw new Error(`route ${route} is not a published P1 route of this build`)
    }
  }

  const browser = await launchBrowserForLighthouse()
  report.meta.chromiumVersion = browser
  log(`Chromium ${browser}; Lighthouse ${LIGHTHOUSE_VERSION}; ${routes.length} route(s) × ${runs} run(s)`)

  for (const route of routes) {
    const runsForRoute = []
    for (let index = 1; index <= runs; index += 1) {
      const measured = runLighthouse(route)
      runsForRoute.push(measured)
      log(
        `${route} run ${index}/${runs}: perf ${measured.performanceScore}, ` +
          `LCP ${Math.round(measured.lcpMs)} ms, CLS ${measured.cls.toFixed(3)}, TBT ${Math.round(measured.tbtMs)} ms`
      )
    }
    const medians = {
      performanceScore: median(runsForRoute.map((run) => run.performanceScore)),
      accessibilityScore: median(runsForRoute.map((run) => run.accessibilityScore)),
      lcpMs: median(runsForRoute.map((run) => run.lcpMs)),
      cls: median(runsForRoute.map((run) => run.cls)),
      tbtMs: median(runsForRoute.map((run) => run.tbtMs)),
      fcpMs: median(runsForRoute.map((run) => run.fcpMs)),
      speedIndexMs: median(runsForRoute.map((run) => run.speedIndexMs)),
      totalByteWeight: median(runsForRoute.map((run) => run.totalByteWeight)),
      requestCount: median(runsForRoute.map((run) => run.requestCount)),
    }
    const spread = {
      lcpMs: Math.max(...runsForRoute.map((run) => run.lcpMs)) - Math.min(...runsForRoute.map((run) => run.lcpMs)),
      cls: Math.max(...runsForRoute.map((run) => run.cls)) - Math.min(...runsForRoute.map((run) => run.cls)),
      tbtMs: Math.max(...runsForRoute.map((run) => run.tbtMs)) - Math.min(...runsForRoute.map((run) => run.tbtMs)),
    }
    const budgets = {
      lcp: medians.lcpMs < BUDGETS.lcpMs,
      cls: medians.cls < BUDGETS.cls,
    }
    const tbtProxyWithinTarget = medians.tbtMs < BUDGETS.tbtProxyMs
    if (!tbtProxyWithinTarget) {
      report.warnings.push({
        route,
        tbtProxyMs: round(medians.tbtMs, 1),
        targetMs: BUDGETS.tbtProxyMs,
        note: "TBT is a lab proxy warning, not a measured INP; field INP is not verifiable locally.",
      })
    }
    if (!budgets.lcp || !budgets.cls) {
      report.failures.push({ route, medians, budgets })
    }
    report.routes[route] = {
      runs: runsForRoute.map((run) => ({
        ...run,
        lcpMs: round(run.lcpMs, 1),
        cls: round(run.cls, 4),
        tbtMs: round(run.tbtMs, 1),
        fcpMs: round(run.fcpMs, 1),
        speedIndexMs: round(run.speedIndexMs, 1),
      })),
      medians: {
        ...medians,
        lcpMs: round(medians.lcpMs, 1),
        cls: round(medians.cls, 4),
        tbtMs: round(medians.tbtMs, 1),
        fcpMs: round(medians.fcpMs, 1),
        speedIndexMs: round(medians.speedIndexMs, 1),
      },
      spread: {
        lcpMs: round(spread.lcpMs, 1),
        cls: round(spread.cls, 4),
        tbtMs: round(spread.tbtMs, 1),
      },
      budgets,
      tbtProxyWithinTarget,
      passes: budgets.lcp && budgets.cls,
    }
    log(
      `${route} median: LCP ${Math.round(medians.lcpMs)} ms, CLS ${medians.cls.toFixed(3)}, ` +
        `TBT ${Math.round(medians.tbtMs)} ms (proxy target ${BUDGETS.tbtProxyMs} ms: ` +
        `${tbtProxyWithinTarget ? "within" : "above"}) — ${report.routes[route].passes ? "budget PASS" : "budget FAIL"}`
    )
  }

  report.pass = report.failures.length === 0
  const medianOf = (field) => median(Object.values(report.routes).map((entry) => entry.medians[field]))
  log("measuring the synthetic Event-Timing proxy (not INP) on the homepage")
  let eventTimingProxy = null
  try {
    eventTimingProxy = await measureEventTimingProxy("/")
    log(
      `event-timing proxy: max interaction ${eventTimingProxy.maxInteractionMs} ms ` +
        `over ${eventTimingProxy.interactions} synthetic event(s) — sanity check only, not INP`
    )
  } catch (error) {
    eventTimingProxy = { error: String(error) }
    log(`event-timing proxy skipped: ${String(error)}`)
  }
  report.eventTimingProxy = eventTimingProxy
  report.summary = {
    routes: routes.length,
    runsPerRoute: runs,
    allRoutesPass: report.pass,
    tbtProxyWithinTargetRoutes: Object.values(report.routes).filter(
      (entry) => entry.tbtProxyWithinTarget
    ).length,
    tbtProxyRouteCount: routes.length,
    worstMedian: {
      lcpMs: round(Math.max(...Object.values(report.routes).map((entry) => entry.medians.lcpMs)), 1),
      cls: round(Math.max(...Object.values(report.routes).map((entry) => entry.medians.cls)), 4),
      tbtMs: round(Math.max(...Object.values(report.routes).map((entry) => entry.medians.tbtMs)), 1),
    },
    medianAcrossRoutes: {
      lcpMs: round(medianOf("lcpMs"), 1),
      cls: round(medianOf("cls"), 4),
      tbtMs: round(medianOf("tbtMs"), 1),
      performanceScore: round(medianOf("performanceScore"), 1),
    },
  }
  writeJson(path.join(AUDIT_DIR, "lighthouse-results.json"), report)
  log(
    `performance audit ${report.pass ? "PASS" : "FAIL"} — evidence docs/build/p1-audit/lighthouse-results.json`
  )
  if (!report.pass) {
    console.error(JSON.stringify(report.failures, null, 2))
    process.exitCode = 1
  }
} catch (error) {
  writeJson(path.join(AUDIT_DIR, "lighthouse-results.json"), report)
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  if (browserProcess) {
    browserProcess.kill("SIGKILL")
  }
  if (server) await server.stop()
  fs.rmSync(profileDir, { recursive: true, force: true })
}
