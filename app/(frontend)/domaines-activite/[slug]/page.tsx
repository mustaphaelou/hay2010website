import type { Metadata } from "next"

import { DomainePage } from "@/components/domaines/domaine-page"
import { PageJsonLd } from "@/components/seo/page-json-ld"
import { pageMetadata, resolvePageSeo } from "@/lib/seo"
import { getDomainPath, getPublishedDomain, getPublishedDomains } from "@/lib/site/domaines"
import { requirePublishedDomain } from "@/lib/site/gates"

/**
 * A published domaine d'activité page (ticket #22).
 *
 * The route already existed as a gate-guarded stub from #21; this ticket adds
 * the CDC trame from content. `requirePublishedDomain` is the render guard and
 * resolves the document *through the seam*: a closed gate and an unknown slug
 * both return `null`, so the route cannot leak a gated page. The proxy layer
 * rewrites both to the branded 404 document before rendering
 * (docs/build/content-seam.md §5).
 *
 * Published domain pages are prerendered at build (like every content page in
 * the production model); the gated domains are not generated, and a request
 * for one is rewritten to the 404 by `proxy.ts`.
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const domains = await getPublishedDomains()
  return domains.map((domain) => ({ slug: domain.slug }))
}

/**
 * Unique title, description and canonical URL per domain page (#32).
 * The domain document owns the phrase and the decided description; a document
 * without a description falls back to the generated metadata default.
 */
async function domainSeo(slug: string) {
  const domain = await getPublishedDomain(slug)
  if (!domain) return null
  return resolvePageSeo({
    path: getDomainPath(slug),
    phrase: domain.title,
    description: domain.description,
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const seo = await domainSeo(slug)
  return seo ? pageMetadata(seo) : {}
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const domain = await requirePublishedDomain(slug)
  const seo = await domainSeo(slug)

  return (
    <>
      {seo ? <PageJsonLd seo={seo} /> : null}
      <DomainePage domain={domain} />
    </>
  )
}
