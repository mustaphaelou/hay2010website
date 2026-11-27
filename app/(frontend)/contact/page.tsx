import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageJsonLd } from "@/components/seo/page-json-ld"
import { ContactPage } from "@/components/site/contact-page"
import { pageMetadata } from "@/lib/seo"
import { requirePublishedRubrique } from "@/lib/site/gates"
import { getRubriquePageContext } from "@/lib/site/page-context"

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

/** The page model and its metadata, read once (#32: the decided title and the page model's description). */
async function contactContext() {
  return getRubriquePageContext("contact")
}

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await contactContext()
  return pageMetadata(seo)
}

export default async function Page() {
  await requirePublishedRubrique("contact")

  const { model: page, seo } = await contactContext()
  if (!page) notFound()

  return (
    <>
      <PageJsonLd seo={seo} />
      <ContactPage page={page} />
    </>
  )
}
