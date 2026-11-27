#!/usr/bin/env node
/**
 * Claims audit over every fixture scenario — ticket #33, acceptance criterion
 * "a claims audit confirms no gated claim renders anywhere".
 *
 * The merge gate builds six production artefact scenarios (`p1`, `p2`, `p3`,
 * `p1-gates-closed`, `p1-recrutement`, `p1-hero-image`). This script builds and
 * serves each one in turn, fetches every route of the P1 matrix plus the
 * scenario's own sitemap (published pages, gated 404s, the reserved `/en`), and
 * scans the real served HTML for:
 *
 * - gated claims (ONEE/agrément wording, client names, founding year, gated
 *   figures, phone/social, CNDP numbers, internal filing codes, placeholders);
 * - gated structured-data types/properties;
 * - photographs/logos beyond the code-owned brand mark;
 * - gated routes, phone links and gated mailboxes in anchors;
 * - analytics scripts, consent banners, form controls and tracking cookies;
 * - the positive side: the cleared facts (RC 87305, ICE, capital, address,
 *   mailboxes, « Plus de 10 ans d'expérience », « Références sur demande »)
 *   must still render, so the denylist cannot pass by hiding everything.
 *
 * It also checks the gate matrix per scenario independently of the HTTP suite:
 * the sitemap equals the expected published set and the expected gated routes
 * answer 404.
 *
 * Usage:
 *   node scripts/audit/claims-scenarios.mjs                  # all six scenarios
 *   node scripts/audit/claims-scenarios.mjs --scenario p1    # one scenario
 *   node scripts/audit/claims-scenarios.mjs --scenario p1 --no-build  # iterate
 *
 * Evidence: `docs/build/p1-audit/claims-results.json`.
 */
import path from "node:path"

import {
  AUDIT_DIR,
  CHROME_BIN,
  DEFAULT_SITE_PORT,
  HOSTNAME,
  SCENARIOS,
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
  startServer,
  timestamp,
  writeJson,
} from "./lib.mjs"

const baseUrl = `http://${HOSTNAME}:${DEFAULT_SITE_PORT}`

/**
 * Independent status expectations, transcribed from the decided tiers and the
 * fixture gate map (`docs/spec/p1-website-build.md`, IA navigation,
 * `tests/http/scenarios.ts`). The audit asserts the gate matrix itself, not
 * only the claim scan.
 */
const SCENARIO_EXPECTATIONS = {
  p1: {
    open: [
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
    ],
    gated: [
      "/domaines-activite/energies-renouvelables",
      "/domaines-activite/fourniture-equipements",
      "/moyens-et-competences",
      "/references-et-partenaires",
      "/actualites",
      "/realisations/projet-non-publie",
    ],
  },
  p2: {
    open: [
      "/",
      "/a-propos",
      "/domaines-activite",
      "/domaines-activite/eclairage-public",
      "/domaines-activite/installations-electriques",
      "/domaines-activite/infrastructures-reseaux-electriques",
      "/domaines-activite/energies-renouvelables",
      "/domaines-activite/fourniture-equipements",
      "/realisations",
      "/contact",
      "/carrieres",
      "/mentions-legales",
      "/politique-de-confidentialite",
    ],
    gated: ["/actualites", "/realisations/projet-non-publie"],
  },
  p3: {
    open: [
      "/",
      "/a-propos",
      "/domaines-activite",
      "/domaines-activite/eclairage-public",
      "/domaines-activite/installations-electriques",
      "/domaines-activite/infrastructures-reseaux-electriques",
      "/domaines-activite/energies-renouvelables",
      "/domaines-activite/fourniture-equipements",
      "/realisations",
      "/contact",
      "/carrieres",
      "/mentions-legales",
      "/politique-de-confidentialite",
    ],
    gated: ["/realisations/projet-non-publie"],
  },
  "p1-gates-closed": {
    open: [
      "/",
      "/domaines-activite",
      "/domaines-activite/installations-electriques",
      "/domaines-activite/infrastructures-reseaux-electriques",
      "/realisations",
      "/contact",
      "/carrieres",
      "/mentions-legales",
      "/politique-de-confidentialite",
    ],
    gated: [
      "/a-propos",
      "/domaines-activite/eclairage-public",
      "/domaines-activite/energies-renouvelables",
      "/domaines-activite/fourniture-equipements",
      "/realisations/projet-non-publie",
    ],
  },
  "p1-recrutement": {
    open: [
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
    ],
    gated: [
      "/domaines-activite/energies-renouvelables",
      "/domaines-activite/fourniture-equipements",
      "/moyens-et-competences",
      "/references-et-partenaires",
      "/actualites",
      "/realisations/projet-non-publie",
    ],
  },
}

