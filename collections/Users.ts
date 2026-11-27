/**
 * `users` — the launch accounts and their role (content model §4, §5.2).
 *
 * No public sign-up: the first accounts are created by `scripts/seed.ts` with
 * the Local API (`overrideAccess: true`), never through `/admin/create-first-user`,
 * so a fresh environment is reproducible. The developer manages accounts; the
 * owner may edit their own name and password, but never their role or the
 * `active` switch.
 */
import type { CollectionConfig } from "payload"

import {
  canAccessAdmin,
  developerOnlyField,
  isDeveloper,
  isStaff,
  userRole,
} from "../access/roles"

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Compte", plural: "Comptes" },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role", "active"],
    group: "Administration",
    description:
      "Comptes du back-office. Le développeur gère les comptes ; le propriétaire peut modifier son nom et son mot de passe.",
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
  },
  access: {
    admin: canAccessAdmin,
    read: isStaff,
    create: isDeveloper,
    // The developer manages accounts; every role may update their own record
    // (name, password). `role` and `active` stay developer-only fields.
    update: ({ req: { user }, id }) =>
      userRole(user) === "developer" || (Boolean(user) && String((user as { id?: unknown }).id) === String(id)),
    delete: isDeveloper,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nom",
      required: true,
      admin: { description: "Nom affiché dans le back-office." },
    },
    {
      name: "role",
      type: "select",
      label: "Rôle",
      required: true,
      defaultValue: "editor",
      saveToJWT: true,
      options: [
        { label: "Développeur", value: "developer" },
        { label: "Éditeur", value: "owner" },
        { label: "Contributeur", value: "editor" },
      ],
      access: { create: developerOnlyField, update: developerOnlyField },
      admin: {
        description:
          "Développeur : tous les droits. Éditeur : modifier, publier, dépublier, sans suppression. Contributeur : brouillons seulement.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      label: "Actif",
      defaultValue: true,
      access: { create: developerOnlyField, update: developerOnlyField },
      admin: { description: "Un compte inactif ne peut plus se connecter." },
    },
  ],
}
