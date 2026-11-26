import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageJsonLd } from "@/components/seo/page-json-ld"
import { ContactPage } from "@/components/site/contact-page"
import { getContentSource } from "@/lib/content"
import { pageMetadata, resolvePageSeo } from "@/lib/seo"
import { requirePublishedRubrique } from "@/lib/site/gates"

/**
 * /contact — the email-first contact page (ticket #26).
 *
 * No form: the primary action is a `mailto:` to the cleared public mailbox, the
 * registered address renders from the code-owned identity block, and the
 * gated channels (phone, hours, map, social) render only when content clears
 * them (see `ContactChannelsBlock`). The page links the privacy policy and
 * carries the code-owned short law 09-08 notice.
 *
 * The publication gate is the first statement of the page component, per the
 * content-seam contract (docs/build/content-seam.md §"Gate semantics").
 */

/** Unique metadata (#32): the decided title and the page model's description. */
async function contactSeo() {
  const source = await getContentSource()
  const page = await source.getPage("contact")
  return resolvePageSeo({ path: "/contact", description: page?.description })
}

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await contactSeo())
}

export default async function Page() {
  await requirePublishedRubrique("contact")

  const source = await getContentSource()
  const page = await source.getPage("contact")
  if (!page) notFound()

  return (
    <>
      <PageJsonLd seo={await contactSeo()} />
      <ContactPage page={page} />
    </>
  )
}
