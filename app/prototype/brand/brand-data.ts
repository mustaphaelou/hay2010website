/**
 * Prototype content only — not production copy.
 * Facts follow docs/company/facts-register.md: "plus de 10 ans d'expérience",
 * four launch services, Références sur demande, email only, no ONEE claim yet.
 */

export const NAV = [
  { label: "L’Entreprise", href: "#entreprise" },
  { label: "Nos Métiers", href: "#metiers" },
  { label: "Réalisations", href: "#realisations" },
  { label: "Carrières", href: "#carrieres" },
  { label: "Contact", href: "#contact" },
]

export const SERVICES = [
  {
    number: "01",
    title: "Éclairage public",
    short: "Éclairage public",
    description:
      "Mâts, luminaires, armoires et réseaux d’éclairage public, de l’étude à la mise en service.",
  },
  {
    number: "02",
    title: "Réseaux HTA/MT & MT/BT",
    short: "Réseaux HTA/BT",
    description:
      "Tranchées, câblage, raccordements et essais sur réseaux souterrains et aériens.",
  },
  {
    number: "03",
    title: "Postes de transformation",
    short: "Postes de transformation",
    description:
      "Génie civil, montage des cellules et mise en service des postes de transformation.",
  },
  {
    number: "04",
    title: "CFO/CFA",
    short: "CFO/CFA",
    description:
      "Courants forts et courants faibles pour le bâtiment et l’industrie.",
  },
]

export const POSITIONING =
  "Depuis plus de 10 ans, HAY2010 accompagne les collectivités et les entreprises dans leurs projets d’éclairage public et d’électrification."

export const POSITIONING_END =
  "Nous intervenons de l’étude à la mise en service, avec une même exigence : des ouvrages fiables, livrés dans les règles de l’art."

export const EMAIL = "ste.hay2010@gmail.com"
export const LOCATION = "Rabat — Maroc"

export const VARIANTS = [
  { key: "a", label: "A — Lumière", detail: "éditorial, photo, ambre" },
  { key: "b", label: "B — Le Plan", detail: "fiche technique, cuivre" },
  { key: "c", label: "C — Réseau", detail: "poster, cobalt & ambre" },
] as const

export type VariantKey = (typeof VARIANTS)[number]["key"]
