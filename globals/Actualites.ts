/**
 * `actualites` global — the gated Actualités listing trame (content model
 * §5.1 `actualites`; ticket #30 acceptance: the model exists while its route
 * and navigation entry stay gated).
 *
 * The gate is code-owned: `actualitesLive` is false at launch and the P3 tier
 * cannot be opened from the admin (there is no CMS publish state that could
 * open it — the provider's tier gate is authoritative). The owner may prepare
 * the listing copy here, and the `communiques` collection is editable, but no
 * public route, navigation entry or sitemap entry exists until the developer
 * opens the gate in code.
 */
import type { GlobalConfig } from "payload"

import { readPublishedOrStaff, updateContent } from "../access/roles"
import {
  richTextField,
  seoField,
  textareaField,
  textField,
} from "../lib/payload/fields"
import {
  preventEditorPublishGlobal,
  publishedGlobalMediaRightsHook,
} from "../lib/payload/media-rights"
import { CONTENT_TAGS, invalidateContent } from "../lib/payload/revalidate"

export const Actualites: GlobalConfig = {
  slug: "actualites",
  label: "Actualités (fermée)",
  admin: {
    group: "Contenu (fermé)",
    description:
      "Modèle de la page Actualités. La rubrique est au palier P3 et `actualitesLive` est false (code-owned) : ce contenu est éditable mais ne peut pas être rendu publiquement depuis l’admin.",
  },
  versions: {
    drafts: { autosave: false },
  },
  access: {
    read: readPublishedOrStaff,
    update: updateContent,
  },
  hooks: {
    beforeValidate: [publishedGlobalMediaRightsHook(["seo.ogImage"])],
    beforeChange: [preventEditorPublishGlobal],
    afterChange: [
      async ({ doc }) => {
        invalidateContent({ tags: [CONTENT_TAGS.actualites] })
        return doc
      },
    ],
  },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Ouverture de la liste",
      fields: [
        textField("title", "Titre de la page (h1)"),
        textareaField("subtitle", "Accroche"),
      ],
    },
    {
      name: "intro",
      type: "group",
      label: "Introduction",
      fields: [richTextField("body", "Texte d’introduction")],
    },
    seoField(),
  ],
}
