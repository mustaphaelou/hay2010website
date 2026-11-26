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
