import { requirePublishedDomain } from "@/lib/site/gates"

/**
 * A domaine d'activité page — gate-guarded stub shipped by #21; the trame and
 * copy are ticket #22.
 *
 * `requirePublishedDomain` resolves the domain *through the seam*: a closed
 * gate and an unknown slug behave identically (404). The proxy layer rewrites
 * both to the branded 404 document before this page renders.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  await requirePublishedDomain(slug)
  return null
}
