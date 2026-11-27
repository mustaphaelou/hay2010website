/**
 * Shared helpers for the ticket #33 P1 audit scripts.
 *
 * These are audit tools, not a second gate: the merge gate stays
 * `npm run typecheck && npm run lint && npm test` (one Vitest HTTP suite over a
 * production build). The audit exists to prove the behaviour the HTTP suite
 * cannot see — keyboard operation, motion preference, layout stability,
 * breakpoints, lab performance numbers — and to scan the real served HTML for
 * gated claims and tracking surfaces independently of the suite's assertions.
 *
 * Design rules:
 * - build once, serve once, audit the production artefact (never `next dev`);
 * - reference numbers keep the ticket's ports (site 3133, Chrome debug 9133);
 * - no assertion here is wired into `npm test`.
 */
import { spawn, spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

import { parse } from "node-html-parser"

import { P1_ROUTE_MATRIX } from "../parity.mjs"

const require = createRequire(import.meta.url)

/** Repository root of this worktree. */
export const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
)

/** Committed evidence directory (`docs/build/p1-audit/`). */
export const AUDIT_DIR = path.join(projectRoot, "docs", "build", "p1-audit")
export const SCREENS_DIR = path.join(AUDIT_DIR, "screens")

/** The fixture scenarios the merge gate runs, in the gate's order. */
export const SCENARIOS = [
  "p1",
  "p2",
  "p3",
  "p1-gates-closed",
  "p1-recrutement",
  "p1-hero-image",
]

export const HOSTNAME = "127.0.0.1"

/** Site port the ticket reserves (`TEST_HTTP_PORT=3133`). */
export const DEFAULT_SITE_PORT =
  process.env.AUDIT_HTTP_PORT ?? process.env.TEST_HTTP_PORT ?? "3133"

/** Chrome DevTools port, inside the ticket's range and never 9222. */
export const DEFAULT_DEBUG_PORT = process.env.AUDIT_DEBUG_PORT ?? "9133"

/** Cached Playwright Chromium 1255 (Chrome for Testing 159). Never downloaded. */
export const CHROME_BIN =
  process.env.CHROME_BIN ??
  path.join(
    os.homedir(),
    ".cache",
    "ms-playwright",
    "chromium-1255",
    "chrome-linux64",
    "chrome"
  )

/** `axe-core/axe.min.js` resolved from the installed devDependency. */
export const AXE_BIN = require.resolve("axe-core/axe.min.js")

/** Routes outside the P1 matrix that must still answer 404 (`/en` reserved). */
export const RESERVED_ROUTES = ["/en"]

/** Route matrix scanned by the claims audit: P1 matrix + reserved + sitemap. */
export function auditRoutes(sitemapPaths = []) {
  return [
    ...new Set([...sitemapPaths, ...P1_ROUTE_MATRIX, ...RESERVED_ROUTES]),
  ].sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)))
}

// ---------------------------------------------------------------------------
// Logging / process helpers
// ---------------------------------------------------------------------------

/** @param {string} message */
export function log(message) {
  console.log(`[audit] ${message}`)
}

/** @param {number} ms */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** @param {string} message */
export function fail(message) {
  throw new Error(message)
}

/**
 * Run a command to completion, inheriting stdio (or capturing it).
 * @param {string} command
 * @param {string[]} args
 * @param {{ env?: NodeJS.ProcessEnv, capture?: boolean, cwd?: string }} [options]
 */
export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    env: options.env ?? process.env,
  })
  if (result.error) throw result.error
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  }
}

const NEXT_BIN = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next")
const NPM_BIN = process.platform === "win32" ? "npm.cmd" : "npm"

/**
 * Environment of one fixture build/serve pair. The scenario is baked into the
 * static prerender, so the build and the server must share it.
 * @param {string} scenario
 * @param {string} baseUrl
 */
export function fixtureEnv(scenario, baseUrl) {
  return {
    ...process.env,
    NODE_ENV: "production",
    NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=4096",
    CONTENT_SOURCE: "fixture",
    CONTENT_SCENARIO: scenario,
    NEXT_PUBLIC_SERVER_URL: baseUrl,
  }
}

