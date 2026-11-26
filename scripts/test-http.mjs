#!/usr/bin/env node
/**
 * One command that verifies the site the way a visitor or a crawler sees it.
 *
 *   1. for each fixture scenario (`content/fixtures/scenarios/`):
 *        a. builds the production app with `CONTENT_SCENARIO=<scenario>`
 *           (from a clean `.next`, so the static prerender really follows the
 *           scenario) unless SKIP_BUILD=1;
 *        b. starts the production server on TEST_HTTP_PORT with the same
 *           environment;
 *        c. waits until it answers;
 *        d. runs the single HTTP suite (`vitest run`) with
 *           `TEST_HTTP_SCENARIO=<scenario>`;
 *        e. always stops the server;
 *   2. stops at the first failing scenario and exits with its status.
 *
 * The built artefact is the production build with its normal static
 * prerendering, fonts and metadata; only the fixture scenario changes between
 * groups. With SKIP_BUILD=1 the existing `.next` is reused and one scenario
 * runs (`TEST_HTTP_SCENARIO`, default p1) — fast iteration only, never the gate.
 *
 * Later tickets extend the suite, never this orchestrator (see
 * docs/build/verification.md and docs/build/content-seam.md).
 */
import { spawn, spawnSync } from "node:child_process"
import { once } from "node:events"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const port = process.env.TEST_HTTP_PORT ?? "3100"
const hostname = "127.0.0.1"
const baseUrl = `http://${hostname}:${port}`
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next")
const vitestBin = path.join(projectRoot, "node_modules", "vitest", "vitest.mjs")

/**
 * Fixture scenarios to run. Each name is a file in
 * `content/fixtures/scenarios/<name>.json`; the suite's expectations live in
 * `tests/http/scenarios.ts`.
 */
const SCENARIOS = ["p1", "p2", "p3", "p1-gates-closed"]

const READINESS_TIMEOUT_MS = 60_000
const SERVER_STOP_TIMEOUT_MS = 5_000
/** Keep the last chunk of server stderr to explain a startup failure. */
const STDERR_KEEP = 20_000

/** @param {string} message */
function log(message) {
  console.log(`\n[http-test] ${message}`)
}

/** @param {number} ms */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Run a child process to completion and return its exit status.
 * @param {string[]} args
 * @param {import("node:child_process").SpawnSyncOptionsWithStringEncoding} [options]
 */
function run(args, options = {}) {
  const result = spawnSync(process.execPath, args, {
    cwd: projectRoot,
    stdio: "inherit",
    ...options,
  })
  if (result.error) throw result.error
  return result.status ?? 1
}

/** Is something already answering on the test port? */
async function isPortServing() {
  try {
    await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(1_500) })
    return true
  } catch {
    return false
  }
}

/**
 * Wait until the production server answers any HTTP response.
 * @param {import("node:child_process").ChildProcess} server
 */
async function waitForServer(server) {
  const deadline = Date.now() + READINESS_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error(`the production server exited before answering (code ${server.exitCode})`)
    }
    try {
      const response = await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(2_000) })
      if (response.status > 0) return
    } catch {
      // Not listening yet.
    }
    await delay(250)
  }
  throw new Error(`the production server did not answer within ${READINESS_TIMEOUT_MS}ms`)
}

/**
 * Stop the production server, escalating to SIGKILL if it ignores SIGTERM.
 * @param {import("node:child_process").ChildProcess} server
 */
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
 * Start the production server for one fixture scenario.
 * @param {string} scenario
 */
async function startServer(scenario) {
  log(`starting the production server on ${baseUrl} (CONTENT_SCENARIO=${scenario})`)
  let stderr = ""
  const server = spawn(process.execPath, [nextBin, "start", "-p", port, "-H", hostname], {
    cwd: projectRoot,
    stdio: ["ignore", "ignore", "pipe"],
    env: {
      ...process.env,
      NODE_ENV: "production",
      CONTENT_SOURCE: "fixture",
      CONTENT_SCENARIO: scenario,
    },
  })
  server.stderr?.setEncoding("utf8")
  server.stderr?.on("data", (chunk) => {
    stderr = (stderr + chunk).slice(-STDERR_KEEP)
  })

  const interrupt = (signal) => {
    server.kill(signal === "SIGINT" ? "SIGTERM" : signal)
    process.exit(signal === "SIGINT" ? 130 : 143)
  }
  process.once("SIGINT", interrupt)
  process.once("SIGTERM", interrupt)

  try {
    await waitForServer(server)
  } catch (error) {
    await stopServer(server)
    process.removeListener("SIGINT", interrupt)
    process.removeListener("SIGTERM", interrupt)
    if (stderr.trim()) console.error(`[http-test] production server stderr:\n${stderr.trim()}`)
    throw error
  }

  return {
    server,
    stderr: () => stderr,
    /** Stop the server and unregister the signal handlers. */
    async stop() {
      process.removeListener("SIGINT", interrupt)
      process.removeListener("SIGTERM", interrupt)
      await stopServer(server)
    },
  }
}

/** Run the whole HTTP suite against the already-running server for a scenario. */
function runSuite(scenario) {
  return run([vitestBin, "run", "--config", "vitest.config.ts"], {
    env: {
      ...process.env,
      TEST_HTTP_BASE_URL: baseUrl,
      TEST_HTTP_PORT: port,
      TEST_HTTP_SCENARIO: scenario,
    },
  })
}

/**
 * Build the production app for one fixture scenario.
 *
 * The previous `.next` is removed so the static prerender cannot reuse another
 * scenario's pages: the scenario bakes navigation, gate routes, sitemap and 404
 * links at build time, exactly like the production deploy does with the CMS.
 * @param {string} scenario
 */
function buildForScenario(scenario) {
  log(`scenario "${scenario}" — building the production app (next build)`)
  fs.rmSync(path.join(projectRoot, ".next"), { recursive: true, force: true })
  return run([nextBin, "build"], {
    env: { ...process.env, CONTENT_SOURCE: "fixture", CONTENT_SCENARIO: scenario },
  })
}

async function main() {
  const skipBuild = process.env.SKIP_BUILD === "1"
  const scenarios = skipBuild
    ? [(process.env.TEST_HTTP_SCENARIO ?? "p1").trim() || "p1"]
    : SCENARIOS

  if (skipBuild) {
    log(`SKIP_BUILD=1 — reusing the existing .next build for scenario "${scenarios[0]}"`)
    if (scenarios[0] !== "p1") {
      log("note: the existing build must have been produced with the same CONTENT_SCENARIO")
    }
  }

  if (await isPortServing()) {
    console.error(
      `[http-test] something is already serving ${baseUrl}; refusing to test against an unknown server.\n` +
        `[http-test] stop it or pick another TEST_HTTP_PORT.`
    )
    return 1
  }

  for (const scenario of scenarios) {
    if (!skipBuild) {
      const buildStatus = buildForScenario(scenario)
      if (buildStatus !== 0) return buildStatus
    }

    log(`scenario "${scenario}" — starting the production server`)
    const running = await startServer(scenario)
    try {
      log(`scenario "${scenario}" — running the HTTP suite (vitest run)`)
      const testStatus = runSuite(scenario)
      if (testStatus !== 0) {
        const stderr = running.stderr()
        if (stderr.trim()) {
          console.error(`\n[http-test] production server stderr:\n${stderr.trim()}`)
        }
        return testStatus
      }
    } finally {
      await running.stop()
    }
  }

  log(`all ${scenarios.length} scenario group(s) passed: ${scenarios.join(", ")}`)
  return 0
}

main()
  .then((status) => {
    process.exitCode = status
  })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
