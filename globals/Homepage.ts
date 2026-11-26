/**
 * `homepage` global — the Accueil trame (content model §5.1 `homepage`, ticket
 * #23 trame, #30 schema).
 *
 * What the owner edits here: the hero copy and its two code-owned-target
 * buttons, the introduction, the domain section heading, the réalisations
 * teaser copy, the engagements, and the closing contact band.
 *
 * What is deliberately NOT a field:
 * - the « repères » band (`Plus de 10 ans d’expérience`, `Rabat — Maroc`, the
 *   four service words) is an approved claim, code-owned (`lib/site/facts.ts`);
 * - the hero eyebrow (`HAY2010 · Rabat — Maroc`) is the identity block;
 * - the section labels (`Qui sommes-nous`, `Réalisations`, `Nos engagements`)
 *   are interface copy of the fixed trame;
 * - the CTA destinations are a closed enum of internal routes.
 *
 * Publish/unpublish is a draft state: the owner never deletes the singleton.
 */
import type { GlobalConfig } from "payload"

import { readPublishedOrStaff, updateContent } from "../access/roles"
import {
  contactCtaField,
  internalLinkFields,
  richTextField,
  seoField,
  textareaField,
  textField,
  titledItemsField,
  uploadField,
} from "../lib/payload/fields"
import {
  preventEditorPublishGlobal,
  publishedGlobalMediaRightsHook,
} from "../lib/payload/media-rights"
import { CONTENT_TAGS, invalidateContent } from "../lib/payload/revalidate"

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Accueil",
  admin: {
    group: "Contenu",
    description:
      "Page d’accueil : bandeau d’ouverture, introduction, section domaines, renvoi réalisations, engagements et bandeau contact. Les repères chiffrés et les libellés de section sont code-owned et restent hors de l’admin.",
  },
  versions: {
    drafts: { autosave: false },
  },
  access: {
    read: readPublishedOrStaff,
    update: updateContent,
  },
  hooks: {
    beforeValidate: [publishedGlobalMediaRightsHook(["hero.image", "seo.ogImage"])],
    beforeChange: [preventEditorPublishGlobal],
    afterChange: [
      async ({ doc }) => {
        invalidateContent({ paths: ["/"], tags: [CONTENT_TAGS.homepage] })
        return doc
      },
    ],
  },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Bandeau d’ouverture",
      admin: {
        description:
          "Le titre est le h1 de la page. Sans image aux droits validés, le bandeau s’affiche en typographie sur fond encre (jamais une image de remplacement).",
      },
      fields: [
        textField("title", "Titre principal (h1)", undefined, true),
        textareaField("subtitle", "Accroche"),
        uploadField(
          "image",
          "Photographie documentaire",
          "Optionnelle. Une image dont les droits ne sont pas validés bloque la publication."
        ),
        ...internalLinkFields("primaryCta", "Bouton principal"),
        ...internalLinkFields("secondaryCta", "Bouton secondaire"),
      ],
    },
    {
      name: "intro",
      type: "group",
      label: "Introduction",
      fields: [
        richTextField(
          "body",
          "Texte d’introduction",
          "« Qui sommes-nous » : le premier paragraphe est le chapô."
        ),
      ],
    },
    {
      name: "servicesBand",
      type: "group",
      label: "Section domaines d’activité",
      fields: [
        textField(
          "title",
          "Titre de la section",
          "La liste elle-même vient des domaines publiés : un domaine fermé n’apparaît jamais."
        ),
      ],
    },
    {
      name: "referencesTeaser",
      type: "group",
      label: "Renvoi réalisations",
      fields: [
        richTextField(
          "fallbackText",
          "Formulation « Références sur demande »",
          "Formulation approuvée tant qu’aucune étude de cas n’est publiée."
        ),
        textareaField("body", "Texte d’appui"),
        ...internalLinkFields("link", "Lien vers les réalisations"),
      ],
    },
    titledItemsField(
      "engagements",
      "Engagements",
      "Qualité, sécurité, délais : texte uniquement, aucune promesse d’équipement ou de certification."
    ),
    contactCtaField(
      "Bandeau orange de clôture : appelle au contact sans formulaire."
    ),
    seoField({ descriptionRequired: true }),
  ],
}
