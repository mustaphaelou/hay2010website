/**
 * `domaines` — the five domain records behind `/domaines-activite/{slug}`
 * (ticket #22 trame; content model §5.2 `services` adapted to the delivered
 * domain pages, #30 schema).
 *
 * Ownership split (content model §4):
 * - the owner edits the copy, the prestations and the method of every domain;
 * - the `slug` is a code-owned route key (developer-only field): adding,
 *   removing or renaming a domain touches the route, the gate and the sitemap;
 * - permanent deletion is developer-only; the owner unpublishes instead.
 *
 * Two domains are gated at launch by a code-owned gate (`DOMAIN_GATES` in
 * lib/payload/content-map.ts). Their records exist so the owner can prepare
 * them, but the content adapter hides them even if they are published — a
 * publish cannot open a code-owned gate.
 */
import { ValidationError } from "payload"
import type { CollectionConfig, PayloadRequest } from "payload"

import {
  canAccessAdmin,
  deleteDeveloperOnly,
  developerOnlyField,
  readPublishedOrStaff,
  updateContent,
} from "../access/roles"
import { domainPath, DOMAIN_KEYS } from "../lib/payload/content-map"
import {
  contactCtaField,
  labelledItemsField,
  richTextField,
  seoField,
  textField,
  titledItemsField,
} from "../lib/payload/fields"
import {
  preventEditorPublish,
  publishedMediaRightsHook,
} from "../lib/payload/media-rights"
import { CONTENT_TAGS, invalidateContent } from "../lib/payload/revalidate"

/** Publish validation: a domain page may not go public empty. */
export const validateDomainPublish = async ({
  data,
  originalDoc,
}: {
  data?: Record<string, unknown> | null
  originalDoc?: Record<string, unknown> | null
  req: PayloadRequest
}): Promise<void> => {
  const merged: Record<string, unknown> = { ...(originalDoc ?? {}), ...(data ?? {}) }
  if (merged._status !== "published") return

  const errors: Array<{ message: string; path: string }> = []
  const presentation = (merged.presentation ?? {}) as { body?: unknown }
  const prestations = (merged.prestations ?? {}) as { items?: unknown[] }
  const methods = (merged.methods ?? {}) as { items?: unknown[] }
  const contactCta = (merged.contactCta ?? {}) as { title?: unknown }
  const seo = (merged.seo ?? {}) as { description?: unknown }

  if (!presentation.body) {
    errors.push({
      message:
        "Une fiche domaine publiée doit porter sa présentation (texte de la section « Présentation et besoins »).",
      path: "presentation.body",
    })
  }
  if (!Array.isArray(prestations.items) || prestations.items.length === 0) {
    errors.push({
      message: "Une fiche domaine publiée doit lister au moins une prestation confirmée.",
      path: "prestations.items",
    })
  }
  if (!Array.isArray(methods.items) || methods.items.length === 0) {
    errors.push({
      message: "Une fiche domaine publiée doit décrire sa méthode (au moins une sous-section).",
      path: "methods.items",
    })
  }
  if (!contactCta.title) {
    errors.push({
      message: "Une fiche domaine publiée doit porter son bandeau de contact.",
      path: "contactCta.title",
    })
  }
  if (typeof seo.description !== "string" || seo.description.trim().length === 0) {
    errors.push({
      message:
        "Une fiche domaine publiée doit porter sa description de métadonnées (120 à 160 caractères).",
      path: "seo.description",
    })
  }

  if (errors.length) throw new ValidationError({ errors })
}

export const Domaines: CollectionConfig = {
  slug: "domaines",
  labels: { singular: "Domaine d’activité", plural: "Domaines d’activité" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    group: "Contenu",
    description:
      "Fiches des domaines d’activité (route /domaines-activite/{slug}). La clé de route est code-owned ; deux domaines restent fermés par une barrière code-owned.",
  },
  versions: {
    drafts: { autosave: false },
  },
  access: {
    admin: canAccessAdmin,
    read: readPublishedOrStaff,
    // Creating or removing a domain is a structural change: developer only.
    create: ({ req: { user } }) => user?.role === "developer",
    update: updateContent,
    delete: deleteDeveloperOnly,
  },
  hooks: {
    beforeValidate: [
      validateDomainPublish,
      publishedMediaRightsHook(["seo.ogImage"]),
    ],
    beforeChange: [preventEditorPublish],
    afterChange: [
      async ({ doc }) => {
        invalidateContent({
          paths: ["/domaines-activite", domainPath(String(doc.slug))],
          tags: [CONTENT_TAGS.domains],
        })
        return doc
      },
    ],
    afterDelete: [
      async () => {
        invalidateContent({
          paths: ["/domaines-activite"],
          tags: [CONTENT_TAGS.domains],
        })
      },
    ],
  },
  fields: [
    {
      name: "slug",
      type: "select",
      label: "Clé du domaine (route)",
      required: true,
      unique: true,
      index: true,
      options: DOMAIN_KEYS.map((domain) => ({
        label: `${domain.label} (${domain.slug})`,
        value: domain.slug,
      })),
      access: { create: developerOnlyField, update: developerOnlyField },
      admin: {
        description:
          "Identifiant code-owned de la route et de la barrière de publication : le changer est un changement de code, pas une édition de contenu.",
      },
    },
    textField("title", "Titre (h1)", "Titre du CDC, affiché en h1.", true),
    textField(
      "summary",
      "Accroche (index)",
      "Une phrase, affichée dans l’index des domaines et les listes."
    ),
    {
      name: "presentation",
      type: "group",
      label: "Présentation et besoins",
      fields: [
        textField("title", "Titre de section"),
        richTextField("body", "Texte de présentation"),
      ],
    },
    {
      name: "prestations",
      type: "group",
      label: "Prestations confirmées",
      admin: {
        description:
          "Uniquement des prestations confirmées : jamais une capacité supposée ni un agrément gated.",
      },
      fields: [
        textField("title", "Titre de section"),
        labelledItemsField("items", "Prestations"),
      ],
    },
    {
      name: "methods",
      type: "group",
      label: "Méthode, moyens et compétences",
      fields: [
        textField("title", "Titre de section"),
        titledItemsField("items", "Sous-sections"),
      ],
    },
    contactCtaField("Bandeau de clôture de la fiche domaine."),
    seoField(),
  ],
}
