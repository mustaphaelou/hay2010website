/**
 * `jobs` — job openings rendered inline on `/carrieres` (content model §5.2
 * `jobs`, forms doc §4.2, ticket #30 schema).
 *
 * - The owner creates, edits, publishes and closes an opening (drafts +
 *   `status: open/closed`); nothing is deleted except by the developer.
 * - `applicationEmail` is a read-only code-owned field: `recrutement@` only when
 *   the F-113 authorization covers the mailbox, `contact@` until then. The
 *   admin can never publish the gated mailbox (registre des faits §2.3).
 * - `closingAt` auto-hides an opening from the public list; the content
 *   provider applies the filter even if the record stays published.
 * - No detail route and no `JobPosting` structured data at launch: the slug is
 *   reserved for phase 2 and never becomes a URL here.
 */
import { ValidationError } from "payload"
import type { CollectionBeforeChangeHook, CollectionConfig } from "payload"

import {
  canAccessAdmin,
  canCreateContent,
  deleteDeveloperOnly,
  developerOnlyField,
  readPublishedOrStaff,
  updateContent,
} from "../access/roles"
import { COMPANY } from "../lib/site/company"
import { richTextField, seoField, textareaField, textField } from "../lib/payload/fields"
import { preventEditorPublish } from "../lib/payload/media-rights"
import { CONTENT_TAGS, invalidateContent } from "../lib/payload/revalidate"

/** `closingAt` must be after `postedAt` when both are set (content model §11.5). */
const validateJobDates: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const merged = { ...(originalDoc ?? {}), ...(data ?? {}) } as {
    postedAt?: string | null
    closingAt?: string | null
  }
  if (!merged.postedAt || !merged.closingAt) return data
  const posted = Date.parse(merged.postedAt)
  const closing = Date.parse(merged.closingAt)
  if (Number.isFinite(posted) && Number.isFinite(closing) && closing < posted) {
    throw new ValidationError({
      errors: [
        {
          message: "La date de clôture doit être postérieure à la date de publication.",
          path: "closingAt",
        },
      ],
    })
  }
  return data
}

export const Jobs: CollectionConfig = {
  slug: "jobs",
  labels: { singular: "Offre d’emploi", plural: "Offres d’emploi" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "openingStatus", "_status", "postedAt", "closingAt"],
    group: "Contenu",
    description:
      "Offres affichées en ligne sur /carrieres (aucune fiche détail, aucun formulaire, aucun CV stocké). Publier rend l’offre visible ; fermer ou dépublier la retire.",
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
    beforeChange: [preventEditorPublish, validateJobDates],
    afterChange: [
      async ({ doc }) => {
        invalidateContent({ paths: ["/carrieres"], tags: [CONTENT_TAGS.jobs] })
        return doc
      },
    ],
    afterDelete: [
      async () => {
        invalidateContent({ paths: ["/carrieres"], tags: [CONTENT_TAGS.jobs] })
      },
    ],
  },
  fields: [
    textField("title", "Intitulé du poste", undefined, true),
    textField(
      "slug",
      "Identifiant (slug)",
      "Réservé à une future fiche détail : aucun chemin public n’existe au lancement.",
      true
    ),
    {
      // Field name is `openingStatus`, not `status`: a drafts-enabled collection
      // reserves the `enum_<collection>_status` enum for Payload's `_status`
      // column, so a field literally named `status` collides in the generated
      // SQL migration (verified). The content model's "status" semantics are
      // unchanged: open/closed, drafts being Payload's `_status`.
      name: "openingStatus",
      type: "select",
      label: "État de l’offre",
      required: true,
      defaultValue: "open",
      options: [
        { label: "Ouverte", value: "open" },
        { label: "Fermée", value: "closed" },
      ],
      admin: {
        description:
          "Une offre fermée n’est jamais listée, même publiée. Le brouillon Payload (« Enregistrer comme brouillon ») est l’autre état.",
      },
    },
    {
      name: "contractType",
      type: "select",
      label: "Type de contrat",
      required: true,
      options: ["CDI", "CDD", "Stage", "Alternance"].map((value) => ({
        label: value,
        value,
      })),
    },
    textField("location", "Lieu", "Rabat par défaut."),
    textField("department", "Service"),
    textField("experienceLevel", "Expérience demandée"),
    textareaField("summary", "Résumé (carte)", "Deux à trois lignes.", true),
    richTextField("description", "Description"),
    {
      name: "responsibilities",
      type: "array",
      label: "Missions",
      fields: [textField("item", "Mission")],
    },
    {
      name: "requirements",
      type: "array",
      label: "Profil recherché",
      fields: [textField("item", "Critère")],
    },
    {
      name: "postedAt",
      type: "date",
      label: "Date de publication",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "closingAt",
      type: "date",
      label: "Date de clôture",
      admin: {
        date: { pickerAppearance: "dayOnly" },
        description: "Au-delà de cette date, l’offre disparaît du site automatiquement.",
      },
    },
    {
      name: "applicationEmail",
      type: "email",
      label: "Adresse de candidature",
      defaultValue: COMPANY.email,
      access: { create: developerOnlyField, update: developerOnlyField },
      admin: {
        readOnly: true,
        description:
          "Code-owned (F-113) : recrutement@hay2010.ma uniquement quand l’autorisation CNDP couvre la boîte ; contact@hay2010.ma d’ici là.",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "Épinglée en tête de liste",
      defaultValue: false,
    },
    seoField(),
  ],
}
