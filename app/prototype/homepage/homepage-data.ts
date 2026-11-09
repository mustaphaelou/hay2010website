/**
 * Prototype content only — not production copy.
 *
 * Verified wording comes from docs/company/facts-register.md:
 * "Plus de 10 ans d’expérience", the four launch services,
 * "Références sur demande", contact@hay2010.ma, Rabat — Maroc, no phone,
 * no social, no client names. Everything else is clearly sample copy.
 */

export const NAV = [
  { label: "L’Entreprise", href: "/entreprise" },
  { label: "Nos Métiers", href: "/metiers" },
  { label: "Réalisations", href: "/realisations" },
  { label: "Carrières", href: "/carrieres" },
  { label: "Contact", href: "/contact" },
] as const

export const SERVICES = [
  {
    number: "01",
    title: "Éclairage public",
    short: "Éclairage public",
    href: "/metiers#eclairage-public",
    description:
      "Mâts, luminaires, armoires et réseaux d’éclairage public, de l’étude à la mise en service.",
  },
  {
    number: "02",
    title: "Réseaux HTA/MT & MT/BT",
    short: "Réseaux HTA/BT",
    href: "/metiers#reseaux-hta-mt",
    description:
      "Tranchées, câblage, raccordements et essais sur réseaux souterrains et aériens.",
  },
  {
    number: "03",
    title: "Postes de transformation",
    short: "Postes de transformation",
    href: "/metiers#postes-de-transformation",
    description:
      "Génie civil, montage des cellules et mise en service des postes de transformation.",
  },
  {
    number: "04",
    title: "CFO/CFA",
    short: "CFO/CFA",
    href: "/metiers#cfo-cfa",
    description:
      "Courants forts et courants faibles pour le bâtiment et l’industrie.",
  },
] as const

/** Approved positioning line (facts register §5.3). */
export const POSITIONING =
  "Depuis plus de 10 ans, HAY2010 accompagne les collectivités et les entreprises dans leurs projets d’éclairage public et d’électrification."

/** Sample copy — to be replaced by approved French copy. */
export const POSITIONING_END =
  "Nous intervenons de l’étude à la mise en service, avec une même exigence : des ouvrages fiables, livrés dans les règles de l’art."

export const HERO_HEADLINE = "La lumière, comme infrastructure."
export const HERO_SUBLINE =
  "HAY2010 conçoit et réalise les réseaux d’éclairage public et d’électrification des collectivités et des entreprises, au Maroc."

export const EMAIL = "contact@hay2010.ma"
export const LOCATION = "Rabat — Maroc"
export const ADDRESS = "Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc"

export const REFERENCES_TITLE = "Références sur demande."
export const REFERENCES_TEXT =
  "Nos dossiers sont communiqués sur demande, avec l’accord des maîtres d’ouvrage."

export const CAREERS_TITLE = "Rejoignez-nous"
export const CAREERS_TEXT =
  "Nous recrutons des électriciens, des chefs de chantier et des techniciens. Écrivez-nous à contact@hay2010.ma."

/** French typesetting: non-breaking space before “?”. */
export const CONTACT_TITLE =
  "Un projet d’éclairage public ou d’électrification\u00a0?"

export const FOOTER_POSITIONING =
  "Éclairage public, réseaux HTA/BT, postes de transformation et CFO/CFA, de l’étude à la mise en service."

export const VARIANTS = [
  {
    key: "a",
    label: "A — Éditorial",
    detail: "photo pleine page, grille 12 colonnes",
  },
  { key: "b", label: "B — Preuve", detail: "typographique, liste de services" },
  {
    key: "c",
    label: "C — Chantier",
    detail: "plein cadre empilé, mobile d’abord",
  },
] as const

export type VariantKey = (typeof VARIANTS)[number]["key"]
