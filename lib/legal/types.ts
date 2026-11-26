/**
 * Legal-page content types (ticket #28).
 *
 * The legal copy is a decision, not site content: it is written here in code
 * from docs/legal/analytics-consent-legal-pages.md §4 and never read from the
 * content source, so the CMS admin cannot edit it (#30 verifies). The renderer
 * in `components/site/legal-document.tsx` only knows these shapes.
 *
 * Blocks are deliberately small: paragraphs, lists, tables, subsections and
 * the injected code-owned identity block. That is all the approved copy uses —
 * no free-form HTML is ever published on a legal page.
 */

/** An inline link in a paragraph: label plus target (route, mailto or URL). */
export interface LegalLink {
  readonly label: string
  readonly href: string
}

/**
 * One inline segment: a text run, a bold lead-in, or a link. Paragraphs are
 * arrays so a link sits mid-sentence without string templating.
 */
export type LegalInline =
  | string
  | { readonly link: LegalLink }
  | { readonly bold: string }

/** A paragraph as an ordered sequence of inline segments. */
export type LegalParagraph = readonly LegalInline[]

/** A table of approved copy: retention periods, strictly necessary cookies. */
export interface LegalTableBlock {
  readonly kind: "table"
  /** Required accessible caption; not part of the approved visible copy. */
  readonly caption: string
  readonly head: readonly string[]
  readonly rows: readonly (readonly string[])[]
}

/** A numbered subsection of a section (policy §2.1, §2.2, …). */
export interface LegalSubsectionBlock {
  readonly kind: "subsection"
  readonly heading: string
  readonly blocks: readonly LegalBlock[]
}

/**
 * The “Dernière mise à jour” line, rendered from `lastReviewed` so the approved
 * date is never retyped (the decision: the date is the review date, not the
 * publication date).
 */
export interface LegalLastReviewedBlock {
  readonly kind: "last-reviewed"
}

/** Everything a legal section can render, in order. */
export type LegalBlock =
  | { readonly kind: "paragraphs"; readonly items: readonly LegalParagraph[] }
  | { readonly kind: "list"; readonly items: readonly LegalParagraph[] }
  | { readonly kind: "identity"; readonly variant: "editor" | "controller" }
  | LegalLastReviewedBlock
  | LegalSubsectionBlock
  | LegalTableBlock

/** One numbered section of a legal notice. */
export interface LegalSection {
  /** Stable anchor, e.g. `cookies` (`/politique-de-confidentialite#cookies`). */
  readonly id?: string
  /** Heading without its number: the renderer numbers sections in code. */
  readonly heading: string
  readonly blocks: readonly LegalBlock[]
}

/** A complete legal page: title, review date, optional intro, sections. */
export interface LegalDocument {
  readonly title: string
  /** ISO date of the last legal review — never the CMS publish date (§4.1). */
  readonly lastReviewed: string
  readonly intro?: readonly LegalParagraph[]
  readonly sections: readonly LegalSection[]
}
