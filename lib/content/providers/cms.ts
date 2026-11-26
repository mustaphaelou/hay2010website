/**
 * CMS content source — the Payload implementation of the #21 `ContentSource`
 * seam (docs/build/content-seam.md §9).
 *
 * This file is the ONLY module in the app that talks to Payload. It is loaded
 * through a dynamic `import()` from `lib/content/index.ts`, so a fixture build
 * and the whole `npm test` suite never bundle or boot a database. It is
 * activated by `CONTENT_SOURCE=cms` + `DATABASE_URL` (+ `PAYLOAD_SECRET` for
 * the admin), as documented in docs/build/cms.md.
 *
 * Ticket #29 owns the foundation only:
 * - `pages` is the minimal content type; #30 adds the structured globals and
 *   collections of the content model and seeds the fixture corpus;
 * - domains and actualités have no CMS type yet, so `listPublishedDomains` is
 *   empty and `getDomain` returns `null` — the domain routes therefore 404 in
 *   CMS mode until #30 lands them. This is the documented extension point, not
 *   a silent gate.
 *
 * Gate semantics are the seam's contract: published listings only,
 * `getPage` still returns a closed document (a draft page keeps its content),
 * `getDomain` returns `null` when closed, and media leaves the seam only when
 * its rights are cleared.
 */
import type { Payload } from "payload"

import type {
  CareersChannel,
  ContentBlock,
  ContentSource,
  DomainDocument,
  JobOpening,
  MediaRecord,
  PageDocument,
  PublishState,
  RubriqueKey,
} from "@/lib/content/types"
import { isRubriqueKey } from "@/lib/payload/rubrique-keys"
import { RUBRIQUES, getRubrique } from "@/lib/site/rubriques"
import type { Media as MediaDocument, Page as PageDocumentRow } from "@/payload-types"

/** Block kinds the renderers know (mirror of the `ContentBlock` union). */
const KNOWN_BLOCK_KINDS = new Set([
  "hero",
  "intro",
  "presentation",
  "prestations",
  "methods",
  "photos",
  "associees",
  "domaines",
  "reperes",
  "engagements",
  "credentials",
  "contact-cta",
  "contact-channels",
  "sections",
  "steps",
  "openings",
])

/** F-113 closed state: questions go to contact@, no CV invitation (fail closed). */
const CAREERS_CHANNEL_CLOSED: CareersChannel = Object.freeze({
  recruitmentMailboxLive: false,
})

/** One Payload client per server process (it owns the Postgres pool). */
let payloadPromise: Promise<Payload> | null = null

/** Lazily boot Payload with the repo config. Dynamic imports keep it CMS-only. */
async function getPayloadClient(): Promise<Payload> {
  if (!payloadPromise) {
    payloadPromise = (async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        throw new Error(
          "CONTENT_SOURCE=cms requires DATABASE_URL. Configure it in .env.local (see docs/build/cms.md) " +
            "or use CONTENT_SOURCE=fixture (défaut)."
        )
      }
      const { getPayload } = await import("payload")
      const { default: config } = await import("@payload-config")
      return getPayload({ config })
    })().catch((error: unknown) => {
      // Let a later request retry instead of caching a rejected promise forever.
      payloadPromise = null
      throw error
    })
  }
  return payloadPromise
}

/**
 * Validate a JSON `blocks` value against the renderer union.
 *
 * Unknown or malformed blocks are dropped rather than rendered: a page must
 * never fail on content the renderer cannot understand. #30 replaces this
 * transient JSON field with typed blocks.
 */
export function toContentBlocks(value: unknown): ContentBlock[] {
  const list = Array.isArray(value) ? value : []
  return list.filter((block): block is ContentBlock => {
    if (typeof block !== "object" || block === null) return false
    const kind = (block as { kind?: unknown }).kind
    return typeof kind === "string" && KNOWN_BLOCK_KINDS.has(kind)
  })
}

/** Map a CMS media row to the seam record (rights included, cleared only). */
function toMediaRecord(media: MediaDocument): MediaRecord | null {
  const cleared =
    media.rightsStatus === "cleared" &&
    (!media.peoplePresent || media.releaseStatus === "cleared") &&
    (!media.clientMarks || (media.clientPermission === true && media.trademarkPermission === true))
  if (!cleared) return null

  const basis: MediaRecord["rights"]["basis"] =
    media.rightsBasis === "client-supplied"
      ? "authorised"
      : media.rightsBasis === "licensed"
        ? "licensed"
        : media.rightsBasis === "company-owned"
          ? "company-owned"
          : "unknown"

  return {
    id: String(media.id),
    src: media.url ?? undefined,
    alt: media.alt,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
    rights: {
      status: media.rightsStatus,
      basis,
      permissionReference: media.rightsReference ?? undefined,
      peoplePresent: media.peoplePresent === true,
      releaseStatus: media.releaseStatus ?? "not-required",
      clientMarks: media.clientMarks === true,
      clientPermission: media.clientPermission === true,
      trademarkPermission: media.trademarkPermission === true,
    },
  }
}

