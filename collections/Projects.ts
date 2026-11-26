/**
 * `projects` — named case studies behind `/realisations/{slug}` (content model
 * §5.2 `projects`, realisations strategy §4, ticket #30 schema).
 *
 * The family is gated at P1 (`CASE_STUDIES_LIVE` is false in code), so nothing
 * here is rendered publicly. The *model* and its publish rules are what this
 * ticket delivers:
 *
 * - a named case study is publishable only when the permission fields are
 *   recorded: a `clientName` requires the written client authorisation and its
 *   reference (content model §5.2, §9.3);
 * - an anonymized card requires its `evidenceReference` and no `clientName`;
 * - the cover and gallery images pass the same media-rights gate as every other
 *   upload (owed permission = no publish);
 * - identifiable people require the project-level `peopleRelease`, and a
 *   testimonial requires `testimonialPermission` + reference.
 *
 * The owner drafts; permanent deletion stays developer-only (unpublish instead).
 */
import { ValidationError } from "payload"
import type { CollectionBeforeValidateHook, CollectionConfig, PayloadRequest } from "payload"

import {
  canAccessAdmin,
  canCreateContent,
  deleteDeveloperOnly,
  developerOnlyField,
  ownerOrDeveloperField,
  readPublishedOrStaff,
  updateContent,
} from "../access/roles"
import { richTextField, seoField, textareaField, textField, uploadField } from "../lib/payload/fields"
import {
  preventEditorPublish,
  publishedMediaRightsHook,
  resolveMediaValue,
} from "../lib/payload/media-rights"
import { CONTENT_TAGS, invalidateContent } from "../lib/payload/revalidate"

const nonEmpty = (value: unknown): boolean =>
  typeof value === "string" && value.trim().length > 0

/** Resolve every upload referenced by a project (cover + gallery images). */
async function referencedMediaIds(merged: Record<string, unknown>): Promise<unknown[]> {
  const values: unknown[] = []
  if (merged.cover !== undefined && merged.cover !== null && merged.cover !== "") {
    values.push(merged.cover)
  }
  const gallery = Array.isArray(merged.gallery) ? merged.gallery : []
  for (const item of gallery) {
    const image = (item as { image?: unknown } | null)?.image
    if (image !== undefined && image !== null && image !== "") values.push(image)
  }
  return values
}

/**
 * Publish validation — the permission chain of content model §5.2/§9.3.
 *
 * It reads the merged (effective) record because a publish PATCH carries only
 * `_status`; without the merge, a permission could be "missing" on the update
 * payload and the publish would silently pass (or falsely fail).
 */
