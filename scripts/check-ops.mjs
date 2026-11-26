#!/usr/bin/env node
/**
 * Operations-level verification of the deployable artefact — the checks that
 * need *different server environments*, which the shared HTTP suite cannot
 * cover because it starts exactly one server (ticket #31, docs/ops/deploy.md).
 *
 * Covered here:
 *  - `output: "standalone"` produced the runtime artefact (`.next/standalone`);
 *  - `/api/health` without `DATABASE_URL`: 200, database check skipped;
 *  - `/api/health` with an unreachable database: 503, no credential leaked;
 *  - `/api/health` with a wrong-scheme database URL: 503 (fails closed);
 *  - `FORMS_ENABLED=true` still renders no form and health keeps forms off
 *    (the P1 code floor);
 *  - `SITE_ENV=staging` adds `X-Robots-Tag: noindex, nofollow` to `/`, to a 404
 *    and to `/api/health`; the default environment adds it nowhere.
 *
 * It runs against the existing production build (`npm run build`, or the build
 * made by `npm test` just before it) and starts `next start` once per scenario
 * on `OPS_CHECK_PORT` (default 3131). It is wired into CI after `npm test`.
 *
 * Optional: set `OPS_DATABASE_URL` to additionally prove the database-up leg
 * (requires a reachable Postgres; `scripts/rehearse-backup-restore.sh` sets it).
 */
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { once } from "node:events"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const port = process.env.OPS_CHECK_PORT ?? "3131"
const hostname = "127.0.0.1"
const baseUrl = `http://${hostname}:${port}`
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next")
const READINESS_TIMEOUT_MS = 60_000
const SERVER_STOP_TIMEOUT_MS = 5_000
const STDERR_KEEP = 8_000

const results = []

/** @param {string} message */
function log(message) {
  console.log(`[check-ops] ${message}`)
}

/** @param {number} ms */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** @param {string} name */
function pass(name) {
  results.push({ name, ok: true })
  log(`PASS  ${name}`)
}

/**
 * @param {string} name
 * @param {string} detail
 */
function fail(name, detail) {
  results.push({ name, ok: false, detail })
  log(`FAIL  ${name}\n        ${detail.replace(/\n/g, "\n        ")}`)
}

/**
 * Run one named assertion, reporting instead of throwing.
 * @param {string} name
 * @param {() => void | Promise<void>} check
 */
async function check(name, check) {
  try {
    await check()
    pass(name)
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error))
  }
}

/** @param {string} message */
function assert(message, condition) {
  if (!condition) throw new Error(message)
}

/**
 * Start the production server for one scenario.
 * @param {Record<string, string | undefined>} overrides
 * @param {(server: import("node:child_process").ChildProcess) => Promise<void>} run
 */
async function withServer(overrides, run) {
  if (await isPortServing()) {
    throw new Error(
      `something is already serving ${baseUrl}; stop it or set OPS_CHECK_PORT`
    )
  }

  const env = { ...process.env, NODE_ENV: "production" }
  for (const key of ["DATABASE_URL", "SITE_ENV", "FORMS_ENABLED"]) {
    delete env[key]
  }
  Object.assign(env, overrides)

  let stderr = ""
  const server = spawn(
    process.execPath,
    [nextBin, "start", "-p", port, "-H", hostname],
    { cwd: projectRoot, stdio: ["ignore", "ignore", "pipe"], env }
  )
  server.stderr?.setEncoding("utf8")
  server.stderr?.on("data", (chunk) => {
    stderr = (stderr + chunk).slice(-STDERR_KEEP)
  })

  try {
    await waitForServer(server)
    await run(server)
  } catch (error) {
    if (stderr.trim()) {
      console.error(`[check-ops] server stderr (${JSON.stringify(overrides)}):\n${stderr.trim()}`)
    }
    throw error
  } finally {
    await stopServer(server)
  }
}

async function isPortServing() {
  try {
    await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(1_500) })
    return true
  } catch {
    return false
  }
}

/** @param {import("node:child_process").ChildProcess} server */
async function waitForServer(server) {
  const deadline = Date.now() + READINESS_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error(`the production server exited before answering (code ${server.exitCode})`)
    }
    try {
      const response = await fetch(`${baseUrl}/`, {
        signal: AbortSignal.timeout(2_000),
      })
      if (response.status > 0) return
    } catch {
      // Not listening yet.
    }
    await delay(250)
  }
  throw new Error(`the production server did not answer within ${READINESS_TIMEOUT_MS}ms`)
}

