/**
 * French typography for the code-owned legal copy (project rule: typographic
 * apostrophes, non-breaking space before `: ; ? !` and inside « »).
 *
 * The approved copy in the decision documents is plain text. Rather than hide
 * invisible non-breaking spaces in forty paragraphs of source data, the
 * renderer normalises visible text at the boundary — links, mailboxes and
 * URLs are never transformed.
 */
export function frenchTypography(text: string): string {
  return text
    .replace(/ ([:;?!])/g, "\u00a0$1")
    .replace(/« /g, "«\u00a0")
    .replace(/ »/g, "\u00a0»")
}
