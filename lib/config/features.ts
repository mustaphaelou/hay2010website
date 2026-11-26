/**
 * Code-owned feature gates. These are deployment safety switches, not content:
 * they never live in the CMS and they are read from the server environment, so
 * flipping one is a deploy, not a content edit.
 *
 * P1 has **no form at all** (docs/hosting/deployment-decision.md §7,
 * docs/forms/contact-careers-forms.md §3): no contact form component, no Server
 * Action, no form route. `FORMS_ENABLED` is the deployment kill switch that a
 * later ticket (#12, contact form) will read; it is deliberately layered under a
 * code floor so that setting the environment variable alone can never expose a
 * form that does not exist:
 *
 *  1. `FORMS_IMPLEMENTED` — a code constant. It is `false` for the whole P1
 *     build. A later ticket must flip it in the same change that adds the form.
 *  2. `FORMS_ENABLED` — the environment kill switch, off by default. It is only
 *     consulted when the code floor is already lifted.
 *
 * Both must be true before any form UI or Server Action may render. The health
 * endpoint reports the effective value (`features.forms`), so the switch is
 * observable without exposing anything.
 */

const TRUE_VALUES = new Set(["1", "true", "yes", "on"])
const FALSE_VALUES = new Set(["0", "false", "no", "off", ""])

/**
 * Code floor: P1 ships no form implementation. Do not flip this in P1.
 * The contact form is a post-F-211 decision and its own ticket.
 */
const FORMS_IMPLEMENTED: boolean = false

/**
 * Parse a boolean environment flag. Unset, empty or unrecognised values resolve
 * to `false`: an unreadable value must never enable a feature.
 */
function isFlagOn(value: string | undefined): boolean {
  if (value === undefined) return false
  const normalised = value.trim().toLowerCase()
  if (FALSE_VALUES.has(normalised)) return false
  return TRUE_VALUES.has(normalised)
}

/**
 * Whether a form may render anywhere in the site. `false` in P1, regardless of
 * `FORMS_ENABLED`, because no form is implemented.
 */
export function isFormsEnabled(): boolean {
  return FORMS_IMPLEMENTED && isFlagOn(process.env.FORMS_ENABLED)
}
