/**
 * Code-owned content map — the literal contract between the Payload schema and
 * the frontend trames (ticket #30).
 *
 * This module is deliberately dependency-free (no import of the content seam,
 * the fixture corpus or the frontend) so `payload.config.ts` can be loaded by
 * the Payload CLI (`migrate`, `seed`, `generate:types`) without pulling the app
 * graph in. `tests/architecture.test.ts` asserts the literals below still match
 * the runtime registry (`lib/site/rubriques.ts`), so drift is a red test rather
 * than a silent divergence.
 *
 * What lives here:
 * - which rubrique is stored in which global (the page-trame mapping);
 * - the code-owned tier gate and the reasons the admin shows for it;
 * - the code-owned domain gates (Solaire and distribution: never admin-openable);
 * - the labels of the gated families (case studies, actualités, careers mailbox);
 * - the French admin labels of the code-owned content keys.
 *
 * Everything in this file is a decision, not content: the owner cannot edit it
 * from the admin because it is not part of the Payload schema at all.
 */
import type { RubriqueKey, Tier } from "../content/types"

/** Payload global slug that stores one page trame (content model §5.1). */
export type PageGlobalSlug =
  | "homepage"
  | "entreprise"
  | "metiers"
  | "realisations"
  | "contact"
  | "carrieres"
  | "actualites"

/** French admin labels for the code-owned rubrique keys (registry §Navigation). */
export const RUBRIQUE_LABELS: Readonly<Record<RubriqueKey, string>> = {
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

/** Registry/tier snapshot — mirrors `lib/site/rubriques.ts` (asserted by tests). */
export const RUBRIQUE_TIERS: Readonly<Record<RubriqueKey, Tier>> = {
  accueil: "P1",
  "a-propos": "P1",
  "domaines-activite": "P1",
  realisations: "P1",
  "moyens-et-competences": "P2",
  "references-et-partenaires": "P2",
  actualites: "P3",
  contact: "P1",
  carrieres: "P1",
  "mentions-legales": "P1",
  "politique-de-confidentialite": "P1",
}

/**
 * Rubrique → global that stores its copy. The legal utility pages are absent on
 * purpose: their approved copy and identity block are code-owned (`lib/legal/`),
 * so they have no CMS document (content model §3, #28). The P2/P3 rubriques are
 * absent too: their whole model is gated, so there is nothing the admin can
 * open (a page that does not exist in the schema cannot be published).
 */
export const PAGE_GLOBALS: Readonly<Partial<Record<RubriqueKey, PageGlobalSlug>>> = {
  accueil: "homepage",
  "a-propos": "entreprise",
  "domaines-activite": "metiers",
  realisations: "realisations",
  contact: "contact",
  carrieres: "carrieres",
}

/** Utility pages whose content is code-owned (never CMS-readable/editable). */
export const LEGAL_PAGE_KEYS: readonly RubriqueKey[] = [
  "mentions-legales",
  "politique-de-confidentialite",
]

/** Canonical route of one domaine d'activité (code-owned route pattern). */
export function domainPath(slug: string): string {
  return `/domaines-activite/${slug}`
}

/** The five domain records the schema accepts (code-owned, developer-only slug). */
export const DOMAIN_KEYS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: "eclairage-public", label: "Éclairage public" },
  { slug: "installations-electriques", label: "Installations électriques" },
  {
    slug: "infrastructures-reseaux-electriques",
    label: "Infrastructures et réseaux électriques",
  },
  // Gated at launch — see DOMAIN_GATES below; the records exist so the owner
  // can prepare them, but the adapter never serves them while the gate is shut.
  { slug: "energies-renouvelables", label: "Énergies renouvelables et solaire" },
  { slug: "fourniture-equipements", label: "Fourniture d’équipements et de matériel" },
]

/**
 * Code-owned domain gate. A record may exist and even be published in the CMS;
 * the content adapter hides it anyway (spec: "gates are enforced by the schema
 * and the adapter, not by memory"; content model §6 `solaireLive`, IA).
 */
export const DOMAIN_GATES: Readonly<
  Record<string, { readonly open: boolean; readonly reason: string }>
