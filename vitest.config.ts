import { defineConfig } from "vitest/config"

/**
 * HTTP test suite configuration.
 *
 * The suite never renders components itself: it fetches the production build
 * served by `scripts/test-http.mjs` (one process, one port, one run) and
 * asserts what a visitor or a crawler receives. Keep the environment `node`:
 * no jsdom, no component tests (spec: docs/spec/p1-website-build.md).
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 20_000,
    hookTimeout: 20_000,
    // Every suite talks to the same already-running production server.
    fileParallelism: false,
  },
})
