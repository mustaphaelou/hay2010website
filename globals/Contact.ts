/**
 * `contact` global — the email-first Contact trame (content model §5.1
 * `contact`, ticket #26 trame, #30 schema).
 *
 * The page is email-first: the mailbox, the registered address and the short
 * law 09-08 notice are code-owned (`lib/site/company.ts`, `lib/site/contact.ts`),
 * and the page does not invite a call or a visit. The owner edits the intro,
 * the email band wording and the two guidance sections.
 *
 * Code-owned and absent from this schema: `contactNotice`/`formNotice` (the
 * CNDP wording — developer-owned in code), the mailbox, the registered address,
 * the map/phone/social channels while they are gated (`mapLive`).
 */
import type { GlobalConfig } from "payload"

import { readPublishedOrStaff, updateContent } from "../access/roles"
import {
  richTextField,
  seoField,
  textField,
  titledItemsField,
} from "../lib/payload/fields"
import {
  preventEditorPublishGlobal,
  publishedGlobalMediaRightsHook,
} from "../lib/payload/media-rights"
import { CONTENT_TAGS, invalidateContent } from "../lib/payload/revalidate"

export const Contact: GlobalConfig = {
  slug: "contact",
  label: "Contact",
  admin: {
    group: "Contenu",
    description:
      "Page Contact e-mail d’abord : aucun formulaire, aucun stockage de message. L’adresse, l’identité et la mention légale courte sont code-owned.",
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
        invalidateContent({ paths: ["/contact"], tags: [CONTENT_TAGS.contact] })
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
          "Ne promet jamais de délai de réponse ni de formulaire."
        ),
      ],
    },
    {
      name: "contactCta",
      type: "group",
      label: "Bandeau e-mail",
      admin: {
        description:
          "Le bouton e-mail et l’adresse sont code-owned : ce bandeau ne porte que le titre et le texte.",
      },
      fields: [
        textField("title", "Titre", undefined, true),
        richTextField("body", "Texte"),
      ],
    },
    {
      name: "sections",
      type: "group",
      label: "Ce que votre e-mail doit contenir",
      fields: [
        textField("title", "Titre de la section"),
        titledItemsField("items", "Points à préciser"),
      ],
    },
    {
      name: "steps",
      type: "group",
      label: "Ce qui se passe ensuite",
      fields: [
        textField("title", "Titre de la section"),
        titledItemsField("items", "Étapes"),
      ],
    },
    seoField({ descriptionRequired: true }),
  ],
}
