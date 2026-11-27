# Information architecture

Status: accepted 2026-11-26. This supersedes the information architecture in `.scratch/hay2010-website/issues/01-page-tree.md`, following `docs/adr/0001-cahier-des-charges-governs-structure.md`. Route paths, nav labels and the homepage section order are settled in the Round 3 pass and are not in this file yet.

## Page inventory

The cahier des charges' eight rubriques are the public page inventory, delivered in the CDC's own tiers. A page ships only when its tier is reached and its content gates clear; a gated page is absent from navigation, footer and sitemap, and its direct URL returns 404. There are no "coming soon" pages.

| Rubrique (CDC §1) | Tier | Gate |
|---|---|---|
| Accueil | P1 | none |
| À propos | P1 | facts register only (identity, agréments once certified) |
| Nos domaines d'activité (index) | P1 | none; lists published domains only |
| — Éclairage public | P1 | none |
| — Installations électriques | P1 | none |
| — Infrastructures et réseaux électriques | P1 | ONEE agrément wording stays gated until certificates are filed |
| — Énergies renouvelables et solaire | P2 | owner's written confirmation of the real perimeter (CDC §4.3) |
| — Fourniture d'équipements et de matériel | P2 | catalogue plus written distribution/logo authorisations (CDC §4.5) |
| Nos réalisations | P1 | credentials-led until three approved named case studies (DEV-001) |
| — Fiche projet | P2 | three approved named case studies, with permissions |
| Nos moyens et compétences | P2 | owner's matériel, photographic and HR inventory (CDC §11) |
| Références et partenaires | P2 | client, partner and certification permissions (CDC §11) |
| Actualités | P3 | at least one approved actualité |
| — Article | P3 | with Actualités |
| Contact | P1 | phone, map, opening hours and social links only once the facts register clears them |
| Mentions légales | P1 | legal copy and CNDP references |
| Politique de confidentialité | P1 | legal copy and CNDP references |
| 404 | P1 | none |

Site-only pages the CDC does not enumerate (retained by decided scope, outside the eight rubriques): **Carrières**, a utility page reached from the footer only, with email-only applications and no application form or CV upload.

## Navigation

- Flat desktop row, no dropdowns, no separate "Nous contacter" button. **Accueil is the first item** (CDC §1 item 01); the logo also links home.
- The row grows with the tiers: **P1** `Accueil · À propos · Domaines d'activité · Réalisations · Contact`; **P2** adds `Moyens et compétences` and `Références et partenaires`; **P3** adds `Actualités`.
- One nav data module drives desktop, mobile and the footer, carrying a gate flag per entry so the row and footer adapt without edits.
- Mobile drawer order: Accueil first, then the same rubriques, then Carrières, then the legal links. Focus trap, Escape to close, body scroll lock, focus returns to the burger.
- Breakpoint stays 1024 px, from #01.

The **Médias** menu group is dissolved: Actualités becomes a top-level rubrique per the CDC, and **Médiathèque ceases to be a public page**. The Payload media library remains; photographs appear inside domain pages, réalisations (when rights exist) and actualités.

## Domaines d'activité

Five domains are canonical, exactly as the CDC lists them. Three publish at P1; two are gated. CFO/CFA and postes de transformation stop being top-level domains and become named **prestations** inside the domain that contains them — verified capability is preserved, the vocabulary is the CDC's.

| Domaine | Verified capability it carries | Status |
|---|---|---|
| Éclairage public | the approved éclairage public activity | P1 |
| Installations électriques | CFO/CFA, tableaux, distribution and protection, câblage and mise en service | P1 |
| Infrastructures et réseaux électriques | réseaux HTA/MT and MT/BT, postes de transformation | P1 |
| Énergies renouvelables et solaire | the previously gated Solaire & ENR activity | gated |
| Fourniture d'équipements et de matériel | none recorded — no distribution evidence in the facts register | gated |

Each published domain has its own page built on the CDC §4 trame: presentation and needs, confirmed prestations, methods/means/competences, project photos, associated réalisations and a contact CTA. Blocks whose assets do not exist are omitted, not filled with placeholders (DEV-006).

## Références et partenaires

P2. No agrément is stated as held until its certificate is on file, so the page carries only what is provable at the time it ships.

- Certifications and agréments live canonically in **Références et partenaires** (CDC §7.3). À propos carries a short block that links to it; Réalisations keeps its one-line credential and links to it. The same agréments are never restated in three places.
- Client names, logos and testimonials stay gated on written permission; the page ships with what is authorised, or stays unpublished.
- Partner and supplier logos require written authorisation; text-only naming until then.

## Moyens et compétences

P2, content-gated on the owner's inventory: parc matériel and vehicles with photographs and designations, technical means, human resources and savoir-faire, operational capacity and geographic coverage. Nothing is invented; if the inventory never arrives, the page does not ship.

## Mesure et visibilité

- **Google Business Profile is the owner's action**, supported by our written pre-launch checklist and by the site's canonical metadata and Organization structured data. Only the owner can receive the verification.
- **No client-side analytics at launch**; Cloudflare edge analytics only. Cloudflare Web Analytics after the CNDP F-214 filing, per the settled decision.
- **Lead tracking stays manual** (monthly count from the mailbox) until the P2 devis form; instrumentation is re-decided there with its F-214 and consent gate.
- **No LocalBusiness structured data** while the address, phone and opening hours remain gated; revisit when GBP goes live with those fields published.

## Pending

Settled next: canonical French labels and the route/slug scheme, the homepage section order against prototype variant A, template discipline for page composition, the §11 content ownership checklist. Then: the forms/legal detail, the SEO and redirect update this IA forces, and the build plan.