/** Remove the production build directory (a build must follow). */
export function cleanBuild() {
  fs.rmSync(path.join(projectRoot, ".next"), { recursive: true, force: true })
}

/**
 * Build the production app for one fixture scenario from a clean `.next`.
 * @param {string} scenario
 * @param {string} baseUrl
 */
export function buildScenario(scenario, baseUrl) {
  cleanBuild()
  log(`building the production app (CONTENT_SCENARIO=${scenario})`)
  const result = run(NPM_BIN, ["run", "build"], {
    env: fixtureEnv(scenario, baseUrl),
  })
  if (result.status !== 0) {
    fail(`the production build failed for scenario "${scenario}"`)
  }
}

/** Is something already answering on the base URL? */
export async function isPortServing(baseUrl) {
  try {
    await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(1_500) })
    return true
  } catch {
    return false
  }
}

const READINESS_TIMEOUT_MS = 90_000

/**
 * Start the production server for one scenario; resolves once `/api/health`
 * answers. The caller must `stop()` it (idempotent).
 * @param {{ scenario: string, baseUrl: string, env?: NodeJS.ProcessEnv }} options
 */
export async function startServer({ scenario, baseUrl, env }) {
  if (await isPortServing(baseUrl)) {
    fail(
      `something is already serving ${baseUrl}; stop it or set AUDIT_HTTP_PORT to another 31xx port`
    )
  }
  const port = new URL(baseUrl).port
  log(`starting the production server on ${baseUrl} (${scenario})`)
  /** @type {string} */
  let stderr = ""
  const child = spawn(
    process.execPath,
    [NEXT_BIN, "start", "-p", port, "-H", HOSTNAME],
    {
      cwd: projectRoot,
      stdio: ["ignore", "ignore", "pipe"],
      env: env ?? fixtureEnv(scenario, baseUrl),
    }
  )
  child.stderr?.setEncoding("utf8")
  child.stderr?.on("data", (chunk) => {
    stderr = (stderr + chunk).slice(-20_000)
  })

  const deadline = Date.now() + READINESS_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      fail(
        `the production server exited before answering (code ${child.exitCode})\n${stderr}`
      )
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(2_000),
      })
      if (response.status > 0) break
    } catch {
      // Not listening yet.
    }
    await delay(250)
  }

  let stopped = false
  /** Stop the server, escalating to SIGKILL; safe to call twice. */
  async function stop() {
    if (stopped) return
    stopped = true
    if (child.exitCode !== null || child.signalCode !== null) return
    child.kill("SIGTERM")
    const exited = await Promise.race([
      new Promise((resolve) => child.once("exit", () => resolve(true))),
      delay(5_000).then(() => false),
    ])
    if (!exited && child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL")
    }
  }

  return { child, stop, stderr: () => stderr }
}

// ---------------------------------------------------------------------------
// Fetching and text extraction
// ---------------------------------------------------------------------------

/**
 * Fetch one served document without following redirects.
 * @param {string} baseUrl
 * @param {string} route
 */
export async function fetchDocument(baseUrl, route) {
  const url = `${baseUrl}${route === "/" ? "/" : route}`
  const response = await fetch(url, {
    redirect: "manual",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "fr",
    },
  })
  const html = await response.text()
  const getSetCookie = response.headers.getSetCookie?.bind(response.headers)
  return {
    route,
    url,
    status: response.status,
    location: response.headers.get("location"),
    contentType: response.headers.get("content-type") ?? "",
    setCookies: getSetCookie ? getSetCookie() : [],
    html,
  }
}

/**
 * Paths listed by `/sitemap.xml` of the running server, normalised to route
 * paths (`""` becomes `/`, trailing slash removed).
 * @param {string} baseUrl
 */
