/**
 * Embedded Payload 3 configuration — tickets #29 (foundation) and #30 (content
 * types, seed, gate visibility).
 *
 * One deployment: the admin is served by this Next.js app at `/admin` on the
 * same origin, the REST API at `/api`, GraphQL at `/api/graphql`, and Postgres
 * holds content and accounts (docs/content/content-model.md §1, §11).
 *
 * Content types (#30): seven page/listing globals (homepage, entreprise,
 * metiers, realisations, contact, carrieres, actualites) and four collections
 * (domaines, projects, jobs, communiques) plus the #29 users/media collections.
 * The code that publishes them stays code-owned: gates, identity, approved
 * claims, nav labels, SEO defaults, link targets and route keys are not Payload
 * fields (content model §3).
 *
 * Command surface (see docs/build/cms.md):
 *   npm run generate:types       # regenerate + commit payload-types.ts
 *   npm run generate:importmap   # regenerate + commit app/(payload)/admin/importMap.js
 *   npm run migrate:create -- <name> [--skip-empty]
 *   npm run migrate / migrate:status
 *   npm run seed                 # dev bootstrap: accounts, media, fixture corpus
 *   npm run test:cms             # disposable Postgres + CMS build + parity + HTTP suite
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

import { Communiques } from "./collections/Communiques"
import { Domaines } from "./collections/Domaines"
import { Jobs } from "./collections/Jobs"
import { Media } from "./collections/Media"
import { Projects } from "./collections/Projects"
import { Users } from "./collections/Users"
import { Actualites } from "./globals/Actualites"
import { Carrieres } from "./globals/Carrieres"
import { Contact } from "./globals/Contact"
import { Entreprise } from "./globals/Entreprise"
import { Homepage } from "./globals/Homepage"
import { Metiers } from "./globals/Metiers"
import { Realisations } from "./globals/Realisations"
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
    components: {
      /**
       * Read-only panels above the dashboard (#30): the pages the code keeps
       * gated and why, and the code-owned constants the owner may copy but
       * never edit. Both come from `lib/` literals, not from the database, so a
       * CMS record can never change what they say.
       */
      beforeDashboard: ["/components/admin/dashboard-panels#DashboardPanels"],
    },
  },
  collections: [Users, Media, Domaines, Projects, Jobs, Communiques],
  globals: [
    Homepage,
    Entreprise,
    Metiers,
    Realisations,
    Contact,
    Carrieres,
    Actualites,
  ],
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
