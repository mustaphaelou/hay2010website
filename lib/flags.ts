/**
 * Application flags and deployment environment — one code-owned module for the
 * server runtime. They are deployment safety switches, never content: they are
 * read from the server environment at request time, so one image serves staging
 * and production (docs/ops/runbook.md, "Environment").
 *
 * Nothing here may be exposed through a `NEXT_PUBLIC_*` variable: `SITE_ENV` and
 * `FORMS_ENABLED` are runtime decisions, not build-time inlines.
 */

export type SiteEnv = "production" | "staging"

/**
 * `SITE_ENV=staging` marks a non-indexable staging deployment. Any other value,
 * including unset, is production: the switch fails closed.
 */
export function siteEnv(): SiteEnv {
  return process.env.SITE_ENV?.trim().toLowerCase() === "staging"
    ? "staging"
    : "production"
}

/** Convenience predicate; #32's `app/robots.ts` must reuse this, not a copy. */
export function isStaging(): boolean {
  return siteEnv() === "staging"
}

/**
 * Forms are hard-disabled in P1, with two independent locks:
 *
 *  1. `FORMS_IMPLEMENTED_IN_P1` — a code floor, `false` for the whole P1 build.
 *     A later ticket must lift it in the same change that adds the form.
 *  2. `FORMS_ENABLED` — the deployment kill switch, off by default (decision
 *     §6.6). It is only consulted once the code floor is lifted.
 *
 * Both must hold before any form UI or Server Action may render. Flipping the
 * environment variable alone can never expose a form that does not exist, and
 * anything but the exact string "true" disables the flag (fail-closed).
 */
const FORMS_IMPLEMENTED_IN_P1: boolean = false

/** The raw environment switch: `FORMS_ENABLED=true` only. */
export function formsFlagEnabled(): boolean {
  return process.env.FORMS_ENABLED?.trim().toLowerCase() === "true"
}

/**
 * Effective value: may a form render anywhere? `false` in P1 regardless of the
 * environment. `/api/health` reports this so the switch is observable.
 */
export function formsEnabled(): boolean {
  return FORMS_IMPLEMENTED_IN_P1 && formsFlagEnabled()
}