export async function fetchSitemapPaths(baseUrl) {
  const response = await fetch(`${baseUrl}/sitemap.xml`)
  if (response.status !== 200) fail(`/sitemap.xml answered ${response.status}`)
  const xml = await response.text()
  const locations = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gu)].map(
    (match) => match[1]
  )
  if (locations.length === 0) fail("the sitemap lists no URL")
  return locations.map((location) => {
    const pathname = new URL(location).pathname
    return pathname === "/" ? "/" : pathname.replace(/\/+$/u, "")
  })
}

/** Parse a served document (null-safe for non-HTML). */
export function documentOf(html) {
  return parse(html)
}

/** Visible text: excludes script/style/template/noscript data. */
export function visibleTextOf(html) {
  const rendered = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
  return foldText(parse(rendered).text)
}

/** Fold NBSP / typographic apostrophes / whitespace so matching is stable. */
export function foldText(value) {
  return value
    .replace(/\u00a0/gu, " ")
    .replace(/[\u2019\u02bc]/gu, "'")
    .replace(/\s+/gu, " ")
    .trim()
}

/** The head/meta/JSON-LD text that is not visible copy but is published. */
export function metadataTextOf(html) {
  const doc = documentOf(html)
  const parts = []
  const title = doc.querySelector("title")
  if (title) parts.push(`title: ${foldText(title.textContent)}`)
  for (const meta of doc.querySelectorAll("meta")) {
    const name = meta.getAttribute("property") ?? meta.getAttribute("name")
    const content = meta.getAttribute("content")
    if (name && content) parts.push(`${name}: ${content}`)
  }
  for (const link of doc.querySelectorAll('link[rel="canonical"]')) {
    const href = link.getAttribute("href")
    if (href) parts.push(`canonical: ${href}`)
  }
  return foldText(parts.join(" | "))
}

/** Raw JSON-LD payloads (script bodies), concatenated. */
export function jsonLdTextOf(html) {
  const doc = documentOf(html)
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]')
  return {
    blocks: scripts.map((script) => script.textContent.trim()).filter(Boolean),
    text: foldText(scripts.map((script) => script.textContent).join(" ")),
  }
}

// ---------------------------------------------------------------------------
// Claims audit — gated wording that must never render while its gate is closed
// ---------------------------------------------------------------------------

/**
 * One gated claim rule. Derived from `docs/company/facts-register.md` §2–§3 and
 * the ticket #33 acceptance list, then narrowed against the real P1 corpus so
 * cleared facts cannot false-positive (see `CLEARED_FACTS`).
 */
