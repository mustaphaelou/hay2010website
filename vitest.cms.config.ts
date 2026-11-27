/**
 * CMS verification configuration — a SECOND Vitest project, run only by
 * `npm run test:cms` against a disposable Postgres and a production build made
 * with `CONTENT_SOURCE=cms`.
 *
 * It is not part of `npm test`: the merge gate stays database-free and runs the
 * HTTP suite against the fixture provider (`vitest.config.ts` excludes this
 * directory on purpose).
 */
import path from "node:path"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname) },
  },
  test: {
    environment: "node",
    include: ["tests/cms/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // The orchestrator (scripts/test-cms.mjs) owns the database, the build and
    // the server; the assertions only follow each other where one mutates the
    // state the next one observes.
    fileParallelism: false,
  },
})
