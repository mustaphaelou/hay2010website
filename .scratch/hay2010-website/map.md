# HAY2010 website — wayfinder map

> Canonical tracker: GitHub issue [#1](https://github.com/mustaphaelou/hay2010website/issues/1). This file is a local mirror; the local-to-GitHub mapping is in [`github-issues.md`](github-issues.md).

## Destination

A build-ready specification for the HAY2010 French corporate website, adapted from `lamalifgroup.ma`'s information architecture and section patterns, plus the decisions needed to start implementation in the existing Next.js 16 repo. The resolved tickets are the spec; this map does not write production code.

## Notes

- **Domain:** corporate website for HAY2010 SARL, a Rabat electrical contractor working in public lighting, HTA/BT electrification, transformer stations, CFO/CFA and solar.
- **Reference architecture:** `lamalifgroup.ma`. Teardown: [`docs/research/lamalifgroup-architecture-style.md`](../../docs/research/lamalifgroup-architecture-style.md). Company research: [`docs/research/hay2010-company-activity-and-careers.md`](../../docs/research/hay2010-company-activity-and-careers.md).
- **Agreed scope:** French only; adapted corporate site with Accueil, L'Entreprise, Nos Métiers, Réalisations, Carrières, Médias, Contact + legal; drop lamalif-only contest pages; same IA and section patterns, new HAY2010 brand. The page tree, navigation and homepage order are decided in [#2](https://github.com/mustaphaelou/hay2010website/issues/2).
- **Phasing:** build and deploy to a temporary URL first; the `hay2010.ma` DNS/domain cutover is a later public-launch task ([GitHub #16](https://github.com/mustaphaelou/hay2010website/issues/16)), not a blocker for the build.
- **Content rule:** use verified public research; draft French copy; flag placeholders for missing photos, references and brand assets. Never publish unverified client claims or legal facts. The confirmed facts, approved wording and gated-claim list are in [`docs/company/facts-register.md`](../../docs/company/facts-register.md); copy, footer, legal pages and structured data must follow it.
- **Company identity (confirmed 2026-11-08):** SOCIETE HAY 2010 SARL, RC 87305 — Tribunal de commerce de Rabat, ICE 001459327000056, capital 15 000 000 MAD, registered 26/09/2011; the 2004/RC 517 record is a different, radiée El Kelaâ entity.
- **Existing repo:** Next.js 16.4.3 App Router, React 19, Tailwind 4, shadcn `base-maia`, Hugeicons, TypeScript. Only the template page exists.
- **Tracker:** GitHub issues are canonical: map [#1](https://github.com/mustaphaelou/hay2010website/issues/1); tickets are sub-issues labelled `wayfinder:<type>`. This local file is a mirror; local-to-GitHub mapping is in [`github-issues.md`](github-issues.md).
- **Skills for sessions:** `grilling` + `domain-modeling` for decisions; `prototype` for visual directions; `research` for external facts.
- **Standing preferences:** decisions over deliverables; one ticket per session (except research); no build work in this map; keep this map index-only.
- **Known infrastructure risk:** hay2010.ma's DNS delegation is split between Cloudflare and HeberjaHiz; the Cloudflare authoritative servers refuse the zone, so resolvers can intermittently SERVFAIL. Fix the delegation before the public launch on hay2010.ma; it does not block the first deployment. See [Research hosting, domain and deployment options](issues/06-hosting-research.md) and [Fix the hay2010.ma DNS delegation and identify account owners](issues/14-dns-delegation.md).
- **Compliance is a launch dependency:** CNDP filings are required before public forms collect real contact data or CVs; they do not block a staging build with forms disabled or test-only. Do not copy lamalif's blank receipt number or missing privacy policy. See [Research Moroccan legal and consent requirements for the site](issues/08-legal-research.md) and [Plan the CNDP filings and launch compliance](issues/13-cndp-filings.md).
- **Legal checklist:** the legal research note's compliance checklist (consent notices, retention jobs, CV storage, security headers, rights procedure, processor contracts) is part of the build spec, not optional polish.

## Decisions so far

<!-- One line per resolved ticket: linked name + one-line gist. Detail stays in the ticket. -->

- [Research Moroccan legal and consent requirements for the site](https://github.com/mustaphaelou/hay2010website/issues/9): Law 09-08 requires CNDP filings before launch — F-211/F-214 contact declaration, F-113 recruitment authorization, F-118 for US transfers; D-939-2025 exempts non-profiling analytics from prior consent but conflicts with older guidance; mentions légales need an RC extract; the current sites are not compliance models.
- [Establish the publishable company facts and legal identity](https://github.com/mustaphaelou/hay2010website/issues/3): Official registries confirm **SOCIETE HAY 2010 SARL, RC 87305 (Rabat), ICE 001459327000056, capital 15 000 000 MAD, registered 26/09/2011, active**. RC 517 belongs to a radiée El Kelaâ namesake. Publishable: owner-confirmed address (Local N° 21, Hay El Manzeh, Hay Er-Riad), gérant **name only** (Rahhal Essamlali), "plus de 10 ans d'expérience" (no founding year), ONEE **EE HTA-BT** agrément (certificate pending), and `ste.hay2010@gmail.com` as the only contact. Gated: the 2004 claim, old RC/capital/addresses, generic "entreprise agréée", client names/logos, employee photos, phone/recruitment email/social accounts, and CNDP receipt numbers (no filing found). Full register: [`docs/company/facts-register.md`](../../docs/company/facts-register.md).
- [Research hosting, domain and deployment options](https://github.com/mustaphaelou/hay2010website/issues/7): Recommends Vercel Pro + repair DNS at HeberjaHiz (remove the dead Cloudflare NS), keep email; Cloudflare Workers/vinext is the beta alternative; the current WordPress site is a placeholder; the split DNS delegation must be fixed first.
- [Define the page tree, navigation and homepage section order](https://github.com/mustaphaelou/hay2010website/issues/2): Six-item desktop nav with no Accueil link (logo = home) — L'Entreprise, Nos Métiers, Réalisations, Carrières, Médias, Contact; one-page Nos Métiers with four anchored services; flat French slugs; static hero and a homepage ending on a contact CTA; Médias is a gated menu group; no search, newsletter, certifications page or job detail pages at launch.

## Not yet specified

- **Inner-page section composition and page copy** — waits on the homepage prototype; the page tree is set.
- **L'Entreprise page copy** — facts are confirmed in the register; copy can proceed. Mot du gérant is dropped (gérant name only, no photo/quote), so the page ends on direction and agréments.
- **Médias/actualités seed content and media library** — waits on the content model and available assets; the Médias group is gated until a child is live.
- **Careers page copy and current job listings** — waits on the content model and application flow; the single-page structure is decided.
- **Legal page copy and CNDP receipt numbers** — the identity block is confirmed; copy can proceed without a receipt line. CNDP receipts and form gating still wait on #14, and the address/gérant need RC-extract re-verification before launch.
- **Retention schedule and data-handling procedures** — waits on the forms, hosting and CNDP decisions.
- **Component inventory and design tokens** — waits on the brand direction and homepage prototype.
- **Accessibility and performance acceptance criteria** — waits on the design system and prototype.
- **Maintenance, ownership and post-launch support** — waits on hosting and content model.

## Out of scope

- Rebuilding or migrating `lamalifgroup.ma`, or reusing its content as HAY2010 content.
- E-commerce, client portal, extranet, quoting tools.
- Multilingual versions; this effort is French-only.
- Native mobile app.
- Paid acquisition and ongoing SEO/content marketing beyond on-site SEO.
- Lamalif-only pages: Concours Madinaty, STARS IN THE PLACE, Lamalif Le Mag.
- Custom CRM/ERP integration.
- Full brand identity system beyond the web (stationery, signage, vehicle livery).
- Photo/video production; this effort covers asset sourcing and selection only.
- Legal counsel; legal pages are drafted from research, not legal advice.
