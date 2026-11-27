#!/usr/bin/env node
/**
 * Fixture-vs-CMS parity — the ticket #30 acceptance check that proves the
 * rendered P1 site is the same whether it is served from the fixture corpus
 * (`CONTENT_SOURCE=fixture`, the merge-gate default) or from the embedded
 * Payload database (`CONTENT_SOURCE=cms`, the operator-managed site).
 *
 * How it runs (driven by `scripts/test-cms.mjs`, never by `npm test`):
 *
 *   1. build the production app with the fixture provider and the `p1` scenario;
 *   2. serve it, capture the P1 route matrix (statuses, metadata, normalised
 *      structure and text of `<main>`, navigation/footer links, sitemap);
 *   3. build the production app with the CMS provider against the seeded
 *      disposable Postgres, serve it, capture the same matrix;
 *   4. compare the two captures. Any difference is a failure: the seed no longer
 *      reproduces the fixture corpus, the adapter mapping drifted, or a gate
 *      differs between the two providers.
 *
 * Normalisation is deliberate: only the observable public document is compared
 * (status code, `<title>`, meta description, heading sequence, main text,
 * main links, header/footer hrefs, sitemap URLs), whitespace and NBSP are
 * folded, and attributes/class names are ignored — page parity is about what a
 * visitor and a crawler receive, not about markup identity.
 *
 * CLI for manual use:
 *   node scripts/parity.mjs capture http://127.0.0.1:3130 /tmp/fixture.json
 *   node scripts/parity.mjs compare /tmp/fixture.json /tmp/cms.json
 */
import fs from "node:fs"
import { parse } from "node-html-parser"

/**
 * The P1 route matrix: every published route, every gated route of the launch
 * state, and the sitemap. Kept literal on purpose (an independent expectation,
 * like `tests/http/scenarios.ts`) — it is the same matrix the fixture HTTP suite
 * asserts, so the two providers are compared on the routes the ticketing
 * system decided.
 */
/** Routes published in the P1 launch state (must answer 200). */
const PUBLISHED_ROUTES = [
  "/",
  "/a-propos",
  "/domaines-activite",
  "/domaines-activite/eclairage-public",
  "/domaines-activite/installations-electriques",
  "/domaines-activite/infrastructures-reseaux-electriques",
  "/realisations",
  "/contact",
  "/carrieres",
  "/mentions-legales",
  "/politique-de-confidentialite",
]

/** Gated routes of the P1 launch state (must answer 404 in both providers). */
const GATED_ROUTES = [
  "/domaines-activite/energies-renouvelables",
  "/domaines-activite/fourniture-equipements",
  "/moyens-et-competences",
  "/references-et-partenaires",
  "/actualites",
]

/** The named-case-study family is gated at every tier (code-owned gate). */
const GATED_CASE_STUDY_ROUTE = "/realisations/projet-non-publie"

/** A route no page defines — the router's own 404 document. */
const UNKNOWN_ROUTE = "/cette-page-n-existe-pas"

/** The matrix both providers are compared on: published + gated + unknown. */
export const P1_ROUTE_MATRIX = [
  ...PUBLISHED_ROUTES,
  ...GATED_ROUTES,
  GATED_CASE_STUDY_ROUTE,
  UNKNOWN_ROUTE,
]

/** Fold the typographic characters that vary in encoding, and whitespace. */
function normalizeText(value) {
  return value
    .replace(/\u00a0/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
}

/** Normalised text of one element (excluding script/style and hidden nodes). */
function elementText(root) {
  const forbidden = new Set(["SCRIPT", "STYLE", "TEMPLATE", "SVG"])
  const walk = (node) => {
    if (node.nodeType === 3) return node.rawText
    if (node.nodeType !== 1) return ""
    if (forbidden.has(node.rawTagName?.toUpperCase?.() ?? "")) return ""
    return (node.childNodes ?? []).map(walk).join(" ")
  }
  return normalizeText(walk(root))
}

/** The heading sequence of the document, tag and text preserved. */
function headingsOf(root) {
  return root
    .querySelectorAll("h1, h2, h3, h4")
    .map((heading) => `${heading.rawTagName.toLowerCase()}: ${elementText(heading)}`)
}

/** Links of one container, as `label → href`. */
function linksOf(root) {
  return root
    .querySelectorAll("a[href]")
    .map((link) => `${elementText(link)} → ${link.getAttribute("href") ?? ""}`)
}

/** The main landmark, or the whole body when a document has no `<main>`. */
function mainOf(document) {
  return document.querySelector("main") ?? document.querySelector("body") ?? document
}

/** Capture one route: the observable public document, normalised. */
async function captureRoute(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: { "Accept-Language": "fr" },
    redirect: "manual",
  })
  const html = await response.text()
  const document = parse(html)
  const main = mainOf(document)
  const header = document.querySelector("header")
  const footer = document.querySelector("footer")

  return {
    status: response.status,
    lang: document.querySelector("html")?.getAttribute("lang") ?? null,
    title: normalizeText(document.querySelector("title")?.textContent ?? ""),
    description:
      document.querySelector('meta[name="description"]')?.getAttribute("content") ??
      null,
    headings: headingsOf(main),
    text: elementText(main),
    links: linksOf(main),
    mainTags: (main.childNodes ?? [])
      .filter((node) => node.nodeType === 1)
      .map((node) => node.rawTagName?.toUpperCase?.() ?? ""),
    navigation: header ? linksOf(header) : [],
    footer: footer ? linksOf(footer) : [],
  }
}