export const validateProjectPublish: CollectionBeforeValidateHook = async ({
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

  const services = Array.isArray(merged.services) ? merged.services : []
  if (services.length === 0) {
    errors.push({
      message: "Une étude de cas doit être rattachée à au moins un domaine d’activité.",
      path: "services",
    })
  }

  if (nonEmpty(merged.clientName)) {
    if (merged.clientPermission !== true) {
      errors.push({
        message:
          "Nom du client : l’autorisation écrite du client est requise avant publication.",
        path: "clientPermission",
      })
    }
    if (!nonEmpty(merged.clientPermissionRef)) {
      errors.push({
        message: "Nom du client : la référence de l’autorisation écrite est requise.",
        path: "clientPermissionRef",
      })
    }
  } else if (!nonEmpty(merged.evidenceReference)) {
    errors.push({
      message:
        "Carte anonymisée : la référence de preuve (contrat ou procès-verbal de réception) est requise.",
      path: "evidenceReference",
    })
  }

  if (nonEmpty(merged.testimonial)) {
    if (merged.testimonialPermission !== true || !nonEmpty(merged.testimonialPermissionRef)) {
      errors.push({
        message:
          "Témoignage : l’accord écrit de son auteur et sa référence sont requis avant publication.",
        path: "testimonialPermission",
      })
    }
  }

  for (const value of await referencedMediaIds(merged)) {
    const media = await resolveMediaValue(value, req)
    if (media?.peoplePresent === true && merged.peopleRelease !== true) {
      errors.push({
        message:
          "Personnes identifiables sur une image : l’autorisation de diffusion du projet est requise (peopleRelease).",
        path: "peopleRelease",
      })
      break
    }
  }

  if (errors.length) throw new ValidationError({ errors })
  return data
}

/** The project upload fields checked by the media-rights publish gate. */
const PROJECT_UPLOAD_FIELDS = ["cover", "gallery.*.image"] as const

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Étude de cas", plural: "Études de cas" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "clientName", "_status", "updatedAt"],
    group: "Contenu (fermé)",
    description:
      "Études de cas nommées, famille fermée par la barrière code-owned `caseStudiesLive`. Une étude nommée n’est publiable qu’avec l’autorisation écrite du client ; une carte anonymisée exige une référence de preuve.",
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
      validateProjectPublish,
      publishedMediaRightsHook([...PROJECT_UPLOAD_FIELDS, "seo.ogImage"]),
    ],
    beforeChange: [preventEditorPublish],
    afterChange: [
      async ({ doc }) => {
        invalidateContent({
          paths: ["/realisations"],
          tags: [CONTENT_TAGS.projects],
        })
        return doc
      },
    ],
  },
  fields: [
    textField("title", "Titre", "Objet de l’étude de cas, sans nom de client inventé.", true),
    textField(
      "slug",
      "Identifiant (slug)",
      "Réservé à la future route de fiche ; la famille /realisations/{slug} reste fermée.",
      true
    ),
    {
      name: "services",
      type: "relationship",
      relationTo: "domaines",
      hasMany: true,
      label: "Domaines d’activité",
      required: true,
      admin: { description: "Un ou plusieurs domaines publiés." },
    },
    textField("location", "Lieu", "Région par défaut ; une ville seulement si elle n’identifie pas le client."),
    {
      name: "year",
      type: "number",
      label: "Année",
      admin: { step: 1 },
    },
    {
      name: "clientName",
      type: "text",
      label: "Nom du client",
      admin: {
        description:
          "Ne s’affiche qu’avec l’autorisation écrite du client. Laisser vide pour une carte anonymisée.",
      },
    },
    {
      name: "clientPermission",
      type: "checkbox",
      label: "Autorisation écrite du client",
      defaultValue: false,
      admin: {
        description:
          "Obligatoire pour publier un nom de client (content model §9.3).",
      },
    },
    {
      name: "clientPermissionRef",
      type: "text",
      label: "Référence de l’autorisation client",
      access: { create: developerOnlyField, update: developerOnlyField },
    },
    textareaField("scope", "Périmètre (une ligne)"),
    richTextField("challenge", "Contexte et enjeu"),
    richTextField("solution", "Solution mise en œuvre"),
    richTextField("results", "Résultats"),
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Image de couverture",
      admin: {
        description:
          "Optionnelle pour une carte anonymisée (repli typographique). Une image sans droits validés bloque la publication.",
      },
    },
    {
      name: "gallery",
      type: "array",
      label: "Galerie",
      fields: [uploadField("image", "Image", "Droits validés requis."), textField("caption", "Légende")],
    },
    {
      name: "peopleRelease",
      type: "checkbox",
      label: "Autorisation des personnes photographiées",
      defaultValue: false,
    },
    {
      name: "peopleReleaseRef",
      type: "text",
      label: "Référence de l’autorisation des personnes",
      access: { create: developerOnlyField, update: developerOnlyField },
    },
    {
      name: "testimonial",
      type: "textarea",
      label: "Témoignage",
      access: { create: ownerOrDeveloperField, update: ownerOrDeveloperField },
    },
    {
      name: "testimonialPermission",
      type: "checkbox",
      label: "Accord écrit de l’auteur du témoignage",
      defaultValue: false,
    },
    {
      name: "testimonialPermissionRef",
      type: "text",
      label: "Référence de l’accord du témoignage",
      access: { create: developerOnlyField, update: developerOnlyField },
    },
    {
      name: "evidenceReference",
      type: "text",
      label: "Référence de preuve",
      access: { create: developerOnlyField, update: developerOnlyField },
      admin: {
        description:
          "Contrat ou procès-verbal de réception (obligatoire pour une carte anonymisée).",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "Éligible au renvoi de la page d’accueil",
      defaultValue: false,
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Date de publication",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    seoField(),
  ],
}
