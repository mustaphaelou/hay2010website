/**
 * `media` — uploads carrying their rights evidence (content model §5.2 `media`,
 * §7 rights table; spec "Admin and editorial rules").
 *
 * An image is publishable only when it is `cleared` AND its evidence is
 * coherent (see `lib/payload/media-rights.ts`): a rights reference, a release
 * when people are identifiable, client + trademark permission when client marks
 * are visible. The `media` collection enforces the coherence on save; every
 * collection/global that references an upload enforces the publish gate.
 *
 * Storage: object storage (R2 through the S3 API) when `S3_BUCKET` is set,
 * Payload's local disk otherwise (dev, merge gate, disposable-DB check). The
 * S3 plugin config lives in `lib/payload/storage.ts` so the schema stays
 * identical in every environment.
 */
import path from "node:path"

import type { CollectionConfig } from "payload"

import {
  canAccessAdmin,
  deleteDeveloperOnly,
  developerOnlyField,
  ownerMayClearRights,
  ownerOrDeveloper,
  ownerOrDeveloperField,
} from "../access/roles"
import { validateMediaRights } from "../lib/payload/media-rights"
import { CONTENT_TAGS, invalidateContent } from "../lib/payload/revalidate"

/**
 * Repository `media/` directory of the local-disk fallback (gitignored).
 *
 * Resolved from `process.cwd()` at runtime (the app root for `next start` and
 * `payload run`); production uses object storage, so this path is dev/test only.
 * Keep it a plain path string: a `new URL(..., import.meta.url)` here makes
 * Turbopack treat it as a module to resolve and fails the build.
 */
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "media")

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Média", plural: "Médias" },
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["filename", "alt", "rightsBasis", "rightsStatus", "updatedAt"],
    group: "Médias",
    description:
      "Photographies et visuels. Aucune image ne peut être publiée sur une page tant que ses droits ne sont pas enregistrés et validés (« cleared »).",
  },
  upload: {
    staticDir: LOCAL_UPLOADS_DIR,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 800 },
      { name: "hero", width: 1920 },
      { name: "og", width: 1200, height: 630, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
    focalPoint: true,
  },
  access: {
    admin: canAccessAdmin,
    create: ownerOrDeveloper,
    // Public API reads: anonymous callers only ever see cleared records; staff
    // see the whole library (drafts, pending rights). The file route uses the
    // same access, so a revocation hides the file too.
    read: ({ req: { user } }) =>
      user ? true : { rightsStatus: { equals: "cleared" } },
    update: ownerOrDeveloper,
    delete: deleteDeveloperOnly,
  },
  hooks: {
    beforeChange: [validateMediaRights],
    // A rights change (clearance or revocation) hides/shows the image on every
    // published page that references it: invalidate the whole frontend layout.
    afterChange: [
      async ({ doc }) => {
        invalidateContent({ tags: [CONTENT_TAGS.media] })
        return doc
      },
    ],
    afterDelete: [
      async () => {
        invalidateContent({ tags: [CONTENT_TAGS.media] })
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texte alternatif",
      required: true,
      admin: {
        description:
          "Obligatoire, en français : décrit l’image, pas un mot-clé SEO. Une image sans texte alternatif ne part jamais sur le site.",
      },
    },
    {
      name: "caption",
      type: "text",
      label: "Légende",
      access: { create: ownerOrDeveloperField, update: ownerOrDeveloperField },
    },
    {
      name: "credit",
      type: "text",
      label: "Crédit",
      access: { create: ownerOrDeveloperField, update: ownerOrDeveloperField },
      admin: { description: "Photographe ou source de l’image." },
    },
    {
      type: "collapsible",
      label: "Droits et autorisations",
      admin: {
        description:
          "Ces champs décident si l’image peut être publiée. Le développeur valide les autorisations ; le propriétaire peut valider une image interne sans personne ni marque.",
      },
      fields: [
        {
          name: "rightsBasis",
          type: "select",
          label: "Origine des droits",
          required: true,
          defaultValue: "unknown",
          options: [
            { label: "Propriété de l’entreprise", value: "company-owned" },
            { label: "Licence acquise", value: "licensed" },
            { label: "Fournie par le client", value: "client-supplied" },
            { label: "Inconnue", value: "unknown" },
          ],
          access: { create: ownerOrDeveloperField, update: ownerOrDeveloperField },
        },
        {
          name: "rightsStatus",
          type: "select",
          label: "Statut des droits",
          required: true,
          defaultValue: "pending",
          index: true,
          options: [
            { label: "En attente", value: "pending" },
            { label: "Validés (utilisable)", value: "cleared" },
            { label: "Retirés", value: "revoked" },
          ],
          access: { create: ownerMayClearRights, update: ownerMayClearRights },
          admin: {
            description:
              "Seul un média « Validés » peut illustrer une page publiée. Le propriétaire ne peut valider que les images propriété de l’entreprise, sans personne identifiable et sans marque client.",
          },
        },
        {
          name: "rightsReference",
          type: "text",
          label: "Référence des droits",
          access: { create: ownerOrDeveloperField, update: ownerOrDeveloperField },
          admin: {
            description:
              "Licence, facture, autorisation ou référence de propriété. Obligatoire pour déclarer l’image utilisable.",
          },
        },
        {
          name: "peoplePresent",
          type: "checkbox",
          label: "Personnes identifiables",
          defaultValue: false,
          access: { create: developerOnlyField, update: developerOnlyField },
        },
        {
          name: "releaseStatus",
          type: "select",
          label: "Autorisation de diffusion",
          defaultValue: "not-required",
          options: [
            { label: "Non requise", value: "not-required" },
            { label: "En attente", value: "pending" },
            { label: "Obtenue", value: "cleared" },
          ],
          access: { create: developerOnlyField, update: developerOnlyField },
        },
        {
          name: "releaseReference",
          type: "text",
          label: "Référence de l’autorisation de diffusion",
          access: { create: developerOnlyField, update: developerOnlyField },
        },
        {
          name: "clientMarks",
          type: "checkbox",
          label: "Marque ou site client identifiable",
          defaultValue: false,
          access: { create: developerOnlyField, update: developerOnlyField },
        },
        {
          name: "clientPermission",
          type: "checkbox",
          label: "Autorisation du client",
          defaultValue: false,
          access: { create: developerOnlyField, update: developerOnlyField },
        },
        {
          name: "clientPermissionRef",
          type: "text",
          label: "Référence de l’autorisation client",
          access: { create: developerOnlyField, update: developerOnlyField },
        },
        {
          name: "trademarkPermission",
          type: "checkbox",
          label: "Autorisation de la marque",
          defaultValue: false,
          access: { create: developerOnlyField, update: developerOnlyField },
        },
        {
          name: "trademarkPermissionRef",
          type: "text",
          label: "Référence de l’autorisation de marque",
          access: { create: developerOnlyField, update: developerOnlyField },
        },
        {
          name: "takenAt",
          type: "date",
          label: "Date de prise de vue",
          access: { create: developerOnlyField, update: developerOnlyField },
          admin: { date: { pickerAppearance: "dayOnly" } },
        },
      ],
    },
  ],
}