/** Parse a sitemap document into its absolute URLs, normalised to paths. */
function sitemapPathsOf(xml) {
  const paths = []
  const regexp = /<loc>\s*([^<\s]+)\s*<\/loc>/gu
  let match
  while ((match = regexp.exec(xml)) !== null) {
    try {
      const url = new URL(match[1])
      paths.push(url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/u, ""))
    } catch {
      paths.push(match[1])
    }
  }
  return paths.sort()
}

/** Capture the whole P1 matrix from one running server. */
export async function captureMatrix(baseUrl) {
  const base = baseUrl.replace(/\/+$/u, "")
  const routes = {}
  for (const route of P1_ROUTE_MATRIX) {
    routes[route] = await captureRoute(base, route)
  }

  const sitemapResponse = await fetch(`${base}/sitemap.xml`, {
    headers: { "Accept-Language": "fr" },
  })
  const sitemap = {
    status: sitemapResponse.status,
    paths: sitemapPathsOf(await sitemapResponse.text()),
  }

  return { baseUrl: base, routes, sitemap }
}

/** Compare one field of two route captures; returns a readable difference. */
function compareField(route, field, fixture, cms, differences) {
  const left = JSON.stringify(fixture)
  const right = JSON.stringify(cms)
  if (left === right) return
  differences.push({
    route,
    field,
    fixture: left.length > 600 ? `${left.slice(0, 600)}…` : left,
    cms: right.length > 600 ? `${right.slice(0, 600)}…` : right,
  })
}

/**
 * Compare two matrix captures. Throws with the full difference list when the
 * two providers disagree; returns the capture summary when they are identical.
 * Also asserts the expected P1 gate statuses, so the comparison cannot pass by
 * both providers serving the same *wrong* status.
 */
export function compareMatrices(fixture, cms) {
  const differences = []

  for (const route of P1_ROUTE_MATRIX) {
    const left = fixture.routes[route]
    const right = cms.routes[route]
    if (!left || !right) {
      differences.push({ route, field: "capture", fixture: Boolean(left), cms: Boolean(right) })
      continue
    }

    // Expected P1 launch status (known from the decided route matrix).
    const expected = PUBLISHED_ROUTES.includes(route) ? 200 : 404
    if (right.status !== expected) {
      differences.push({
        route,
        field: "expected-status",
        fixture: expected,
        cms: right.status,
      })
    }

    for (const field of [
      "status",
      "lang",
      "title",
      "description",
      "headings",
      "text",
      "links",
      "mainTags",
      "navigation",
      "footer",
    ]) {
      compareField(route, field, left[field], right[field], differences)
    }
    // The gated routes must be gated in the CMS build too.
    if (GATED_ROUTES.includes(route) && right.status !== 404) {
      differences.push({ route, field: "gate", fixture: 404, cms: right.status })
    }
  }

  compareField("/sitemap.xml", "status", fixture.sitemap.status, cms.sitemap.status, differences)
  compareField("/sitemap.xml", "paths", fixture.sitemap.paths, cms.sitemap.paths, differences)

  if (differences.length > 0) {
    const details = differences
      .map(
        (difference) =>
          `  ${difference.route} · ${difference.field}\n    fixture: ${difference.fixture}\n    cms:     ${difference.cms}`
      )
      .join("\n")
    throw new Error(
      `Fixture-vs-CMS parity failed (${differences.length} difference(s)):\n${details}`
    )
  }

  return {
    routes: P1_ROUTE_MATRIX.length,
    openRoutes: P1_ROUTE_MATRIX.filter((route) => fixture.routes[route]?.status === 200).length,
    gatedRoutes: P1_ROUTE_MATRIX.filter((route) => fixture.routes[route]?.status === 404).length,
    sitemapPaths: fixture.sitemap.paths,
  }
}

/** `capture` and `compare` sub-commands for manual runs. */
async function main() {
  const [command, ...rest] = process.argv.slice(2)
  if (command === "capture") {
    const [baseUrl, outFile] = rest
    if (!baseUrl || !outFile) {
      throw new Error("usage: parity.mjs capture <baseUrl> <outFile>")
    }
    const matrix = await captureMatrix(baseUrl)
    fs.writeFileSync(outFile, JSON.stringify(matrix, null, 2))
    console.log(`parity: captured ${Object.keys(matrix.routes).length} routes → ${outFile}`)
    return
  }
  if (command === "compare") {
    const [fixtureFile, cmsFile] = rest
    if (!fixtureFile || !cmsFile) {
      throw new Error("usage: parity.mjs compare <fixture.json> <cms.json>")
    }
    const fixture = JSON.parse(fs.readFileSync(fixtureFile, "utf8"))
    const cms = JSON.parse(fs.readFileSync(cmsFile, "utf8"))
    const summary = compareMatrices(fixture, cms)
    console.log("parity: identical", JSON.stringify(summary))
    return
  }
  throw new Error("usage: parity.mjs <capture|compare> …")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
