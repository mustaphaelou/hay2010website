## Problem Statement

HAY2010 has no working institutional website. `hay2010.ma` serves a WordPress placeholder, and everything that makes the company credible — its verified legal identity, its ONEE agréments, its activity domains, its contact channels — lives in documents rather than on a site a prospective client can reach.

The result, from the user's perspective: a public-sector donneur d'ordre cannot tell within a minute what HAY2010 does or whether it covers their scope; a private client cannot find a way to ask for a devis; a job applicant finds no reliable way to apply; and the owner cannot correct or publish anything without a developer. Worse, the first thing the company would publish is a risk: the organisation's records show eight bidder entries and zero documented awards, so any conventional "portfolio" page would either overclaim or be empty.

The team also holds fourteen settled decisions from 8–9 November and a new client cahier des charges (CDC) received 26 November that contradicts them on structure, taxonomy, languages and forms while agreeing with them on evidence. Until that contradiction is arbitrated, nothing can be built: the page tree, the routes, the language architecture and the réalisations model all depend on it.

## Solution

Build the P1 institutional website on the reconciled information architecture: the CDC's rubriques and vocabulary, governed by the facts register on everything that may be claimed.

Concretely, the first public release ships five rubriques — Accueil, À propos, Domaines d'activité (index plus one page per published domain), Réalisations (credentials-led), Contact — plus the two legal pages and a 404. The navigation is a flat row that grows with the content tiers, and a rubrique exists only when its content gates clear: a gated page is absent from navigation, footer and sitemap and returns 404, never a hollow shell. Three of the CDC's five activity domains publish (éclairage public, installations électriques, infrastructures et réseaux électriques); solar and equipment supply stay gated until the owner confirms the perimeter and the catalogue with authorisations. Réalisations opens as a credentials-led page ("Références sur demande") with no project cards, no filters and no detail pages until named case studies are documented and permitted. Contact is email-first with no form at launch. French lives at the root; English is a reserved `/en` path for P2.

The owner edits copy, domain content, images and news in an embedded admin with fixed page trames — composition is code-owned, fields are editable, pages can be unpublished but never deleted, and no photo, client name or logo can be published without its permission recorded. The stack is the decided one: Next.js App Router with an embedded CMS, Postgres, object-storage media, a self-hosted staging deploy behind an access layer.

Four divergences from the CDC (réalisations/chiffres clés, languages, forms and devis, Odoo) and two more (three of five domains, omitted trame blocks) are recorded in a deviation register and need the structeur's written sign-off. Nothing is published that the facts register has not cleared.

## User Stories

