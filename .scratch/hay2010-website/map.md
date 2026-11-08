# HAY2010 website — wayfinder map

> Canonical tracker: GitHub issue [#1](https://github.com/mustaphaelou/hay2010website/issues/1). This file is a local mirror; the local-to-GitHub mapping is in [`github-issues.md`](github-issues.md).

## Destination

A build-ready specification for the HAY2010 French corporate website, adapted from `lamalifgroup.ma`'s information architecture and section patterns, plus the decisions needed to start implementation in the existing Next.js 16 repo. The resolved tickets are the spec; this map does not write production code.

## Notes

- **Domain:** corporate website for HAY2010 SARL, a Rabat electrical contractor working in public lighting, HTA/BT electrification, transformer stations, CFO/CFA and solar.
- **Reference architecture:** `lamalifgroup.ma`. Teardown: [`docs/research/lamalifgroup-architecture-style.md`](../../docs/research/lamalifgroup-architecture-style.md). Company research: [`docs/research/hay2010-company-activity-and-careers.md`](../../docs/research/hay2010-company-activity-and-careers.md).
- **Agreed scope:** French only; adapted full corporate site (Accueil, Le Groupe, Réalisations, Carrières, Médias, Contact + legal); drop lamalif-only contest pages; same IA and section patterns, new HAY2010 brand.
- **Content rule:** use verified public research; draft French copy; flag placeholders for missing photos, references and brand assets. Never publish unverified client claims or legal facts.
- **Existing repo:** Next.js 16.4.3 App Router, React 19, Tailwind 4, shadcn `base-maia`, Hugeicons, TypeScript. Only the template page exists.
- **Tracker:** GitHub issues are canonical: map [#1](https://github.com/mustaphaelou/hay2010website/issues/1); tickets are sub-issues labelled `wayfinder:<type>`. This local file is a mirror; local-to-GitHub mapping is in [`github-issues.md`](github-issues.md).
- **Skills for sessions:** `grilling` + `domain-modeling` for decisions; `prototype` for visual directions; `research` for external facts.
- **Standing preferences:** decisions over deliverables; one ticket per session (except research); no build work in this map; keep this map index-only.
- **Known infrastructure risk:** hay2010.ma's DNS delegation is split between Cloudflare and HeberjaHiz; the Cloudflare authoritative servers refuse the zone, so resolvers can intermittently SERVFAIL. Fix the delegation before any hosting cutover. See [Research hosting, domain and deployment options](issues/06-hosting-research.md) and [Fix the hay2010.ma DNS delegation and identify account owners](issues/14-dns-delegation.md).
- **Compliance is a launch dependency:** CNDP filings are required before go-live, and recruitment/CV processing needs an F-113 authorization. Do not copy lamalif's blank receipt number or missing privacy policy. See [Research Moroccan legal and consent requirements for the site](issues/08-legal-research.md) and [Plan the CNDP filings and launch compliance](issues/13-cndp-filings.md).
- **Legal checklist:** the legal research note's compliance checklist (consent notices, retention jobs, CV storage, security headers, rights procedure, processor contracts) is part of the build spec, not optional polish.

## Decisions so far

<!-- One line per resolved ticket: linked name + one-line gist. Detail stays in the ticket. -->

- [Research Moroccan legal and consent requirements for the site](https://github.com/mustaphaelou/hay2010website/issues/9): Law 09-08 requires CNDP filings before launch — F-211/F-214 contact declaration, F-113 recruitment authorization, F-118 for US transfers; D-939-2025 exempts non-profiling analytics from prior consent but conflicts with older guidance; mentions légales need an RC extract; the current sites are not compliance models.
- [Research hosting, domain and deployment options](https://github.com/mustaphaelou/hay2010website/issues/7): Recommends Vercel Pro + repair DNS at HeberjaHiz (remove the dead Cloudflare NS), keep email; Cloudflare Workers/vinext is the beta alternative; the current WordPress site is a placeholder; the split DNS delegation must be fixed first.

## Not yet specified

- **Inner-page section composition and page copy** — waits on the page tree and the homepage prototype.
- **Le Groupe subpage copy and the gérant's message** — waits on the confirmed company facts and the page tree.
- **Médias/actualités seed content and media library** — waits on the content model and available assets.
- **Careers page copy and current job listings** — waits on the page tree, content model and application flow.
- **Legal page copy and CNDP receipt numbers** — waits on the RC extract and the CNDP filings.
- **Retention schedule and data-handling procedures** — waits on the forms, hosting and CNDP decisions.
- **Component inventory and design tokens** — waits on the brand direction and homepage prototype.
- **Accessibility and performance acceptance criteria** — waits on the design system and prototype.
- **Launch/cutover runbook** — waits on the hosting/domain decision, the DNS delegation fix, email/SPF preservation and the CNDP filings.
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
