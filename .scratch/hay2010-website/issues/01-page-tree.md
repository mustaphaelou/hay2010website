# Define the page tree, navigation and homepage section order

Type: grilling
Status: resolved
Blocked by: none

## Question

Which French pages, URL slugs, menu labels, subpage hierarchy and homepage section order should HAY2010 ship?

Start from the lamalifgroup.ma tree in [`docs/research/lamalifgroup-architecture-style.md`](../../../docs/research/lamalifgroup-architecture-style.md) §3 and adapt it to HAY2010's business. Decide:

- The top-level menu and submenus (Accueil, Le Groupe, Réalisations, Carrières, Médias, Contact?). Keep the menu short enough to fit one desktop row.
- Which lamalif pages to drop, rename or merge: contest pages, Lamalif Le Mag, newsletter, site search, certifications.
- Whether "Nos Métiers" becomes "Nos Services", "Nos Expertises" or stays "Nos Métiers", and how to group the offer: éclairage public, lignes MT/HTA, postes de transformation, CFO/CFA, solaire.
- The homepage section order and which lamalif sections to keep: hero, split intro, services icon band, video band, references teaser, careers teaser, footer.
- Flat French URL slugs with no language prefix, and redirects from the current hay2010.ma WordPress URLs.
- Mobile navigation behaviour and the footer link groups.

The answer should be a complete page table (page, slug, parent, menu label) plus an ordered homepage section list, ready to become routes and components.

## Answer

Resolved 2026-11-08 by a grilling session with the owner. The page tree, navigation and homepage order below are final; copy, assets, forms and legal content stay with their own tickets.

### Navigation

- **Desktop, six items, one row:** `L'Entreprise` · `Nos Métiers` · `Réalisations` · `Carrières` · `Médias` · `Contact`. **Accueil is not a menu item** — the logo links to `/`. A `Nous contacter` CTA sits at the far right.
- **Breakpoint:** desktop from 1024 px; below that the mobile drawer takes over.
- **Submenus:** `L'Entreprise` → `Mot du gérant` only when that page is live. `Nos Métiers` → `Éclairage public`, `Réseaux HTA/MT & MT/BT`, `Postes de transformation`, `CFO/CFA`, plus `Solaire & ENR` only once confirmed. `Médias` is a **menu group, not a page** (button, not link): `Actualités` and `Médiathèque` appear only when live; hide the whole group if neither is live.
- **Dropdown behaviour:** hover + keyboard focus on desktop, click/tap toggle on touch, Escape closes, `aria-expanded` on the trigger, current section highlighted with `aria-current="page"`.
- **Mobile:** full-screen overlay drawer opened by the burger. Logo + close, `Accueil` first, then the six items, accordion submenus, `Nous contacter` CTA, phone/email. Focus trap, Escape to close, body scroll lock, focus returns to the burger. No search.
- **Header:** sticky, solid white, no transparent-over-hero variant and no mega menu. Revisit only if the brand direction in #4 calls for it.

### Page table

