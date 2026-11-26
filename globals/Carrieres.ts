/**
 * `carrieres` global — the Carrières utility trame (content model §5.1
 * `carrieres`, ticket #27 trame, #30 schema).
 *
 * The page copy is the hero and the culture introduction; the openings are
 * `jobs` collection records rendered inline (no detail route at launch), and
 * the application section is governed by the code-owned F-113 gate:
 * `recrutement@hay2010.ma`, the CV invitation and the CNDP notice render only
 * when the authorization covers the mailbox. None of that is a CMS field —
 * opening it from the admin would be a gated claim (content model §3, facts
 * register §2.3).
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

export const Carrieres: GlobalConfig = {
  slug: "carrieres",
  label: "Carrières",
  admin: {
    group: "Contenu",
    description:
      "Page Carrières (pied de page) : ouverture et introduction culture. Les offres sont des fiches « Offres d’emploi » ; la boîte recrutement@ reste fermée par la barrière F-113 code-owned.",
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
          paths: ["/carrieres"],
          tags: [CONTENT_TAGS.carrieres],
        })
        return doc
      },
    ],
  },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Ouverture",
      fields: [
        textField("title", "Titre de la page (h1)", undefined, true),
        textareaField("subtitle", "Accroche"),
      ],
    },
    {
      name: "intro",
      type: "group",
      label: "Introduction culture",
      fields: [
        richTextField(
          "body",
          "Texte d’introduction",
          "Présente les métiers et les chantiers ; n’invite jamais à envoyer un CV avant l’ouverture F-113."
        ),
      ],
    },
    seoField(),
  ],
}