export const CLAIM_RULES = [
  {
    key: "onee",
    label: "ONEE wording",
    pattern: /\bONEE\b/iu,
  },
  {
    key: "agrement",
    label: "agrément / agréé claim",
    pattern: /agrément|\bagréé\b|entreprise agréée/iu,
  },
  {
    key: "certification",
    label: "certification or homologation claim",
    pattern: /\bcertifi\w*|\bhomologu\w*/iu,
  },
  {
    key: "founding-year",
    label: "founding year (2004 / 2011 / >20 ans)",
    pattern: /\b2004\b|\b2011\b|créée?\s+en\s+\d{4}|plus\s+de\s+20\s+ans/iu,
  },
  {
    key: "rc-517",
    label: "stale RC 517",
    pattern: /\bRC\s*517\b/iu,
  },
  {
    key: "stale-capital",
    label: "stale capital figure",
    pattern: /\b(?:6\s?000\s?000|4\s?700\s?000|500\s?000)\b/u,
  },
  {
    key: "old-address",
    label: "historical address",
    pattern: /Ribat\s+Al\s+Fath|Hay\s+El\s+Fath/iu,
  },
  {
    key: "if",
    label: "gated IF number",
    pattern: /\bIF\s*6580342\b/u,
  },
  {
    key: "mhvp",
    label: "MHVP / HTA-BT0 claim",
    pattern: /\bMHVP\b|\bHTA-BT0\b/u,
  },
  {
    key: "solaire",
    label: "gated solaire / ENR vocabulary",
    pattern: /solaire|photovolta|énergies?\s+renouvelables/iu,
  },
  {
    key: "client-name",
    label: "gated client / buyer name or bid wording",
    pattern:
      /Al\s+Omrane|CHU\s+Mohammed|Bank\s+Al-Maghrib|\bAMEE\b|Aïn\s+Taoujdate|Khemisset|Sania|attributaire|non\s+retenu|marché\s+remporté|losing\s+bid/iu,
  },
  {
    key: "gated-figure",
    label: "gated financial or procurement figure",
    pattern:
      /187\s?607|78[,.]66|\b14\s+marchés?\b|chiffre\s+d'affaires|bénéfice\s+net|résultat\s+net/iu,
  },
  {
    key: "phone-number",
    label: "phone number",
    pattern:
      /\+212[\s.-]?\d(?:[\s.-]?\d{2}){4}|\b0[5-7](?:[\s.-]?\d{2}){4}\b/u,
  },
  {
    key: "social-link",
    label: "social network URL",
    pattern:
      /linkedin\.com|facebook\.com|instagram\.com|twitter\.com|youtube\.com|tiktok\.com/iu,
  },
  {
    key: "cndp-number",
    label: "CNDP receipt / authorization number",
    pattern:
      /récépissé\s*n°|autorisation\s*(?:CNDP\s*)?n°|CNDP\s*n°|déclaration\s*n°|numéro\s+de\s+récépissé/iu,
  },
  {
    key: "gated-mailbox",
    label: "gated mailbox published",
    pattern:
      /recrutement@hay2010\.ma|ste\.hay2010@gmail\.com|no-reply@hay2010\.ma/iu,
  },
  {
    key: "internal-code",
    label: "internal filing code",
    pattern: /\bF-\d{3}\b|\bD-\d{3}-\d{4}\b/u,
  },
  {
    key: "placeholder",
    label: "placeholder copy",
    pattern: /lorem ipsum|à confirmer|à compléter|\[●\]|coming soon/iu,
  },
]

/** Metadata-only gated wording (a channel named in the head is a claim too). */
export const METADATA_ONLY_RULES = [
  {
    key: "metadata-phone",
    label: "phone channel in metadata",
    pattern: /\btéléphone\b|\btel\./iu,
  },
  {
    key: "metadata-mailbox",
    label: "gated mailbox in metadata",
    pattern: /recrutement@|ste\.hay2010@gmail\.com|no-reply@/iu,
  },
]

/** Gated mailboxes that must never be published (careers has an exception). */
export const GATED_MAILBOXES = [
  "recrutement@hay2010.ma",
  "ste.hay2010@gmail.com",
  "no-reply@hay2010.ma",
]

/** Mailboxes the launch state publishes. */
export const CLEARED_MAILBOXES = ["contact@hay2010.ma", "donnees@hay2010.ma"]

/**
 * Documented fixture-only exceptions. `p1-recrutement` is the F-113-granted
 * simulation (`content/fixtures/scenarios/p1-recrutement.json`, comment: the
 * CNDP reference is fictitious on purpose); it must prove the live careers copy
 * path, never ship. Anywhere else these rules are absolute.
 */
export const SCENARIO_EXCEPTIONS = [
  {
    scenario: "p1-recrutement",
    route: "/carrieres",
    keys: ["cndp-number", "gated-mailbox"],
    reason:
      "F-113 simulation: the careers page publishes a fictitious CNDP reference and the recrutement@ mailbox to prove the live-copy path; never a production corpus.",
  },
  {
    scenario: "p1-hero-image",
    route: "/",
    keys: ["photograph"],
    reason:
      "Hero-image fixture: the homepage carries the documented test media record to prove the cleared-image path; no licensed photograph exists at launch.",
  },
  {
    scenario: "p2",
    route: "*",
    keys: ["solaire"],
    reason:
      "P2 gate simulation opens the Énergies renouvelables domain by corpus design, so its published vocabulary (label, title, description) is expected on the pages that list it. The P1 launch state must never render it.",
  },
  {
    scenario: "p3",
    route: "*",
    keys: ["solaire"],
    reason:
      "P3 gate simulation opens the Énergies renouvelables domain by corpus design, so its published vocabulary (label, title, description) is expected on the pages that list it. The P1 launch state must never render it.",
  },
]