| Page | Slug | Parent | Menu label | Status |
|---|---|---|---|---|
| Accueil | `/` | — | Logo (Accueil in mobile drawer) | Launch |
| L'Entreprise | `/entreprise` | — | L'Entreprise | Launch (lean; the page absorbs qui sommes-nous, activité, valeurs, chiffres clés if confirmed, agréments if confirmed) |
| Mot du gérant | `/mot-du-gerant` | L'Entreprise | Mot du gérant | Gated: #3 must confirm the gérant and authorize the text/photo |
| Nos Métiers | `/metiers` | — | Nos Métiers | Launch: one page, four anchored service blocks |
| Éclairage public | `/metiers#eclairage-public` | Nos Métiers | — (anchor) | Launch |
| Réseaux HTA/MT & MT/BT | `/metiers#reseaux-hta-mt` | Nos Métiers | — (anchor) | Launch |
| Postes de transformation | `/metiers#postes-de-transformation` | Nos Métiers | — (anchor) | Launch |
| CFO/CFA | `/metiers#cfo-cfa` | Nos Métiers | — (anchor) | Launch |
| Solaire & ENR | `/metiers#solaire` | Nos Métiers | — (anchor) | Gated: only after the company confirms the capability and #3 clears the wording |
| Réalisations | `/realisations` | — | Réalisations | Launch: content per #6; fallback is "Références sur demande" |
| Étude de cas | `/realisations/[slug]` | Réalisations | — | Phase 2: publish detail pages once ≥3 approved case studies exist |
| Carrières | `/carrieres` | — | Carrières | Launch: openings inline; applications to recrutement@hay2010.ma until #12/CNDP F-113 |
| Médias | — (menu group) | — | Médias | No page; group appears only when a child is live |
| Actualités | `/actualites` | Médias | Actualités | Gated: at least one approved article |
| Article | `/actualites/[slug]` | Actualités | — | With Actualités |
| Médiathèque | `/mediatheque` | Médias | Médiathèque | Gated: approved photos |
| Contact | `/contact` | — | Contact | Launch: phone/email/map; form only when #12/CNDP F-211/F-214 clears |
| Mentions légales | `/mentions-legales` | — | Footer | Launch: #10/#14 content |
| Politique de confidentialité | `/politique-de-confidentialite` | — | Footer | Launch: #10/#14 content, cookies covered here + banner |
| 404 | — | — | — | Launch: custom not-found with links to Accueil, Métiers, Contact |

