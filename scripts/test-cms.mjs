#!/usr/bin/env node
/**
 * `npm run test:cms` — the CMS acceptance check for ticket #29.
 *
 * It proves, by running rather than by reading:
 *
 * 1. a clean database can be prepared with ONE documented command
 *    (`npm run migrate` applies the committed migrations from empty);
 * 2. the idempotent dev seed creates the accounts, the media records and the
 *    P1 pages the adapter needs;
 * 3. a production build made with `CONTENT_SOURCE=cms` succeeds against that
 *    database (pages are prerendered from the CMS);
 * 4. the embedded Payload admin serves on the same origin, in French;
 * 5. the role matrix, the media rights gate and the CMS-backed P1 route behave
 *    as specified — asserted over HTTP by `tests/cms/**` through Vitest;
 * 6. everything disposable is removed afterwards: the Postgres container, the
 *    local-disk uploads, the CMS build and the server.
 *
 * Requires: Docker with `postgres:16-alpine` (already cached on this host).
 * Uses container `hay2010-pg-29` on port 5529 and HTTP port 3129 — the ticket's
 * dedicated, never-shared names. Never touches `eguidar-*` containers or 3000.
 *
 * `npm test` (the merge gate) stays database-free: this script is separate and
 * never runs in it.
 */
import { spawn, spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const port = process.env.TEST_CMS_HTTP_PORT ?? "3129"
const hostname = "127.0.0.1"
const baseUrl = `http://${hostname}:${port}`
const PG_CONTAINER = "hay2010-pg-29"
const PG_PORT = process.env.TEST_CMS_PG_PORT ?? "5529"
const PG_IMAGE = "postgres:16-alpine"
const DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${PG_PORT}/hay2010`
const PAYLOAD_SECRET = "hay2010-test-cms-only-not-a-secret"
const MEDIA_DIR = path.join(projectRoot, "media")
const NEXT_DIR = path.join(projectRoot, ".next")

const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next")
const vitestBin = path.join(projectRoot, "node_modules", "vitest", "vitest.mjs")
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm"

/** Environment every app command uses: CMS source, disposable database. */
const cmsEnv = {
  ...process.env,
  NODE_ENV: "production",
  NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=4096",
  DATABASE_URL,
  PAYLOAD_SECRET,
  CONTENT_SOURCE: "cms",
  NEXT_PUBLIC_SERVER_URL: baseUrl,
  SITE_ENV: "production",
}

const READINESS_TIMEOUT_MS = 90_000
const POSTGRES_TIMEOUT_MS = 60_000

/** @param {string} message */
function log(message) {
  console.log(`\n[cms-test] ${message}`)
}

/** @param {number} ms */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Run a command to completion, inheriting stdio.
 * @param {string} command
 * @param {string[]} args
 * @param {{ env?: NodeJS.ProcessEnv, capture?: boolean }} [options]
 */
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    env: { ...cmsEnv, ...options.env },
  })
  if (result.error) throw result.error
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  }
}

/**
 * Run an npm script; throw on failure with the script name.
 * @param {string} script
 * @param {{ env?: NodeJS.ProcessEnv, capture?: boolean }} [options]
 */
function runScript(script, options = {}) {
  log(`npm run ${script}`)
  const result = run(npmBin, ["run", script], { env: options.env, capture: options.capture })
  if (result.status !== 0) throw new Error(`npm run ${script} failed with status ${result.status}`)
  return result
}

/** Is something already answering on the CMS HTTP port? */
async function isPortServing() {
  try {
    await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(1_500) })
    return true
  } catch {
    return false
  }
}

/** Start the disposable Postgres container. */
function startPostgres() {
  log(`starting ${PG_IMAGE} as ${PG_CONTAINER} on port ${PG_PORT}`)
  // A previous crashed run may have left the container behind; it is ours
  // (dedicated name) and disposable.
  run("docker", ["rm", "-f", PG_CONTAINER], { capture: true })
  const result = run("docker", [
    "run",
    "-d",
    "--rm",
    "--name",
    PG_CONTAINER,
    "-e",
    "POSTGRES_PASSWORD=postgres",
    "-e",
    "POSTGRES_USER=postgres",
    "-e",
    "POSTGRES_DB=hay2010",
    "-p",
    `${PG_PORT}:5432`,
    PG_IMAGE,
  ])
  if (result.status !== 0) throw new Error("could not start the disposable Postgres container")
}

/** Wait until Postgres accepts connections. */
async function waitForPostgres() {
  const deadline = Date.now() + POSTGRES_TIMEOUT_MS
  while (Date.now() < deadline) {
    const probe = run("docker", ["exec", PG_CONTAINER, "pg_isready", "-U", "postgres", "-d", "hay2010"], {
      capture: true,
    })
    if (probe.status === 0) return
    await delay(500)
  }
  throw new Error(`Postgres did not become ready within ${POSTGRES_TIMEOUT_MS}ms`)
}

/** Start the production server built from the CMS. */
async function startServer() {
  log(`starting the production server on ${baseUrl} (CONTENT_SOURCE=cms)`)
  let stderr = ""
  const server = spawn(process.execPath, [nextBin, "start", "-p", port, "-H", hostname], {
    cwd: projectRoot,
    stdio: ["ignore", "ignore", "pipe"],
    env: cmsEnv,
  })
  server.stderr?.setEncoding("utf8")
  server.stderr?.on("data", (chunk) => {
    stderr = (stderr + chunk).slice(-20_000)
  })

  const deadline = Date.now() + READINESS_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error(`the production server exited before answering (code ${server.exitCode})\n${stderr}`)
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(2_000) })
      if (response.status > 0) return { server, stderr: () => stderr }
    } catch {
      // Not listening yet.
    }
    await delay(250)
  }
  server.kill("SIGKILL")
  throw new Error(`the production server did not answer within ${READINESS_TIMEOUT_MS}ms\n${stderr}`)
}

/** Stop the server, escalating to SIGKILL. */
async function stopServer(server) {
  if (!server || server.exitCode !== null || server.signalCode !== null) return
  server.kill("SIGTERM")
  const stopped = await Promise.race([
    new Promise((resolve) => server.once("exit", () => resolve(true))),
    delay(5_000).then(() => false),
  ])
  if (!stopped && server.exitCode === null && server.signalCode === null) {
    server.kill("SIGKILL")
    await new Promise((resolve) => server.once("exit", resolve)).catch(() => {})
  }
}

/** Remove the disposable database, uploads and (on success) the CMS build. */
function cleanup({ keepBuild }) {
  run("docker", ["rm", "-f", PG_CONTAINER], { capture: true })
  fs.rmSync(MEDIA_DIR, { recursive: true, force: true })
  if (!keepBuild) fs.rmSync(NEXT_DIR, { recursive: true, force: true })
}

/**
 * The committed migration must be environment-independent: `_objectkey` is in
 * the schema even though CI/dev without R2 sets no `S3_BUCKET` (the storage
 * plugin's `alwaysInsertFields`). A database migrated without that column
 * fails at the first upload once S3 is enabled.
 */
function assertSchemaIsStorageIndependent() {
  log("checking the committed migration keeps the storage column in every environment")
  const migrationsDir = path.join(projectRoot, "migrations")
  const files = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".ts"))
    : []
  if (!files.length) throw new Error("no committed migration found in migrations/")
  const sql = files.map((file) => fs.readFileSync(path.join(migrationsDir, file), "utf8")).join("\n")
  if (!sql.includes("_objectkey")) {
    throw new Error(
      "the committed migration does not create media._objectkey — regenerate it with the S3 plugin fields enabled"
    )
  }
}

async function main() {
  if (await isPortServing()) {
    throw new Error(
      `something is already serving ${baseUrl}; stop it or set TEST_CMS_HTTP_PORT to another 312x port`
    )
  }
  const docker = run("docker", ["version", "--format", "{{.Server.Version}}"], { capture: true })
  if (docker.status !== 0) throw new Error("Docker is not available; `npm run test:cms` needs a disposable Postgres")

  assertSchemaIsStorageIndependent()

  // A previous crashed run can leave the local uploads behind; the seed names
  // its files deterministically, so Payload would suffix them (-1) and the
  // filename assertions would no longer match. Start from an empty upload dir.
  fs.rmSync(MEDIA_DIR, { recursive: true, force: true })
  startPostgres()

  /** @type {import("node:child_process").ChildProcess | null} */
  let server = null
  let failed = false

  try {
    await waitForPostgres()

    // 1. migrations from an empty database — the documented one-command setup.
    runScript("migrate")
    const status = runScript("migrate:status", { capture: true })
    const statusOutput = `${status.stdout}${status.stderr}`
    if (!/Ran[\s\S]*Yes|Yes[\s\S]*Ran/u.test(statusOutput.replace(/\u001b\[[0-9;]*m/gu, ""))) {
      throw new Error(`migrate:status did not report a ran migration:\n${statusOutput}`)
    }
    // Re-running must be a no-op: migrations are forward-only and applied once.
    runScript("migrate")

    // 2. idempotent dev seed (accounts, media rights fixtures, P1 pages).
    runScript("seed")

    // 3. production build from the CMS (pages are prerendered from Postgres).
    log("rm -rf .next && npm run build (CONTENT_SOURCE=cms)")
    fs.rmSync(NEXT_DIR, { recursive: true, force: true })
    runScript("build")

    // 4. boot and run the HTTP assertions.
    const running = await startServer()
    server = running.server
    log(`running tests/cms against ${baseUrl}`)
    const tests = run(process.execPath, [vitestBin, "run", "--config", "vitest.cms.config.ts"], {
      capture: false,
      env: { ...process.env, CMS_TEST_BASE_URL: baseUrl },
    })
    if (tests.status !== 0) throw new Error("tests/cms failed")
  } catch (error) {
    failed = true
    throw error
  } finally {
    await stopServer(server)
    cleanup({ keepBuild: failed })
  }
}

main()
  .then(() => {
    log("CMS verification passed — disposable container and uploads removed")
    process.exitCode = 0
  })
  .catch((error) => {
    log("CMS verification FAILED")
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