SCENARIO_EXPECTATIONS["p1-hero-image"] = SCENARIO_EXPECTATIONS.p1

/** Routes that must answer 404 in every scenario (reserved and unknown). */
const ALWAYS_404 = ["/en", "/cette-page-n-existe-pas"]

const argv = process.argv.slice(2)
const argValue = (name) => {
  const index = argv.indexOf(name)
  return index >= 0 ? argv[index + 1] : undefined
}
const only = argValue("--scenario")
const noBuild = argv.includes("--no-build")
const scenarios = only ? [only] : SCENARIOS

for (const scenario of scenarios) {
  if (!SCENARIOS.includes(scenario)) {
    throw new Error(`unknown scenario "${scenario}"; known: ${SCENARIOS.join(", ")}`)
  }
}

/** @type {Record<string, unknown>} */
const report = {
  meta: {
    ticket: 33,
    commit: currentCommit(),
    timestamp: timestamp(),
    node: process.version,
    playwrightCore: packageVersion("playwright-core"),
    axeCore: packageVersion("axe-core"),
    chrome: CHROME_BIN,
    method:
      "each scenario is built from a clean .next (CONTENT_SCENARIO=<name>) and served with " +
      "`next start`; every matrix + sitemap route is fetched over HTTP and scanned as served HTML",
  },
  scenarios: {},
  pass: false,
}

/** @type {{ label: string, findings: object[] }[]} */
const allChecks = []

/** Compare two route sets (sorted) and return a readable difference list. */
function setDifference(expected, actual, label) {
  const expectedSet = new Set(expected)
  const actualSet = new Set(actual)
  const missing = [...expectedSet].filter((route) => !actualSet.has(route))
  const unexpected = [...actualSet].filter((route) => !expectedSet.has(route))
  return missing.length + unexpected.length > 0
    ? [{ key: label, missing, unexpected }]
    : []
}

