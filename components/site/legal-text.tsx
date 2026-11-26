import Link from "next/link"
import type { ReactNode } from "react"

import { frenchTypography } from "@/lib/legal/typography"
import type { LegalInline, LegalParagraph } from "@/lib/legal/types"

/** The one link style on a legal page (copper on paper, brand direction §2.2). */
export const legalLinkClassName =
  "font-medium text-copper underline decoration-copper/40 underline-offset-4 transition-colors hover:decoration-copper"

/** Render one inline segment: a text run, a bold lead-in or a link. */
function InlineSegment({ segment }: { segment: LegalInline }): ReactNode {
  if (typeof segment === "string") {
    return <>{frenchTypography(segment)}</>
  }
  if ("bold" in segment) {
    return (
      <strong className="font-semibold text-ink">
        {frenchTypography(segment.bold)}
      </strong>
    )
  }
  const label = frenchTypography(segment.link.label)
  if (segment.link.href.startsWith("/")) {
    return (
      <Link href={segment.link.href} className={legalLinkClassName}>
        {label}
      </Link>
    )
  }
  return (
    <a href={segment.link.href} className={legalLinkClassName}>
      {label}
    </a>
  )
}

/** A whole approved paragraph, inline segments in order. */
export function LegalParagraphText({
  paragraph,
}: {
  readonly paragraph: LegalParagraph
}) {
  return (
    <>
      {paragraph.map((segment, index) => (
        <InlineSegment key={index} segment={segment} />
      ))}
    </>
  )
}
