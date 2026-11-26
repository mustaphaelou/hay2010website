import { Client } from "pg"

import { formsEnabled } from "@/lib/flags"

/**
 * `/api/health` — the liveness/readiness probe used by the container
 * `HEALTHCHECK` and by Coolify before it switches traffic
 * (docs/hosting/deployment-decision.md §5, §6.4).
 *
 * Contract:
 *  - `200` `{ status: "ok", … }` when the app serves and, if `DATABASE_URL` is
 *    set, a trivial `SELECT 1` succeeds;
 *  - `200` with `checks.database: "skipped"` when `DATABASE_URL` is not set
 *    (fixture mode is legitimate, e.g. this P1 build before #29 adds Payload);
 *  - `503` `{ status: "error", … }` when a configured database cannot answer.
 *
 * The report never contains a connection string, credential, driver message or
 * stack trace: a probe is public, so it says only which check failed.
 */

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type DatabaseCheck = "ok" | "skipped" | "error"

const DATABASE_TIMEOUT_MS = 1_500

const NO_STORE = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
} as const

/**
 * Run the database leg of the probe. A connection attempt is intentionally
 * short-lived and time-boxed: a hung database must fail the probe, not hang it.
 */
async function checkDatabase(): Promise<DatabaseCheck> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return "skipped"

  if (!/^postgres(?:ql)?:\/\//i.test(connectionString)) {
    // A configured database that is not a Postgres URL is a misconfiguration:
    // report it as unhealthy instead of silently skipping the check.
    return "error"
  }

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: DATABASE_TIMEOUT_MS,
    query_timeout: DATABASE_TIMEOUT_MS,
  })

  try {
    await client.connect()
    await client.query("SELECT 1")
    return "ok"
  } catch {
    // Swallow the driver message on purpose: it can carry host names and roles.
    return "error"
  } finally {
    await client.end().catch(() => {})
  }
}

export async function GET(): Promise<Response> {
  const database = await checkDatabase()
  const healthy = database !== "error"

  const report = {
    status: healthy ? "ok" : "error",
    // Identifies the running image; the CI deploy pins the commit sha as the tag
    // and passes it as APP_VERSION (Docker build arg), so a rollback is visible.
    service: "hay2010-website",
    version: process.env.APP_VERSION ?? "dev",
    checks: { app: "ok", database },
    features: { forms: formsEnabled() },
    timestamp: new Date().toISOString(),
  }

  return new Response(JSON.stringify(report), {
    status: healthy ? 200 : 503,
    headers: NO_STORE,
  })
}
