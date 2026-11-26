/**
 * Shared Payload field builders for the #30 content model.
 *
 * Keeping the repeated shapes in one module means the admin labels, help text
 * and validation stay identical across the seven page globals and the four
 * collections, and the content-model §5 field names (`seo`, `title`, `body`,
 * `items` …) are spelled once.
 *
 * Every field here is prose or an image relation the owner may edit; nothing in
 * this module is a code-owned constant. Routing, gates, nav labels, identity,
 * SEO defaults and approved claims are not Payload fields at all (content model
 * §3) — they stay in `lib/` and `lib/payload/content-map.ts`.
 */
import type { Field } from "payload"

import { LINK_TARGET_OPTIONS } from "./link-targets"

/** A rich-text field (Lexical), the type the content model uses for prose. */
export function richTextField(
  name: string,
  label: string,
  description?: string,
  required = false
): Field {
  return {
    name,
    type: "richText",
    label,
    required,
    admin: description ? { description } : undefined,
  }
}

/** A plain multi-line prose field (short copy that carries no marks). */
export function textareaField(
  name: string,
  label: string,
  description?: string,
  required = false
): Field {
  return {
    name,
    type: "textarea",
    label,
    required,
    admin: description ? { description } : undefined,
  }
}

/** A plain one-line prose field. */
export function textField(
  name: string,
  label: string,
  description?: string,
  required = false
): Field {
  return {
    name,
    type: "text",
    label,
    required,
    admin: description ? { description } : undefined,
  }
}

/** An upload relation to the rights-gated media collection. */
export function uploadField(
  name: string,
  label: string,
  description: string
): Field {
  return {
    name,
    type: "upload",
    relationTo: "media",
    label,
    admin: { description },
  }
}

/**
 * The `seo` group of content model §5: metadata title, 120–160 character
 * description and the share image. #32 owns the metadata patterns; #30 only
 * stores the approved copy so a page cannot ship an empty head.
 */
export function seoField({
  descriptionRequired = false,
}: { descriptionRequired?: boolean } = {}): Field {
  return {
    name: "seo",
    type: "group",
    label: "Référencement (SEO)",
    admin: {
      description:
        "Copie approuvée des métadonnées. Les modèles et valeurs par défaut restent code-owned (#32) : ce groupe ne les remplace pas.",
    },
    fields: [
      textField(
        "title",
        "Titre de métadonnées",
        "Sans le suffixe de marque « — HAY2010 », ajouté par le code. Laisser vide pour utiliser le titre de la page."
      ),
      textareaField(
        "description",
        "Description (120 à 160 caractères)",
        "Décrit la page en français, sans jargon ni promesse non vérifiable. Une page publiée doit en avoir une.",
        descriptionRequired
      ),
      uploadField(
        "ogImage",
        "Image de partage",
        "Optionnelle. Sans droits validés, elle n’est jamais publiée."
      ),
    ],
  }
}

/** The two fields of a link to a code-owned internal target (no free URL). */
export function internalLinkFields(prefix: string, label: string): Field[] {
  return [
    textField(
      `${prefix}Label`,
      `${label} — texte du lien`,
      "Texte affiché ; la destination est une route code-owned choisie ci-dessous."
    ),
    {
      name: `${prefix}Target`,
      type: "select",
      label: `${label} — destination`,
      options: LINK_TARGET_OPTIONS.map((option) => ({ ...option })),
      admin: {
        description:
          "Liste fermée des routes internes approuvées (une page fermée n’est jamais liée).",
      },
    },
  ]
}

/** A repeatable `{ title, body }` item list (engagements, method, values …). */
export function titledItemsField(
  name: string,
  label: string,
  description?: string
): Field {
  return {
    name,
    type: "array",
    label,
    admin: {
      description,
      initCollapsed: false,
    },
    fields: [
      textField("title", "Titre", undefined, true),
      textareaField("body", "Texte"),
    ],
  }
}

/** A repeatable `{ label, description }` item list (prestations, reference cover). */
export function labelledItemsField(
  name: string,
  label: string,
  description?: string
): Field {
  return {
    name,
    type: "array",
    label,
    admin: {
      description,
      initCollapsed: false,
    },
    fields: [
      textField("label", "Intitulé", undefined, true),
      textareaField("description", "Description"),
    ],
  }
}

/**
 * The closing contact band. `link` is optional: the page trame renders the band
 * without a button when no target is chosen (the contact page's own band is
 * email-first and carries no button).
 */
export function contactCtaField(
  description = "Bandeau de clôture qui mène au contact."
): Field {
  return {
    name: "contactCta",
    type: "group",
    label: "Bandeau contact",
    admin: { description },
    fields: [
      textField("title", "Titre", undefined, true),
      richTextField("body", "Texte"),
      ...internalLinkFields("cta", "Bouton"),
    ],
  }
}
