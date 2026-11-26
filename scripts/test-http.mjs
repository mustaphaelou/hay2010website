#!/usr/bin/env node
/**
 * One command that verifies the site the way a visitor sees it.
 *
 *   1. builds the production app (`next build`) unless SKIP_BUILD=1;
 *   2. starts it with `next start` on TEST_HTTP_PORT (default 3100);
 *   3. waits until it answers;
 *   4. runs the single HTTP suite (`vitest run`);
 *   5. always stops the server;
 *   6. exits with the test status.
 *
 * Later tickets extend the suite (and may add scenario env vars read by the
 * server), never this orchestrator. See docs/build/verification.md.
 */
import { spawn, spawnSync } from "node:child_process"
import { once } from "node:events"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const port = process.env.TEST_HTTP_PORT ?? "3100"
const hostname = "127.0.0.1"
const baseUrl = `http://${hostname}:${port}`
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next")
const vitestBin = path.join(projectRoot, "node_modules", "vitest", "vitest.mjs")

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

async function main() {
  if (process.env.SKIP_BUILD === "1") {
    log("SKIP_BUILD=1 — reusing the existing .next production build")
  } else {
    log("building the production app (next build)")
    const buildStatus = run([nextBin, "build"])
    if (buildStatus !== 0) return buildStatus
  }

  if (await isPortServing()) {
    console.error(
      `[http-test] something is already serving ${baseUrl}; refusing to test against an unknown server.\n` +
        `[http-test] stop it or pick another TEST_HTTP_PORT.`
    )
    return 1
  }

  log(`starting the production server on ${baseUrl}`)
  let stderr = ""
  const server = spawn(process.execPath, [nextBin, "start", "-p", port, "-H", hostname], {
    cwd: projectRoot,
    stdio: ["ignore", "ignore", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  })
  server.stderr?.setEncoding("utf8")
  server.stderr?.on("data", (chunk) => {
    stderr = (stderr + chunk).slice(-STDERR_KEEP)
  })

  /** @param {NodeJS.Signals} signal */
  const interrupt = (signal) => {
    server.kill(signal === "SIGINT" ? "SIGTERM" : signal)
    process.exit(signal === "SIGINT" ? 130 : 143)
  }
  process.once("SIGINT", interrupt)
  process.once("SIGTERM", interrupt)

  try {
    await waitForServer(server)
    log("running the HTTP suite (vitest run)")
    const testStatus = run([vitestBin, "run", "--config", "vitest.config.ts"], {
      env: { ...process.env, TEST_HTTP_BASE_URL: baseUrl, TEST_HTTP_PORT: port },
    })
    if (testStatus !== 0 && stderr.trim()) {
      console.error(`\n[http-test] production server stderr:\n${stderr.trim()}`)
    }
    return testStatus
  } catch (error) {
    console.error(`[http-test] ${error instanceof Error ? error.message : String(error)}`)
    if (stderr.trim()) console.error(`[http-test] production server stderr:\n${stderr.trim()}`)
    return 1
  } finally {
    process.removeListener("SIGINT", interrupt)
    process.removeListener("SIGTERM", interrupt)
    await stopServer(server)
  }
}

main()
  .then((status) => {
    process.exitCode = status
  })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
