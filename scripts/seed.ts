/**
 * Idempotent development/bootstrap seed for the embedded Payload database
 * (ticket #29 foundation; #30 replaces the page corpus with the decided copy).
 *
 * Run with `npm run seed` and a reachable `DATABASE_URL`:
 *
 *   export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5529/hay2010
 *   export PAYLOAD_SECRET=dev-only
 *   npm run migrate && npm run seed
 *
 * It creates through the Local API (never raw SQL) so the collection hooks —
 * media rights validation, the publish media gate, the editor publish lock —
 * run exactly as they do in production. `overrideAccess: true` is required
 * because the seed has no authenticated user.
 *
 * Account emails live in `lib/payload/seed-accounts.ts` so the CMS verification
 * suite (`npm run test:cms`) logs in with the same identities. Password:
 * `CMS_SEED_PASSWORD` or the documented development value — never a production
 * credential (production accounts are created during the handover, #34).
 *
 * The seed is the *foundation* seed only: three accounts, two media records
 * (one rights-pending, one cleared) and the P1 pages the adapter needs to prove
 * a route renders from the CMS. #30 owns the full corpus.
 */
import sharp from "sharp"

import { getPayload } from "payload"

import config from "../payload.config"
import { SEED_ACCOUNTS, seedPassword } from "../lib/payload/seed-accounts"
import type { ContentBlock, RubriqueKey } from "../lib/content/types"
import type { Media } from "../payload-types"

/** A generated solid-colour PNG, so the seed needs no binary asset in Git. */
async function generatePng(width: number, height: number, rgb: [number, number, number]) {
  const data = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: rgb[0], g: rgb[1], b: rgb[2] },
    },
  })
    .png()
    .toBuffer()
  return { data, mimetype: "image/png", size: data.length }
}

async function seedAccounts(payload: Awaited<ReturnType<typeof getPayload>>): Promise<void> {
  const password = seedPassword()
  for (const account of SEED_ACCOUNTS) {
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: account.email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      console.log(`seed: compte ${account.email} déjà présent`)
      continue
    }
    await payload.create({
      collection: "users",
      data: {
        email: account.email,
        name: account.name,
        password,
        role: account.role,
        active: true,
      },
      overrideAccess: true,
    })
    console.log(`seed: compte ${account.email} créé (${account.role})`)
  }
}

interface SeedMedia {
  readonly filename: string
  readonly alt: string
  readonly width: number
  readonly height: number
  readonly colour: [number, number, number]
  readonly rightsBasis: Media["rightsBasis"]
  readonly rightsStatus: Media["rightsStatus"]
  readonly data: Partial<
    Pick<
      Media,
      | "caption"
      | "credit"
      | "rightsReference"
      | "peoplePresent"
      | "releaseStatus"
      | "releaseReference"
      | "clientMarks"
      | "clientPermission"
      | "trademarkPermission"
    >
  >
}

async function seedMedia(
  payload: Awaited<ReturnType<typeof getPayload>>
): Promise<Map<string, Media>> {
  const definitions: SeedMedia[] = [
    {
      filename: "media-droits-en-attente.png",
      alt: "Visuel de test sur fond bleu — droits en attente de validation.",
      width: 1600,
      height: 1200,
      colour: [37, 99, 235],
      rightsBasis: "company-owned",
      rightsStatus: "pending",
      data: {
        credit: "HAY2010",
        // Identifiable people without a signed release: must stay unpublishable.
        peoplePresent: true,
        releaseStatus: "pending",
      },
    },
    {
      filename: "media-droits-valides.png",
      alt: "Visuel de test sur fond vert — droits validés, utilisable sur le site.",
      width: 1200,
      height: 800,
      colour: [22, 163, 74],
      rightsBasis: "company-owned",
      rightsStatus: "cleared",
      data: {
        credit: "HAY2010",
        rightsReference: "AUT-SEED-PROPRIETE-1",
        peoplePresent: false,
        releaseStatus: "not-required",
        clientMarks: false,
      },
    },
  ]

  const byFilename = new Map<string, Media>()

  for (const definition of definitions) {
    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: definition.filename } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const found = existing.docs[0]
    if (found) {
      byFilename.set(definition.filename, found)
      console.log(`seed: média ${definition.filename} déjà présent`)
      continue
    }

    const file = await generatePng(definition.width, definition.height, definition.colour)
    const created = await payload.create({
      collection: "media",
      data: {
        alt: definition.alt,
        rightsBasis: definition.rightsBasis,
        rightsStatus: definition.rightsStatus,
        ...definition.data,
      },
      file: { ...file, name: definition.filename },
      overrideAccess: true,
    })
    byFilename.set(definition.filename, created)
    console.log(`seed: média ${definition.filename} créé (${created.width}×${created.height})`)
  }

  return byFilename
}

