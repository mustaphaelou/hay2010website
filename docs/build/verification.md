# Verification — the HTTP test suite

The single verification seam for the site: one command builds the production
app, serves it, and checks what a visitor or a crawler actually receives. No
component tests, no second runner, no browser.

## The one command

```bash
TEST_HTTP_PORT=3120 npm test
```

From a clean checkout (no `node_modules`, no `.next`):

```bash
npm ci
TEST_HTTP_PORT=3120 npm test
```

`TEST_HTTP_PORT` is required for parallel work: each worktree uses its own
port (`31NN`), never 3000. Without it the runner defaults to 3100.

### What the command does

`scripts/test-http.mjs`:

1. runs `next build` (skipped with `SKIP_BUILD=1`, which reuses the existing
   `.next` — useful for fast iteration, but the merge gate always builds);
2. refuses to start if the port already answers HTTP (never test an unknown
   server);
3. starts the production server with `next start` on `127.0.0.1:$TEST_HTTP_PORT`;
4. polls `/` until the server answers (60 s cap) and fails with the captured
   server stderr if it will not start;
5. runs `vitest run --config vitest.config.ts` with
   `TEST_HTTP_BASE_URL=http://127.0.0.1:$TEST_HTTP_PORT`;
6. always stops the server (SIGTERM, SIGKILL after 5 s) and exits with the
   test status.

The build is the production build: what the suite asserts is the artefact that
deploys, not a dev-server rendering.

## Merge gate

Every ticket merges only when the following passes from its worktree:

```bash
npm run typecheck && npm run lint && npm test
```

The suite must pass from an empty `.next`; `npm test` builds it itself.

## What the shell suite asserts

`tests/http/shell.test.ts`, through `tests/http/helpers.ts`:

- canonical document: `lang="fr"`, one `<header>` banner, one `<main>`
  (`#contenu`, focusable) and one `<footer>` contentinfo, with the skip link as
  the first focusable element and pointing at the main landmark;
- French metadata: the HAY2010 title and the approved positioning description,
  within the SEO length bounds;
- empty homepage: the shell renders around an empty `<main>` (homepage sections
  are #23) and no framework-template copy remains;
- one navigation source: the header's five P1 rubriques render in order and the
  footer links come from the same list; only declared routes, `#` targets and
  the `mailto:` channel are linked;
- footer identity: badge, registered address, `contact@hay2010.ma` and the legal
  line; no phone, social, newsletter or recruitment mailbox;
- privacy surface: no form control, no analytics script or API marker, no
  consent banner, no tracking cookie in `Set-Cookie`;
- brand styling: the served stylesheet carries the ink/paper/orange palette
  tokens and the shadcn semantic names mapped onto them, self-hosted Poppins is
  preloaded and embedded, keyboard focus is visible (2 px ring, 2 px offset) and
  reduced-motion is honoured;
- light theme only: no `dark` class and no theme provider.

The assertions are behaviour-level (status, headers, landmarks, document text,
served CSS), never class names or internal call order. A removed behaviour
fails the suite: delete the palette, the skip link, the nav source or the
privacy guarantees and `npm test` goes red.

## Files

| File                        | Role                                                    |
| --------------------------- | ------------------------------------------------------- |
| `scripts/test-http.mjs`     | build → serve → test → clean up, one command            |
| `vitest.config.ts`          | node environment, `tests/**/*.test.ts`, 20 s timeouts   |
| `tests/http/helpers.ts`     | fetch + parse helpers, canonical-document assertions    |
| `tests/http/shell.test.ts`  | the #20 acceptance criteria over HTTP                   |

## Extending it (later tickets)

Extend this suite; do not add a second runner or component tests.

- **Routes and content** (#21–#28): add test files under `tests/http/` and use
  the helpers (`fetchPage`, `assertCanonicalDocument`, `textOf`). New routes
  can render full trames and be asserted as documents.
- **Gate scenarios** (#21+): the content source is selected by environment
  (fixture corpus, gate flags). The orchestrator passes through its environment,
  so a scenario is an env var on the `npm test` command — for example
  `SKIP_BUILD=1 GATES=all-open TEST_HTTP_PORT=3120 node scripts/test-http.mjs`
  runs the suite with the fixture gates open. The name and shape of that
  variable belong to #21; when scenarios need a different server state, extend
  `scripts/test-http.mjs` to restart the server per scenario group rather than
  spawning a second runner.
- **Legacy redirects/410s** (#32): fetch with `redirect: "manual"` (already the
  default in `fetchPage`) and assert status and `location`.
- Keep tests deterministic and self-cleaning: no CMS, no Postgres, no network at
  test time, no shared server outside the orchestrator. Fonts are fetched once
  at build time by `next/font` and self-hosted from then on, so visitors and
  tests never contact Google.
