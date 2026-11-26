/**
 * Embedded Payload 3 configuration — ticket #29 foundation.
 *
 * One deployment: the admin is served by this Next.js app at `/admin` on the
 * same origin, the REST API at `/api`, GraphQL at `/api/graphql`, and Postgres
 * holds content and accounts (docs/content/content-model.md §1, §11).
 *
 * Command surface (see docs/build/cms.md):
 *   npm run generate:types       # regenerate + commit payload-types.ts
 *   npm run generate:importmap   # regenerate + commit app/(payload)/admin/importMap.js
 *   npm run migrate:create -- <name> [--skip-empty]
 *   npm run migrate / migrate:status
 *   npm run seed                 # dev bootstrap accounts + #29 foundation content
 *
 * The content frontend never imports this file: the `cms` content provider
 * (lib/content/providers/cms.ts) is the only consumer, loaded through a dynamic
 * import so fixture builds and `npm test` need no database.
 */
import path from "node:path"
import { fileURLToPath } from "node:url"

import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { s3Storage } from "@payloadcms/storage-s3"
import { en } from "@payloadcms/translations/languages/en"
import { fr } from "@payloadcms/translations/languages/fr"
import { buildConfig } from "payload"
import sharp from "sharp"

import { Media } from "./collections/Media"
import { Pages } from "./collections/Pages"
import { Users } from "./collections/Users"
import { s3StorageOptions } from "./lib/payload/storage"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * `PAYLOAD_SECRET` signs sessions and tokens. It is required for a running
 * admin (set in `.env.local` / Coolify), never committed. An empty value is
 * tolerated by `buildConfig` so `next build` in fixture mode — which compiles
 * the `(payload)` routes without booting an admin — does not need a secret.
 * Requesting the admin without it fails closed at the Payload layer.
 */
const secret = process.env.PAYLOAD_SECRET?.trim() ?? ""

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "— HAY2010",
      description: "Back-office du site HAY2010.",
    },
  },
  collections: [Users, Media, Pages],
  globals: [],
  editor: lexicalEditor(),
  secret,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    migrationDir: path.resolve(dirname, "migrations"),
    /**
     * No `prodMigrations`: migrations are an explicit deploy step, not a side
     * effect of `next build` (docs/build/cms.md "Migrations"). Enabling it here
     * makes `next build` initialize Payload and run migrations while it
     * prerenders CMS-backed pages, which blocks on an interactive prompt for a
     * database that was not migration-managed (verified in #29 research).
     */
  }),
  sharp,
  i18n: {
    supportedLanguages: { en, fr },
    fallbackLanguage: "fr",
  },
  plugins: [s3Storage(s3StorageOptions())],
})