**Also phase 2, not in the launch table:** job detail pages (`/carrieres/[slug]`), service child pages (`/eclairage-public` etc. at root level if ever split), a certifications page (not planned; "Agréments & certifications" is a block on L'Entreprise once proof exists).

### Homepage section order

1. **Hero** — one full-bleed image (public lighting / electrification; asset per #4); headline + subline; `Découvrir nos métiers` → `/metiers`, `Nous contacter` → `/contact`. Static image, no slider, no autoplay video; optional Ken Burns respecting `prefers-reduced-motion`.
2. **Intro "Qui sommes-nous"** — split image + short text + link to `/entreprise`.
3. **Nos Métiers** — four cards (Solaire as a fifth only when live) linking to the `/metiers#…` anchors; grid 4/2/1.
4. **Réalisations teaser** — three approved projects, or the "Références sur demande" fallback with a contact CTA; link to `/realisations`. No client logos without permission.
5. **Carrières teaser** — "Rejoignez-nous", current roles or a single line, link to `/carrieres`. Secondary audience, kept compact.
6. **Contact CTA band** — "Un projet d'éclairage public ou d'électrification ?", phone/email, button to `/contact`.
7. **Footer** — four columns below.

Not on the homepage at launch: video band, stats strip, news teaser, client-logo band, newsletter.

### Footer

Four columns:

1. **Brand + contact** — logo, one-line positioning, verified address, phone, email, recruitment email. No newsletter. Social icons only after #3 confirms official accounts (LinkedIn/Facebook).
2. **L'Entreprise** — L'Entreprise, Mot du gérant (if live), Réalisations, Carrières.
3. **Nos Métiers** — the four service anchors (plus Solaire when live).
4. **Médias & contact** — Actualités (if live), Médiathèque (if live), Contact.

Bottom bar: `© 2026 HAY2010 SARL — Tous droits réservés` + `Mentions légales` + `Politique de confidentialité`. No plan du site, no newsletter, no cart/account links.

### Renamed, merged, dropped

- **Renamed:** Le Groupe → L'Entreprise; Nos Réalisations → Réalisations; Espace Carrière → Carrières; Mot du président → Mot du gérant; Medias → Médias.
- **Merged into L'Entreprise:** en bref, chiffres clés, valeurs, vision & mission, agréments/certifications.
- **Dropped:** Concours Madinaty, Madinaty 2021/2022, STARS IN THE PLACE, Lamalif Le Mag, La News, newsletter, site search, plan du site, separate certifications page, filiales, cart/account/Porto promo, dedicated job detail pages at launch.

### Redirects from the current WordPress site

| Old URL | New target | Status |
|---|---|---|
| `/company/` | `/entreprise` | 301 |
| `/services/` | `/metiers` | 301 |
| `/services/pre-construction/` | `/metiers` | 301 |
| `/services/general-construction/` | `/metiers` | 301 |
| `/services/plumbing/` | `/metiers` | 301 |
| `/services/painting/` | `/metiers` | 301 |
| `/projects/` | `/realisations` | 301 |
| `/project/` | `/realisations` | 301 |
| `/contact/` | `/contact` | 301 |
| `/blog/` | `/actualites` | 301 once Actualités is live; 410 before |
| demo posts (`/2016/…`, `/2026/02/16/hello-world/`), `/category/*`, `/author/*`, `/feed/`, `/comments/feed/` | — | 410 |
| `/cart/`, `/my-account/`, `/sample-page/` | — | 410 |
| old sitemaps (`/sitemap_index.xml`, `/page-sitemap1.xml`, …) | `/sitemap.xml` | 301 |
| trailing-slash variants | canonical no-slash URL | 301 |

Old `/wp-json/`, `/xmlrpc.php`, `/wp-admin/` are disabled/404 at the edge, not redirected. Implement the 301s in `next.config.ts` with explicit `statusCode: 301`; implement the 410s in middleware (Next.js redirects cannot return 410).

### Launch gates

- **Launch:** `/`, `/entreprise` (lean, verified facts only), `/metiers` (four blocks), `/realisations` (per #6; fallback "Références sur demande"), `/carrieres` (mailto applications), `/contact` (phone/email/map; form only after CNDP), legal pages, 404.
- **Gated:** Mot du gérant, Actualités, Médiathèque, Solaire, case-study pages. Hidden from nav, footer, sitemap and internal links; public direct URL returns 404; staging access only. No "coming soon" placeholders.
- **Consequence:** the desktop nav may show five items at launch (Médias group hidden) and six once a media child is live. Build the nav from a data module with gate flags so the row and footer adapt automatically.

### Build notes

- Routes: `app/page.tsx`, `app/entreprise/page.tsx`, `app/metiers/page.tsx`, `app/realisations/page.tsx`, `app/realisations/[slug]/page.tsx`, `app/carrieres/page.tsx`, `app/actualites/page.tsx`, `app/actualites/[slug]/page.tsx`, `app/mediatheque/page.tsx`, `app/contact/page.tsx`, `app/mentions-legales/page.tsx`, `app/politique-de-confidentialite/page.tsx`, `app/not-found.tsx`.
- One nav data module drives desktop, mobile and footer, with `label`, `href`, `children`, `gate`.
- Homepage sections as separate components: Hero, IntroSplit, ServicesBand, ReferencesTeaser, CareersTeaser, ContactCta.
- Keep per-page copy, metadata (#11), forms (#12), analytics/consent (#10) and facts (#3) out of this ticket.

### Amendment 2026-11-08 (company facts, #3)

- **Footer column 1:** logo, one-line positioning, `Rabat — Maroc`, `ste.hay2010@gmail.com`. **No phone, no recruitment email and no social icons** — only the email was confirmed. Add any of them later only if #3 is reopened.
- **`Mot du gérant` is dropped:** the gérant is confirmed for a name-only line (`Gérant : Rahhal Essamlali`), with no photo or quote. Keep `/mot-du-gerant` out of the nav, footer and sitemap.
- **Carrières:** applications go to `ste.hay2010@gmail.com` until a recruitment mailbox is confirmed; no CV upload before #12/#14.
- **Réalisations** launches on `Références sur demande`; no client names or logos (no permissions).
- **Legal pages** use the identity block in [`docs/company/facts-register.md`](../../../docs/company/facts-register.md).

### Dependencies / handed to other tickets

- #3 — publishable facts, gérant authorization, certifications, contact details, social accounts.
- #4 — imagery, logo, palette, type.
- #5 — content model for Actualités and updates.
- #6 — réalisations format, permissions and fallback.
- #10 — analytics, consent and legal copy.
- #11 — SEO, metadata, structured data.
- #12 — contact/careers forms and CNDP dependency.
- #13 — homepage prototype.
- #14 — CNDP filings and launch compliance.
