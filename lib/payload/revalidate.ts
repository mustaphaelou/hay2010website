/**
 * Publish revalidation — the #30 half of the CMS freshness contract
 * (docs/build/content-model.md §11.4, content-seam §9.4).
 *
 * Payload `afterChange` / `afterDelete` hooks call this helper after a document
 * changes. It invalidates the Next.js route cache so a publish, unpublish or
 * rights revocation shows up on the public site **without a rebuild**:
 *
 * - `revalidatePath("/", "layout")` is used for any change that can move a
 *   gate or a media permission: the site header/footer render the published
 *   set on every page, and a rights revocation must hide an image everywhere —
 *   so every frontend route is invalidated at once. The site is small and
 *   content changes are a few per quarter (content model §8.4), so a precise
 *   per-page invalidation would be premature;
 * - the specific affected route and `/sitemap.xml` are invalidated explicitly
 *   (the ticket requires the observable effect on the page that changed);
 * - `revalidateTag(tag, "max")` runs with the two-argument Next 16 signature.
 *   The tags are the documented cache keys (`page:<key>`, `services`, …); the
 *   local API reads Postgres directly, so the path invalidation is what makes
 *   the re-render pick the new content up, while the tags keep the contract for
 *   any future `fetch`-tagged content source.
 *
 * IMPORTANT: `revalidatePath`/`revalidateTag` only work inside a Next.js request
 * store. Payload hooks normally run inside a request (REST/app/admin), but the
 * seed runs through `payload run` — outside Next — where calling them throws.
 * The helper swallows that specific case: a seed does not need cache
 * invalidation, and a hook must never fail a write because it ran from the CLI.
 */
import { revalidatePath, revalidateTag } from "next/cache"

/** One cache key of the content contract (content model §11.4). */
export const CONTENT_TAG = "content"

/** Tags documented for the content types (#30 keeps them in one place). */
export const CONTENT_TAGS = {
  homepage: "homepage",
  entreprise: "page:entreprise",
  metiers: "page:metiers",
  realisations: "page:realisations",
  contact: "page:contact",
  carrieres: "page:carrieres",
  actualites: "page:actualites",
  domains: "domains",
  projects: "projects",
  jobs: "jobs",
  communiques: "communiques",
  media: "media",
} as const

export interface Invalidation {
  /** Specific routes to regenerate on the next request. */
  readonly paths?: readonly string[]
  /** Documented tags for the content type that changed. */
  readonly tags?: readonly string[]
  /**
   * Invalidate every page of the frontend layout (gate- or media-affecting
   * change). Defaults to `true`: every content write can move a link, a gate
   * or an image, and the header/footer render the published set.
   */
  readonly layoutWide?: boolean
}

/**
 * Invalidate the public routes affected by a CMS write. Safe to call outside a
 * Next request (seed / CLI): the missing request store is ignored.
 */
export function invalidateContent({
  paths = [],
  tags = [],
  layoutWide = true,
}: Invalidation): void {
  try {
    revalidateTag(CONTENT_TAG, "max")
    for (const tag of tags) revalidateTag(tag, "max")
    for (const path of paths) revalidatePath(path)
    // The sitemap derives from the published set, so it moves with any write.
    revalidatePath("/sitemap.xml")
    if (layoutWide) revalidatePath("/", "layout")
  } catch {
    // `payload run` (seed, migrations) has no Next request store: nothing to
    // invalidate, and the write itself must not fail because of it.
  }
}

/** The exact route of one rubrique key, for hook invalidation (literal mirror). */
export const RUBRIQUE_ROUTES: Readonly<Record<string, string>> = {
  accueil: "/",
  "a-propos": "/a-propos",
  "domaines-activite": "/domaines-activite",
  realisations: "/realisations",
  "moyens-et-competences": "/moyens-et-competences",
  "references-et-partenaires": "/references-et-partenaires",
  actualites: "/actualites",
  contact: "/contact",
  carrieres: "/carrieres",
  "mentions-legales": "/mentions-legales",
  "politique-de-confidentialite": "/politique-de-confidentialite",
}
