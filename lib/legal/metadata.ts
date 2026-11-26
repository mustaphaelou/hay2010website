import type { Metadata } from "next"

import { SITE_URL } from "@/lib/site/site"

/**
 * Code-owned metadata for the legal pages (ticket #28, awaiting #32's full SEO
 * layer). The title/description pairs are the launch defaults of
 * docs/seo/seo-metadata.md §3.3, copied verbatim; the canonical is absolute on
 * the code-owned apex origin, no trailing slash (§2.3).
 *
 * The policy description uses the staging-safe variant from §3.3: the
 * `donnees@` mailbox is owner-approved but still pending creation/test, so it
 * stays out of metadata until the public-launch gate closes. #32 replaces this
 * module with `lib/seo.ts` and keeps the same values.
 */
function legalMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
  }
}

/** `/mentions-legales` — title and description from SEO doc §3.3. */
export const mentionsLegalesMetadata = (): Metadata =>
  legalMetadata(
    "Mentions légales — HAY2010",
    "Mentions légales de SOCIETE HAY 2010 (SARL, RC 87305, ICE 001459327000056) : éditeur, propriété intellectuelle, données personnelles et cookies.",
    "/mentions-legales"
  )

/** `/politique-de-confidentialite` — title and description from SEO doc §3.3. */
export const politiqueDeConfidentialiteMetadata = (): Metadata =>
  legalMetadata(
    "Politique de confidentialité — HAY2010",
    "Politique de confidentialité de SOCIETE HAY 2010 : données traitées, finalités, durées de conservation, droits et cookies. Comment exercer vos droits.",
    "/politique-de-confidentialite"
  )
