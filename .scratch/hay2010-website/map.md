# HAY2010 website — wayfinder map

## Destination

A build-ready specification for the HAY2010 French corporate website, adapted from `lamalifgroup.ma`'s information architecture and section patterns, plus the decisions needed to start implementation in the existing Next.js 16 repo. The resolved tickets are the spec; this map does not write production code.

## Notes

- **Domain:** corporate website for HAY2010 SARL, a Rabat electrical contractor working in public lighting, HTA/BT electrification, transformer stations, CFO/CFA and solar.
- **Reference architecture:** `lamalifgroup.ma`. Teardown: [`docs/research/lamalifgroup-architecture-style.md`](../../docs/research/lamalifgroup-architecture-style.md). Company research: [`docs/research/hay2010-company-activity-and-careers.md`](../../docs/research/hay2010-company-activity-and-careers.md).
- **Agreed scope:** French only; adapted full corporate site (Accueil, Le Groupe, Réalisations, Carrières, Médias, Contact + legal); drop lamalif-only contest pages; same IA and section patterns, new HAY2010 brand.
- **Content rule:** use verified public research; draft French copy; flag placeholders for missing photos, references and brand assets. Never publish unverified client claims or legal facts.
- **Existing repo:** Next.js 16.4.3 App Router, React 19, Tailwind 4, shadcn `base-maia`, Hugeicons, TypeScript. Only the template page exists.
- **Tracker:** local markdown in `.scratch/hay2010-website/`. Map is this file; tickets are `issues/NN-*.md`. Blocking is a `Blocked by:` line; a ticket is unblocked when every listed file is `resolved`.
- **Skills for sessions:** `grilling` + `domain-modeling` for decisions; `prototype` for visual directions; `research` for external facts.
- **Standing preferences:** decisions over deliverables; one ticket per session (except research); no build work in this map; keep this map index-only.

## Decisions so far

<!-- One line per resolved ticket: linked name + one-line gist. Detail stays in the ticket. -->

## Not yet specified

- **Inner-page section composition and page copy** — waits on the page tree and the homepage prototype.
- **Le Groupe subpage copy and the gérant's message** — waits on the confirmed company facts and the page tree.
- **Médias/actualités seed content and media library** — waits on the content model and available assets.
- **Careers page copy and current job listings** — waits on the page tree, content model and application flow.
- **Component inventory and design tokens** — waits on the brand direction and homepage prototype.
- **Accessibility and performance acceptance criteria** — waits on the design system and prototype.
- **Launch/cutover runbook** — waits on the hosting/domain decision.
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
