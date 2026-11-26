/**
 * Domaine d'activité helpers — the domain children of `/domaines-activite`.
 *
 * Domains are content documents, not navigation entries (the flat row has no
 * dropdowns). Their five canonical slugs and CDC titles live in the content
 * source (`content/fixtures/site.json` today, the CMS from #30), while the
 * route pattern is code-owned here.
 *
 * `listPublishedDomains` / `getDomain` already apply the gate inside the
 * content source: a closed domain is absent from listings and returns `null`,
 * so the domain index and the `[slug]` route cannot leak a gated page.
 */
import { getContentSource } from "@/lib/content"
import type { DomainDocument, DomainSlug } from "@/lib/content/types"

/** Route prefix of the domain child pages (code-owned). */
export const DOMAINES_ROUTE = "/domaines-activite"

/** Canonical route of a domain page. */
export function getDomainPath(slug: DomainSlug): string {
  return `${DOMAINES_ROUTE}/${slug}`
}

/** Published domains, in the content source's CDC order. */
export async function getPublishedDomains(): Promise<readonly DomainDocument[]> {
  const source = await getContentSource()
  return source.listPublishedDomains()
}

/** A published domain by slug, or `null` when the gate is closed/unknown. */
export async function getPublishedDomain(
  slug: DomainSlug
): Promise<DomainDocument | null> {
  const source = await getContentSource()
  return source.getDomain(slug)
}