async function auditScenario(scenario) {
  const expected = SCENARIO_EXPECTATIONS[scenario]
  if (!expected) throw new Error(`no independent expectation for scenario "${scenario}"`)

  if (!noBuild) buildScenario(scenario, baseUrl)
  const server = await startServer({ scenario, baseUrl })
  try {
    log(`scanning scenario "${scenario}" at ${baseUrl}`)
    const sitemapPaths = await fetchSitemapPaths(baseUrl)
    const routes = auditRoutes(sitemapPaths)
    const documents = new Map()
    const statuses = {}
    const claimFindings = []
    const claimExceptions = []
    const structuredDataFindings = []
    const mediaFindings = []
    const mediaAllowed = []
    const linkFindings = []
    const linkAllowed = []
    const privacyFindings = []
    const privacyByRoute = {}

    // Fetch the whole matrix first so the tier's 404 set can drive the link
    // audit (a link is gated only when its target is closed in this corpus).
    for (const route of routes) {
      const document = await fetchDocument(baseUrl, route)
      statuses[route] = document.status
      documents.set(route, {
        html: document.html,
        status: document.status,
        setCookies: document.setCookies,
      })
    }
    const gatedLinkTargets = [...expected.gated, ...ALWAYS_404]

    for (const route of routes) {
      const document = documents.get(route)
      const claims = analyseClaims(document.html, { scenario, route })
      claimFindings.push(...claims.findings.map((finding) => ({ route, ...finding })))
      claimExceptions.push(...claims.allowed.map((finding) => ({ route, ...finding })))

      structuredDataFindings.push(
        ...analyseStructuredData(document.html).map((finding) => ({ route, ...finding }))
      )

      const media = analyseMedia(document.html, { scenario, route })
      mediaFindings.push(...media.findings.map((finding) => ({ route, ...finding })))
      mediaAllowed.push(...media.allowed.map((finding) => ({ route, ...finding })))

      const links = analyseLinks(document.html, {
        scenario,
        route,
        gatedRoutes: gatedLinkTargets,
      })
      linkFindings.push(...links.findings.map((finding) => ({ route, ...finding })))
      linkAllowed.push(...links.allowed.map((finding) => ({ route, ...finding })))

      const privacy = analysePrivacy(document.html, {
        setCookies: document.setCookies,
      })
      if (privacy.length > 0) privacyByRoute[route] = privacy
      privacyFindings.push(...privacy.map((finding) => ({ route, ...finding })))
    }

    const statusFindings = []
    // The sitemap must be exactly the published set of this scenario.
    statusFindings.push(
      ...setDifference(expected.open, sitemapPaths, "sitemap-set")
    )
    // Every expected published route must answer 200.
    for (const route of expected.open) {
      if (statuses[route] !== 200) {
        statusFindings.push({ route, expected: 200, actual: statuses[route] })
      }
    }
    // Every expected gated route must answer 404.
    for (const route of expected.gated) {
      if (statuses[route] !== 404) {
        statusFindings.push({ route, expected: 404, actual: statuses[route] })
      }
    }
    for (const route of ALWAYS_404) {
      if (statuses[route] !== 404) {
        statusFindings.push({ route, expected: 404, actual: statuses[route] })
      }
    }
    // No server error and no redirect anywhere in the audited matrix.
    for (const [route, status] of Object.entries(statuses)) {
      if (status >= 300 && status < 400) {
        statusFindings.push({ route, unexpected: `redirect ${status}` })
      }
      if (status >= 500) {
        statusFindings.push({ route, unexpected: `server error ${status}` })
      }
    }

    const clearedFactFindings = analyseClearedFacts(documents)
    const checks = [
      { label: `${scenario}: gate/status matrix`, findings: statusFindings },
      { label: `${scenario}: gated-claim absence`, findings: claimFindings },
      {
        label: `${scenario}: structured-data gated types/properties`,
        findings: structuredDataFindings,
      },
      { label: `${scenario}: photograph/logo absence`, findings: mediaFindings },
      {
        label: `${scenario}: link audit (gated route/phone/social/mailbox)`,
        findings: linkFindings,
      },
      {
        label: `${scenario}: no analytics/consent/form/cookie`,
        findings: privacyFindings,
      },
      {
        label: `${scenario}: cleared facts render`,
        findings: clearedFactFindings,
      },
    ]
    allChecks.push(...checks)

    report.scenarios[scenario] = {
      sitemapPaths,
      routesAudited: routes.length,
      statuses,
      checks,
      claims: {
        findings: claimFindings,
        documentedExceptions: claimExceptions,
        structuredDataFindings,
        mediaFindings,
        mediaAllowed,
        linkFindings,
        linkAllowed,
      },
      privacy: { findings: privacyFindings, byRoute: privacyByRoute },
      clearedFactFindings,
    }

    log(
      `${scenario}: ${routes.length} routes — claim=${claimFindings.length} ` +
        `privacy=${privacyFindings.length} gate=${statusFindings.length} cleared=${clearedFactFindings.length} finding(s)`
    )
  } finally {
    await server.stop()
  }
}

try {
  // Build/serve sequentially: one production build at a time (memory-tight host).
  for (const scenario of scenarios) {
    await auditScenario(scenario)
  }

  const failed = allChecks.filter((check) => check.findings.length > 0)
  report.pass = failed.length === 0
  report.summary = {
    scenarios: scenarios.length,
    checks: allChecks.length,
    passed: allChecks.length - failed.length,
    failed: failed.map((check) => check.label),
    claimFindings: Object.values(report.scenarios).reduce(
      (total, scenario) => total + scenario.claims.findings.length,
      0
    ),
    privacyFindings: Object.values(report.scenarios).reduce(
      (total, scenario) => total + scenario.privacy.findings.length,
      0
    ),
  }
  writeJson(path.join(AUDIT_DIR, "claims-results.json"), report)
  log(
    `${report.summary.passed}/${report.summary.checks} checks passed across ` +
      `${report.summary.scenarios} scenario(s) — evidence docs/build/p1-audit/claims-results.json`
  )
  for (const check of allChecks) {
    if (check.findings.length === 0) continue
    log(`  FAIL ${check.label}: ${JSON.stringify(check.findings.slice(0, 5))}`)
  }
  assertNoFindings(failed)
  process.exitCode = 0
} catch (error) {
  writeJson(path.join(AUDIT_DIR, "claims-results.json"), report)
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