1. As a prospective public-sector client, I want the homepage to state within seconds what HAY2010 does and for whom, so that I know whether the company is relevant to my tender.
2. As a prospective client, I want one page per activity domain, so that I can judge whether my scope is covered before contacting anyone.
3. As a prospective client, I want each domain page to list the prestations actually delivered, so that I can map them to my project.
4. As a prospective client, I want each domain page to describe methods, means and competences, so that I can assess how the work would be delivered.
5. As a prospective client, I want a réalisations page that shows what is verifiable instead of a gallery of unverifiable images, so that it increases my trust rather than eroding it.
6. As a prospective client, I want agréments and certifications shown only where they are held and current, so that nothing misleads me.
7. As a prospective client, I want the legal identity — denomination, RC, ICE, capital, registered address — on the mentions légales page, so that I can verify the supplier.
8. As a prospective client, I want to reach a human by email in one click, so that I can ask a question without filling in a form.
9. As a prospective client, I want to see where the company is based and where it intervenes, so that I can judge geographic coverage.
10. As a prospective client on a phone, I want the whole site usable on a small screen, so that I can browse it on site or between meetings.
11. As a prospective client on mobile data, I want pages to open quickly, so that I do not abandon the site.
12. As a returning visitor, I want the same navigation on every page with my current section marked, so that I always know where I am.
13. As a visitor interested in one domain, I want a shareable URL that points straight at it, so that I can send it to a colleague.
14. As a job applicant, I want a Carrières page that explains how to apply by email, so that I can apply without a broken form.
15. As a job applicant, I want to see the current openings, so that I only apply when relevant.
16. As an English-speaking visitor from P2 onward, I want an English version at a stable `/en` path, so that I can read the site in my language.
17. As a partner or supplier, I want a Références et partenaires page once permissions exist, so that I can see the professional network the company belongs to.
18. As a search-engine user, I want titles and descriptions naming the activity and the city, so that I click the right result.
19. As a search engine, I want a sitemap containing only published URLs, so that gated pages are never indexed.
20. As a search engine, I want one canonical URL per page (apex host, no trailing slash), so that ranking signals are not split.
21. As a visitor arriving from an old WordPress address, I want a permanent redirect to the equivalent page, so that old links keep working.
22. As a visitor who hits a dead URL, I want a useful 404 with links to the main rubriques, so that I recover instead of leaving.
23. As an accessibility user, I want to navigate by keyboard with visible focus and a skip link, so that I can use the site without a mouse.
24. As a motion-sensitive visitor, I want animation to respect reduced-motion preferences, so that the site does not make me unwell.
25. As a privacy-conscious visitor, I want no cookie banner and no tracking cookies at launch, so that my visit is not profiled.
26. As the owner, I want to edit page text, domain content, images and actualités without a developer, so that the site stays current.
27. As the owner, I want to publish and unpublish content without deleting it, so that mistakes are reversible and nothing is lost.
28. As the owner, I want new content to stay invisible until I publish it, so that incomplete work is never public.
29. As the owner, I want the legal identity block and the compliance prose protected from accidental edits, so that compliance statements cannot drift.
30. As the owner, I want to record a permission before a photo, client name or logo can be published, so that the site never breaks a permission.
31. As the owner, I want to see which pages are gated and why, so that I know exactly which content I still owe.
32. As the owner, I want a two-hour training session and a one-page French guide, so that I can run the site after handover.
33. As the developer, I want a single navigation source of truth carrying gate flags, so that desktop, mobile, footer, sitemap and metadata never disagree.
34. As the developer, I want fixed page trames in code with field-level editing, so that content edits cannot break the layout.
35. As the developer, I want to run the whole site from a fixture content source, so that tests and previews need no database and no CMS.
36. As the developer, I want the rubrique list, the five domains and their routes declared once in code, so that opening a page is a flag change rather than a refactor.
37. As the developer, I want metadata, structured data and the sitemap generated from the same page model, so that SEO cannot drift from the routes.
38. As the operator, I want an ARM64 container image and tagged releases deployable to the staging host, so that a bad build can be rolled back.
39. As the operator, I want nightly database dumps to object storage, so that content is recoverable.
40. As the operator, I want forms hard-disabled until the CNDP receipt exists, so that no personal data is collected unlawfully.
41. As the compliance owner, I want the filing gates visible in the site's gate configuration, so that no feature launches before its declaration.
42. As the structeur, I want every deviation from the cahier recorded in one register and signed off, so that the delivered site is accountable to the mandate.
43. As the owner, I want the domain, DNS, hosting, backups and admin accounts in HAY2010's name with the developer holding delegated access, so that the company can never be locked out.
44. As a reviewer, I want the P1 site verified at 360, 768, 1024 and 1440 px, so that nothing breaks at the breakpoints.
45. As the owner, I want one checklist listing the content I still owe per tier, so that I can unblock P2 without a meeting.
46. As the developer, I want the legacy WordPress URL map expressed as 301s and 410s in code, so that the cutover does not leak broken links.
47. As the structeur, I want the eight CDC rubriques, their tier and their gate listed in one IA document, so that I can verify the mandate maps to routes.
48. As a visitor, I want the site to feel institutional and calm — generous typography, restrained motion, real photography — so that HAY2010 reads as a serious contractor.

## Implementation Decisions

### Single content seam

One content-source adapter is the only door between the rendering code and content. It exposes: the rubrique registry with gate flags, a page document by key, a domain document by slug, published actualités, media records, and the resolved publish state. Every page, the navigation, the footer, the sitemap, robots and metadata read through it; no page imports the CMS client directly.

Two implementations: the production one reads the embedded CMS; a fixture one serves a JSON corpus selected by environment. The fixture implementation exists so the entire site, including all gate states, can be exercised without a database — it is the seam the test strategy depends on.

### Rubriques, gates and navigation

