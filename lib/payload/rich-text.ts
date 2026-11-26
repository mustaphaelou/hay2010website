/**
 * Lexical rich-text helpers shared by the seed and the content provider.
 *
 * The CMS stores prose in Payload's Lexical editor (content model §11.3: rich
 * text restricted to the brand marks). At P1 the trames render that prose as a
 * sequence of paragraphs, so two tiny, lossless helpers are all the seam needs:
 *
 * - `paragraphsToRichText` builds a valid Lexical document from plain
 *   paragraphs (used by the seed, which reads the fixture corpus). The seed
 *   never writes raw SQL and never hand-builds a broken editor state;
 * - `richTextToParagraphs` extracts the paragraph texts back for the content
 *   provider. An empty/malformed value yields `[]` — an absent block is omitted
 *   (DEV-006), never rendered as a placeholder.
 *
 * Both functions are pure so the same value round-trips: the `npm run test:cms`
 * parity check compares the rendered site, and a lossy conversion would show up
 * there immediately.
 */

interface LexicalNode {
  readonly type?: string
  readonly text?: string
  readonly children?: readonly LexicalNode[]
}

interface LexicalDocument {
  readonly root?: LexicalNode & { readonly children?: readonly LexicalNode[] }
}

/** One text leaf carrying the paragraph's exact characters (NBSP, ’ …). */
function textNode(text: string): Record<string, unknown> {
  return {
    type: "text",
    text,
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    version: 1,
  }
}

/** One paragraph node in the default (`richtext-lexical`) document shape. */
function paragraphNode(text: string): Record<string, unknown> {
  return {
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    direction: null,
    textFormat: 0,
    textStyle: "",
    children: text.length > 0 ? [textNode(text)] : [],
  }
}

/** Build a Lexical editor state holding one paragraph per input string. */
export function paragraphsToRichText(
  paragraphs: readonly string[]
): Record<string, unknown> {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: null,
      children: paragraphs.map((paragraph) => paragraphNode(paragraph)),
    },
  }
}

/** Concatenate the text leaves of one node (nested nodes included). */
function collectText(node: LexicalNode | null | undefined): string {
  if (!node) return ""
  if (node.type === "text" && typeof node.text === "string") return node.text
  if (node.type === "linebreak") return "\n"
  if (Array.isArray(node.children)) {
    return node.children.map((child) => collectText(child)).join("")
  }
  return ""
}

/** Extract the paragraph texts of a Lexical value; malformed input → `[]`. */
export function richTextToParagraphs(value: unknown): string[] {
  const root = (value as LexicalDocument | null | undefined)?.root
  if (!root || !Array.isArray(root.children)) return []

  const paragraphs: string[] = []
  for (const child of root.children) {
    const text = collectText(child).trim()
    if (text.length > 0) paragraphs.push(text)
  }
  return paragraphs
}

/** A single plain-text string for a rich-text value (headings, statements). */
export function richTextToPlainText(value: unknown): string {
  return richTextToParagraphs(value).join("\n\n")
}
