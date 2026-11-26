import { describe, expect, it } from "vitest"

import { baseUrl } from "./helpers"

/**
 * `/api/health` — the endpoint Coolify and the container HEALTHCHECK poll
 * before switching traffic (docs/hosting/deployment-decision.md §6.4).
 *
 * The shared harness starts the production server without `DATABASE_URL`, so
 * this file covers the database-free mode. The database-up and database-down
 * modes are covered by `scripts/check-ops.mjs`, which starts its own servers
 * with each environment.
 */

interface HealthBody {
  status: string
  checks: { app: string; database: string }
  features: { forms: boolean }
}

async function fetchHealth(): Promise<{
  status: number
  headers: Headers
  body: HealthBody
  text: string
}> {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { accept: "application/json" },
  })
  const text = await response.text()
  return {
    status: response.status,
    headers: response.headers,
    body: JSON.parse(text) as HealthBody,
    text,
  }
}

describe("/api/health over HTTP", () => {
  it("answers 200 with a JSON health report", async () => {
    const health = await fetchHealth()

    expect(health.status).toBe(200)
    expect(health.headers.get("content-type") ?? "").toMatch(
      /^application\/json/
    )
    expect(health.body.status).toBe("ok")
    expect(health.body.checks.app).toBe("ok")
  })

  it("skips the database check when DATABASE_URL is not configured", async () => {
    const health = await fetchHealth()

    expect(health.headers.get("content-type") ?? "").toMatch(
      /^application\/json/
    )
    // The harness starts the server without DATABASE_URL: the report must say
    // so rather than pretend a database was checked.
    expect(health.body.checks.database).toBe("skipped")
  })

  it("is never cached by a proxy or the browser", async () => {
    const health = await fetchHealth()

    expect(health.headers.get("cache-control") ?? "").toMatch(/no-store/)
  })

  it("reports the forms kill switch as hard-off in P1", async () => {
    const health = await fetchHealth()

    // P1 renders no form at all (docs/hosting/deployment-decision.md §7,
    // docs/forms/contact-careers-forms.md): the gate is observable in health.
    expect(health.body.features.forms).toBe(false)
  })

  it("exposes no connection string, credential or stack trace", async () => {
    const health = await fetchHealth()

    expect(health.text).not.toMatch(/postgres(?:ql)?:\/\//i)
    expect(health.text).not.toMatch(/password|secret|token|api[_-]?key/i)
    expect(health.text).not.toMatch(/\bat\s+\S+\s+\(.*:\d+:\d+\)/) // stack frames
  })
})