/**
 * Is a rule allowed on this scenario/route?
 * @param {string} key
 * @param {string} scenario
 * @param {string} route
 */
export function isClaimAllowed(key, scenario, route) {
  return SCENARIO_EXCEPTIONS.some(
    (exception) =>
      exception.scenario === scenario &&
      (exception.route === route || exception.route === "*") &&
      exception.keys.includes(key)
  )
}

/** First-match context around a pattern hit, for the report. */
function contextOf(haystack, pattern) {
  const match = pattern.exec(haystack)
  if (!match) return null
  const start = Math.max(0, (match.index ?? 0) - 90)
  const end = Math.min(haystack.length, (match.index ?? 0) + match[0].length + 90)
  return {
    match: match[0],
    context: `${start > 0 ? "…" : ""}${haystack.slice(start, end)}${
      end < haystack.length ? "…" : ""
    }`,
  }
}

/**
 * Scan one served document for gated claims, in visible text, metadata and
 * JSON-LD. Returns the findings; the caller decides pass/fail.
 * @param {string} html
 * @param {{ scenario: string, route: string }} context
 */
export function analyseClaims(html, { scenario, route }) {
  const text = visibleTextOf(html)
  const metadata = metadataTextOf(html)
  const jsonLd = jsonLdTextOf(html).text
  const allowed = []
  const findings = []

  for (const rule of CLAIM_RULES) {
    if (isClaimAllowed(rule.key, scenario, route)) {
      const hit = contextOf(text, rule.pattern)
      if (hit) allowed.push({ key: rule.key, label: rule.label, ...hit })
      continue
    }
    for (const [where, haystack] of [
      ["text", text],
      ["metadata", metadata],
      ["json-ld", jsonLd],
    ]) {
      const hit = contextOf(haystack, rule.pattern)
      if (hit) {
        findings.push({ key: rule.key, label: rule.label, where, ...hit })
      }
    }
  }

  for (const rule of METADATA_ONLY_RULES) {
    if (isClaimAllowed(rule.key, scenario, route)) continue
    const hit = contextOf(metadata, rule.pattern)
    if (hit) {
      findings.push({ key: rule.key, label: rule.label, where: "metadata", ...hit })
    }
  }

  return { findings, allowed }
}

/** Gated JSON-LD types and properties (SEO §5.10, structured-data suite). */
const GATED_SCHEMA_TYPES = new Set([
  "LocalBusiness",
  "Electrician",
  "JobPosting",
  "BreadcrumbList",
  "Review",
  "AggregateRating",
  "Service",
  "FAQPage",
  "Article",
  "Person",
  "Product",
  "Offer",
])

const GATED_SCHEMA_KEYS = new Set([
  "sameAs",
  "logo",
  "telephone",
  "foundingDate",
  "openingHours",
  "openingHoursSpecification",
  "areaServed",
  "aggregateRating",
  "review",
  "priceRange",
  "employees",
  "award",
])

/**
 * Assert that the structured data only uses the allowed SEO §5 graph and no
 * gated property. Returns findings (gated type/property, unparsable block).
 * @param {string} html
 */
export function analyseStructuredData(html) {
  const findings = []
  const { blocks } = jsonLdTextOf(html)
  for (const block of blocks) {
    let payload
    try {
      payload = JSON.parse(block)
    } catch {
      findings.push({ key: "jsonld-parse", detail: "a JSON-LD block is not valid JSON" })
      continue
    }
    const walk = (node, pointer) => {
      if (Array.isArray(node)) {
        node.forEach((value, index) => walk(value, `${pointer}[${index}]`))
        return
      }
      if (!node || typeof node !== "object") return
      for (const [key, value] of Object.entries(node)) {
        if (GATED_SCHEMA_KEYS.has(key)) {
          findings.push({ key: "jsonld-property", detail: `${pointer}.${key}` })
        }
        if (key === "@type") {
          const types = Array.isArray(value) ? value : [value]
          for (const type of types) {
            if (typeof type === "string" && GATED_SCHEMA_TYPES.has(type)) {
              findings.push({ key: "jsonld-type", detail: `${pointer} = ${type}` })
            }
          }
        }
        walk(value, `${pointer}.${key}`)
      }
    }
    walk(payload, "$")
  }
  return findings
}

