/**
 * `pages` — the foundation content type of the embedded CMS (ticket #29).
 *
 * #29 owns the foundation, not the full content model: ticket #30 replaces
 * `blocks` with the structured globals/collections of
 * docs/content/content-model.md §5 and seeds the fixture corpus. What is
 * already final here:
 *
 * - the document is addressed by a code-owned rubrique `key` (never a route or
 *   a nav label: content model §3), so the content adapter can map a page back
 *   to its rubrique without parsing copy;
 * - drafts/publish state drive the gate (`_status`), with unpublish — the owner
 *   never deletes a published record;
 * - the roles matrix from content model §4 is enforced over HTTP: the owner
 *   edits/publishes/unpublishes but cannot delete, the developer can delete,
 *   the editor is draft-only and cannot publish (hook);
 * - an upload referenced by a page cannot be published before its rights are
 *   recorded (`publishedMediaRightsHook` on `cover`).
 */
import type { CollectionConfig } from "payload"

import {
  canAccessAdmin,
  canCreateContent,
  deleteDeveloperOnly,
  developerOnlyField,
  ownerOrDeveloperField,
  readPublishedOrStaff,
  updateContent,
} from "../access/roles"
import { PAGE_KEY_OPTIONS } from "../lib/payload/rubrique-keys"
import { preventEditorPublish, publishedMediaRightsHook } from "../lib/payload/media-rights"

/** Upload fields of a page checked by the rights publish gate (content model §7.2). */
export const PAGE_UPLOAD_FIELDS = ["cover"] as const

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Page", plural: "Pages" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["key", "title", "_status", "updatedAt"],
    group: "Contenu",
    description:
      "Pages du site, adressées par leur clé de rubrique. Les champs de structure (clé, blocs) restent au développeur ; le propriétaire édite le texte, les images et publie.",
  },
  versions: {
    drafts: {
      // Drafts are explicit (publish/unpublish), not an autosave stream: the
      // owner must know when a change is live.
      autosave: false,
    },
  },
  access: {
    admin: canAccessAdmin,
    read: readPublishedOrStaff,
    create: canCreateContent,
    update: updateContent,
    delete: deleteDeveloperOnly,
  },
  hooks: {
    beforeValidate: [publishedMediaRightsHook(PAGE_UPLOAD_FIELDS)],
    beforeChange: [preventEditorPublish],
  },
  fields: [
    {
      name: "key",
      type: "select",
      label: "Rubrique",
      required: true,
      unique: true,
      index: true,
      options: PAGE_KEY_OPTIONS.map((option) => ({ ...option })),
      access: { create: developerOnlyField, update: developerOnlyField },
      admin: {
        description:
          "Identifiant de la rubrique (code-owned). Détermine la route, la navigation et les barrières de publication : un changement de clé est un changement de code.",
      },
    },
    {
      name: "title",
      type: "text",
      label: "Titre",
      required: true,
      access: { create: ownerOrDeveloperField, update: ownerOrDeveloperField },
      admin: { description: "Titre de la page (h1) et base du titre de l’onglet." },
    },
    {
      name: "description",
      type: "textarea",
      label: "Description (métadonnées)",
      access: { create: ownerOrDeveloperField, update: ownerOrDeveloperField },
      admin: {
        description:
          "120 à 160 caractères, en français. Utilisée comme description de la page ; les pages sans description héritent du modèle SEO (#32).",
      },
    },
    {
      name: "blocks",
      type: "json",
      label: "Blocs de contenu",
      access: { create: developerOnlyField, update: developerOnlyField },
      admin: {
        description:
          "Blocs structurés au format ContentBlock[] de lib/content/types.ts — champ transitoire de la fondation #29 ; le ticket #30 le remplace par des champs typés.",
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Image de couverture",
      access: { create: ownerOrDeveloperField, update: ownerOrDeveloperField },
      admin: {
        description:
          "Une image dont les droits ne sont pas validés bloque la publication de la page (c’est la règle des droits, indépendante du rôle).",
      },
    },
  ],
}