/** Map a CMS page row to the seam page document. */
function toPageDocument(page: PageDocumentRow): PageDocument | null {
  if (!isRubriqueKey(page.key)) return null
  const key: RubriqueKey = page.key
  return {
    key,
    title: page.title,
    description: page.description ?? undefined,
    blocks: toContentBlocks(page.blocks),
  }
}

/**
 * The code-owned tier gate: at P1 only P1 rubriques may be published. The CMS
 * cannot open a P2/P3 tier (content model §3/§6, and #30 verifies the admin
 * cannot); this predicate is the single place that decides.
 */
function tierAllowsPublication(key: RubriqueKey): boolean {
  return getRubrique(key).tier === "P1"
}

async function findPageByKey(
  payload: Payload,
  key: RubriqueKey,
  options: { publishedOnly: boolean }
): Promise<PageDocumentRow | null> {
  const result = await payload.find({
    collection: "pages",
    where: {
      key: { equals: key },
      ...(options.publishedOnly ? { _status: { equals: "published" } } : {}),
    },
    depth: 0,
    limit: 1,
    pagination: false,
    // `draft: true` returns the latest draft version; a closed page keeps its
    // document (the seam may still expose it by key).
    draft: !options.publishedOnly,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

/** Build the `ContentSource` implementation bound to one Payload instance. */
export function createCmsContentSource(payload: Payload): ContentSource {
  return {
    async getPublishState(key: RubriqueKey): Promise<PublishState> {
      if (!tierAllowsPublication(key)) {
        return {
          published: false,
          reason: `Palier ${getRubrique(key).tier} — ce palier n’est pas ouvert à la publication (gates code-owned, #21).`,
        }
      }
      const page = await findPageByKey(payload, key, { publishedOnly: true })
      if (!page) {
        return {
          published: false,
          reason: "Aucune page publiée dans le CMS pour cette rubrique.",
        }
      }
      return { published: true }
    },

    async listPublishedRubriques(): Promise<readonly RubriqueKey[]> {
      const result = await payload.find({
        collection: "pages",
        where: { _status: { equals: "published" } },
        depth: 0,
        limit: 0,
        pagination: false,
        overrideAccess: true,
      })
      const published = new Set(
        result.docs
          .map((page) => page.key)
          .filter((key): key is RubriqueKey => isRubriqueKey(key) && tierAllowsPublication(key))
      )
      // Registry order, not CMS order (docs/build/content-seam.md §1).
      return RUBRIQUES.filter((rubrique) => published.has(rubrique.key)).map(
        (rubrique) => rubrique.key
      )
    },

    async getPage(key: RubriqueKey): Promise<PageDocument | null> {
      const page = await findPageByKey(payload, key, { publishedOnly: false })
      if (!page) return null
      return toPageDocument(page)
    },

    async listPublishedDomains(): Promise<readonly DomainDocument[]> {
      // No domain content type in the #29 foundation: #30 adds it.
      return []
    },

    async getDomain(): Promise<DomainDocument | null> {
      // A closed or unknown domain must be indistinguishable — both 404.
      return null
    },

    async getActualites() {
      // The P3 actualités model does not exist yet (#30); the corpus is empty.
      return []
    },

    async getOpenJobs(): Promise<readonly JobOpening[]> {
      // No `jobs` collection exists in the #29 foundation (the content model's
      // jobs type is #30 work). An empty list is the honest state of the launch
      // corpus too: no opening has been confirmed by the owner (fixture `p1`
      // closes every jobs gate). #30 adds the collection and applies the seam
      // filters here — publish gate open, not past `closingAt`, featured first,
      // then `postedAt` descending (forms doc §4.2).
      return []
    },

    async getCareersChannel(): Promise<CareersChannel> {
      // F-113 gate — code-owned deployment state, NEVER CMS-editable: opening
      // `recrutement@hay2010.ma` is a gated claim until the CNDP authorization
      // covers the mailbox (facts register §2.3/§3, forms doc §4.4/§4.9). At
      // launch the gate is closed: the page points at contact@ only and never
      // invites a CV. Opening it is a code change that carries the real
      // authorization number and date — not an admin action (#30/#34).
      return CAREERS_CHANNEL_CLOSED
    },

    async getMedia(id: string): Promise<MediaRecord | null> {
      const numericId = Number(id)
      if (!Number.isInteger(numericId) || numericId <= 0) return null
      try {
        const media = await payload.findByID({
          collection: "media",
          id: numericId,
          depth: 0,
          overrideAccess: true,
        })
        return toMediaRecord(media)
      } catch {
        return null
      }
    },
  }
}

/**
 * Entry point called by `lib/content/index.ts` for `CONTENT_SOURCE=cms`.
 * The returned source is a process-wide singleton (Payload owns the pool).
 */
export async function getCmsContentSource(): Promise<ContentSource> {
  const payload = await getPayloadClient()
  cmsSource ??= createCmsContentSource(payload)
  return cmsSource
}

let cmsSource: ContentSource | null = null
