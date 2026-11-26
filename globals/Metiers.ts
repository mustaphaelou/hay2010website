/**
 * `metiers` global — the domain-index trame `/domaines-activite`
 * (content model §5.1 `metiers`, ticket #22 trame, #30 schema).
 *
 * The index is short: an introduction plus the published-domain list. The list
 * itself is NOT a field — it is derived from the `domaines` collection through
 * the published gate, so a gated domain cannot be listed by editing content.
 */
import type { GlobalConfig } from "payload"

import { readPublishedOrStaff, updateContent } from "../access/roles"
import { richTextField, seoField, textField } from "../lib/payload/fields"
import {
  preventEditorPublishGlobal,
  publishedGlobalMediaRightsHook,
} from "../lib/payload/media-rights"
import { CONTENT_TAGS, invalidateContent } from "../lib/payload/revalidate"

export const Metiers: GlobalConfig = {
  slug: "metiers",
  label: "Domaines d’activité (index)",
  admin: {
    group: "Contenu",
    description:
      "Page index des domaines : titre et introduction. La liste des domaines est dérivée des fiches publiées ; elle ne s’édite pas ici.",
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
        invalidateContent({
          paths: ["/domaines-activite"],
          tags: [CONTENT_TAGS.metiers, CONTENT_TAGS.domains],
        })
        return doc
      },
    ],
  },
  fields: [
    textField("title", "Titre de la page (h1)", undefined, true),
    {
      name: "intro",
      type: "group",
      label: "Introduction",
      fields: [
        richTextField(
          "body",
          "Texte d’introduction",
          "Présente les domaines ; ne cite jamais un domaine fermé."
        ),
      ],
    },
    seoField({ descriptionRequired: true }),
  ],
}
