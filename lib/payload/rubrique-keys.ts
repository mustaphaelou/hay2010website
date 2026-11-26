/**
 * Content keys of the P1 rubriques — the bridge between the code-owned rubrique
 * registry (`lib/site/rubriques.ts`) and the `pages` collection's `key` field.
 *
 * The keys are code-owned (content model §3): the admin picks a page by its
 * stable key, it never types a route, a nav label or a gate. These literals are
 * the TypeScript source of truth for the select options; the `Record<RubriqueKey, …>`
 * type makes a missing/extra key a compile error, and the content adapter maps
 * every document back through this list.
 *
 * They stay a literal module (no import of the app seam or of `RUBRIQUES`) so
 * the Payload CLI can load `payload.config.ts` without pulling the fixture
 * corpus or the frontend into the config graph. #30 may derive the admin labels
 * from the registry once the content types land.
 */
import type { RubriqueKey } from "../content/types"

/** French admin labels, one per rubrique key. */
const PAGE_LABELS: Readonly<Record<RubriqueKey, string>> = {
  accueil: "Accueil",
  "a-propos": "À propos",
  "domaines-activite": "Domaines d’activité",
  realisations: "Réalisations",
  "moyens-et-competences": "Moyens et compétences",
  "references-et-partenaires": "Références et partenaires",
  actualites: "Actualités",
  contact: "Contact",
  carrieres: "Carrières",
  "mentions-legales": "Mentions légales",
  "politique-de-confidentialite": "Politique de confidentialité",
}

/** Registry order (CDC order) — the admin select order. */
export const PAGE_KEYS: readonly RubriqueKey[] = Object.freeze(
  Object.keys(PAGE_LABELS) as RubriqueKey[]
)

/** `options` for the `pages.key` select field. */
export const PAGE_KEY_OPTIONS: ReadonlyArray<{ label: string; value: RubriqueKey }> =
  PAGE_KEYS.map((key) => ({ label: PAGE_LABELS[key], value: key }))

/** Is this value a known rubrique key? Used by the adapter to ignore stray rows. */
export function isRubriqueKey(value: unknown): value is RubriqueKey {
  return typeof value === "string" && PAGE_KEYS.includes(value as RubriqueKey)
}