> = {
  "energies-renouvelables": {
    open: false,
    reason:
      "Périmètre réel à confirmer par écrit par l’owner (CDC §4.3). Barrière code-owned : le palier solaire ne s’ouvre pas depuis l’admin.",
  },
  "fourniture-equipements": {
    open: false,
    reason:
      "Catalogue et autorisations de distribution et de marque manquants (CDC §4.5). Barrière code-owned : ne s’ouvre pas depuis l’admin.",
  },
}

/** Is a domain allowed to be public, whatever its CMS publish state? */
export function domainGateOpen(slug: string): boolean {
  return DOMAIN_GATES[slug]?.open ?? true
}

/** The code-owned reason a domain is gated, or `null` when it is open. */
export function domainGateReason(slug: string): string | null {
  const gate = DOMAIN_GATES[slug]
  return gate && !gate.open ? gate.reason : null
}

/**
 * Gated rubriques — the tier gate is code-owned (content model §3/§6): P2 and
 * P3 pages are not part of the P1 publication surface and there is no CMS
 * document for them, so no admin action can open them. They are listed in the
 * admin with this reason so the owner sees *why* they are absent.
 */
export const GATED_RUBRIQUES: ReadonlyArray<{
  readonly key: RubriqueKey
  readonly tier: Tier
  readonly reason: string
}> = [
  {
    key: "moyens-et-competences",
    tier: "P2",
    reason:
      "Palier P2 — inventaire matériel, photographique et RH de l’owner requis (CDC §11).",
  },
  {
    key: "references-et-partenaires",
    tier: "P2",
    reason:
      "Palier P2 — autorisations clients, partenaires et certifications requises (CDC §11).",
  },
  {
    key: "actualites",
    tier: "P3",
    reason:
      "Palier P3 — au moins une actualité approuvée requise ; `actualitesLive` est false (code-owned).",
  },
]

/** The code-owned tier gate: only P1 rubriques may be public at launch. */
export function tierAllowsPublication(key: RubriqueKey): boolean {
  return RUBRIQUE_TIERS[key] === "P1"
}

/** Reason shown to the owner for a rubrique the code keeps closed. */
export function rubriqueGateReason(key: RubriqueKey): string | null {
  return GATED_RUBRIQUES.find((entry) => entry.key === key)?.reason ?? null
}

/**
 * Gated families and switches the admin dashboard lists read-only. They are not
 * fields anywhere in the schema — code decisions (`lib/flags.ts`,
 * `lib/site/realisations.ts`, `lib/site/claims.ts`, forms/F-113) — so the owner
 * sees their current state and the reason, and knows to ask the developer.
 */
export interface CodeGateNote {
  readonly key: string
  readonly label: string
  readonly state: string
  readonly reason: string
}

export const CODE_GATE_NOTES: readonly CodeGateNote[] = [
  {
    key: "caseStudiesLive",
    label: "Fiches réalisations (/realisations/{slug})",
    state: "Fermé",
    reason:
      "Ouvre quand trois études de cas nommées et autorisées existent (stratégie réalisations §4). Décision code-owned.",
  },
  {
    key: "actualitesLive",
    label: "Rubrique Actualités (/actualites)",
    state: "Fermé",
    reason:
      "Palier P3 : le modèle de communiqués existe dans l’admin, la route et le lien de navigation restent fermés (code-owned).",
  },
  {
    key: "agrementLive",
    label: "Agréments ONEE (pages Entreprise et Réalisations)",
    state: "Fermé",
    reason:
      "Les deux certificats doivent être versés au dépôt ; la formulation approuvée est code-owned (registre des faits §2.2).",
  },
  {
    key: "recrutementMailboxLive",
    label: "Boîte recrutement@hay2010.ma (F-113)",
    state: "Fermé",
    reason:
      "S’ouvre uniquement quand l’autorisation CNDP F-113 couvre la boîte ; jamais depuis l’admin (registre des faits §2.3).",
  },
  {
    key: "mapLive",
    label: "Carte et canaux de contact gated",
    state: "Fermé",
    reason:
      "Téléphone, horaires, carte et réseaux sociaux restent absents jusqu’à validation de l’owner et du registre des faits.",
  },
  {
    key: "formLive",
    label: "Formulaire de contact",
    state: "Fermé",
    reason:
      "Désactivé au lancement P1 (décision formulaires) ; le site est e-mail d’abord, sans stockage de message.",
  },
]
