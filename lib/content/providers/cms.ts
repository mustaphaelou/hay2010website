/**
 * CMS provider — deliberately unimplemented at #21.
 *
 * Ticket #29 embeds Payload 3 and implements this module behind the exact same
 * `ContentSource` interface: it must dynamically build the Payload client (so
 * the fixture path never loads Payload, a database or `payload.config.ts`),
 * then translate Payload documents into the domain types of
 * `lib/content/types.ts` and apply the same gate rules the fixture provider
 * applies (published listings only, gated documents still readable by key,
 * cleared media only).
 *
 * Nothing in the app imports Payload directly: this file is the only place
 * that will.
 */
import type { ContentSource } from "@/lib/content/types"

export async function getCmsContentSource(): Promise<ContentSource> {
  throw new Error(
    "Le fournisseur CMS n’est pas encore configuré (ticket #29). " +
      "Utilisez CONTENT_SOURCE=fixture (défaut) ou implémentez getCmsContentSource() " +
      "derrière l’interface ContentSource de lib/content/types.ts."
  )
}
