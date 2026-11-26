/**
 * `realisations` global — the credentials-led Réalisations trame
 * (content model §5.1 `realisations`, ticket #24 trame, #30 schema).
 *
 * The page form is decided: a hero carrying the `Références sur demande`
 * statement and two code-owned-target buttons, an intro, the service rows
 * (derived from published domains), the qualifications position (code-owned),
 * the references block, the documentation rules, the method and the formatting
 * note. No project card, client name, photograph, quote or amount is modelled
 * here — the named case studies live in the gated `projects` collection.
 */
import type { GlobalConfig } from "payload"

import { readPublishedOrStaff, updateContent } from "../access/roles"
import {
  contactCtaField,
  internalLinkFields,
  labelledItemsField,
  richTextField,
  seoField,
  textareaField,
  textField,
  titledItemsField,
} from "../lib/payload/fields"
import {
  preventEditorPublishGlobal,
  publishedGlobalMediaRightsHook,
} from "../lib/payload/media-rights"
import { CONTENT_TAGS, invalidateContent } from "../lib/payload/revalidate"

export const Realisations: GlobalConfig = {
  slug: "realisations",
  label: "Réalisations",
  admin: {
    group: "Contenu",
    description:
      "Page Réalisations : formulation « Références sur demande », bloc références, règles de documentation, méthode et bandeau contact. Les qualifications et les fiches détaillées restent gated (code-owned).",
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
          paths: ["/realisations"],
          tags: [CONTENT_TAGS.realisations],
        })
        return doc
      },
    ],
  },
  fields: [
    textField("title", "Titre de la page (h1)", undefined, true),
    {
      name: "hero",
      type: "group",
      label: "Bandeau d’ouverture",
      fields: [
        textField(
          "title",
          "Accroche",
          "Formulation approuvée affichée sous le titre (« Références sur demande. »).",
          true
        ),
        textareaField("subtitle", "Sous-titre"),
        ...internalLinkFields("primaryCta", "Bouton principal"),
        ...internalLinkFields("secondaryCta", "Bouton secondaire"),
      ],
    },
    {
      name: "intro",
      type: "group",
      label: "Introduction",
      fields: [
        richTextField("body", "Texte d’introduction"),
        ...internalLinkFields("link", "Lien de l’introduction"),
      ],
    },
    {
      name: "servicesBand",
      type: "group",
      label: "Section « ce que nous réalisons »",
      fields: [
        textField(
          "title",
          "Titre de la section",
          "Les lignes viennent des domaines publiés."
        ),
      ],
    },
    {
      name: "qualifications",
      type: "group",
      label: "Bloc qualifications",
      fields: [
        textField(
          "title",
          "Titre du bloc",
          "Le contenu du bloc (position honnête ou agréments approuvés) est code-owned et suit la barrière `agrementLive`."
        ),
      ],
    },
    {
      name: "references",
      type: "group",
      label: "Bloc références",
      fields: [
        textField("title", "Titre du bloc"),
        richTextField(
          "fallbackText",
          "Formulation « Références sur demande »",
          "Formulation approuvée, affichée en grand."
        ),
        textareaField("body", "Texte d’appui"),
        labelledItemsField(
          "items",
          "Ce qu’une référence comprend",
          "Objet, lieu et année, périmètre, pièces du dossier."
        ),
        ...internalLinkFields("link", "Lien du bloc"),
      ],
    },
    {
      name: "documentation",
      type: "group",
      label: "Bloc « comment un projet est documenté »",
      fields: [
        textField("title", "Titre du bloc"),
        titledItemsField("items", "Règles de documentation"),
      ],
    },
    {
      name: "method",
      type: "group",
      label: "Bloc méthode",
      fields: [
        textField("title", "Titre du bloc"),
        titledItemsField("items", "Étapes"),
      ],
    },
    contactCtaField("Bandeau de clôture vers la page Contact."),
    seoField({ descriptionRequired: true }),
  ],
}
