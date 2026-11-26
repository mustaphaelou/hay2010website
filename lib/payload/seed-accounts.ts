/**
 * Seed accounts of the development/test database — the only values shared by
 * `scripts/seed.ts` and the CMS verification suite (`npm run test:cms`).
 *
 * These are NOT production credentials: `scripts/seed.ts` is the dev bootstrap
 * (docs/build/cms.md), production accounts are created by the developer during
 * the handover (#34). The password comes from `CMS_SEED_PASSWORD` when set;
 * otherwise a well-known development value is used and any production run of
 * the seed must set its own.
 */

export interface SeedAccount {
  readonly email: string
  readonly name: string
  readonly role: "developer" | "owner" | "editor"
}

export const SEED_ACCOUNTS: readonly SeedAccount[] = [
  { email: "developpeur@hay2010.test", name: "Développeur", role: "developer" },
  { email: "proprietaire@hay2010.test", name: "Propriétaire", role: "owner" },
  { email: "contributeur@hay2010.test", name: "Contributeur", role: "editor" },
]

/** Development password used when `CMS_SEED_PASSWORD` is not set. */
export const DEFAULT_SEED_PASSWORD = "hay2010-dev-only"

export function seedPassword(env: NodeJS.ProcessEnv = process.env): string {
  return env.CMS_SEED_PASSWORD?.trim() || DEFAULT_SEED_PASSWORD
}
