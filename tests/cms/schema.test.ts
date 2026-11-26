/**
 * Static schema guards for ticket #30 — the checks no served document can make.
 *
 * They run in the same CMS Vitest project (no second runner): the rest of the
 * suite observes HTTP, these read the committed schema/migration/config files.
 *
 * - the P1 content model must not enable Payload localization (content model
 *   §5: no `localization` config at P1);
 * - the committed migration must be environment-independent (the S3 plugin's
 *   `_objectkey` column is present, #29 rule) and must apply from an empty DB;
 * - the code-owned content map (literals that keep `payload.config.ts` free of
 *   the app graph) must match the runtime rubrique registry, so a tier or label
 *   can never drift silently between the CMS admin and the site navigation;
 * - the seed must reproduce the fixture corpus (it reads
 *   `content/fixtures/site.json` + the `p1` scenario), which is what makes the
 *   parity comparison meaningful.
 */
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  PAGE_GLOBALS,
  RUBRIQUE_LABELS,
  RUBRIQUE_TIERS,
} from "../../lib/payload/content-map"
import { RUBRIQUES } from "../../lib/site/rubriques"

const ROOT = process.cwd()

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8")
}

describe("Payload schema (#30)", () => {
  it("does not enable localization at P1", () => {
    const config = read("payload.config.ts")
    expect(config).not.toMatch(/\blocalization\s*:/)
    expect(config).not.toMatch(/\blocalize\s*:\s*true/)
  })

  it("declares the seven page globals and the four content collections", () => {
    const config = read("payload.config.ts")
    for (const global of [
      "Homepage",
      "Entreprise",
      "Metiers",
      "Realisations",
      "Contact",
      "Carrieres",
      "Actualites",
    ]) {
      expect(config, `payload.config.ts must register the ${global} global`).toContain(global)
    }
    for (const collection of ["Domaines", "Projects", "Jobs", "Communiques", "Media", "Users"]) {
      expect(config, `payload.config.ts must register the ${collection} collection`).toContain(
        collection
      )
    }
    // The transient #29 `pages` collection is replaced by the structured model.
    expect(config).not.toContain("Pages")
  })

  it("commits a storage-independent migration that applies from an empty database", () => {
    const migrationsDir = path.join(ROOT, "migrations")
    const sqlFiles = readdirSync(migrationsDir).filter((file) => file.endsWith(".ts"))
    expect(sqlFiles.length, "no committed migration found").toBeGreaterThan(0)

    const sql = sqlFiles.map((file) => read(path.join("migrations", file))).join("\n")
    // The S3 plugin runs with `alwaysInsertFields: true`: `_objectkey` is part of
    // every migration whether or not object storage is configured (#29 rule).
    expect(sql).toContain("_objectkey")
    // The structured model's tables and draft version tables exist.
    for (const table of [
      '"homepage"',
      '"entreprise"',
      '"metiers"',
      '"realisations"',
      '"contact"',
      '"carrieres"',
      '"actualites"',
      '"domaines"',
      '"projects"',
      '"jobs"',
      '"communiques"',
      '"_homepage_v"',
      '"_domaines_v"',
    ]) {
      expect(sql, `the committed migration must create ${table}`).toContain(`CREATE TABLE ${table}`)
    }
  })

  it("keeps the code-owned content map in sync with the rubrique registry", () => {
    for (const rubrique of RUBRIQUES) {
      expect(
        RUBRIQUE_TIERS[rubrique.key],
        `tier drift for ${rubrique.key}: content-map must mirror lib/site/rubriques.ts`
      ).toBe(rubrique.tier)
      // The admin label follows the registry's nav label for P1 pages; P2/P3
      // labels use the longer CDC title because they are not in the P1 row.
      if (rubrique.tier === "P1") {
        expect(
          RUBRIQUE_LABELS[rubrique.key],
          `label drift for ${rubrique.key}: the admin label must mirror the registry`
        ).toBe(rubrique.navLabel)
      } else {
        expect(RUBRIQUE_LABELS[rubrique.key].length).toBeGreaterThan(0)
      }
    }

    // Only P1 pages have a CMS document; P2/P3 rubriques and the legal pages
    // (code-owned) must not appear in the page-global map.
    for (const key of [
      "moyens-et-competences",
      "references-et-partenaires",
      "actualites",
      "mentions-legales",
      "politique-de-confidentialite",
    ] as const) {
      expect(PAGE_GLOBALS[key], `${key} must not be CMS-publishable`).toBeUndefined()
    }
  })

  it("seeds the corpus from the fixture files, never invented copy", () => {
    const seed = read("scripts/seed.ts")
    expect(seed).toContain("content/fixtures/site.json")
    expect(seed).toContain("content/fixtures/scenarios/p1.json")
    // The seed writes through the Local API, not raw SQL, so hooks run.
    expect(seed).toContain("payload.create")
    expect(seed).not.toMatch(/INSERT\s+INTO/i)
  })
})
