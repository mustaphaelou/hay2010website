/**
 * The single door to content (spec: "Single content seam").
 *
 * Every page, the header, the drawer, the footer, the sitemap and metadata call
 * `getContentSource()` and never import a provider or a CMS client directly.
 * Ticket #29 adds the `cms` branch; the fixture provider stays the default so
 * the build gate needs no database.
 */
import { getFixtureContentSource } from "@/lib/content/providers/fixture"
import type { ContentSource } from "@/lib/content/types"

/** Provider selection: `fixture` (default) or `cms` (#29). */
export type ContentProviderName = "fixture" | "cms"

export function getContentProviderName(): ContentProviderName {
  const provider = (process.env.CONTENT_SOURCE ?? "fixture").trim() || "fixture"
  if (provider !== "fixture" && provider !== "cms") {
    throw new Error(
      `Unknown CONTENT_SOURCE "${provider}". Expected "fixture" (défaut) or "cms".`
    )
  }
  return provider
}

let sourcePromise: Promise<ContentSource> | null = null

/**
 * Resolve the active content source once per process.
 *
 * The CMS provider is loaded through a dynamic `import()` on purpose: the
 * fixture build must never pull Payload, a database driver or `payload.config`
 * into the server bundle, and `npm test` must build without Postgres.
 */
export function getContentSource(): Promise<ContentSource> {
  sourcePromise ??= createContentSource()
  return sourcePromise
}

async function createContentSource(): Promise<ContentSource> {
  if (getContentProviderName() === "fixture") return getFixtureContentSource()

  const { getCmsContentSource } = await import("@/lib/content/providers/cms")
  return getCmsContentSource()
}

