import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

/**
 * Architecture guards for the content seam and the layout constraint.
 *
 * These are not HTTP assertions: they protect two structural decisions that no
 * served document can reveal, and that are explicitly part of ticket #21:
 *
 * - every content decision goes through the content-source adapter, so no
 *   rendering file may import the CMS or a provider directly (acceptance
 *   criterion); ticket #29 must keep this true;
 * - the app has no root `app/layout.tsx`, because the embedded Payload admin
 *   (#29) brings its own root layout in `app/(payload)/layout.tsx`.
 *
 * They run as a pure filesystem check in the same Vitest runner (no second
 * runner, no second seam); the rest of the suite stays HTTP-only.
 */

const ROOT = process.cwd()
const SOURCE_DIRS = ["app", "components", "lib"]

function sourceFiles(relativeDir: string): string[] {
  const absolute = path.join(ROOT, relativeDir)
  const files: string[] = []
  for (const entry of readdirSync(absolute)) {
    const child = path.join(relativeDir, entry)
    const stats = statSync(path.join(ROOT, child))
    if (stats.isDirectory()) files.push(...sourceFiles(child))
    else if (/\.(ts|tsx|mts|js|mjs|jsx)$/.test(entry)) files.push(child)
  }
  return files
}

function allSourceFiles(): string[] {
  return SOURCE_DIRS.flatMap((dir) => sourceFiles(dir))
}

/** Every file under a directory, whatever its extension. */
function allFiles(relativeDir: string): string[] {
  const absolute = path.join(ROOT, relativeDir)
  const files: string[] = []
  for (const entry of readdirSync(absolute)) {
    const child = path.join(relativeDir, entry)
    const stats = statSync(path.join(ROOT, child))
    if (stats.isDirectory()) files.push(...allFiles(child))
    else files.push(child)
  }
  return files
}

function readSources(files: readonly string[]): string {
  return files.map((file) => readFileSync(path.join(ROOT, file), "utf8")).join("\n")
}

/** `from "payload"`, `from "@payloadcms/next"`, etc. */
const CMS_IMPORT = /\bfrom\s+["'](?:payload|@payloadcms\/[^"']*)["']/
/** A direct import of a provider, which only the adapter may do. */
const PROVIDER_IMPORT = /\bfrom\s+["']@\/lib\/content\/providers\//

describe("content seam architecture", () => {
  it("keeps the CMS behind the content-source adapter", () => {
    const offenders = allSourceFiles()
      .map((file) => ({ file, content: readFileSync(path.join(ROOT, file), "utf8") }))
      // The CMS provider is the one place allowed to talk to Payload (#29).
      .filter(({ file }) => !file.startsWith("lib/content/providers/"))
      .filter(({ content }) => CMS_IMPORT.test(content))
      .map(({ file }) => file)

    expect(
      offenders,
      "no app/component/lib file outside the content provider may import Payload directly"
    ).toEqual([])
  })

  it("lets only the adapter import a content provider", () => {
    const offenders = allSourceFiles()
      .filter((file) => !file.startsWith("lib/content/"))
      .filter((file) =>
        PROVIDER_IMPORT.test(readFileSync(path.join(ROOT, file), "utf8"))
      )

    expect(
      offenders,
      "rendering code must go through getContentSource(), never a provider"
    ).toEqual([])
  })

  it("keeps every frontend page behind a publication gate", () => {
    const pageFiles = sourceFiles(path.join("app", "(frontend)")).filter((file) =>
      file.endsWith(`${path.sep}page.tsx`)
    )
    // The prototype is a noindex design artefact, not a public page.
    const publicPages = pageFiles.filter((file) => !file.includes("prototype"))

    expect(publicPages.length, "expected the P1 route pages to exist").toBeGreaterThan(0)
    const unguarded = publicPages.filter((file) => {
      const content = readFileSync(path.join(ROOT, file), "utf8")
      return !/requirePublished(?:Rubrique|Domain)\(/.test(content)
    })
    expect(
      unguarded,
      "every page must call requirePublishedRubrique()/requirePublishedDomain() first"
    ).toEqual([])
  })
})

describe("root layout constraint (#29)", () => {
  it("has no app/layout.tsx, so the Payload admin can own a root layout", () => {
    const rootLayout = path.join(ROOT, "app", "layout.tsx")
    expect(
      (() => {
        try {
          return statSync(rootLayout).isFile()
        } catch {
          return false
        }
      })(),
      "a root app/layout.tsx would break the embedded Payload admin (#29)"
    ).toBe(false)
  })

  it("keeps the global 404 document that replaces a root layout", () => {
    expect(statSync(path.join(ROOT, "app", "global-not-found.tsx")).isFile()).toBe(true)
  })
})

/**
 * The legal pages are a decision, not site content (ticket #28).
 *
 * These guards protect the acceptance criterion no served document can prove on
 * its own: the identity block and the approved copy are code-owned, so the CMS
 * admin can neither edit them nor make them disappear from the content source.
 * #30 re-verifies the admin surface; this test keeps the code boundary honest.
 */
describe("code-owned legal pages (#28)", () => {
  const LEGAL_MAILBOXES = ["contact@hay2010.ma", "donnees@hay2010.ma"]

  it("keeps the legal identity and approved copy out of the content corpus", () => {
    // `content/fixtures/` is what the CMS provider seeds and what the fixture
    // provider serves: if a legal string lived here, the admin could edit it.
    const corpus = readSources(allFiles(path.join("content", "fixtures")))

    const forbidden = [
      "SOCIETE HAY 2010",
      "Registre du commerce : RC 87305",
      "RC 87305 — Tribunal de commerce de Rabat",
      "001459327000056",
      "15 000 000 MAD",
      "Local N° 21, Hay El Manzeh",
      ...LEGAL_MAILBOXES,
    ]
    for (const value of forbidden) {
      expect(
        corpus,
        `the content corpus must not carry the code-owned legal value "${value}"`
      ).not.toContain(value)
    }
  })

  it("keeps the code-owned legal modules off the content seam", () => {
    const modules = sourceFiles(path.join("lib", "legal"))
    expect(modules.length, "lib/legal/ must hold the legal data").toBeGreaterThan(0)

    const offenders = modules.filter((file) =>
      /from\s+["']@\/lib\/content/.test(
        readFileSync(path.join(ROOT, file), "utf8")
      )
    )
    expect(
      offenders,
      "lib/legal/ must never read the content source: the admin cannot feed it"
    ).toEqual([])
  })

  it("renders both legal pages from lib/legal, behind the publication gate", () => {
    const pages = [
      path.join("app", "(frontend)", "mentions-legales", "page.tsx"),
      path.join("app", "(frontend)", "politique-de-confidentialite", "page.tsx"),
    ]

    for (const file of pages) {
      const content = readFileSync(path.join(ROOT, file), "utf8")
      expect(content, `${file} must import the code-owned legal data`).toMatch(
        /from\s+["']@\/lib\/legal["']/
      )
      expect(
        content,
        `${file} must not read legal copy or metadata from the content source`
      ).not.toMatch(/@\/lib\/content/)
      expect(
        content,
        `${file} must still run the render-side publication gate first`
      ).toMatch(/requirePublishedRubrique\(/)
    }
  })
})
