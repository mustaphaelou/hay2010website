/**
 * `communiques` — company announcements (content model §5.2 `communiques`,
 * ticket #30 acceptance: the model exists while `/actualites` and its
 * navigation entry stay gated).
 *
 * Policy enforced here:
 * - the public label is « Actualités », the route `/actualites`; the internal
 *   type stays `communiques` (company announcements, not journalism);
 * - maximum six per year: the publish hook refuses the seventh;
 * - the first publication requires `legalReviewed` (developer-only field), set
 *   after Moroccan counsel reviewed the wording;
 * - the route is gated by the code-owned `actualitesLive` flag, which the admin
 *   cannot open: the content adapter returns no actualité while it is false.
 *
 * No authors, tags, categories, comments, RSS or related-post loops (loi 88-13
 * guardrails, content model §9.1) are modelled.
 */
import { ValidationError } from "payload"
import type { CollectionBeforeValidateHook, CollectionConfig, PayloadRequest } from "payload"

import {
  canAccessAdmin,
  canCreateContent,
  deleteDeveloperOnly,
  developerOnlyField,
  readPublishedOrStaff,
  updateContent,
} from "../access/roles"
import { richTextField, seoField, textField, uploadField } from "../lib/payload/fields"
import {
  preventEditorPublish,
  publishedMediaRightsHook,
} from "../lib/payload/media-rights"
import { CONTENT_TAGS, invalidateContent } from "../lib/payload/revalidate"

/** Maximum announcements per calendar year (content model §5.2). */
export const MAX_COMMUNIQUES_PER_YEAR = 6

/** Count published communiqués whose `publishedAt` falls in one year. */
async function countPublishedInYear(
  year: number,
  req: PayloadRequest,
  excludeId?: number | string
): Promise<number> {
  const start = new Date(Date.UTC(year, 0, 1))
  const end = new Date(Date.UTC(year + 1, 0, 1))
  const result = await req.payload.find({
    collection: "communiques",
    where: {
      and: [
        { _status: { equals: "published" } },
        { publishedAt: { greater_than_equal: start.toISOString() } },
        { publishedAt: { less_than: end.toISOString() } },
      ],
    },
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const docs = result.docs as Array<{ id?: number | string }>
  return docs.filter((doc) => String(doc.id) !== String(excludeId)).length
}

/**
 * Publish validation: counsel review is mandatory and the annual cap is six.
 * Both read the effective status (merge of stored document and PATCH payload).
 */
export const validateCommuniquePublish: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const merged: Record<string, unknown> = {
    ...((originalDoc ?? {}) as Record<string, unknown>),
    ...((data ?? {}) as Record<string, unknown>),
  }
  if (merged._status !== "published") return data

  const errors: Array<{ message: string; path: string }> = []

  if (merged.legalReviewed !== true) {
    errors.push({
      message:
        "Publication refusée : la relecture juridique (legalReviewed) doit être enregistrée par le développeur avant la première mise en ligne.",
      path: "legalReviewed",
    })
  }

  const publishedAt =
    typeof merged.publishedAt === "string" ? merged.publishedAt : new Date().toISOString()
  const year = new Date(publishedAt).getUTCFullYear()
  if (Number.isFinite(year)) {
    const existing = await countPublishedInYear(
      year,
      req,
      (merged.id as number | string | undefined) ?? undefined
    )
    if (existing >= MAX_COMMUNIQUES_PER_YEAR) {
      errors.push({
        message: `Plafond atteint : ${MAX_COMMUNIQUES_PER_YEAR} communiqués publiés au maximum par année civile.`,
        path: "publishedAt",
      })
    }
  }

  if (errors.length) throw new ValidationError({ errors })
  return data
}

export const Communiques: CollectionConfig = {
  slug: "communiques",
  labels: { singular: "Communiqué", plural: "Communiqués" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "_status", "legalReviewed"],
    group: "Contenu (fermé)",
    description:
      "Communiqués d’entreprise (rubrique publique « Actualités »). La route /actualites et le lien de navigation restent fermés par la barrière code-owned `actualitesLive` : le contenu est éditable, pas publiable publiquement depuis l’admin.",
  },
  versions: {
    drafts: { autosave: false },
  },
  access: {
    admin: canAccessAdmin,
    read: readPublishedOrStaff,
    create: canCreateContent,
    update: updateContent,
    delete: deleteDeveloperOnly,
  },
  hooks: {
    beforeValidate: [
      validateCommuniquePublish,
      publishedMediaRightsHook(["cover", "seo.ogImage"]),
    ],
    beforeChange: [preventEditorPublish],
    afterChange: [
      async ({ doc }) => {
        invalidateContent({ tags: [CONTENT_TAGS.communiques] })
        return doc
      },
    ],
  },
  fields: [
    textField("title", "Titre", undefined, true),
    textField("slug", "Identifiant (slug)", "Réservé à la future route d’article.", true),
    textField(
      "excerpt",
      "Chapeau",
      "Deux phrases, utilisées sur la liste et comme description de repli."
    ),
    {
      name: "publishedAt",
      type: "date",
      label: "Date de publication",
      admin: {
        date: { pickerAppearance: "dayOnly" },
        description: "Compte pour le plafond de six communiqués par année civile.",
      },
    },
    uploadField(
      "cover",
      "Image de couverture",
      "Optionnelle. Une image sans droits validés bloque la publication."
    ),
    richTextField("body", "Texte du communiqué"),
    {
      name: "legalReviewed",
      type: "checkbox",
      label: "Relecture juridique effectuée",
      defaultValue: false,
      access: { create: developerOnlyField, update: developerOnlyField },
      admin: {
        description:
          "Développeur uniquement : obligatoire avant la première publication (relecture par un conseil marocain).",
      },
    },
    {
      name: "legalReviewRef",
      type: "text",
      label: "Référence de la relecture juridique",
      access: { create: developerOnlyField, update: developerOnlyField },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "Éligible à un futur encart d’accueil",
      defaultValue: false,
    },
    seoField(),
  ],
}
