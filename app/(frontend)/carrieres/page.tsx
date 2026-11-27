import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CareersPage } from "@/components/careers/careers-page"
import { PageJsonLd } from "@/components/seo/page-json-ld"
import {
  getCareersApplicationState,
  getCareersMetadataDescription,
  getOpenJobs,
  isPrivacyPolicyPublished,
} from "@/lib/site/careers"
import { pageMetadata } from "@/lib/seo"
import { requirePublishedRubrique } from "@/lib/site/gates"
import { getRubriquePageContext } from "@/lib/site/page-context"

/**
 * Carrières — the footer-only utility page (IA §Navigation). It is never in the
 * primary navigation; the footer and the drawer's utility list derive the link
 * from the published utility set, so the gate and the link cannot disagree.
 *
 * The page explains the company and how to apply by email, lists the current
 * openings inline from the content source (no detail route, no `JobPosting`
 * structured data), and renders the application section according to the F-113
 * gate: questions to `contact@` (no CV invitation) until the CNDP authorization
 * covers `recrutement@`, then the careers mailbox with the approved notice
 * (forms doc §4.4/§4.9). No form, no upload: the mailbox is the record (§4.3).
 *
 * Metadata is the approved unique title/description (SEO doc §3.3); the
 * description that invites a spontaneous application only renders once the gate
 * is open, so the head never carries a gated claim.
 */

/**
 * The F-113 application state and the page context (model + metadata), each
 * read once. The description depends on the gate state: the live variant
 * invites a spontaneous application, so it only renders once the gate is open.
 */
async function careersContext() {
  const application = await getCareersApplicationState()
  const page = await getRubriquePageContext("carrieres", {
    description: getCareersMetadataDescription(application),
  })
  return { application, page }
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await careersContext()
  return pageMetadata(page.seo)
}

export default async function Page() {
  // Render half of the gate; `proxy.ts` already rewrites a closed route to the
  // real 404 document (docs/build/content-seam.md §5).
  await requirePublishedRubrique("carrieres")

  const { application, page } = await careersContext()
  const [jobs, privacyPublished] = await Promise.all([
    getOpenJobs(),
    isPrivacyPolicyPublished(),
  ])

  // A published route without its document is not renderable: no placeholder.
  if (!page.model) notFound()

  return (
    <>
      <PageJsonLd seo={page.seo} />
      <CareersPage
        document={page.model}
        jobs={jobs}
        application={application}
        privacyPublished={privacyPublished}
      />
    </>
  )
}
