# HAY2010 — Content model and update workflow

**Status:** resolved 2026-11-09 — ticket [#5](https://github.com/mustaphaelou/hay2010website/issues/5).
**Amended 2026-11-09 (#10):** contact channels are `contact@`, `donnees@` and `recrutement@hay2010.ma` (careers gated by #14); the legal global carries structured CNDP references; the analytics and legal-page decision is [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md).
**Amended 2026-11-09 (#12):** no application form and no CV upload; the contact form is optional and gated on F-211; `contactNotice` is shown even when the form is off; the form/CV flow is in [`docs/forms/contact-careers-forms.md`](../forms/contact-careers-forms.md).
**Platform:** **Payload 3** (MIT, self-hosted), embedded in the existing Next.js 16 app, admin at `/admin`.
**Scope:** the website content model and authoring workflow. Hosting, forms, SEO rules, analytics and visual design stay with their own tickets.
**Source of truth:** this document plus the schema in code. The facts register remains the source for legal identity and approved claims: [`docs/company/facts-register.md`](../company/facts-register.md).

---

## 1. The decision

Use **Payload 3** as the content management system:

- Open source and MIT licensed, self-hosted, no per-seat fees.
- Runs inside the existing Next.js 16.4.3 app, so the admin is part of the site and there is one deployment.
- Admin at `/admin`, French UI, email/password accounts, custom roles.
- Postgres for content and S3-compatible object storage for media.
- Drafts, versions, live preview, field-level access control and uploads with generated image sizes.
- Content lives in a database, not in Git; the public repo can stay public.

**Not chosen:** Sanity (the Studio is open source, but the Content Lake is proprietary hosted), Strapi/Directus (open source but separate, heavier apps), Keystatic/Decap (open source but git-based — the owner would need GitHub and drafts would live in Git), and headless WordPress (the plugin and security burden we are leaving).

**Hosting is not decided here.** Payload runs on Vercel with managed Postgres and object storage, or on a VPS with Postgres and MinIO. [#8](https://github.com/mustaphaelou/hay2010website/issues/8) chooses the runtime and the providers; this model does not depend on which.

**Platform references:** [Payload is MIT and self-hosted](https://payloadcms.com/posts/blog/open-source) · [Payload 3.73 supports Next.js 16](https://payloadcms.com/posts/releases/new-in-payload-dashboards-developer-control-and-nextjs-16) · [storage adapters](https://payloadcms.com/docs/v3/upload/storage-adapters) · [get started](https://payloadcms.com/get-started).

### Terms

| Term | Meaning |
|---|---|
| **Global** | A singleton content record: one homepage, one L'Entreprise page, one legal page set. |
| **Collection** | A list of records: projects, jobs, communiqués, media, users. |
| **Communiqué** | A company announcement. Not a news article, not a blog post. |
| **Gate** | A code flag that hides a section or record until the owner and the facts register clear it. |
| **Approved claim** | Wording approved in the facts register §2.2; it is code-owned, not CMS-editable. |
| **Rights-cleared** | An image that may be published: ownership/licence recorded, and any people or client marks cleared. |

---

## 2. Principles

1. **One fact, one source.** Legal identity, contact channels and approved claims come from the facts register and live in code. The CMS never duplicates them.
2. **Gates are enforced by the schema, not by memory.** A gated claim, an unapproved photo or a client logo cannot be published by filling a field.
3. **Structured content, not a page builder.** The owner edits named fields; the layout remains developer-owned.
4. **Rights before publication.** Every image carries alt text, credit and a rights status. Unclear rights block publication.
5. **No personal data in the content database.** Contact and application data stay with [#12](https://github.com/mustaphaelou/hay2010website/issues/12); #12 decided that the app stores none of it — the mailboxes are the record. The one exception is a released photo of a person, which is gated by its release record.
6. **Content is portable.** Collections export to JSON and media to the bucket; the frontend reads through a content adapter, so the source can be replaced without rewriting pages.

---

## 3. Source-of-truth split

### Code-owned (developer)

| Area | Where | Why |
|---|---|---|
| Legal identity: legal name, form, RC, ICE, capital, address, gérant line | `lib/company.ts` | One typo in the RC or capital is a legal error. |
| Approved claims: `Plus de 10 ans d'expérience`, the four services, the ONEE agréments wording | `lib/company.ts` / `lib/claims.ts` | The facts register §2.2 is the only approved wording. |
| Contact channels: `contact@hay2010.ma`, `donnees@hay2010.ma`, `recrutement@hay2010.ma` (gated), `Rabat — Maroc` | `lib/company.ts` | Owner-approved 2026-11-09; the Gmail is a private fallback. Phone and socials remain gated; `recrutement@` is public only after #14. |
| Navigation, footer, service anchors and their order | `lib/navigation.ts` | The page tree and anchors are fixed by [#2](https://github.com/mustaphaelou/hay2010website/issues/2). |
| Redirects and 410s | `next.config.ts` / middleware | The WordPress redirect map is code. |
| SEO defaults, metadata patterns, JSON-LD, sitemap, robots | `lib/seo.ts` | [#11](https://github.com/mustaphaelou/hay2010website/issues/11) owns the rules. |
| Feature gates | `lib/flags.ts` | `actualitesLive`, `mediathequeLive`, `solaireLive`, `agrementLive`, `mapLive`, `formLive`, `applicationFormLive`, `cvUploadLive`, `caseStudiesLive`, `recrutementMailboxLive`, `analyticsLive`. |
| Form notices | `components/forms/` | `contactNotice` (shown even when the form is off), `formNotice` (form-only), the careers email notice; all code-owned from the #10 §4.5 texts and `cndpReferences`. |

### Payload-owned (owner-editable)

- Homepage, L'Entreprise, Nos Métiers, Réalisations, Carrières and Contact page copy and images.
- Service copy, bullets, images and related projects.
- Projects and case studies.
- Job openings.
- Communiqués (gated).
- Media library.
- Legal prose (draft only; the developer publishes).

### The boundary rule

If a value appears in the facts register §2, it is **code-owned**. If it is prose about the company, it may live in Payload, but it may not contradict the register. The admin shows a read-only **Company facts** reference panel so the owner can copy the approved wording without guessing.

---

## 4. Roles and access

| Role | Admin label | Can do | Cannot do |
|---|---|---|---|
| `developer` | Développeur | Everything: schema, users, media rights clearance, legal/claims publication, permanent deletion, first communiqué | — |
| `owner` | Éditeur | Create/edit/publish routine page copy, service copy, projects, jobs and later communiqués; upload media; clear company-owned images with no people or marks; unpublish; close jobs; delete drafts | Manage users; edit legal identity, approved claims, navigation or SEO defaults; clear restricted media; permanently delete published items |
| `editor` | Contributeur | Create and edit drafts | Publish; clear media rights; manage users; delete published content |

- The owner and the developer are the two launch accounts. `editor` exists for a future assistant and can stay unused.
- Field-level restrictions:
  - `legalReviewed`, `legalReviewRef`: developer only.
  - `contactNotice`, `formNotice`: developer only; they carry the CNDP receipt and cannot be edited by the owner.
  - `rightsStatus`, `releaseStatus`, `clientPermission`, `trademarkPermission`: developer only, except the owner may set `rightsStatus=cleared` on an image that is company-owned, has no people and no client/trademark marks (see §7).
  - `services.key`, `services.order`, `services.status`: developer only.
  - `users.role`: developer only.
- Access functions live in `access/` and are unit-tested. The admin hides fields the role cannot edit rather than showing an error after the fact.
- Destructive actions: the owner can unpublish, close and delete drafts. Permanent deletion of published records and media is developer-only.

---

## 5. Content types

### 5.1 Globals

#### `homepage`

| Field | Type | Notes |
|---|---|---|
| `hero.eyebrow` | text | Short label above the headline. |
| `hero.title` | text, required | The headline. |
| `hero.subtitle` | textarea | One or two sentences. |
| `hero.image` | upload → media | Required unless the typographic fallback is active. |
| `hero.imageAlt` | text | Required when an image is set. |
| `hero.primaryCtaLabel` / `primaryCtaTarget` | text / select | Target is an internal route enum, not a free URL. |
| `hero.secondaryCtaLabel` / `secondaryCtaTarget` | text / select | Same. |
| `intro.label`, `intro.title`, `intro.body` | text / text / rich text | The “Qui sommes-nous” split. |
| `intro.image`, `intro.imageAlt` | upload / text | 4:3 crop per the brand plan. |
| `intro.linkLabel`, `intro.linkTarget` | text / select | “L'Entreprise”. |
| `servicesBand.label`, `servicesBand.title`, `servicesBand.intro` | text / text / rich text | The four cards come from the services collection. |
| `referencesTeaser.label`, `referencesTeaser.title`, `referencesTeaser.fallbackText` | text / text / rich text | The fallback is `Références sur demande` until projects are approved. |
| `referencesTeaser.featuredProjects` | relationship → projects, max 3 | Manual selection; empty means the fallback. |
| `referencesTeaser.linkLabel` | text | “Voir les réalisations”. |
| `careersTeaser.label`, `careersTeaser.title`, `careersTeaser.body` | text / text / rich text | Kept compact. |
| `careersTeaser.featuredJobs` | relationship → jobs, max 2 | Manual selection; empty shows a single line. |
| `careersTeaser.linkLabel` | text | “Rejoignez-nous”. |
| `contactCta.title`, `contactCta.body` | text / rich text | Ends the page. |
| `contactCta.ctaLabel`, `contactCta.ctaTarget` | text / select | “Nous contacter”. |
| `seo` | group | Title, description, OG image; [#11](https://github.com/mustaphaelou/hay2010website/issues/11) patterns override. |

#### `entreprise`

| Field | Type | Notes |
|---|---|---|
| `hero.label`, `hero.title`, `hero.subtitle` | text / text / textarea | The page opener. |
| `hero.image`, `hero.imageAlt` | upload / text | Optional. |
| `intro.title`, `intro.body` | text / rich text | Company story; must not add a founding year. |
| `values` | array `{ title, body }` | The page absorbs valeurs. |
| `activities` | array `{ title, body }` | Optional; the four services are the canonical list. |
| `seo` | group | — |

Code-rendered on this page: the approved positioning line, `Plus de 10 ans d'expérience`, `Gérant : Rahhal Essamlali`, and the ONEE agréments block — the last only when `agrementLive` is true and both certificates are filed. The owner cannot edit or publish these.

#### `metiers`

| Field | Type | Notes |
|---|---|---|
| `hero.label`, `hero.title`, `hero.subtitle` | text / text / textarea | — |
| `hero.image`, `hero.imageAlt` | upload / text | Optional. |
| `intro.title`, `intro.body` | text / rich text | The one-page introduction. |
| `servicesIntro` | rich text | Copy above the four anchored blocks. |
| `cta.title`, `cta.body`, `cta.label` | text / rich text / text | Contact band. |
| `seo` | group | — |

The four service blocks come from the `services` collection. Solaire appears only when `solaireLive` is true.

#### `realisations`

| Field | Type | Notes |
|---|---|---|
| `hero.label`, `hero.title`, `hero.subtitle` | text / text / textarea | — |
| `intro.title`, `intro.body` | text / rich text | — |
| `fallbackText` | rich text | Seeded with `Références sur demande`; used when no project is published. |
| `listIntro` | rich text | Optional copy above the project list. |
| `seo` | group | — |

#### `actualites`

The gated listing page for `communiques`.

| Field | Type | Notes |
|---|---|---|
| `hero.label`, `hero.title`, `hero.subtitle` | text / text / textarea | Listing page opener. |
| `intro.title`, `intro.body` | text / rich text | Short intro above the list. |
| `seo` | group | Noindex until `actualitesLive` is true; [#11](https://github.com/mustaphaelou/hay2010website/issues/11) patterns. |

The list is the published `communiques` collection. No authors, tags or categories.

#### `mediatheque`

The gated curated gallery.

| Field | Type | Notes |
|---|---|---|
| `hero.label`, `hero.title`, `hero.subtitle` | text / text / textarea | Page opener. |
| `intro.title`, `intro.body` | text / rich text | Short intro. |
| `gallery` | relationship → media, hasMany, ordered | Curated selection, not the raw library. Captions and alt come from the media record. |
| `seo` | group | Noindex until `mediathequeLive` is true. |

The owner curates the gallery order. The rights gate filters the items: an uncleared image cannot appear even if it is selected. The page stays hidden until at least one approved photo exists.

#### `carrieres`

| Field | Type | Notes |
|---|---|---|
| `hero.label`, `hero.title`, `hero.subtitle` | text / text / textarea | — |
| `hero.image`, `hero.imageAlt` | upload / text | Optional. |
| `intro.title`, `intro.body` | text / rich text | — |
| `culture.title`, `culture.body`, `culture.values` | text / rich text / array `{ title, body }` | Why work here. |
| `spontaneous.title`, `spontaneous.body` | text / rich text | Spontaneous applications; the email is code-rendered. |
| `seo` | group | — |

The application email is `recrutement@hay2010.ma` when `recrutementMailboxLive` is true, and `contact@hay2010.ma` until then. The flag stays false until [#14](https://github.com/mustaphaelou/hay2010website/issues/14) confirms the F-113 authorization covers the mailbox. **No application form and no CV upload** at launch: [#12](https://github.com/mustaphaelou/hay2010website/issues/12) decided email-only, with the CV travelling to `recrutement@` and the mailbox as the record. The page does not invite CVs before F-113. The email notice is in [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md) §4.5; the full flow is in [`docs/forms/contact-careers-forms.md`](../forms/contact-careers-forms.md) §4.

#### `contact`

| Field | Type | Notes |
|---|---|---|
| `hero.label`, `hero.title`, `hero.subtitle` | text / text / textarea | — |
| `intro.title`, `intro.body` | text / rich text | — |
| `contactNotice` | rich text | Developer-only. Shown **even when the form is off**, because the email route is still a collection; carries the short law 09-08 notice and the `contact` CNDP reference. |
| `formNotice` | rich text | Developer-only. Shown only when `formLive` is true; the full form notice. Until then the form is absent, not broken. |
| `seo` | group | — |

Code-rendered: address and `contact@hay2010.ma`. The Gmail is not shown. The map is hidden until `mapLive` is true and the owner confirms the address is a public reception point. The contact form is **optional** and waits on the F-211 receipt, the mailbox tests and [#12](https://github.com/mustaphaelou/hay2010website/issues/12); the email-only page still needs the short notice and the F-211 receipt. The notices are in [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md) §4.5; the behaviour is in [`docs/forms/contact-careers-forms.md`](../forms/contact-careers-forms.md) §3.

#### `legal`

| Field | Type | Notes |
|---|---|---|
| `mentionsLegales` | rich text | Prose only; the identity block is injected by the template. |
| `politiqueConfidentialite` | rich text | Prose only; controller, address, rights, retention and processors are injected or approved with [#10](https://github.com/mustaphaelou/hay2010website/issues/10). Cookies are a section of this page. |
| `lastReviewed` | date | Displayed as “Dernière mise à jour”. |
| `cndpReferences` | array `{ scope, number, date }` | Developer-only; empty until [#14](https://github.com/mustaphaelou/hay2010website/issues/14) issues a reference. Only filled entries render; no blank “n° …”. Scopes: `contact`, `careers`, `analytics`, `transfer`. |
| `legalReviewed` | checkbox | Developer-only; required before public publication. |
| `legalReviewRef` | text | Counsel/reviewer reference for the one-off review in #10. |
| `seo` | group | — |

The identity block is rendered from `lib/company.ts`:

```text
SOCIETE HAY 2010
Société à responsabilité limitée (SARL)
Capital social : 15 000 000 MAD
Siège social : Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc
Registre du commerce : RC 87305 — Tribunal de commerce de Rabat
ICE : 001459327000056
Contact : contact@hay2010.ma
Droits des personnes : donnees@hay2010.ma
```

No publication director, no phone, no host line in the mentions légales. The host is named as a processor in the privacy policy only. The exact prose and publication gates are in [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md) §4; the legal pages are public-launch gated by #14 and #16.

### 5.2 Collections

#### `services`

Four fixed records: `eclairage-public`, `reseaux-hta-mt`, `postes-de-transformation`, `cfo-cfa`. A fifth, `solaire`, stays gated.

| Field | Type | Notes |
|---|---|---|
| `key` | select, unique | Fixed enum; developer-only. |
| `title`, `shortTitle` | text | `Éclairage public`, `Réseaux HTA/MT & MT/BT`, etc. |
| `anchor` | text, read-only | Derived from `key`; the nav and homepage link to `/metiers#…`. |
| `icon` | select / media | A Hugeicons name or an approved SVG. |
| `summary` | textarea | Card copy. |
| `body` | rich text | The anchored block. |
| `bullets` | array of text | Scope points. |
| `image`, `imageAlt` | upload / text | Optional; rights-cleared. |
| `relatedProjects` | relationship → projects, hasMany | Case studies for this service. |
| `order` | number | Developer-only; fixed 1–4. |
| `status` | select `published` / `gated` | Developer-only. Solaire starts gated. |
| `seo` | group | — |

The owner edits copy, bullets, image and related projects. Adding, removing, reordering or ungating a service is a developer change, because it touches the nav, anchors, homepage cards, facts register and sitemap.

#### `projects`

| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | text, unique | Slug is stable; changing it needs a redirect. |
| `status` | select `draft` / `published` / `gated` | Only published, ungated records render. |
| `services` | relationship → services, hasMany | At least one. |
| `location`, `year` | text / number | — |
| `clientName` | text | Optional; gated by `clientPermission`. |
| `clientPermission` | checkbox + `clientPermissionRef` | Written client authorization. |
| `scope` | textarea | One-line scope. |
| `challenge`, `solution`, `results` | rich text | The case-study body. |
| `cover`, `coverAlt` | upload / text | Required for a named case study; **optional for an anonymized card**, which falls back to a typographic card. |
| `gallery` | array `{ image, alt, caption }` | Rights-cleared. |
| `peopleRelease` | checkbox + `peopleReleaseRef` | Required when an image shows identifiable people. |
| `testimonialPermission` | checkbox + `testimonialPermissionRef` | Required if a quote is included. |
| `evidenceReference` | text | Developer-only. Contract/réception reference for an owner-confirmed project; required for an anonymized card. |
| `featured` | checkbox | Eligible for the homepage teaser. |
| `publishedAt` | date | — |
| `seo` | group | — |

Publish validation:

- `clientName` requires `clientPermission` and a reference.
- A cover or gallery image with people requires `peopleRelease`.
- A testimonial requires `testimonialPermission`.
- Client logos require both the client permission and the trademark owner’s permission; until then, no logo.

At launch there are **no published projects**. `/realisations` is a credentials-led page: it shows the two ONEE agréments, the method and `Références sur demande`; the homepage teaser falls back to the same. Case-study detail pages go live only when at least three approved named case studies exist (phase 2), per [#6](https://github.com/mustaphaelou/hay2010website/issues/6).

**Amendment 2026-11-09 (#6) — réalisations references**

- **Anonymized card:** `clientName` empty, `evidenceReference` required, `cover` optional; it renders a typographic card (service, object, region, year, scope) with no buyer, logo, photo, amount, testimonial or detail link.
- **Named card:** `clientName` + `clientPermission`; a logo additionally needs `trademarkPermission`; a photo still passes the media rights gate; no detail page until the case-study gate.
- **Detail page:** `caseStudiesLive` (default false) and at least three approved named case studies.
- **Teaser:** `referencesTeaser.featuredProjects` is ignored until three projects are published; the fallback renders instead.
- **Amounts:** not modelled; they stay in the owner's inventory and are not displayed by default.
- The full strategy, page copy, evidence levels and permission campaign are in [`docs/content/realisations-strategy.md`](realisations-strategy.md).

#### `jobs`

| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | text, unique | Slug reserved for phase-2 detail pages. |
| `status` | select `draft` / `open` / `closed` | Only open records render. |
| `contractType` | select `CDI` / `CDD` / `Stage` / `Alternance` | — |
| `location` | text | Default `Rabat`. |
| `department` | text | Optional. |
| `experienceLevel` | text | Optional. |
| `summary` | textarea | List card. |
| `description` | rich text | — |
| `responsibilities`, `requirements` | array of text | — |
| `postedAt`, `closingAt` | date | `closingAt` auto-hides the job. |
| `applicationEmail` | email, read-only | `recrutement@hay2010.ma` when `recrutementMailboxLive` is true; `contact@hay2010.ma` until then. **Not rendered as an application CTA before F-113**; it is for questions only until the gate opens. |
| `featured` | checkbox | Homepage teaser. |
| `seo` | group | — |

No detail pages at launch: openings render inline on `/carrieres`. **No application form and no CV upload**: applications go by email after the F-113 authorization (email-only for the site, per [#12](https://github.com/mustaphaelou/hay2010website/issues/12)); `recrutement@` is not public before that authorization, and until then the page uses `contact@` and does not invite CVs. The owner creates, publishes and closes openings. See [`docs/forms/contact-careers-forms.md`](../forms/contact-careers-forms.md) §4.

#### `communiques`

| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | text, unique | — |
| `status` | select `draft` / `published` / `gated` | Gate is `actualitesLive` plus this status. |
| `publishedAt` | date | — |
| `excerpt` | textarea | List card and meta description fallback. |
| `cover`, `coverAlt` | upload / text | Optional; rights-cleared. |
| `body` | rich text | Company announcement. |
| `legalReviewed` | checkbox | Developer-only. Required before publication. |
| `legalReviewRef` | text | Counsel/reviewer reference. |
| `featured` | checkbox | Eligible for a future homepage slot; not shown at launch. |
| `seo` | group | — |

Policy:

- Maximum **six per year**. A validation hook warns at five and blocks the seventh.
- No authors, tags, categories, comments, RSS, related-post loops, advertising or external contributors.
- The public label is `Actualités` and the route is `/actualites`; the internal type is `communiques` because these are company announcements, not journalism.
- The first communiqué is published by the developer after counsel review. Later ones can be published by the owner only when `legalReviewed` is already set.
- The gate `actualitesLive` stays false at launch. A public direct URL returns 404; no “coming soon” page.
- If the owner ever wants a real news/blog operation, reopen [#5](https://github.com/mustaphaelou/hay2010website/issues/5) and take Moroccan counsel on loi 88-13 before publishing.

#### `media`

| Field | Type | Notes |
|---|---|---|
| `file` | upload | JPG/PNG/WebP; max 20 MB; EXIF stripped. |
| `alt` | text, required | French, describes the image, not the SEO keyword. |
| `caption` | text | Optional; shown where the design supports it. |
| `credit` | text | Photographer/source. |
| `rightsBasis` | select `company-owned` / `licensed` / `client-supplied` / `unknown` | Provenance; the owner may set it. |
| `rightsStatus` | select `pending` / `cleared` / `revoked` | Clearance gate; developer-only except for company-owned images with no people or client marks. |
| `rightsReference` | text | Licence, invoice, permission email or release reference. |
| `peoplePresent` | checkbox | Any identifiable person. |
| `releaseStatus` | select `not-required` / `pending` / `cleared` | Required when `peoplePresent`. |
| `releaseReference` | text | Signed release or authorization reference. |
| `clientMarks` | checkbox | Logo, name or identifiable site. |
| `clientPermission` | checkbox | Written client authorization. |
| `clientPermissionRef` | text | Client authorization reference. |
| `trademarkPermission` | checkbox | Trademark owner permission (loi 17-97). |
| `trademarkPermissionRef` | text | Trademark permission reference. |
| `takenAt` | date | Optional. |
| `focalPoint` | Payload focal point | For crops. |

Generated sizes: `thumbnail` 400 px, `card` 800 px, `hero` 1920 px, `og` 1200 × 630. WebP variants with a JPEG fallback; AVIF where the pipeline supports it. The original is kept in the bucket.

Publication gate:

- `rightsStatus` must be `cleared`.
- If `peoplePresent`, `releaseStatus` must be `cleared`.
- If `clientMarks`, both `clientPermission` and `trademarkPermission` must be true.
- `revoked` hides the image everywhere, including already-published pages, on the next revalidation.

No Porto demo assets, no stock construction photography, no AI-generated people. Documentary HAY2010 photography only.

#### `users`

`name`, `email`, `password`, `role` (`developer` / `owner` / `editor`), `active`. The developer manages users. The owner can change their own password and name. No public sign-up.

### 5.3 What is deliberately not modeled

- Newsletter, site search, comments, blog categories/tags/authors/RSS.
- A free-form page builder or block library.
- Contact form submissions or CVs — the app stores none (see [#12](https://github.com/mustaphaelou/hay2010website/issues/12)); they are not modelled in Payload.
- Analytics, cookie consent and tag manager configuration — decided in [#10](https://github.com/mustaphaelou/hay2010website/issues/10); no analytics script is configured in the CMS.
- Navigation, footer, redirects, legal identity, approved claims and SEO defaults — code.
- Testimonials as a separate type — they live inside an approved project until a permission exists.
- Job detail pages, service child pages, case-study filters, certifications page, multilingual content — later phases.

---

## 6. Relationships and gates

```
services 1 ─── n projects        (a project is classified by one or more services)
homepage 1 ─── n featuredProjects (max 3)
homepage 1 ─── n featuredJobs     (max 2)
media    1 ─── n pages/projects/jobs/communiques (cover, gallery, OG)
users    n ─── 1 role
```

| Gate | Default at launch | What it hides |
|---|---|---|
| `actualitesLive` | false | `/actualites`, article routes, Médias > Actualités, sitemap entries, homepage news slots. |
| `mediathequeLive` | false | `/mediatheque`, Médias > Médiathèque, sitemap entries. |
| `solaireLive` | false | The fifth service, its nav item, homepage card, anchor and sitemap entry. |
| `agrementLive` | false | The ONEE agrément blocks on L'Entreprise and `/realisations` until both certificates are filed. |
| `mapLive` | false | The contact map until the address is confirmed as a reception point. |
| `formLive` | false | The contact form until the F-211 receipt, the mailbox tests and the [#12](https://github.com/mustaphaelou/hay2010website/issues/12) gates clear. The email-only page has its own short notice and does not depend on this flag. |
| `applicationFormLive` | false | The phase-3 application form (not built); no `/carrieres/postuler`, no application fields. |
| `cvUploadLive` | false | The phase-3 CV upload (not built); no file input, no R2 application bucket. |
| `recrutementMailboxLive` | false | `recrutement@` on `/carrieres`, CV invitations and the careers email CTA until the F-113 authorization covers the mailbox. |
| `caseStudiesLive` | false | `/realisations/[slug]`, detail links and sitemap entries until three approved named case studies exist. |

Frontend rule: a record renders only when `status` is public, its gate is true, and its media is rights-cleared. Direct URLs to gated content return 404. The sitemap and internal links use the same filter, so a gate is never a hidden link.

---

## 7. Media and rights

### 7.1 Who clears what

| Image | Who can clear | What is required |
|---|---|---|
| Company-owned site photo, no identifiable people, no client marks | Owner | `rightsBasis=company-owned`, `rightsStatus=cleared`, `rightsReference` describing the source |
| Company-owned photo with identifiable people | Developer | `rightsBasis=company-owned`, `rightsStatus=cleared`, `peoplePresent`, `releaseStatus=cleared`, `releaseReference` |
| Photo by an external photographer | Developer | `rightsBasis=licensed`, `rightsStatus=cleared`, licence reference; `credit` required |
| Client site, client logo, client name mark | Developer | `rightsBasis=client-supplied`, `rightsStatus=cleared`, `clientMarks`, client permission and reference, trademark permission and reference |
| Employee portrait | Developer | Written specific authorization per person; `peoplePresent`, `releaseStatus=cleared`, `releaseReference` |
| Testimonial portrait/quote | Developer | Written testimonial release; linked from the project |
| Rights revoked | Developer | `rightsStatus=revoked`; hidden on next revalidation |

### 7.2 Upload and publication flow

1. The owner uploads the file and writes French alt text, a caption and a credit.
2. The owner sets `rightsBasis` and `rightsReference`. For a company-owned image with no people and no client marks, the owner may also set `rightsStatus=cleared`.
3. Anything with people, client marks, a licence or a testimonial stays `pending` until the developer records the evidence and clears it.
4. The editor shows a warning and blocks “use on page” while the image is not cleared.
5. Publishing a page or project with an uncleared image is blocked by a validation hook, not just a warning.
6. Revoking rights hides the image and triggers revalidation of every page that references it.

### 7.3 Image handling

- Generate WebP variants at the sizes above (AVIF where the image pipeline supports it); keep the original for archival.
- Strip EXIF location data; keep capture date only if the owner wants it.
- Use `next/image` with the bucket/CDN domain allow-listed.
- Never upscale a 500 px source to hero size. The logo is a vector; photography must meet the hero dimensions.
- No image without alt text reaches the frontend.

---

## 8. Update workflow

### 8.1 Who publishes what

| Content | Drafts | Publishes | Review required |
|---|---|---|---|
| Page copy and images | Owner | Owner | Only if it touches a claim, legal text or a new service |
| Service copy, bullets, image | Owner | Owner | Developer if the service itself changes |
| Projects | Owner | Developer while permissions are missing; owner once all permission flags are true | Client name, people, testimonial, logo permissions |
| Jobs | Owner | Owner | None; email application only |
| Communiqués | Owner | Developer for the first; owner later if `legalReviewed` is already set | Counsel before the first; `legalReviewed` on every one |
| Media | Owner uploads | Owner for company-owned/no-people; developer for restricted | Rights gate |
| Legal prose | Owner may draft | Developer | Always |
| Legal identity, approved claims, nav, SEO defaults | — | Developer | Always; code-owned |

### 8.2 The loop

1. **Intake.** The owner writes in the admin, or sends copy/photos to the developer for a batch.
2. **Draft.** Payload autosaves. The record is invisible to the public.
3. **Preview.** Live preview or a signed preview URL renders the draft with the real layout. Preview is authenticated; it is not a public staging site.
4. **Review.** The developer reviews anything on the review list: legal text, claims, new services, client names, people, client logos, the first communiqué.
5. **Publish.** Payload sets the published status. An `afterChange` hook calls `revalidateTag`/`revalidatePath` for the affected page, the homepage, the sitemap and any listing.
6. **Verify.** The owner opens the live URL. A publish is not done until the page shows the change.
7. **Record.** Rights references and legal-review references stay on the record; factual approvals stay in the ticket or email trail.

### 8.3 Expiry, unpublish and rollback

- **Jobs** auto-hide when `closingAt` passes. A daily scheduled revalidation covers the case where nobody opens the admin; the owner can also close a job manually.
- **Projects and communiqués** can be unpublished at any time; the record stays in the admin.
- **Media** can be revoked; every reference disappears after revalidation.
- **Versions.** Payload keeps document versions; the developer can restore a prior version.
- **Backups.** Postgres point-in-time recovery or a scheduled dump, plus bucket versioning. [#8](https://github.com/mustaphaelou/hay2010website/issues/8) picks the provider; the restore is tested before launch.
- **Code rollback** is a Vercel deployment rollback or a Git revert. Content rollback never requires a code deploy.

### 8.4 Cadence and service levels

- Content changes: a few per quarter, per the decision in [#5](https://github.com/mustaphaelou/hay2010website/issues/5).
- Job opening: live within **2 business days** of the owner’s copy.
- Page copy or image swap: within **5 business days**.
- Legal, claim or permission change: before the next publish, never on a deadline.
- Quarterly review: services, legal pages, contact channels, open jobs, media rights, broken links.
- The owner is the content owner; the developer is the technical owner. Both are named in the hosting/ops handoff ([#8](https://github.com/mustaphaelou/hay2010website/issues/8)).

### 8.5 Incident path

- Wrong content published: unpublish or restore the prior version, then revalidate.
- Rights revoked: set `revoked`; verify the image is gone from every page.
- Legal/claim error: unpublish the page, correct the copy, ask the developer to review, republish.
- Admin unavailable: the site remains static and serving; fix the admin, then resume. The public site does not depend on Payload being up at request time.

---

## 9. Legal and compliance guardrails

### 9.1 Loi 88-13

Loi 88-13 applies to a “journal électronique” — a publication that is regularly updated, has its own domain and a professional journalistic editorial line, and names a publication director. A corporate site with occasional company announcements is not that. The model keeps it that way:

- The type is `communiques`, not a blog.
- Maximum six a year; no daily or weekly cadence.
- No external contributors, advertising, comments, tags, categories, RSS or author pages.
- The first communiqué is reviewed by Moroccan counsel; the review reference is stored on the record.
- If the owner wants a real news operation, reopen [#5](https://github.com/mustaphaelou/hay2010website/issues/5) and take advice before publishing.

### 9.2 CNDP and personal data

- No contact-form messages, CVs or applicant data in Payload — and none in the app either, per [#12](https://github.com/mustaphaelou/hay2010website/issues/12); the mailboxes are the record.
- Media may contain people; that is personal data. It is published only with a recorded release, and the release reference is part of the media record.
- Employee photos need a specific written authorization, not a generic consent.
- The privacy policy names `SOCIETE HAY 2010` as controller (`contact@hay2010.ma`, rights `donnees@hay2010.ma`); the CMS is a tool, not the controller.
- The CNDP references are structured in `cndpReferences` and render only when a real `scope`/`number`/`date` exists. Never copy lamalif’s blank receipt.
- No analytics, tag manager or tracking scripts are configured in Payload or the frontend at launch. The #10 decision allows a cookieless Cloudflare Web Analytics beacon after #14’s F-214; it is not a CMS field.

### 9.3 Permissions

| Asset | Permission | Where recorded |
|---|---|---|
| Client name | Written client authorization | Project `clientPermissionRef` |
| Client logo | Client authorization + trademark owner permission (loi 17-97 arts. 154/201) | Media `clientPermission` + `trademarkPermission` |
| Employee/person photo | Specific written authorization (loi 09-08 art. 1) | Media `releaseStatus` + `rightsReference` |
| Testimonial | Written authorization | Project `testimonialPermissionRef` |
| Photographer’s image | Licence or assignment | Media `rightsReference` |

The default when a permission is missing is **no publication**, not a placeholder. `Références sur demande` remains the fallback.

### 9.4 Claims

The CMS cannot publish a claim that is not in the facts register §2.2. Approved claims are code-owned. If the owner needs new wording, the change goes through the facts register first, then code, then the page. The admin’s read-only **Company facts** panel shows the approved lines.

---

## 10. Migration and seeding

### 10.1 There is no legacy content

The current WordPress site is a Porto demo: 12 template pages, 7 lorem-ipsum posts and 51 demo media items. Nothing is migrated. Take a backup before the host is retired, but do not import the demo.

### 10.2 Initial seed

A `scripts/seed.ts` script creates the globals and the four service records from:

- The approved copy in the facts register §5.
- The page copy and section order in [#2](https://github.com/mustaphaelou/hay2010website/issues/2).
- The brand slots in [#4](https://github.com/mustaphaelou/hay2010website/issues/4).

Job openings start empty; the owner enters the current role(s). The seed is idempotent, refuses to create a gated claim, and leaves all media empty. The owner reviews the seeded copy in the admin before launch.

### 10.3 Export and exit path

- Collections export to JSON with a script that uses the Local API or REST; the database can also be dumped with `pg_dump`. Media is already in the bucket.
- The frontend reads through a content adapter, so pages do not import Payload directly.
- If the CMS is ever replaced, the adapter maps the new source. If the CMS is removed, the export can be converted to MDX/JSON without rewriting the design.
- Payload is MIT and self-hosted; there is no licence lock-in. The data lives in Postgres and the bucket, both portable.

### 10.4 Growing the model

Add collections or fields with Payload migrations; never edit production data by hand. A new service, a job detail page or a real news section is a schema change plus a gate change plus a ticket — not a field the owner can invent in the admin.

---

## 11. Build notes

### 11.1 Packages

```text
payload
@payloadcms/next
@payloadcms/db-postgres
@payloadcms/richtext-lexical
@payloadcms/storage-r2      # or @payloadcms/storage-s3
sharp
```

Payload 3.73+ supports Next.js 16; this repo is on 16.4.3. Pin the Payload version and upgrade deliberately.

### 11.2 File layout

```text
payload.config.ts
collections/
  Users.ts
  Media.ts
  Services.ts
  Projects.ts
  Jobs.ts
  Communiques.ts
globals/
  Homepage.ts
  Entreprise.ts
  Metiers.ts
  Realisations.ts
  Actualites.ts
  Mediatheque.ts
  Carrieres.ts
  Contact.ts
  Legal.ts
access/
  roles.ts
  content.ts
  media.ts
lib/
  company.ts          # legal identity, approved claims, contact channels
  navigation.ts       # nav/footer, anchors, gates
  seo.ts              # metadata, JSON-LD, sitemap
  flags.ts            # feature gates
  content/            # content adapter used by pages
  payload/            # Payload client helpers
scripts/
  seed.ts
app/
  (payload)/
    admin/[[...segments]]/page.tsx
    api/[...slug]/route.ts
    layout.tsx
  (frontend)/
    page.tsx
    entreprise/page.tsx
    ...
```

The existing `app/page.tsx` moves into the `(frontend)` route group when the Payload routes are added. `next.config.ts` wraps the config with `withPayload`.

### 11.3 Admin

- `admin.user: 'users'`, French translations, `meta.titleSuffix: '— HAY2010'`.
- Custom dashboard widgets: open jobs, drafts awaiting review, media pending rights, communiqués this year.
- Read-only **Company facts** panel with the approved identity and claims.
- Help text on every field that has a legal consequence: alt text, rights, client permission, release, `legalReviewed`.
- No page builder, no raw HTML field for the owner. Rich text is restricted to the brand’s allowed marks.

### 11.4 Revalidation and preview

- `afterChange` / `afterDelete` hooks call `revalidateTag` for the collection tag and `revalidatePath` for the affected route, homepage, listing and sitemap.
- Tags: `homepage`, `page:entreprise`, `services`, `projects`, `jobs`, `communiques`, `media`.
- Preview uses Next.js draft mode with a signed URL; the preview route is authenticated and `noindex`.
- Jobs expiry uses a daily scheduled revalidation plus the `closingAt` query filter.
- The public site is static/ISR; it does not query Payload on every request and stays up if the admin is down.

### 11.5 Access, validation and tests

- Access functions per collection/global/field; unit tests for each role.
- Validation hooks: required alt, rights gate, permission gate, max six communiqués per year, job closing date after posting date, unique slug, no gated claim in free text where the model can detect it.
- Build/test checks: seed on an empty database, publish with each role, blocked publish with uncleared media, preview, revalidation, image sizes, 404 for gated routes.
- A content lint script checks for forbidden claims (`depuis 2004`, `RC 517`, `6 000 000`, etc.) in seeded copy before launch.

### 11.6 Security and operations

- `PAYLOAD_SECRET`, database URL and bucket credentials in environment variables; never in the repo.
- Strong passwords, least privilege, admin route behind auth; optional 2FA or edge access if the host supports it.
- Configure a transactional email adapter (SMTP or Resend) for password reset and publish notifications; the owner must not depend on the developer to recover an account.
- Rate-limit the admin login; keep Payload and Next.js patched.
- Backups: database PITR or daily dump, bucket versioning, quarterly restore test.
- Monitoring: uptime for the public site, error tracking for the admin, backup alerts.
- The admin is not a public page: `noindex`, no sitemap entry, no links from the marketing site.

### 11.7 Handoff to hosting

[#8](https://github.com/mustaphaelou/hay2010website/issues/8) must provide:

- A Node runtime compatible with Next.js 16 (Vercel or a VPS).
- Postgres with backups and a connection pooler suitable for serverless, if Vercel.
- An S3-compatible bucket with a CDN domain for media.
- A region choice consistent with the CNDP position (EU preferred).
- A cron/scheduled job for job expiry revalidation.
- Secrets management and a restore procedure.

---

## 12. Handoffs

| Ticket | What it receives |
|---|---|
| [#6](https://github.com/mustaphaelou/hay2010website/issues/6) réalisations | `projects` schema, permission fields, the `Références sur demande` fallback, the three-project threshold for detail pages. |
| [#8](https://github.com/mustaphaelou/hay2010website/issues/8) hosting | Payload runtime, Postgres, object storage, backups, region, cron. |
| [#10](https://github.com/mustaphaelou/hay2010website/issues/10) legal/analytics | **Resolved** — [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md): legal prose fields, identity block, `cndpReferences`, `legalReviewed`, no personal data in the CMS, no analytics script at launch. |
| [#11](https://github.com/mustaphaelou/hay2010website/issues/11) SEO | SEO groups on every page/collection, noindex for drafts/gated, sitemap from published content, JSON-LD from code facts. |
| [#12](https://github.com/mustaphaelou/hay2010website/issues/12) forms | No form submissions or CVs in Payload or the app; `contactNotice` even when the form is off; `formLive`; `applicationFormLive`/`cvUploadLive` false; email-only careers. |
| [#13](https://github.com/mustaphaelou/hay2010website/issues/13) prototype | The field names and copy slots the prototype should exercise. |
| [#14](https://github.com/mustaphaelou/hay2010website/issues/14) CNDP | No applicant data; releases for people; the conditional receipt field. |
| [#15](https://github.com/mustaphaelou/hay2010website/issues/15) DNS | Canonical URL from `lib/company.ts`; admin on the same domain or a protected subdomain. |
| [#16](https://github.com/mustaphaelou/hay2010website/issues/16) launch | Content readiness checklist, gates, backups, ownership, first communiqué review. |

---

## 13. Owner actions before launch

1. Review the seeded page and service copy in the admin; correct the French.
2. Supply photography with rights; no employee portraits until releases are signed.
3. File both ONEE certificates (EE HTA-BT, HTA-BT3) so `agrementLive` can be switched on.
4. Confirm the active job opening(s) and the application email; confirm that the site stays email-only (no form, no CV upload).
5. Nominate the legal reviewer/counsel for the first communiqué.
6. Confirm the account recovery email and who holds the owner account.
7. Confirm whether the admin should be French (yes by default).
8. Confirm the domain and hosting path in [#8](https://github.com/mustaphaelou/hay2010website/issues/8).

---

## 14. Acceptance criteria

- [ ] Payload admin is live at `/admin`, in French, with `developer`, `owner` and `editor` roles.
- [ ] The owner can publish a job and see it on `/carrieres` without a developer.
- [ ] The owner cannot edit legal identity, approved claims, navigation or SEO defaults.
- [ ] Publishing an image with `rightsStatus != cleared` is blocked.
- [ ] Publishing a project with a client name but no permission is blocked.
- [ ] The owner can unpublish a page and cannot permanently delete published content.
- [ ] The first communiqué cannot publish without `legalReviewed`; the gate hides `/actualites` until it is live.
- [ ] `/mediatheque` stays 404 until `mediathequeLive` is true and at least one approved photo is curated.
- [ ] The four service anchors are fixed; Solaire stays hidden until `solaireLive`.
- [ ] `/realisations` launches with the qualifications block and `Références sur demande`, zero project cards.
- [ ] A published project without `cover` renders a typographic card; an anonymized card has no buyer, logo, photo or amount.
- [ ] `/realisations/[slug]` is 404 until `caseStudiesLive` and three approved case studies.
- [ ] Revalidation updates the page, homepage, listing and sitemap after publish.
- [ ] Preview works for drafts without exposing them publicly.
- [ ] A restore from backup is tested before launch.
- [ ] No contact message, CV or applicant data is stored in Payload or the app; the mailboxes are the record.
- [ ] The contact page renders the short notice even when `formLive` is false; no blank CNDP number can render.
- [ ] `/carrieres` has no application form, no CV upload and no `recrutement@` before F-113.
- [ ] The public site remains available when the admin is down.

---

## 15. Change log

| Date | Change |
|---|---|
| 2026-11-09 | Initial decision: Payload 3, structured content, roles, workflow, media rights, communiqués policy. |
| 2026-11-09 | Réalisations amendment (#6): anonymized cards, optional cover, `evidenceReference`, `caseStudiesLive`, teaser threshold. |
| 2026-11-09 | Forms amendment (#12): no application form or CV upload; contact form optional and F-211-gated; `contactNotice` for the email-only page; `applicationFormLive`/`cvUploadLive`; `recrutementMailboxLive` in the gate table. |
