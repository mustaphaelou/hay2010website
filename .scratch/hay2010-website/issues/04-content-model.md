# Decide the content model and update workflow

Type: grilling
Status: resolved
Blocked by: 01

## Question

Which parts of the site are static, which need non-developer editing, and how will updates happen?

Decide:

- Whether to keep content in TypeScript/MDX modules (fast, developer-owned) or add a headless CMS (Sanity, Payload, Contentful) for actualités, médiathèque, carrières and références.
- Which sections change often enough to justify a CMS: news posts, job openings, project references, media gallery, homepage highlights.
- Who edits the site after launch, how often, and what approval is needed.
- Whether the site needs a newsletter, site search or a blog at all; if yes, which provider.
- If actualités/blog is in scope, whether loi 88-13's electronic-press obligations apply (publication director, legal deposit) and who would be named.
- The content model for services, projects, news posts, job openings and legal pages: fields, relationships, media.
- A migration path if we start static and add a CMS later.

The answer should name the chosen approach, the editable content types, and the authoring workflow.

## Answer

Resolved 2026-11-09 by a grilling session with the owner. The full content model, field tables, roles, gates and build notes are in [`docs/content/content-model.md`](https://github.com/mustaphaelou/hay2010website/blob/main/docs/content/content-model.md).

### The decision

**Payload 3**, self-hosted and MIT licensed, embedded in the existing Next.js 16 app with the admin at `/admin`. Content lives in Postgres; images live in S3-compatible object storage. The owner edits in a browser; there is no Git workflow for content and no page builder.

**Why this and not the alternatives**

- **Payload:** open source, Next.js-native, one deployment, `/admin`, French UI, custom roles, drafts, versions, live preview, uploads with generated image sizes, Postgres and S3/R2. Next.js 16 support is in Payload 3.73+; this repo is on 16.4.3.
- **Sanity:** the Studio is open source, but the Content Lake is proprietary hosted. Ruled out by the open-source requirement.
- **Strapi/Directus:** open source, but separate, heavier apps with more operations for a ten-page site.
- **Keystatic/Decap:** open source, but git-based; the owner would need GitHub, drafts would live in Git, and images would bloat the repo.
- **Headless WordPress:** open source, but it reintroduces the plugin and security stack we are leaving.

Hosting is not decided here. Payload runs on Vercel with managed Postgres and object storage, or on a VPS with Postgres and MinIO; [#8](https://github.com/mustaphaelou/hay2010website/issues/8) chooses the runtime and providers.

### Source of truth

| Owned by | Content |
|---|---|
| **Code (developer)** | Legal identity, contact channels, approved claims, gated claims, navigation/footer, redirects, SEO defaults and JSON-LD, feature gates, service anchors and order |
| **Payload** | Page copy and images, service copy, projects, jobs, communiqués, media, homepage highlights |

The legal identity is rendered from code, not stored as editable CMS fields. The admin shows a read-only **Company facts** panel with the approved wording. The facts register remains the source: [`docs/company/facts-register.md`](https://github.com/mustaphaelou/hay2010website/blob/main/docs/company/facts-register.md).

### Editable content types

- **Globals:** `homepage`, `entreprise`, `metiers`, `realisations`, `actualites`, `mediatheque`, `carrieres`, `contact`, `legal`.
- **Collections:** `services` (four fixed records), `projects`, `jobs`, `communiques`, `media`, `users`.

`actualites` and `mediatheque` are gated page records: their copy and gallery selection exist, but the routes return 404 until `actualitesLive`/`mediathequeLive` and the rights gate allow them. The Médiathèque is a curated selection from the media library, not the raw library.

The four services are fixed: `eclairage-public`, `reseaux-hta-mt`, `postes-de-transformation`, `cfo-cfa`. The owner edits their copy, bullets, image and related projects. Adding, removing, reordering or ungating a service is a developer change because it touches the navigation, anchors, homepage cards, facts register and sitemap. Solaire stays gated until [#3](https://github.com/mustaphaelou/hay2010website/issues/3) clears it.

**Deliberately not modeled:** newsletter, site search, comments, blog categories/tags/authors/RSS, a page builder, contact-form messages, CVs or applicant data. Forms stay with [#12](https://github.com/mustaphaelou/hay2010website/issues/12); analytics and consent stay with [#10](https://github.com/mustaphaelou/hay2010website/issues/10).

### Roles and publishing

| Role | Can do | Cannot do |
|---|---|---|
| `developer` (agency) | Everything: users, schema, media rights, legal/claims publication, first communiqué, permanent deletion | — |
| `owner` | Create/edit/publish routine page copy, service copy, projects, jobs and later communiqués; upload media; clear company-owned images with no people or marks; unpublish; close jobs; delete drafts | Manage users; edit legal identity, approved claims, navigation or SEO defaults; clear restricted media; permanently delete published items |
| `editor` (optional assistant) | Create and edit drafts | Publish, clear rights, manage users, delete published content |

The owner publishes routine content. The developer publishes legal prose, claims, new services, the first communiqué and anything that depends on permissions. The owner can unpublish, close and delete drafts; permanent deletion is developer-only.

### Workflow

Draft → preview → publish. Payload autosaves drafts; live preview renders them with the real layout behind authentication. Publishing calls `revalidateTag`/`revalidatePath`, so the static site updates without a redeploy. Jobs auto-hide at `closingAt`; a daily scheduled revalidation covers the case where nobody opens the admin. Payload versions allow content rollback; Postgres backups and bucket versioning sit behind that.

Cadence: a few changes per quarter. Job opening live within two business days; page copy or image swap within five; legal or claim changes before the next publish, never on a deadline; quarterly review of services, legal pages, contact channels, open jobs and media rights.

### Media rights

Every image needs French alt text, a credit and a rights status. The owner can clear a company-owned image with no identifiable people and no client marks. The developer clears people, client marks, employee portraits, licensed photography and testimonials. Publication is blocked — not just warned — while rights are pending. Revoking rights hides the image everywhere on the next revalidation. No Porto demo assets, no stock construction photography, no AI-generated people.

### Actualités and loi 88-13

The internal type is `communiques`; the public label is `Actualités`, route `/actualites`. Maximum six a year. No authors, tags, categories, comments, RSS, advertising or external contributors. `legalReviewed` (developer-only) is required before publication; the first post is reviewed by Moroccan counsel. The gate `actualitesLive` stays false at launch, and a direct URL returns 404. If the owner ever wants a real news operation, reopen [#5](https://github.com/mustaphaelou/hay2010website/issues/5) and take advice before publishing.

### Boundary decisions

- **Services:** fixed four; copy is owner-editable, structure is developer-owned.
- **Deletion:** the owner unpublishes and deletes drafts; the developer deletes published items and media.
- **Media clearance:** the owner clears company-owned, no-people, no-mark images; the developer clears everything restricted.
- **Legal pages:** the owner may draft edits; the developer publishes after review; the identity block stays read-only.

### Migration and seeding

There is no legacy content to migrate: the current WordPress site is a Porto demo with 12 template pages, 7 lorem posts and 51 demo media items. A `scripts/seed.ts` creates the globals and the four services from the approved copy and the facts register; job openings start empty. Media starts empty and is uploaded only with rights. Collections export to JSON and media stays in the bucket; the frontend reads through a content adapter, so the source can be replaced without rewriting pages.

### Handoffs

- [#6](https://github.com/mustaphaelou/hay2010website/issues/6) réalisations: `projects` schema, permission fields, `Références sur demande` fallback, three-project threshold for detail pages.
- [#8](https://github.com/mustaphaelou/hay2010website/issues/8) hosting: Payload runtime, Postgres, object storage, backups, region, cron.
- [#10](https://github.com/mustaphaelou/hay2010website/issues/10) legal/analytics: legal prose fields, identity block, conditional CNDP receipt, no personal data in the CMS.
- [#11](https://github.com/mustaphaelou/hay2010website/issues/11) SEO: SEO groups, noindex for drafts/gated, sitemap from published content, JSON-LD from code facts.
- [#12](https://github.com/mustaphaelou/hay2010website/issues/12) forms: no submissions or CVs in Payload; `formLive` gate; application email.
- [#13](https://github.com/mustaphaelou/hay2010website/issues/13) prototype: the field names and copy slots to exercise.
- [#14](https://github.com/mustaphaelou/hay2010website/issues/14) CNDP: no applicant data, releases for people, conditional receipt.
- [#15](https://github.com/mustaphaelou/hay2010website/issues/15) DNS: canonical URL from code; admin on the same domain or a protected subdomain.
- [#16](https://github.com/mustaphaelou/hay2010website/issues/16) launch: content readiness, gates, backups, ownership, first communiqué review.

### Acceptance criteria

- Admin at `/admin`, French, with `developer`, `owner` and `editor` roles.
- The owner can publish a job and see it live without a developer.
- The owner cannot edit legal identity, approved claims, navigation or SEO defaults.
- Publishing an uncleared image or a client name without permission is blocked.
- The owner can unpublish but cannot permanently delete published content.
- The first communiqué cannot publish without `legalReviewed`; `/actualites` stays 404 until the gate opens.
- `/realisations` falls back to `Références sur demande` with no published projects.
- Revalidation updates the page, homepage, listing and sitemap after publish.
- Preview works for drafts without exposing them publicly.
- A backup restore is tested before launch.
- No contact message, CV or applicant data is stored in Payload.
- The public site stays available when the admin is down.
