/**
 * The one definition of "this image may appear on the public site" — the
 * media-rights rule of the content model (§7, tickets #29/#30).
 *
 * It lives at the seam level (pure data, no Payload import) because three
 * places must apply exactly the same rule and must never disagree:
 *
 * 1. the fixture provider, when it decides whether a fixture media record may
 *    leave the seam;
 * 2. the CMS provider, when it maps a Payload media row to a seam record;
 * 3. the Payload admin hook (`lib/payload/media-rights.ts`), which rejects
 *    publishing a document whose upload is not cleared.
 *
 * The admin also validates that a `cleared` record names its evidence
 * (`rightsReference`), which is a *save-time* validation concern; this
 * predicate is the visibility rule every provider and the publish hook share.
 */
import type { MediaRights } from "./types"

/** May a media record with these rights appear on the public site? */
export function mediaRightsCleared(rights: MediaRights): boolean {
  if (rights.status !== "cleared") return false
  // Identifiable people need their own release on file.
  if (rights.peoplePresent && rights.releaseStatus !== "cleared") return false
  // Visible client marks need both the client's and the trademark holder's
  // permission.
  if (
    rights.clientMarks &&
    !(rights.clientPermission && rights.trademarkPermission)
  ) {
    return false
  }
  return true
}