// ---------------------------------------------------------------------------
// Media / link / privacy audits
// ---------------------------------------------------------------------------

/**
 * Photograph and logo audit. The only images allowed in the launch state are
 * the code-owned brand mark; the `p1-hero-image` fixture may add the one
 * documented test media record on the homepage (see SCENARIO_EXCEPTIONS).
 * @param {string} html
 * @param {{ scenario: string, route: string }} context
 */
export function analyseMedia(html, { scenario, route }) {
  const doc = documentOf(html)
  const heroAllowed = isClaimAllowed("photograph", scenario, route)
  const findings = []
  const allowed = []

  for (const element of doc.querySelectorAll("img, picture, figure, video, iframe")) {
    const tag = element.rawTagName?.toLowerCase() ?? "?"
    if (tag !== "img") {
      findings.push({
        key: "photograph",
        detail: `<${tag}> is not allowed on a P1 page`,
      })
      continue
    }
    const src = element.getAttribute("src") ?? ""
    const isBrand = src.startsWith("/brand/")
    const isHeroFixture =
      heroAllowed &&
      /(?:^|\/media\/)hero-documentaire-test\.jpg/u.test(decodeURIComponent(src))
    if (isBrand) {
      allowed.push({ key: "brand-image", detail: src })
    } else if (isHeroFixture) {
      allowed.push({ key: "hero-fixture", detail: src })
    } else {
      findings.push({ key: "photograph", detail: `<img src="${src}">` })
    }
  }

  // Inline CSS must not smuggle a photograph in as a background image (the
  // brand mark is an <img>, never a CSS url()).
  for (const element of doc.querySelectorAll("style")) {
    const css = element.textContent
    if (/url\(\s*['"]?(?!data:)/u.test(css)) {
      findings.push({ key: "photograph", detail: "background-image url() in a <style>" })
    }
  }

  return { findings, allowed }
}

/** Route families gated at every tier (named case studies, English at P1). */
const ALWAYS_GATED_LINK = /^\/realisations\/.+|^\/en(?:\/|$)/u

/**
 * Link audit: no gated route, no phone/social channel, no gated mailbox.
 *
 * `gatedRoutes` is the scenario's expected 404 set (transcribed independently
 * in `claims-scenarios.mjs` / derived from the served matrix in `audit.mjs`):
 * a link is gated only when its target is closed *in this tier simulation*.
 * Published-but-unbuilt tier items (the p2/p3 navigation simulation) are not
 * gated links.
 * @param {string} html
 * @param {{ scenario: string, route: string, gatedRoutes?: readonly string[] }} context
 */
export function analyseLinks(html, { scenario, route, gatedRoutes = [] }) {
  const doc = documentOf(html)
  const findings = []
  const allowed = []
  const gated = new Set(gatedRoutes)
  for (const anchor of doc.querySelectorAll("a[href]")) {
    const rawHref = anchor.getAttribute("href") ?? ""
    const href = rawHref.split(/[?#]/u)[0]
    if (href.startsWith("tel:")) {
      findings.push({ key: "phone-link", detail: href })
      continue
    }
    if (href.startsWith("mailto:")) {
      const address = decodeURIComponent(href.slice("mailto:".length)).split("?")[0]
      if (CLEARED_MAILBOXES.includes(address)) {
        allowed.push({ key: "cleared-mailbox", detail: address })
      } else if (
        GATED_MAILBOXES.includes(address) &&
        isClaimAllowed("gated-mailbox", scenario, route)
      ) {
        allowed.push({ key: "fixture-mailbox", detail: address })
      } else {
        findings.push({ key: "gated-mailbox", detail: href })
      }
      continue
    }
    if (gated.has(href) || ALWAYS_GATED_LINK.test(href)) {
      findings.push({ key: "gated-link", detail: rawHref })
    }
  }
  return { findings, allowed }
}

const ANALYTICS_HOST_PATTERN =
  /(?:google-analytics\.com|googletagmanager\.com|doubleclick\.net|googlesyndication\.com|googleadservices\.com|connect\.facebook\.net|facebook\.net\/tr|segment\.(?:io|com)|plausible\.io|matomo\.(?:org|cloud)|piwik\.(?:org|pro)|hotjar\.com|mixpanel\.com|amplitude\.com|clarity\.ms|fullstory\.com|heap\.io|statcounter\.com|cloudflareinsights\.com|simpleanalytics\.com|ackee\.io|umami\.is)/iu

const ANALYTICS_MARKER_PATTERN =
  /\b(?:dataLayer|gtag\s*\(|ga\s*\(\s*['"]create|fbq\s*\(|_paq\b|plausible\s*\(|mixpanel\.init|amplitude\.getInstance|hotjar\._hjSettings)/u

const CONSENT_MARKER_PATTERN =
  /cookie|consent|consentement|gdpr|tarteaucitron|axeptio|didomi|onetrust|usercentrics|klaro|borlabs|cookiebot/iu

const TRACKING_COOKIE_PATTERN =
  /^(?:__utm|_ga|_gid|_gat|_gcl|_fbp|_fbc|ajs_|_hj|mp_|_clck|_clsk|_uet|_pk_|amplitude|matomo|piwik|plausible|segment|IDE$|MUID$)/iu

/**
 * No analytics, cookie-consent banner, form control or tracking cookie on any
 * public page (P1 spec: "No analytics, no cookies, no consent banner, no forms").
 * @param {string} html
 * @param {{ setCookies?: string[] }} [details]
 */
export function analysePrivacy(html, details = {}) {
  const doc = documentOf(html)
  const findings = []

  for (const selector of ["form", "input", "textarea", "select"]) {
    const nodes = doc.querySelectorAll(selector)
    if (nodes.length > 0) {
      findings.push({
        key: "form-control",
        detail: `${nodes.length} <${selector}> element(s) (first: ${nodes[0]
          .getAttribute("name")
          ?.slice(0, 40) ?? "unnamed"})`,
      })
    }
  }

  for (const script of doc.querySelectorAll("script")) {
    const src = script.getAttribute("src") ?? ""
    if (src && ANALYTICS_HOST_PATTERN.test(src)) {
      findings.push({ key: "analytics-script", detail: src })
    }
  }
  if (ANALYTICS_HOST_PATTERN.test(html)) {
    findings.push({ key: "analytics-host", detail: "analytics host in the document" })
  }
  if (ANALYTICS_MARKER_PATTERN.test(html)) {
    findings.push({
      key: "analytics-marker",
      detail: "client-side analytics API marker in the document",
    })
  }

  // A consent banner is an overlay outside the content landmark (the policy's
  // `#cookies` section anchor lives inside <main> and is legal copy, not a
  // banner); consent wording on an element outside <main> is the signal.
  for (const element of doc.querySelectorAll("body *")) {
    if (element.closest("main")) continue
    const markers = ["id", "class", "role", "aria-label", "data-testid"]
      .map((attribute) => element.getAttribute(attribute))
      .filter((value) => Boolean(value))
      .join(" ")
    if (markers && CONSENT_MARKER_PATTERN.test(markers)) {
      findings.push({
        key: "consent-banner",
        detail: `<${element.rawTagName?.toLowerCase()} ${markers.slice(0, 120)}>`,
      })
    }
  }

  const trackingCookies = (details.setCookies ?? []).filter((cookie) => {
    const name = cookie.split("=")[0]?.trim() ?? ""
    return TRACKING_COOKIE_PATTERN.test(name)
  })
  for (const cookie of trackingCookies) {
    findings.push({ key: "tracking-cookie", detail: cookie.split(";")[0] })
  }

  return findings
}

// ---------------------------------------------------------------------------
// Cleared facts — the positive side of the claims audit
// ---------------------------------------------------------------------------

/** Facts register §2 values that must render, so the denylist cannot be naive. */
export const IDENTITY_FACTS = [
  "SOCIETE HAY 2010",
  "Société à responsabilité limitée (SARL)",
  "15 000 000 MAD",
  "Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc",
  "RC 87305 — Tribunal de commerce de Rabat",
  "001459327000056",
  "contact@hay2010.ma",
]

/** Checks proving the cleared facts render where the decisions put them. */
export const CLEARED_FACT_CHECKS = [
  {
    route: "/mentions-legales",
    facts: [...IDENTITY_FACTS, "donnees@hay2010.ma"],
  },
  {
    route: "/politique-de-confidentialite",
    facts: [...IDENTITY_FACTS, "donnees@hay2010.ma"],
  },
  {
    route: "/realisations",
    facts: ["Références sur demande."],
  },
  {
    route: "/",
    facts: [
      "Plus de 10 ans d'expérience",
      "Éclairage public",
      "Réseaux HTA/MT & MT/BT",
      "Postes de transformation",
      "CFO/CFA",
    ],
  },
  {
    route: "/a-propos",
    facts: ["Plus de 10 ans d'expérience", "Gérant : Rahhal Essamlali"],
  },
  {
    route: "/contact",
    facts: ["contact@hay2010.ma"],
  },
]

/**
 * Verify the cleared facts are actually served (a denylist that also hid them
 * would pass the claim audit for the wrong reason).
 * @param {Map<string, { html: string, status: number }>} documents route → served document
 */
export function analyseClearedFacts(documents) {
  const findings = []
  for (const check of CLEARED_FACT_CHECKS) {
    const document = documents.get(check.route)
    if (!document) {
      findings.push({ route: check.route, detail: "route was not served" })
      continue
    }
    // Gated in some scenario corpora (e.g. `/a-propos` in `p1-gates-closed`):
    // the route is absent on purpose, so there is no fact to assert.
    if (document.status !== 200) continue
    const text = visibleTextOf(document.html)
    for (const fact of check.facts) {
      if (!text.includes(foldText(fact))) {
        findings.push({
          route: check.route,
          detail: `cleared fact missing: « ${fact} »`,
        })
      }
    }
  }
  // Footer identity must render on every published page (2xx document); a 404
  // document is the branded error page and keeps the same footer, but the
  // router's fallback shells are not claimed to carry it.
  for (const [route, document] of documents) {
    if (document.status !== 200) continue
    const text = visibleTextOf(document.html)
    for (const fact of [
      "Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc",
      "contact@hay2010.ma",
    ]) {
      if (!text.includes(foldText(fact))) {
        findings.push({ route, detail: `footer cleared fact missing: « ${fact} »` })
      }
    }
  }
  return findings
}

// ---------------------------------------------------------------------------
// Report plumbing
// ---------------------------------------------------------------------------

/** Commit SHA of the audited tree. */
export function currentCommit() {
  const result = run("git", ["rev-parse", "HEAD"], { capture: true })
  return result.stdout.trim()
}

/** ISO timestamp (UTC). */
export function timestamp() {
  return new Date().toISOString()
}

/** Write pretty JSON, creating the directory. */
export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

/** Installed version of a package, or "missing". */
export function packageVersion(name) {
  try {
    const manifest = path.join(projectRoot, "node_modules", name, "package.json")
    return JSON.parse(fs.readFileSync(manifest, "utf8")).version
  } catch {
    return "missing"
  }
}

/**
 * Split findings into assertions; throws a readable aggregate on failure.
 * @param {{ label: string, findings: Array<Record<string, unknown>> }[]} checks
 */
export function assertNoFindings(checks) {
  const failed = checks.filter((check) => check.findings.length > 0)
  if (failed.length === 0) return
  const details = failed
    .map(
      (check) =>
        `  ${check.label}: ${check.findings
          .map((finding) => JSON.stringify(finding))
          .join(", ")}`
    )
    .join("\n")
  fail(`audit assertions failed:\n${details}`)
}

/** Relative path from the repo root, for report links. */
export function relative(file) {
  return path.relative(projectRoot, file).split(path.sep).join("/")
}