interface SeedPage {
  readonly key: RubriqueKey
  readonly title: string
  /**
   * Meta description. The foundation seed carries short factual lines so pages
   * whose metadata requires a description (À propos) build; #30 replaces them
   * with the decided SEO copy.
   */
  readonly description?: string
  readonly status: "draft" | "published"
  readonly blocks?: ContentBlock[]
  /** Filename of a seeded media record attached as the page cover. */
  readonly coverFilename?: string
}

/**
 * The P1 pages the adapter needs. The publish state mirrors the fixture `p1`
 * scenario (`content/fixtures/scenarios/p1.json`): the four core pages and the
 * two legal utility pages are published, Réalisations is a draft so the CMS
 * verification suite can prove a CMS-unpublished page 404s while it exists in
 * the database, and Carrières is absent (footer-only, closed at launch, #27).
 * #30 replaces this corpus with the decided French copy.
 */
const SEED_PAGES: readonly SeedPage[] = [
  {
    key: "accueil",
    title: "Accueil",
    description:
      "HAY2010, entreprise d’éclairage public et d’électrification à Rabat : HTA/MT, MT/BT, postes de transformation et CFO/CFA.",
    status: "published",
  },
  {
    key: "a-propos",
    title: "À propos",
    description:
      "SOCIETE HAY 2010, entreprise d’éclairage public et d’électrification à Rabat : positionnement, activités, engagements qualité et sécurité.",
    status: "published",
    // Approved identity only — no invented copy (facts register §2.1).
    blocks: [
      {
        kind: "sections",
        title: "Qui sommes-nous",
        items: [
          {
            title: "SOCIETE HAY 2010 SARL",
            body: "Éclairage public et électrification à Rabat.",
          },
        ],
      },
    ],
  },
  {
    key: "domaines-activite",
    title: "Nos domaines d’activité",
    description:
      "Les domaines d’activité de HAY2010 : éclairage public, installations électriques et infrastructures de réseaux électriques à Rabat.",
    status: "published",
  },
  {
    key: "contact",
    title: "Contact",
    description:
      "Contactez HAY2010 par e-mail à contact@hay2010.ma pour vos projets d’éclairage public et d’électrification à Rabat.",
    status: "published",
  },
  {
    key: "carrieres",
    title: "Carrières",
    description:
      "Carrières chez HAY2010 : offres d’emploi, candidatures par e-mail et informations pour rejoindre l’entreprise à Rabat.",
    status: "published",
  },
  // The utility pages are P1 pages: Carrières is footer-only and opens with
  // #27, the legal pages with #28 (the contact and careers notices link the
  // privacy policy). Same publish state as the fixture `p1` scenario.
  {
    key: "mentions-legales",
    title: "Mentions légales",
    description:
      "Mentions légales de SOCIETE HAY 2010 (SARL, RC 87305, ICE 001459327000056) : éditeur, propriété intellectuelle, données personnelles et cookies.",
    status: "published",
  },
  {
    key: "politique-de-confidentialite",
    title: "Politique de confidentialité",
    description:
      "Politique de confidentialité de SOCIETE HAY 2010 : données traitées, finalités, durées de conservation, droits et cookies.",
    status: "published",
  },
  {
    key: "realisations",
    title: "Nos réalisations",
    description:
      "Les réalisations de HAY2010 : méthodes, moyens et références sur demande pour l’éclairage public et l’électrification à Rabat.",
    status: "draft",
    // Rights-pending image: publishing this page must be rejected until the
    // developer records the release (the media rights gate).
    coverFilename: "media-droits-en-attente.png",
  },
]

async function seedPages(
  payload: Awaited<ReturnType<typeof getPayload>>,
  mediaByFilename: Map<string, Media>
): Promise<void> {
  for (const definition of SEED_PAGES) {
    const existing = await payload.find({
      collection: "pages",
      where: { key: { equals: definition.key } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      console.log(`seed: page ${definition.key} déjà présente (${definition.status})`)
      continue
    }

    const cover = definition.coverFilename
      ? mediaByFilename.get(definition.coverFilename)
      : undefined

    await payload.create({
      collection: "pages",
      data: {
        key: definition.key,
        title: definition.title,
        description: definition.description,
        blocks: definition.blocks ?? [],
        cover: cover?.id,
        _status: definition.status,
      },
      overrideAccess: true,
    })
    console.log(`seed: page ${definition.key} créée (${definition.status})`)
  }
}

async function main(): Promise<void> {
  const payload = await getPayload({ config })
  await seedAccounts(payload)
  const media = await seedMedia(payload)
  await seedPages(payload, media)
  console.log("seed: terminé")
}

// Top-level await is required: `payload run` imports the module and then exits
// its process, so a floating `main()` promise would be killed before the first
// query. Exit explicitly to close the Postgres pool.
try {
  await main()
  process.exit(0)
} catch (error) {
  console.error("seed: échec")
  console.error(error)
  process.exit(1)
}
