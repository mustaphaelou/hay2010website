import type { Metadata } from "next"

import { NotFoundContent } from "@/components/site/not-found-content"
import { NOT_FOUND_TITLE } from "@/lib/site/site"

/**
 * Not-found boundary of the site route group — rendered inside the normal
 * `(frontend)` layout when a page calls `notFound()` at render time.
 *
 * This is the CMS gate path (#29): a page whose CMS document is not published
 * calls `requirePublishedRubrique()` → `notFound()`. The proxy cannot resolve
 * CMS gates itself without querying the database on every request, so the
 * branded 404 comes from this boundary instead of the `/_not-found` rewrite
 * that serves the fixture path (`app/global-not-found.tsx`, same content).
 */
export const metadata: Metadata = {
  title: `${NOT_FOUND_TITLE} — HAY2010`,
  robots: { index: false, follow: false },
}

export default function FrontendNotFound() {
  return <NotFoundContent />
}
