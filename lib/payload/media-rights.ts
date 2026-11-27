/**
 * Media rights — the "no image on published content until its permission is
 * recorded" rule (content model §7, ticket #29).
 *
 * Three independent layers, on purpose:
 *
 * 1. `validateMediaRights` (media `beforeChange`): a media record cannot be
 *    saved as `cleared` unless the evidence is coherent — a rights reference,
 *    a signed release when people are identifiable, client AND trademark
 *    permission when client marks are visible;
 * 2. `publishedMediaRightsHook` (the referencing collection's `beforeValidate`,
 *    applied here to `pages.cover`): publishing a document whose upload is not
 *    cleared is rejected with a validation error. It merges `originalDoc` with
 *    the incoming update because an update payload is a *delta*: a
 *    `_status: 'published'` PATCH carries no cover field at all, and an upload
 *    relation arrives as an id, not a populated document;
 * 3. the content adapter (lib/content/providers/cms.ts) only returns cleared
 *    media, and the media collection's public read access filters anonymous
 *    reads to `rightsStatus: cleared`, so a revocation hides the image on the
 *    next render even if a hook missed a path.
 *
 * The visibility rule itself — "this image may appear on the public site" — is
 * defined once, at the seam level (`lib/content/media-rights.ts`), and is
 * applied by both providers and by `mediaIsCleared` below; this module only
 * adds the admin-side save-time validation and the publish hooks around it.
 */
import { mediaRightsCleared } from "../content/media-rights"
import type { MediaRights } from "../content/types"
import { Forbidden, ValidationError } from "payload"
import type {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  GlobalBeforeChangeHook,
  GlobalBeforeValidateHook,
  PayloadRequest,
} from "payload"

/** The rights fields of a media record (content model §5.2 `media`). */
export interface MediaRightsValues {
  readonly rightsStatus?: string | null
  readonly rightsReference?: string | null
  readonly peoplePresent?: boolean | null
  readonly releaseStatus?: string | null
  readonly clientMarks?: boolean | null
  readonly clientPermission?: boolean | null
  readonly trademarkPermission?: boolean | null
}

/** A validation problem, shaped for Payload's `ValidationError`. */
export interface RightsProblem {
  readonly field: string
  readonly message: string
}

/**
 * Problems that make a rights status incoherent. Empty for a non-cleared
 * record (a pending image is a valid state and simply cannot be published).
 */
export function mediaRightsProblems(media: MediaRightsValues): RightsProblem[] {
  if (media.rightsStatus !== "cleared") return []

  const problems: RightsProblem[] = []

  if (!media.rightsReference?.trim()) {
    problems.push({
      field: "rightsReference",
      message:
        "Référence des droits requise : une image « cleared » doit porter la licence, l’autorisation ou la preuve de propriété.",
    })
  }

  if (media.peoplePresent === true && media.releaseStatus !== "cleared") {
    problems.push({
      field: "releaseStatus",
      message:
        "Personnes identifiables : l’autorisation de diffusion doit être enregistrée (« cleared ») avant de déclarer l’image utilisable.",
    })
  }

  if (
    media.clientMarks === true &&
    !(media.clientPermission === true && media.trademarkPermission === true)
  ) {
    problems.push({
      field: "clientPermission",
      message:
        "Marques client : l’autorisation du client et celle du titulaire de la marque sont toutes deux requises.",
    })
  }

  return problems
}

/** Map the admin's rights fields onto the seam rights model. */
function toSeamRights(media: MediaRightsValues): MediaRights {
  return {
    status:
      media.rightsStatus === "cleared"
        ? "cleared"
        : media.rightsStatus === "revoked"
          ? "revoked"
          : "pending",
    basis: "unknown",
    permissionReference: media.rightsReference?.trim() || undefined,
    peoplePresent: media.peoplePresent === true,
    releaseStatus:
      media.releaseStatus === "cleared"
        ? "cleared"
        : media.releaseStatus === "pending"
          ? "pending"
          : "not-required",
    clientMarks: media.clientMarks === true,
    clientPermission: media.clientPermission === true,
    trademarkPermission: media.trademarkPermission === true,
  }
}

/**
 * May this media record be attached to published content?
 *
 * The visibility rule is the seam predicate (`mediaRightsCleared`,
 * lib/content/media-rights.ts) — the exact rule the providers apply when they
 * read media — so the admin and the rendered site can never disagree. On top of
 * it, the admin requires coherent evidence (`mediaRightsProblems`): a
 * `cleared` record must name its rights reference, which is a save-time
 * validation the seam record does not need to judge.
 */
export function mediaIsCleared(media: MediaRightsValues): boolean {
  return (
    mediaRightsCleared(toSeamRights(media)) &&
    mediaRightsProblems(media).length === 0
  )
}

/** Throw a Payload `ValidationError` for coherent rights evidence. */
function throwRightsProblems(problems: readonly RightsProblem[]): void {
  if (!problems.length) return
  throw new ValidationError({
    errors: problems.map((problem) => ({ message: problem.message, path: problem.field })),
  })
}

/** `media` beforeChange: no incoherent `cleared` record can be saved. */
export const validateMediaRights: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const merged: MediaRightsValues = {
    ...((originalDoc ?? {}) as unknown as MediaRightsValues),
    ...((data ?? {}) as unknown as MediaRightsValues),
  }
  throwRightsProblems(mediaRightsProblems(merged))
  return data
}