/** @param {import("node:child_process").ChildProcess} server */
async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) return
  server.kill("SIGTERM")
  const stopped = await Promise.race([
    once(server, "exit").then(() => true),
    delay(SERVER_STOP_TIMEOUT_MS).then(() => false),
  ])
  if (!stopped && server.exitCode === null && server.signalCode === null) {
    server.kill("SIGKILL")
    await once(server, "exit").catch(() => {})
  }
}

/**
 * @param {string} pathname
 * @returns {Promise<{status: number, headers: Headers, text: string, json: any}>}
 */
async function get(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: "manual",
    headers: { accept: "text/html,application/json" },
  })
  const text = await response.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = undefined
  }
  return { status: response.status, headers: response.headers, text, json }
}

// ---------------------------------------------------------------------------
// Scenario: default environment (production, no database, forms env unset)
// ---------------------------------------------------------------------------
async function scenarioDefault() {
  log(`scenario default environment on ${baseUrl}`)
  await withServer({}, async () => {
    await check("standalone runtime artefact exists (.next/standalone/server.js)", () => {
      assert(
        `missing ${path.join(projectRoot, ".next", "standalone", "server.js")}: ` +
          `next.config.ts must set output: "standalone" and the build must have run`,
        existsSync(path.join(projectRoot, ".next", "standalone", "server.js"))
      )
    })

    await check("production responses carry no X-Robots-Tag", async () => {
      for (const pathname of ["/", "/route-inexistante-31"]) {
        const response = await get(pathname)
        assert(
          `${pathname} must not advertise a staging directive (got ${JSON.stringify(response.headers.get("x-robots-tag"))})`,
          response.headers.get("x-robots-tag") === null
        )
      }
    })

    await check("/api/health is 200 and skips the database check", async () => {
      const health = await get("/api/health")
      assert(`expected 200, got ${health.status}`, health.status === 200)
      assert(`expected JSON, got ${health.headers.get("content-type")}`, /^application\/json/.test(health.headers.get("content-type") ?? ""))
      assert(`expected status ok, got ${health.json?.status}`, health.json?.status === "ok")
      assert(
        `expected checks.database skipped, got ${health.json?.checks?.database}`,
        health.json?.checks?.database === "skipped"
      )
      assert(`expected no-store, got ${health.headers.get("cache-control")}`, /no-store/.test(health.headers.get("cache-control") ?? ""))
    })

    await check("no public page renders a form control", async () => {
      const page = await get("/")
      for (const tag of ["<form", "<input", "<textarea", "<select"]) {
        assert(
          `default environment renders ${tag} in /`,
          !new RegExp(`${tag}[\\s>]`, "i").test(page.text)
        )
      }
    })
  })
}

// ---------------------------------------------------------------------------
// Scenario: staging — every response is noindex, nofollow
// ---------------------------------------------------------------------------
async function scenarioStaging() {
  log("scenario SITE_ENV=staging")
  await withServer({ SITE_ENV: "staging" }, async () => {
    await check("staging sets X-Robots-Tag on /", async () => {
      const page = await get("/")
      assert(`expected 200, got ${page.status}`, page.status === 200)
      assert(
        `expected "noindex, nofollow", got ${JSON.stringify(page.headers.get("x-robots-tag"))}`,
        (page.headers.get("x-robots-tag") ?? "").replace(/\s+/g, " ").trim() === "noindex, nofollow"
      )
    })

    await check("staging sets X-Robots-Tag on a 404 document", async () => {
      const page = await get("/route-inexistante-31")
      assert(`expected 404, got ${page.status}`, page.status === 404)
      assert(
        `expected "noindex, nofollow", got ${JSON.stringify(page.headers.get("x-robots-tag"))}`,
        (page.headers.get("x-robots-tag") ?? "").replace(/\s+/g, " ").trim() === "noindex, nofollow"
      )
    })

    await check("staging sets X-Robots-Tag on the health endpoint", async () => {
      const health = await get("/api/health")
      assert(`expected 200, got ${health.status}`, health.status === 200)
      assert(
        `expected "noindex, nofollow", got ${JSON.stringify(health.headers.get("x-robots-tag"))}`,
        (health.headers.get("x-robots-tag") ?? "").replace(/\s+/g, " ").trim() === "noindex, nofollow"
      )
    })
  })
}

