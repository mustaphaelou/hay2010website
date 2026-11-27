#!/usr/bin/env node
/**
 * `npm run test:cms` — the CMS acceptance check for tickets #29 and #30.
 *
 * It proves, by running rather than by reading:
 *
 * 1. a clean database can be prepared with ONE documented command
 *    (`npm run migrate` applies the committed migrations from empty) and the
 *    seed is idempotent (a second run is a no-op);
 * 2. the fixture build and the seeded CMS build render the **same P1 site**:
 *    the parity phase captures the P1 route matrix from a fixture build (the
 *    merge-gate default) and from the CMS build, then compares statuses,
 *    metadata, normalised structure/text, navigation/footer links and the
 *    sitemap (`scripts/parity.mjs`). This is the ticket #30 acceptance check for
 *    "the seed reproduces the fixture corpus and the rendered site matches".
 * 3. a production build made with `CONTENT_SOURCE=cms` succeeds against that
 *    database (pages are prerendered from the CMS);
 * 4. the embedded Payload admin serves on the same origin, in French, with the
 *    read-only gate/constants panels;
 * 5. the content-model, roles, gate-visibility, media-rights (including a
 *    revocation), revalidation and gated-families behaviour is asserted over
 *    HTTP by `tests/cms/**` through Vitest;
 * 6. everything disposable is removed afterwards: the Postgres container, the
 *    local-disk uploads, the builds and the servers.
 *
 * Requires: Docker with `postgres:16-alpine` (already cached on this host).
 * Uses container `hay2010-pg-30` on port 5530, the fixture server on 3129 and
 * the CMS server on 3130 (the ticket's dedicated, never-shared ports). Never
 * touches `eguidar-*` containers or 3000.
 *
 * `npm test` (the merge gate) stays database-free: this script is separate and
 * never runs in it.
 */
