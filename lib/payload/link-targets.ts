/**
 * Internal link targets — the code-owned enum every CMS link field points at
 * (content model §5.1: « Target is an internal route enum, not a free URL »).
 *
 * The owner picks a target by name in the admin; the URL is resolved here, so a
 * CMS editor can never inject an external URL, a javascript: URI, a gated route
 * or a typo into the navigation. The router consuming this enum stays the only
 * place that knows a route, and the published-gate check stays with the content
 * provider (a link to a page whose gate is closed is omitted, never rendered).
 *
 * The `mailto:` targets are code-owned too: they are the approved contact
 * channel and the approved reference-request wording, never free text.
 */
import { COMPANY } from "../site/company"

/** One selectable link target: stable value, French admin label, resolved href. */
export interface LinkTarget {
  readonly value: string
  readonly label: string
  readonly href: string
}

/** Approved reference-request subject line (already percent-encoded). */
export const REFERENCES_REQUEST_SUBJECT = "Demande%20de%20r%C3%A9f%C3%A9rences"

export const LINK_TARGETS: readonly LinkTarget[] = [
  { value: "accueil", label: "Accueil (/)", href: "/" },
  { value: "a-propos", label: "À propos (/a-propos)", href: "/a-propos" },
  {
    value: "domaines-activite",
    label: "Domaines d’activité (/domaines-activite)",
    href: "/domaines-activite",
  },
  { value: "realisations", label: "Réalisations (/realisations)", href: "/realisations" },
  { value: "contact", label: "Contact (/contact)", href: "/contact" },
  { value: "carrieres", label: "Carrières (/carrieres)", href: "/carrieres" },
  {
    value: "contact-mailto",
    label: "E-mail de contact (contact@hay2010.ma)",
    href: `mailto:${COMPANY.email}`,
  },
  {
    value: "references-mailto",
    label: "Demande de références (e-mail pré-rempli)",
    href: `mailto:${COMPANY.email}?subject=${REFERENCES_REQUEST_SUBJECT}`,
  },
]

/** Payload `select` options: the admin never shows the resolved URL as writable. */
export const LINK_TARGET_OPTIONS = LINK_TARGETS.map(({ label, value }) => ({
  label,
  value,
}))

/** Resolve a stored target value to its href; unknown values resolve to `null`. */
export function resolveLinkTarget(value: unknown): string | null {
  if (typeof value !== "string") return null
  return LINK_TARGETS.find((target) => target.value === value)?.href ?? null
}
