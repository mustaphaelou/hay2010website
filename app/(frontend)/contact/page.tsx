import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContactPage } from "@/components/site/contact-page"
import { getContentSource } from "@/lib/content"
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

export async function generateMetadata(): Promise<Metadata> {
  const source = await getContentSource()
  const page = await source.getPage("contact")

  return {
    // docs/seo/seo-metadata.md §3.3 fixes this title for /contact; #32 owns the
    // metadata system and will move the pattern into lib/seo. `absolute` keeps
    // the title exact once that template lands.
    title: { absolute: "Contact à Rabat — HAY2010" },
    description: page?.description,
  }
}

export default async function Page() {
  await requirePublishedRubrique("contact")

  const source = await getContentSource()
  const page = await source.getPage("contact")
  if (!page) notFound()

  return <ContactPage page={page} />
}