/** Resolve an upload relation value (id or populated document) to rights values. */
export async function resolveMediaValue(
  value: unknown,
  req: PayloadRequest
): Promise<MediaRightsValues | null> {
  if (value === null || value === undefined || value === "") return null

  if (typeof value === "object") {
    const document = value as Record<string, unknown>
    if (typeof document.rightsStatus === "string") return document as MediaRightsValues
    const id = document.id
    if (id === undefined || id === null) return null
    return resolveMediaValue(id, req)
  }

  if (typeof value !== "number" && typeof value !== "string") return null

  const media = await req.payload.findByID({
    collection: "media",
    id: value,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return media as unknown as MediaRightsValues
}

interface PublishedMediaCheck {
  readonly data?: Record<string, unknown> | null
  readonly originalDoc?: Record<string, unknown> | null
  readonly req: PayloadRequest
  /**
   * Upload fields of the referencing document. Top-level names (`cover`) and
   * dotted array paths with a `*` segment (`gallery.*.image`) are supported, so
   * an upload nested in an array is gated exactly like a top-level one.
   */
  readonly uploadFields: readonly string[]
}

/** Read every value a dotted field path points at (`*` expands array items). */
function readPathValues(record: Record<string, unknown>, path: string): unknown[] {
  const segments = path.split(".")
  let values: unknown[] = [record]

  for (const segment of segments) {
    const next: unknown[] = []
    for (const value of values) {
      if (segment === "*") {
        if (Array.isArray(value)) next.push(...value)
        continue
      }
      if (value === null || value === undefined) continue
      if (typeof value !== "object") continue
      next.push((value as Record<string, unknown>)[segment])
    }
    values = next
  }

  return values.filter((value) => value !== null && value !== undefined && value !== "")
}

/**
 * Reject publishing a document whose upload fields are not rights-cleared.
 *
 * The effective status is read from the merged record, because a publish PATCH
 * sends only `_status`: `data._status` alone is not the stored status, and
 * `data[field]` alone is empty on updates — the naive check silently publishes
 * uncleared media (verified in #29 research).
 */
export async function enforcePublishedMediaRights({
  data,
  originalDoc,
  req,
  uploadFields,
}: PublishedMediaCheck): Promise<void> {
  if (!data) return

  const merged: Record<string, unknown> = { ...(originalDoc ?? {}), ...data }
  if (merged._status !== "published") return

  const errors: Array<{ message: string; path: string }> = []

  for (const field of uploadFields) {
    for (const value of readPathValues(merged, field)) {
      const media = await resolveMediaValue(value, req)
      if (!media) {
        errors.push({ message: "Média introuvable.", path: field })
        continue
      }
      if (!mediaIsCleared(media)) {
        errors.push({
          message:
            "Image sans droits enregistrés : la publication est bloquée tant que sa permission n’est pas « cleared ».",
          path: field,
        })
      }
    }
  }

  if (errors.length) throw new ValidationError({ errors })
}

/** Build the referencing collection's `beforeValidate` hook. */
export function publishedMediaRightsHook(
  uploadFields: readonly string[]
): CollectionBeforeValidateHook {
  return async ({ data, originalDoc, req }) => {
    await enforcePublishedMediaRights({
      data: data as Record<string, unknown> | undefined,
      originalDoc: originalDoc as Record<string, unknown> | undefined,
      req,
      uploadFields,
    })
    return data
  }
}

/** Build the global's `beforeValidate` hook (same gate as collections). */
export function publishedGlobalMediaRightsHook(
  uploadFields: readonly string[]
): GlobalBeforeValidateHook {
  return async ({ data, originalDoc, req }) => {
    await enforcePublishedMediaRights({
      data: data as Record<string, unknown> | undefined,
      originalDoc: originalDoc as Record<string, unknown> | undefined,
      req,
      uploadFields,
    })
    return data
  }
}

/**
 * Editor publish lock (content model §4: the editor creates and edits drafts,
 * never publishes).
 *
 * A query constraint on `update` hides the Publish button and scopes which
 * documents are updatable, but an API PATCH with `{ "_status": "published" }`
 * still succeeds; this hook is the enforcement. `Forbidden` is what the REST
 * layer turns into a 403.
 *
 * The rule is shared by collections and globals (#30's page globals are
 * publishable singletons), so the core is a plain function with two thin typed
 * wrappers.
 */
export function enforceEditorPublishLock({
  data,
  originalDoc,
  req,
}: {
  data?: Record<string, unknown> | null
  originalDoc?: Record<string, unknown> | null
  req: PayloadRequest
}): void {
  const role = (req.user as { role?: string } | null | undefined)?.role
  if (role !== "editor") return

  const target = data?._status
  const current = originalDoc?._status
  if (target === "published" || (target === undefined && current === "published")) {
    throw new Forbidden(req.t)
  }
}

/** Collection hook: the editor can never publish a document. */
export const preventEditorPublish: CollectionBeforeChangeHook = (args) => {
  enforceEditorPublishLock(args)
  return args.data
}

/** Global hook: the editor can never publish a page singleton. */
export const preventEditorPublishGlobal: GlobalBeforeChangeHook = (args) => {
  enforceEditorPublishLock(args)
  return args.data
}