// ---------------------------------------------------------------------------
// Scenario: forms forced on by the environment must still expose nothing
// ---------------------------------------------------------------------------
async function scenarioFormsForcedOn() {
  log("scenario FORMS_ENABLED=true (the P1 code floor must hold)")
  await withServer({ FORMS_ENABLED: "true" }, async () => {
    await check("FORMS_ENABLED=true cannot enable forms in P1 health report", async () => {
      const health = await get("/api/health")
      assert(`expected 200, got ${health.status}`, health.status === 200)
      assert(
        `features.forms must stay false, got ${JSON.stringify(health.json?.features)}`,
        health.json?.features?.forms === false
      )
    })

    await check("FORMS_ENABLED=true still renders no form control on /", async () => {
      const page = await get("/")
      for (const tag of ["<form", "<input", "<textarea", "<select"]) {
        assert(
          `FORMS_ENABLED=true renders ${tag} in /`,
          !new RegExp(`${tag}[\\s>]`, "i").test(page.text)
        )
      }
    })
  })
}

// ---------------------------------------------------------------------------
// Scenario: a configured database that cannot answer fails the probe closed
// ---------------------------------------------------------------------------
async function scenarioDatabaseDown() {
  log("scenario unreachable DATABASE_URL")
  await withServer(
    { DATABASE_URL: "postgres://health:not-a-real-secret@127.0.0.1:59999/healthcheck" },
    async () => {
      await check("unreachable database makes /api/health 503", async () => {
        const health = await get("/api/health")
        assert(`expected 503, got ${health.status}`, health.status === 503)
        assert(`expected status error, got ${health.json?.status}`, health.json?.status === "error")
        assert(
          `expected checks.database error, got ${health.json?.checks?.database}`,
          health.json?.checks?.database === "error"
        )
      })

      await check("the failing probe leaks no connection detail", async () => {
        const health = await get("/api/health")
        assert(
          "response body must not contain a postgres URL, a password or a stack frame",
          !/postgres(?:ql)?:\/\//i.test(health.text) &&
            !/not-a-real-secret|password|ECONNREFUSED|127\.0\.0\.1/i.test(health.text) &&
            !/\bat .*:\d+:\d+/.test(health.text)
        )
      })
    }
  )

  log("scenario wrong-scheme DATABASE_URL")
  await withServer({ DATABASE_URL: "mysql://user:pass@127.0.0.1:3306/db" }, async () => {
    await check("a non-Postgres DATABASE_URL fails the probe closed", async () => {
      const health = await get("/api/health")
      assert(`expected 503, got ${health.status}`, health.status === 503)
      assert(
        `expected checks.database error, got ${health.json?.checks?.database}`,
        health.json?.checks?.database === "error"
      )
    })
  })
}

// ---------------------------------------------------------------------------
// Scenario: a reachable database passes the probe (opt-in)
// ---------------------------------------------------------------------------
async function scenarioDatabaseUp() {
  const databaseUrl = process.env.OPS_DATABASE_URL
  if (!databaseUrl) {
    log("scenario reachable DATABASE_URL — skipped (set OPS_DATABASE_URL to run it)")
    return
  }
  log("scenario reachable DATABASE_URL")
  await withServer({ DATABASE_URL: databaseUrl }, async () => {
    await check("reachable database makes /api/health 200 with database ok", async () => {
      const health = await get("/api/health")
      assert(`expected 200, got ${health.status}`, health.status === 200)
      assert(
        `expected checks.database ok, got ${health.json?.checks?.database}`,
        health.json?.checks?.database === "ok"
      )
    })
  })
}

async function main() {
  // Fail fast and clearly when the build is missing, instead of per-scenario.
  if (!existsSync(path.join(projectRoot, ".next", "BUILD_ID"))) {
    console.error(
      "[check-ops] no production build found (.next/BUILD_ID missing). " +
        "Run `npm run build` (or `npm test`) first."
    )
    return 1
  }

  log(`node ${process.versions.node} · next start on ${baseUrl}`)

  const scenarios = [
    scenarioDefault,
    scenarioStaging,
    scenarioFormsForcedOn,
    scenarioDatabaseDown,
    scenarioDatabaseUp,
  ]

  for (const scenario of scenarios) {
    try {
      await scenario()
    } catch (error) {
      fail(
        `${scenario.name} scenario`,
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  const failed = results.filter((result) => !result.ok)
  log(
    `${results.length - failed.length}/${results.length} checks passed`
  )
  return failed.length === 0 ? 0 : 1
}

const status = await main()
process.exitCode = status
