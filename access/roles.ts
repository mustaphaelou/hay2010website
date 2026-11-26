/**
 * Roles and permission predicates — the ONLY place a role is compared to a
 * capability (docs/content/content-model.md §4, spec "Admin and editorial
 * rules").
 *
 * The launch model has three roles:
 * - `developer` (Développeur): everything — schema, accounts, rights
 *   clearance, permanent deletion;
 * - `owner` (Éditeur): edit, publish, unpublish; upload media and clear
 *   company-owned images with no people and no client marks; **no delete**;
 * - `editor` (Contributeur): drafts only, cannot publish (enforced by the
 *   `preventEditorPublish` hook, because a query constraint alone does not
 *   stop an API PATCH of `_status`).
 *
 * Two families of types, deliberately: Payload's `Access` and `FieldAccess`
 * signatures are NOT interchangeable (their args and result types differ), so
 * reusing one for the other is a type error in 3.94.2.
 */
import type { Access, FieldAccess, PayloadRequest } from "payload"

/** The three launch roles (content model §4). */
export type Role = "developer" | "owner" | "editor"

/** Structural view of an authenticated user; the generated `User` fits. */
interface RoleHolder {
  role?: Role
}

/**
 * Normalise `req.user.role` to a known role (or `null`). A user document with
 * an unknown/missing role is treated as unauthenticated for content decisions:
 * fail closed rather than guess.
 */
export function userRole(user: unknown): Role | null {
  const role = (user as RoleHolder | null | undefined)?.role
  return role === "developer" || role === "owner" || role === "editor" ? role : null
}

/** Any signed-in staff member may open the admin panel. */
export const canAccessAdmin = ({ req }: { req: PayloadRequest }): boolean => Boolean(req.user)

/** Staff-only read: every authenticated role, nobody anonymous. */
export const isStaff: Access = ({ req: { user } }) => Boolean(user)

/** Developer-only: accounts, rights clearance, permanent deletion. */
export const isDeveloper: Access = ({ req: { user } }) => userRole(user) === "developer"

/** Owner and developer — routine content and media edits (never the editor). */
export const ownerOrDeveloper: Access = ({ req: { user } }) => {
  const role = userRole(user)
  return role === "developer" || role === "owner"
}

/**
 * Content creation: owner and developer, plus the future editor who may only
 * create drafts (publishing is blocked by a hook).
 */
export const canCreateContent: Access = ({ req: { user } }) => userRole(user) !== null

/**
 * Content update: owner and developer edit anything; the editor is scoped to
 * draft documents.
 *
 * Do not rely on this constraint for publish control: it only decides which
 * documents are updatable. `preventEditorPublish` is the enforcement.
 */
export const updateContent: Access = ({ req: { user } }) => {
  const role = userRole(user)
  if (role === "developer" || role === "owner") return true
  if (role === "editor") return { _status: { equals: "draft" } }
  return false
}

/**
 * Permanent deletion of content: developer only. The owner unpublishes; the
 * ticket's acceptance criterion is that an owner DELETE is denied.
 */
export const deleteDeveloperOnly: Access = ({ req: { user } }) => userRole(user) === "developer"

/**
 * Public read of published documents; staff see everything (drafts, gated
 * documents and their gate reason in the admin).
 */
export const readPublishedOrStaff: Access = ({ req: { user } }) =>
  user ? true : { _status: { equals: "published" } }

/** A field only the developer may read/write (role, rights evidence, legal review). */
export const developerOnlyField: FieldAccess = ({ req: { user } }) => userRole(user) === "developer"

/** A field the owner and the developer may edit (routine copy, media provenance). */
export const ownerOrDeveloperField: FieldAccess = ({ req: { user } }) => {
  const role = userRole(user)
  return role === "developer" || role === "owner"
}

/**
 * Field access for a media rights decision (content model §7.1).
 *
 * The owner may only set a rights status on a company-owned image with no
 * identifiable people and no client marks; the developer may set any rights
 * field. `data` is the incoming (delta) update, `doc` the stored document, so
 * the decision is made on the merged effective record — otherwise an owner
 * could clear a restricted image by omitting the restricted field.
 */
export const ownerMayClearRights: FieldAccess = ({ req: { user }, data, doc }) => {
  const role = userRole(user)
  if (role === "developer") return true
  if (role !== "owner") return false
  const merged: Record<string, unknown> = {
    ...((doc ?? {}) as Record<string, unknown>),
    ...((data ?? {}) as Record<string, unknown>),
  }
  return (
    merged.rightsBasis === "company-owned" &&
    merged.peoplePresent !== true &&
    merged.clientMarks !== true
  )
}