import { spawn, spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { captureMatrix, compareMatrices } from "./parity.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const hostname = "127.0.0.1"
const CMS_PORT = process.env.TEST_CMS_HTTP_PORT ?? "3130"
const FIXTURE_PORT = process.env.TEST_CMS_FIXTURE_HTTP_PORT ?? "3129"
const cmsBaseUrl = `http://${hostname}:${CMS_PORT}`
const fixtureBaseUrl = `http://${hostname}:${FIXTURE_PORT}`
const PG_CONTAINER = "hay2010-pg-30"
const PG_PORT = process.env.TEST_CMS_PG_PORT ?? "5530"
const PG_IMAGE = "postgres:16-alpine"
const DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${PG_PORT}/hay2010`
const PAYLOAD_SECRET = "hay2010-test-cms-only-not-a-secret"
const MEDIA_DIR = path.join(projectRoot, "media")
const NEXT_DIR = path.join(projectRoot, ".next")
const PARITY_DIR = path.join(NEXT_DIR, "parity")

const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next")
const vitestBin = path.join(projectRoot, "node_modules", "vitest", "vitest.mjs")
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm"

/** Base environment of every app command. */
const baseEnv = {
  ...process.env,
  NODE_ENV: "production",
  NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=4096",
  SITE_ENV: "production",
}

/** The fixture build — the merge-gate default, no database. */
const fixtureEnv = {
  ...baseEnv,
  CONTENT_SOURCE: "fixture",
  CONTENT_SCENARIO: "p1",
  NEXT_PUBLIC_SERVER_URL: fixtureBaseUrl,
  DATABASE_URL: "",
  PAYLOAD_SECRET: "",
}

/** The CMS build and server — disposable database, embedded admin. */
const cmsEnv = {
  ...baseEnv,
  DATABASE_URL,
  PAYLOAD_SECRET,
  CONTENT_SOURCE: "cms",
  NEXT_PUBLIC_SERVER_URL: cmsBaseUrl,
}

const READINESS_TIMEOUT_MS = 120_000
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
    env: { ...baseEnv, ...options.env },
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
  const result = run(npmBin, ["run", script], options)
  if (result.status !== 0) throw new Error(`npm run ${script} failed with status ${result.status}`)
  return result
}

/** Is something already answering on one of the test HTTP ports? */
async function isPortServing(baseUrl) {
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

/** Start the production server built for one content source. */
async function startServer(env, baseUrl, label) {
  log(`starting the production server on ${baseUrl} (${label})`)
  let stderr = ""
  const server = spawn(process.execPath, [nextBin, "start", "-p", new URL(baseUrl).port, "-H", hostname], {
    cwd: projectRoot,
    stdio: ["ignore", "ignore", "pipe"],
    env: { ...baseEnv, ...env },
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

/** Build the app once, from a clean `.next`, with the given environment. */
function build(env, label) {
  log(`rm -rf .next && npm run build (${label})`)
  fs.rmSync(NEXT_DIR, { recursive: true, force: true })
  runScript("build", { env })
}

/** Remove the disposable database, uploads and (on success) the builds. */
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

/**
 * Capture the P1 route matrix under one provider.
 * @param {NodeJS.ProcessEnv} env
 * @param {string} baseUrl
 * @param {string} label
 * @param {string} captureFile
 */
async function captureProviderMatrix(env, baseUrl, label, captureFile) {
  build(env, label)
  const running = await startServer(env, baseUrl, label)
  try {
    log(`capturing the P1 route matrix from ${baseUrl} (${label})`)
    const matrix = await captureMatrix(baseUrl)
    fs.mkdirSync(path.dirname(captureFile), { recursive: true })
    fs.writeFileSync(captureFile, JSON.stringify(matrix, null, 2))
    return matrix
  } finally {
    await stopServer(running.server)
  }
}

async function main() {
  for (const baseUrl of [fixtureBaseUrl, cmsBaseUrl]) {
    if (await isPortServing(baseUrl)) {
      throw new Error(
        `something is already serving ${baseUrl}; stop it or set the TEST_CMS_*_PORT variables to other 31xx ports`
      )
    }
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
    runScript("migrate", { env: cmsEnv })
    const status = runScript("migrate:status", { env: cmsEnv, capture: true })
    const statusOutput = `${status.stdout}${status.stderr}`
    if (!/Ran[\s\S]*Yes|Yes[\s\S]*Ran/u.test(statusOutput.replace(/\u001b\[[0-9;]*m/gu, ""))) {
      throw new Error(`migrate:status did not report a ran migration:\n${statusOutput}`)
    }
    // Re-running must be a no-op: migrations are forward-only and applied once.
    runScript("migrate", { env: cmsEnv })

    // 2. idempotent seed — the fixture corpus; a second run must be a no-op.
    runScript("seed", { env: cmsEnv })
    const secondSeed = runScript("seed", { env: cmsEnv, capture: true })
    if (!`${secondSeed.stdout}${secondSeed.stderr}`.includes("déjà")) {
      throw new Error("the seed is not idempotent: the second run did not report existing records")
    }

    // 3. fixture-vs-CMS parity on the P1 route matrix. Both builds are made
    // from a clean `.next`; the parity captures are kept under `.next/parity/`
    // so a failure can be diffed, and removed with the build on success.
    const fixtureMatrix = await captureProviderMatrix(
      fixtureEnv,
      fixtureBaseUrl,
      "fixture provider, p1 scenario",
      path.join(PARITY_DIR, "fixture-matrix.json")
    )

    build(cmsEnv, "CMS provider, seeded database")
    fs.mkdirSync(PARITY_DIR, { recursive: true })
    const running = await startServer(cmsEnv, cmsBaseUrl, "CMS provider, seeded database")
    server = running.server

    log(`capturing the P1 route matrix from ${cmsBaseUrl} (CMS provider)`)
    const cmsMatrix = await captureMatrix(cmsBaseUrl)
    fs.writeFileSync(path.join(PARITY_DIR, "cms-matrix.json"), JSON.stringify(cmsMatrix, null, 2))

    log("comparing fixture and CMS route matrices")
    const parity = compareMatrices(fixtureMatrix, cmsMatrix)
    console.log(
      `[cms-test] parity OK — ${parity.routes} routes (${parity.openRoutes} published, ${parity.gatedRoutes} gated), ` +
        `${parity.sitemapPaths.length} sitemap URLs identical under both providers`
    )

    // 4. HTTP assertions against the CMS build (they mutate the seeded corpus,
    // which is why the parity phase runs first).
    log(`running tests/cms against ${cmsBaseUrl}`)
    const tests = run(process.execPath, [vitestBin, "run", "--config", "vitest.cms.config.ts"], {
      env: { ...cmsEnv, CMS_TEST_BASE_URL: cmsBaseUrl },
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
    log("CMS verification passed — parity, HTTP suite, disposable container and uploads removed")
    process.exitCode = 0
  })
  .catch((error) => {
    log("CMS verification FAILED")
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
