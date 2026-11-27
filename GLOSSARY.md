# HAY2010 website

Vocabulary for the HAY2010 institutional website. It names the two sources the repository answers to — the client's structural mandate and the verified-facts register — and the delivery tiers that decide when a page exists.

## Sources of authority

**Cahier des charges (CDC)**:
The structeur's structural mandate for the site: its rubriques, page composition, section trames, vocabulary and phasing. It governs structure; it never overrides the facts register on what may be claimed, named or published.
_Avoid_: spec, brief, requirements document

**Structeur**:
The client-side author and owner of the CDC, and the sole approver of recorded deviations from it.
_Avoid_: client, agency, product owner

**Facts register**:
The record of HAY2010's verified facts, approved wording and gated claims, kept in `docs/company/facts-register.md`. It is the only authority on what the site may publish.
_Avoid_: content model, copy deck, brand book

**Gated claim** (élément gated):
A fact, name, logo, figure or qualification that may not be published until evidence or written authorisation is recorded in the facts register.
_Avoid_: placeholder, TODO, unverified content

**Deviation**:
A recorded divergence between the CDC and what ships, submitted to the structeur for written sign-off before it is built.
_Avoid_: change request, exception, compromise

## Site structure

**Rubrique**:
A top-level section of the site as the CDC enumerates it (Accueil through Contact). Navigation, footer and sitemap are built from rubriques.
_Avoid_: page, section, menu item, onglet

**Domaine d'activité**:
One of the five business categories the CDC enumerates. A published domain has its own page and is listed on the domain index.
_Avoid_: métier, service, pôle, expertise, activité on its own

**Prestation**:
A named service HAY2010 delivers, described inside a domain page (postes de transformation and CFO/CFA are prestations, not domains). A prestation is never a page and never a nav entry.
_Avoid_: service, offre, sous-domaine

**Trame**:
The composition the CDC prescribes for a page type (domain pages §4, an actualité §8.4). It is fixed for that page type, not assembled per page.
_Avoid_: template, layout, wireframe

## Editorial objects

**Réalisation**:
A completed HAY2010 project, presented as evidence of experience. Publishing one requires a documented project record and, for a named publication, written permissions.
_Avoid_: référence, projet, case study

**Référence**:
A client or maître d'ouvrage whose engagement HAY2010 may cite publicly, and the certifications, partners and suppliers that support the credentials pitch. A reference is not a réalisation.
_Avoid_: réalisation, portfolio, testimonial

## Delivery tiers

**Priorité (P1, P2, P3)**:
The CDC's delivery tiers: P1 is the first public release, P2 the post-launch enrichment, P3 the later development. A page's tier is part of its definition — a page that has no tier does not ship.
_Avoid_: MVP, phase, sprint, v1
