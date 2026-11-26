/**
 * Shared site shell constants — code-owned, never CMS-editable.
 *
 * Ticket #32 owns the full canonical/SEO policy (`lib/seo`). #21 only needs the
 * public origin to emit absolute sitemap URLs; keeping it in one place means
 * #32 has a single value to take over instead of a literal scattered in files.
 */
export const SITE_URL = "https://hay2010.ma"

/** The 404 page's heading (French interface copy, not a company claim). */
export const NOT_FOUND_TITLE = "Page introuvable"

/** The 404 page's explanatory line (French interface copy). */
export const NOT_FOUND_MESSAGE =
  "La page demandée n’existe pas ou n’est plus disponible."
