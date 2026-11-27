/**
 * `entreprise` global — the À propos trame (content model §5.1 `entreprise`,
 * ticket #25 trame, #30 schema).
 *
 * The page copy is chaptered as delivered by #25 (identity introduction, then
 * three titled chapters: activity/perimeter, mission/vision/values,
 * quality/safety/compliance). The content model's `values`/`activities` arrays
 * are represented as the chapter item lists so the owner edits exactly the
 * structure the page renders (no invisible fields).
 *
 * Code-owned and therefore absent from this schema: the identity block
 * (`lib/site/company.ts`), the approved experience/gerant lines, the ONEE
 * agréments claim (`lib/site/claims.ts`, gated by `agrementLive`), and the
 * certifications link target.
 */
import type { GlobalConfig } from "payload"

import { readPublishedOrStaff, updateContent } from "../access/roles"
import {
  contactCtaField,
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

export const Entreprise: GlobalConfig = {
  slug: "entreprise",
  label: "À propos",
  admin: {
    group: "Contenu",
    description:
      "Page À propos : introduction identitaire et chapitres (activité et périmètre, mission/vision/valeurs, qualité/sécurité/conformité). L’identité légale et les agréments restent code-owned.",
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
          paths: ["/a-propos"],
          tags: [CONTENT_TAGS.entreprise],
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
      admin: {
        description:
          "Le titre est le h1 de la page. Aucune photo d’équipe ni aucun récit de fondation n’est modélisé (registre des faits).",
      },
      fields: [textField("title", "Titre de la page (h1)", undefined, true)],
    },
    {
      name: "intro",
      type: "group",
      label: "Introduction identitaire",
      fields: [
        richTextField(
          "body",
          "Texte d’introduction",
          "Le premier paragraphe est le chapô. Pas d’année de fondation, pas de chiffre non approuvé."
        ),
      ],
    },
    {
      name: "chapters",
      type: "array",
      label: "Chapitres de la page",
      admin: {
        description:
          "L’ordre des chapitres est celui du rendu : activité et périmètre, mission/vision/valeurs, qualité/sécurité/conformité.",
        initCollapsed: false,
      },
      fields: [
        textField("title", "Titre du chapitre", undefined, true),
        titledItemsField("items", "Sous-sections"),
      ],
    },
    contactCtaField("Bandeau de clôture vers la page Contact."),
    seoField({ descriptionRequired: true }),
  ],
}