The rubric registry is declared in code: key, full title (CDC wording), nav short label, route, tier (P1/P2/P3) and gate. It drives the desktop row, the mobile drawer, the footer, the sitemap and internal links.

Gate semantics: **gated** means absent from navigation, footer, sitemap and internal links, and its route returns 404 — not a redirect, not a placeholder page. Page content can be complete in the admin while the page stays gated.

Provisional routes and labels (from the grilling Round 3 proposal, pending confirmation):

- Accueil — nav `Accueil` — `/`
- À propos — nav `À propos` — `/a-propos`
- Nos domaines d'activité — nav `Domaines d'activité` — `/domaines-activite`; children `/domaines-activite/eclairage-public`, `/domaines-activite/installations-electriques`, `/domaines-activite/infrastructures-reseaux-electriques`; gated `/domaines-activite/energies-renouvelables`, `/domaines-activite/fourniture-equipements`
- Nos réalisations — nav `Réalisations` — `/realisations`; fiche `/realisations/{slug}` gated off
- Nos moyens et compétences — nav `Moyens` — `/moyens-et-competences` (P2)
- Références et partenaires — nav `Références` — `/references-et-partenaires` (P2)
- Actualités — nav `Actualités` — `/actualites`, article `/actualites/{slug}` (P3)
- Contact — nav `Contact` — `/contact`
- Utility: `/carrieres`, `/mentions-legales`, `/politique-de-confidentialite`

The P1 row is `Accueil · À propos · Domaines d'activité · Réalisations · Contact`; P2 inserts Moyens and Références; P3 inserts Actualités. Flat row, no dropdowns, no separate contact button; Accueil is the first item and the logo also links home. Carrières is reached from the footer only. The dissolved Médias group leaves no equivalent: Actualités is top-level when live, and no public Médiathèque page exists. Desktop from 1024 px; below that a full-screen drawer (Accueil first, then rubriques, then Carrières and legal links) with focus trap, Escape to close, scroll lock and focus return.

### Domaines d'activité and prestations

Five domains are canonical and fixed in code in CDC order; three publish at P1, two are gated: énergies renouvelables et solaire (pending the owner's written perimeter) and fourniture d'équipements et de matériel (pending a catalogue plus distribution and logo authorisations). CFO/CFA, tableaux and postes de transformation are **prestations** inside the relevant domain, not domains.

The domain page trame is fixed: presentation and needs, confirmed prestations, methods/means/competences, project photos (optional block), associated réalisations (optional block), contact CTA. The renderer omits a block whose content is absent; it never fills a placeholder. ONEE agrément wording is a gated claim and appears only once the certificate is on file.

### Réalisations

P1 ships the credentials-led page only: the `Références sur demande` statement, the three service rows with the verified agréments position stated honestly, the reference block, the method block and a contact CTA. No catalogue, no grid, no filters, no client logos, no project photographs, and no detail route (the fiche route returns 404 while gated). The data model for a named case study exists — title, location, client with permission reference, year, prestations, technical data, before/during/after galleries, related projects — but a record publishes only when permission fields are filled; the page and route open at three approved case studies.

### Static rubriques

- **À propos** carries the identity paragraph, activity and perimeter, mission/vision/values, an organisation/team block only if owner-approved material exists, and a quality/safety/compliance block that links to the canonical certifications block in Références et partenaires. History claims (founding year) appear only once the facts register clears them; "plus de 10 ans d'expérience" is the approved line.
- **Contact** is email-first: a working `contact@hay2010.ma` mailto, the registered address once confirmed, a map only when a live location exists, opening hours, phone and social links only when cleared by the facts register. No form at P1. Any eventual form is text-only, stored nowhere, and gated on the CNDP F-211 receipt.
- **Legal** pages carry a code-owned identity block (never CMS-editable): denomination, RC, ICE, capital, registered address; no publication director, no host line, no blank CNDP number; cookies handled as a section of the privacy policy, no separate cookie page, no banner.
- **Carrières** is email-only: applications to `contact@hay2010.ma` until the F-113 authorisation covers `recrutement@hay2010.ma`; openings listed inline by the owner; no application form, no CV upload, no job detail pages, no JobPosting structured data.

### Homepage composition

Provisional, from grilling Round 3: hero (one full-bleed documentary image with a typographic fallback until licensed photography exists; title; tagline; CTAs to Réalisations and Contact) → three-to-five-line company intro with a link to À propos → domain blocks → "repères" band carrying only facts the register clears → réalisations teaser with the `Références sur demande` fallback → text-only engagements block (qualité, sécurité, délais) with no equipment claims → contact CTA → footer. No careers teaser, no stats strip invented to look like three figures, no news teaser, no video band.

### Admin and editorial rules

The CMS is embedded and served from `/admin` on the same origin. Roles: developer (full), owner (edit, publish, unpublish; no delete), and a future editor role. Code-owned constants are not editable: the rubrique registry and gates, legal identity block, navigation labels, SEO defaults.

Media records carry a rights field (permission reference and allowed uses); an image cannot be attached to a published page until its rights are recorded. The same rule covers client names, logos and testimonials. The owner can see every gated page and the reason for its gate.

### SEO, metadata and redirects

Per-page metadata generated from the page model with CMS overrides; title pattern `{phrase} — HAY2010`; descriptions 120–160 characters; canonical apex host, no trailing slash; `lang=fr`, `og:locale=fr_FR`; one typographic OG card until photography rights exist.

Structured data: Organization and WebPage on every page, WebSite on the homepage. No LocalBusiness while address, phone and hours are gated; no JobPosting; no `sameAs` until official accounts exist; no breadcrumbs until the hierarchy is stable across tiers.

Sitemap and robots are derived from publish state: sitemap lists published rubriques and published domains only (five URLs plus the utility pages at launch, growing by tier); robots disallows `/admin` and the API surface.

Legacy WordPress URLs are mapped in code with explicit permanent status codes: `/company/` → `/a-propos`, `/services/` and its children → `/domaines-activite`, `/projects/` and `/project/` → `/realisations`, `/contact/` → `/contact`; `/blog/` returns 410 until Actualités is live then 301s to `/actualites`; demo posts, categories, authors, feeds, cart, account and old sitemaps return 410 (410 cannot be expressed as a Next redirect and needs middleware). Trailing-slash variants redirect to the canonical no-slash URL.

### Languages

French at the root with no prefix. `/en` is reserved for the P2 English version and will be served by a rewrite/route segment; no i18n library, no hreflang and no English copy at P1. Content fields follow a localisable naming convention from day one so P2 does not require a schema migration. Arabic is structure-only — no translation, no RTL build, but typography and spacing tokens must not assume LTR-only metrics.

### Accessibility, performance and motion

Semantic landmarks, skip link, visible focus, `aria-current`, keyboard-operable drawer with focus management. Motion respects `prefers-reduced-motion`. Images go through the framework image pipeline with explicit sizes and no layout shift. Acceptance targets on mobile 4G: LCP under 2.5 s, CLS under 0.1, INP under 200 ms; no client-side analytics script at launch.

### Deployment, operations and ownership

Single ARM64 container image built in CI and deployed to the decided staging host behind an access layer; staging hostname depends on the pending DNS work. Postgres with nightly dumps to object storage and a documented restore. Forms disabled by configuration until the filing exists. Domain, DNS, hosting, backup storage and admin accounts belong to HAY2010; the developer holds delegated admin during build and hands over a runbook. Training and the French editor guide are part of delivery.

### Measurement and visibility

No client-side analytics at launch (edge analytics only); Cloudflare Web Analytics only after the conditional analytics filing; lead counting is a manual monthly inbox count until the P2 devis form exists. Google Business Profile is the owner's action, supported by our written checklist and by the site's canonical metadata and Organization data.

## Testing Decisions

A good test here observes the site the way a visitor or a crawler does: request a URL, read the status, the headers and the rendered document, parse the structured data. It does not import page components, assert on class names, or verify internal call order.

**One seam: HTTP against a built application.** The whole P1 surface is testable there — routes, gates, redirects, 404s, navigation, metadata, structured data, sitemap, robots and the absence of scripts. The fixture content source makes every gate scenario reachable without a database, so the seam needs no CMS, no Postgres and no network. One runner (Vitest) starts the production build once, points it at a fixture corpus, and the suites fetch it. Scenario-specific gate states are selected by environment so the server can be restarted per scenario group.

Coverage, at minimum:

- The P1 route matrix returns 200 and renders its trame (homepage blocks in order; À propos sections; three domain pages; réalisations credentials statement; contact email-first; two legal pages; Carrières).
- Every gated rubrique returns 404, appears in no navigation, footer, sitemap entry or internal link, and its content can be complete without becoming visible.
- Navigation composition per tier: five items at P1, seven at P2, eight at P3, no dropdowns, Accueil first, `aria-current` on the active section.
- Legacy URL map: each 301 target, each 410, and trailing-slash normalisation.
- Canonical host and no-slash form; unique titles and descriptions; `lang=fr`; OG card; JSON-LD parses and contains only allowed types.
- Sitemap contains exactly the published URL set — no gated page ever leaks.
- The 404 page offers links back to the main rubriques.
- No analytics script, no tracking cookie, no consent banner, no form element at launch; `mailto:` links resolve to the cleared mailbox.
- No unverified claim renders: agrément wording, client names, logos, project photographs and gated figures are absent while their gates are closed.
- Legal identity block matches the facts register exactly and is present on both legal pages.
- Reduced motion and keyboard affordances are present in the markup (drawer trigger operable, focus management hooks, `prefers-reduced-motion` styles).

Prior art: **none** — the repository currently has no test runner and no tests, only type checking and linting. This spec establishes the single suite and its fixture corpus; the runner is added to CI alongside the build. If a decision can only be observed through a pure function (for example a date or slug rule), the narrowest possible unit test is added at that function, but no component-level unit tests are introduced.

Deferred: browser-level visual regression and full e2e flows. They are added only when a regression justifies the second tool, not preemptively.

## Out of Scope

- P2 pages: Nos moyens et compétences, Références et partenaires, the fourniture and solaire domains, project detail pages, the downloadable brochure.
- P3: Actualités listing and article routes, lead instrumentation, Odoo study or integration.
- English and Arabic translations; the `/en` build; hreflang.
- The contact form, the devis form, attachment upload and every kind of personal-data storage, until their filings exist.
- CNDP filings execution, counsel review, mailbox provisioning and the Google Business Profile creation.
- Photography production and art direction beyond selecting and optimising supplied images; video.
- Migration or preservation of the current WordPress content.
- E-commerce, client portal, quoting engine, CRM, newsletter.
- The brand system beyond the web scope already decided; print assets.
- Production cutover of the apex domain; that remains its own launch ticket.
- Re-litigating decisions recorded before this spec: where they conflict with the CDC they are amended through the deviation register, not reopened here.

## Further Notes

**One grilling round is still unanswered.** The naming/URL table, the homepage section order, the fixed-trame discipline and the §11 content-ownership split in this spec are the Round 3 recommendations, adopted here so the spec is buildable. They are marked provisional and need one confirmation pass; if they change, only routes, labels and the homepage block list move.

**Deviations must be signed.** Six rows are recorded (réalisations and chiffres clés, languages, forms and devis, Odoo, three of five domains, omitted trame blocks); the homepage's reduced repères band and reduced moyens block will add two more once confirmed. None of these is a build blocker for P1 as specified, but they are the structeur's to accept in writing.

**Superseded decisions.** The page tree and navigation decision from 8 November is superseded as information architecture; the brand direction, the content model, the hosting stack, the legal/consent stance, the SEO decisions and the réalisations strategy stand, except that the SEO spec's eight-URL launch list and its legacy redirect targets must be re-derived from this IA before build.

**Repository state at the time of writing.** `main` carries only the framework template and the homepage prototype; there are no production routes, no CMS dependency, no container image, no test runner. The tracker ticket that opened the reconciliation references two specification files that do not exist in the repository; the working reconciliation is the information-architecture document, the ADR and the deviation register produced by this session, which have not been committed yet.

**Content ownership, provisional split.** The owner supplies every gated fact, permission, certificate, asset and translation approval, tagged to the tier that needs it; the structeur supplies the mandate and sign-off but no copy and no assets; the developer drafts institutional French copy from the facts register, builds and maintains the per-tier content checklist. Each owed line belongs to a tier, so lateness gates a page rather than the launch.

**Triage vocabulary.** This spec is labelled `ready-for-agent`. The repository did not have the triage label set configured, so that label was created for it; run `/setup-matt-pocock-skills` to install the rest of the vocabulary.
