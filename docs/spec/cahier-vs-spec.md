# HAY2010 — Cahier des charges vs. the decided spec

**Status:** client input received 2026-11-26; reconciliation **not yet decided**.
**Source:** [`cahier-des-charges-site-web-2026-11-26.pdf`](cahier-des-charges-site-web-2026-11-26.pdf) — authored "HAY2010", 26/11/2026.
**Compared against:** the resolved wayfinder tickets on map [#1](https://github.com/mustaphaelou/hay2010website/issues/1) — page tree [#2](https://github.com/mustaphaelou/hay2010website/issues/2), facts register [#3](https://github.com/mustaphaelou/hay2010website/issues/3), brand [#4](https://github.com/mustaphaelou/hay2010website/issues/4), content model [#5](https://github.com/mustaphaelou/hay2010website/issues/5), réalisations [#6](https://github.com/mustaphaelou/hay2010website/issues/6), hosting [#8](https://github.com/mustaphaelou/hay2010website/issues/8), legal [#10](https://github.com/mustaphaelou/hay2010website/issues/10), SEO [#11](https://github.com/mustaphaelou/hay2010website/issues/11), forms [#12](https://github.com/mustaphaelou/hay2010website/issues/12), CNDP [#14](https://github.com/mustaphaelou/hay2010website/issues/14).

> **One-line reading:** of the 55 requirement rows below, 19 are already satisfied as decided and 6 are compatible extensions; 21 are blocked on **owner-supplied content and permissions**, and 9 contradict a resolved decision. The blocked rows are the cahier's heaviest sections — the project portfolio, the moyens page and the références page — not its architecture. The one true architectural change it forces, a second language, must be decided before routes are written, because URLs are forever.

---

## 1. Verdict legend

| Code | Meaning |
|---|---|
| ✅ | Already decided and compatible — no change |
| ➕ | Compatible extension — adds a page/section the decided tree lacks |
| ⚠️ | Contradicts a resolved decision — needs an owner decision |
| ⛔ | Requires content, proof or permissions that do not exist yet |

Distribution across the 55 requirement rows of §2 (mixed rows counted by their dominant verdict): **19 ✅ · 6 ➕ · 9 ⚠️ · 21 ⛔**.

---

## 2. Requirement matrix

### 2.1 Navigation and page tree (§1, §12)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| N1 | 8 top-level items: Accueil · À propos · Nos domaines d'activité · Nos réalisations · Nos moyens et compétences · Références et partenaires · Actualités · Contact | 6 items, one desktop row at 1024 px: L'Entreprise · Nos Métiers · Réalisations · Carrières · Médias · Contact. Accueil is not an item (logo = home); Carrières was added; Moyens and Références have no page | ⚠️ |
| N2 | "À propos" label | "L'Entreprise" (renamed from Le Groupe) | ✅ label choice, same content role |
| N3 | "Nos domaines d'activité" (long label) | "Nos Métiers" | ✅ label choice; the cahier's wording is too long for the row |
| N4 | "Nos moyens et compétences" page (§6) | Not in the tree; nothing planned | ➕ |
| N5 | "Références et partenaires" page (§7) | Not in the tree; references are a block on `/realisations`, certifications a block on `/entreprise` | ➕ / ⛔ |
| N6 | "Actualités" top-level rubrique (§8) | Médias is a gated menu group; Actualités gated behind `communiques` (max 6/year, no blog features) | ⚠️ |
| N7 | Carrières absent from the cahier | Carrières is a launch page (#2), email-only (#12) | ⚠️ (keep it) |
| N8 | Legal pages and 404 not in the cahier's tree | `/mentions-legales`, `/politique-de-confidentialite`, `not-found` at launch | ✅ (adds, does not conflict) |

### 2.2 Accueil (§2, §13)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| H1 | Full-bleed hero photo, headline, one-line subline, two CTAs (réalisations + contact) | Hero, static image, headline + subline, `Découvrir nos métiers` + `Nous contacter`; variant A approved | ✅ (CTA target differs slightly) |
| H2 | 3–5 line company intro + link to À propos | IntroSplit, link to `/entreprise` | ✅ |
| H3 | Métiers as visual blocks linking to each domain | ServicesBand, 4 icon blocks → `/metiers#…` | ✅ |
| H4 | Chiffres clés, only verifiable figures | #2 explicitly excludes the stats strip at launch; the register gates headcount, financials and any founding year. Publishable: "Plus de 10 ans d'expérience", Rabat, 2 ONEE agréments (once certificates filed) | ⚠️ / ⛔ |
| H5 | 3–6 selected projects with photo, title, location, domain | References teaser; falls back to "Références sur demande"; no project cards until permissions | ⛔ |
| H6 | Moyens et engagements (quality, safety, deadlines) + link | No such section on the homepage; `Engagements` exist only as valeurs on `/entreprise` | ➕ |
| H7 | Closing CTA + footer with coordinates, quick links, professional networks, legal | ContactCta + four-column footer; social icons gated (no confirmed accounts) | ✅ / ⛔ |

### 2.3 À propos / L'Entreprise (§3)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| A1 | Dénomination, activity, location, intervention perimeter | Identity block in the facts register; "Interventions au Maroc" only after the owner confirms national coverage | ✅ / ⛔ |
| A2 | Creation date and development milestones | Founding year is **gated**: 2004 is contradicted (radiée El Kelaâ entity), 2011 was refused by the owner; approved wording is "Plus de 10 ans d'expérience" | ⛔ |
| A3 | Mission, vision, values | Absorbed into `/entreprise` (values include qualité, sécurité, fiabilité, délais) | ✅ |
| A4 | Organisation and team, with professional photographs | Gérant name only, no photo, no quote; employee photos need signed releases | ⛔ (photos) |
| A5 | Quality, safety, conformity; certifications and agréments held | ONEE EE HTA-BT and HTA-BT3 approved, publishable **only after both certificates are filed**; no ISO or other certification exists | ⚠️ / ⛔ |

### 2.4 Domaines d'activité (§4)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| S1 | One page per métier (5 sub-pages) with a mandatory template: presentation, prestations, methods/equipment, photos, related projects, contact | One `/metiers` page with four anchored blocks; service child pages are explicitly **phase 2** | ⚠️ |
| S2 | Cahier taxonomy: éclairage public · installations électriques (BT, tableaux, distribution, protections) · ENR & solaire · infrastructures et réseaux (tranchées, fourreaux) · fourniture d'équipements | Decided taxonomy: éclairage public · réseaux HTA/MT & MT/BT · postes de transformation · CFO/CFA (+ solaire gated) | ⚠️ |
| S3 | Fourniture d'équipements et de matériel, brands with logo authorization | Not a decided service; no catalogue, no brand authorizations. The OMPIC object does include "négociant / import-export", so the activity is plausible but undocumented | ⛔ |
| S4 | "Selon les prestations réellement assurées" caveats throughout | Exactly the gates already implemented | ✅ |

**Taxonomy read:** the two lists are near-isomorphic, not rival. Cahier 4.1 = éclairage public; 4.2 ≈ CFO/CFA; 4.3 = solaire (gated); 4.4 = réseaux HTA/MT & MT/BT; 4.5 = the only genuinely new line. The decided labels are more precise and match the ONEE agréments; the cahier's labels are plainer for a lay visitor. Both can be true: decided labels as headings, plain-language lead-ins in the copy.

### 2.5 Réalisations (§5)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| R1 | Catalogue classified by domain, year or region; thumbnails with photo, name, location, year, category; filters | Credentials-led page, no grid, no filters; anonymized cards only when the owner's contract file is documented | ⛔ |
| R2 | Detail page per project: client/maître d'ouvrage if authorized, year, context, works, technical data, before/during/after gallery, similar projects | `/realisations/[slug]` stays **off** until three approved named case studies exist | ⛔ |
| R3 | Client names and logos with authorization | No permissions on file; logo use also needs the trademark owner (loi 17-97) | ⛔ |
| R4 | Example project sheet (commune, 2025, prestations, illustrations) | The strategy's anonymized card is the same object minus the name | ✅ pattern |

**Evidence position (unchanged since 2026-11-09):** the official procurement records name HAY2010 as a bidder in eight records and document **zero awards**; the Khemisset PV was not located. A portfolio built now would either be empty or unverifiable. The page is therefore credentials-led until the owner produces contracts, réceptions and signed permissions.

### 2.6 Moyens et compétences (§6)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| M1 | Vehicle fleet, trucks, cranes, lifts, earthmoving, each with photo, designation, function | Nothing on file — no inventory, no photos | ⛔ |
| M2 | Technical means: tools, measuring/commissioning equipment, PPE | Nothing on file | ⛔ |
| M3 | HR and know-how: skills, project functions, training and habilitations | Project functions can be described editorially; individual habilitations are not on file | ➕ / ⛔ |
| M4 | Operational capacity: project types, mobilisation, geographic zones | Zones unconfirmed; ONEE agréments give a defensible scope statement | ➕ / ⛔ |

### 2.7 Références et partenaires (§7)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| P1 | Publishable clients and maîtres d'ouvrage, sectors, logos with authorization | None publishable; "Références sur demande" stands | ⛔ |
| P2 | Partners/suppliers, nature of collaboration, logos and brands with authorization | None confirmed | ⛔ |
| P3 | Certifications and professional documents, validity and scope | The two ONEE agréments, gated on the certificates | ⚠️ / ⛔ |

### 2.8 Actualités (§8)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| T1 | Company news, trade fairs, partnerships; article format (title, date, image, summary, short text, links) | Same article shape; rubrique gated, max 6/year, no blog features, no categories/tags | ⚠️ (volume) |
| T2 | Regularly updated rubrique | Depends on the owner writing; seed content not available | ⛔ |

### 2.9 Contact (§9)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| C1 | Address, map, phone, email, opening hours | Email + address at launch; **map gated** until the address is confirmed as a reception point; phone unconfirmed | ⚠️ / ⛔ |
| C2 | Form: nom, entreprise, email, téléphone, objet, message, consent | Same seven fields, text-only, optional after the F-211 receipt | ✅ / ⚠️ gate |
| C3 | Devis request: project type, location, description, **file attachment**, contact details, reply channel | No attachments; nothing is stored. An upload adds private R2 storage, ClamAV, a retention job and F-118 scope | ⛔ |
| C4 | Map and LinkedIn | No map, no official social account | ⛔ |

### 2.10 Transverse (§10)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| X1 | French complete; English coherent; structure ready for Arabic | French only; multilingual explicitly out of scope | ⚠️ |
| X2 | Logo rules, palette, typography, iconography, real photography with publication rights | Direction A — Lumière; approved badge; photography is the critical path | ✅ / ⛔ (shoot) |
| X3 | Responsive, simple navigation, quick contact access, optimised loading, compressed images | #4 acceptance criteria: contrast, alt text, focus, reduced motion, no CLS | ✅ |
| X4 | Per-page titles/descriptions, readable URLs, local SEO + Google Business Profile, audience measurement | #11 covers titles, descriptions, canonical URLs, JSON-LD, sitemap, redirects; **GBP is out of #11's scope** | ✅ / ➕ |
| X5 | HTTPS, backups, updates, spam protection, legal pages, privacy policy, cookies | #10, #14, #8: HTTPS at Cloudflare, nightly dumps, Turnstile/honeypot/rate limits, two legal pages, no cookies at launch | ✅ |
| X6 | Admin access, edit texts/photos/projects/news, short training for the updater | Payload 3 at `/admin`, owner publishes routine content; written ops handoff in #8. A formal "short training" session is not ticketed | ✅ / ➕ |

### 2.11 Content to gather (§11) and phasing (§12)

| ID | Cahier requirement | Decided spec | Verdict |
|---|---|---|---|
| G1 | Institutional docs, logo, charte, coordinates | Facts register + brand assets mostly done; photography outstanding | ✅ / ⛔ |
| G2 | Project list with dates and locations, descriptions, citable clients, original photos per project | Does not exist on file — this is the single blocker behind §5 and §7 | ⛔ |
| G3 | Fleet inventory, skills list, certifications | Does not exist on file | ⛔ |
| G4 | FR + EN texts, brochure PDF, contact persons, social links | FR copy not written yet; EN deferred by the cahier itself; no brochure; no social accounts | ⛔ |
| G5 | P1: Accueil, À propos, Domaines, Réalisations, Contact; FR; mobile | Launch set also includes Carrières and legal pages; Réalisations ships credentials-led | ⚠️ |
| G6 | P2: EN, Moyens, Références/partenaires/certifications, brochure | Not planned; becomes the phase-2 backlog if adopted | ➕ |
| G7 | P3: Actualités, SEO, Odoo study | Actualités gated per #5; SEO decided in #11; **Odoo/ERP integration is out of scope** — a study is cheap but was not scoped | ⚠️ |
| G8 | TCO comparison; separate site / hosting / DNS / mail / Odoo; ownership of accesses, domain, hosting, backups | #8 decided the stack; #15 deferred the DNS/account ownership to #16, which owns the cutover and access handoff | ✅ (tracked in #16) |

---

## 3. What the cahier does not change

- The evidence gates. The cahier itself says: publish only work actually performed, verify names, figures, dates and authorizations before publication, and never claim unconfirmed competence. That is the same rule as the facts register.
- The technical stack, hosting, legal/consent posture, SEO model, brand direction, CMS choice and mobile/responsive requirements.
- The launch gates: F-211 before any public contact collection, F-113 before CVs, F-118 before launch.

## 4. Decisions this document needs

1. **Authority** — is the cahier the target structure for phases 1–3 with the gates intact, or a replacement spec for launch?
2. **Navigation** — 8 top-level items, or the decided 6 with Moyens/Références folded in when their content lands?
3. **Métiers taxonomy** — the cahier's five plain-language domains, the decided four technical ones, or the decided four with plain-language lead-ins plus "Fourniture d'équipements" once a catalogue exists?
4. **Language architecture** — French at the root with English added later under `/en` (no URL churn), or locale-prefixed URLs from day one?
5. **Portfolio and reference pages** — stay credentials-led until documented projects and signed permissions exist, or start the permission campaign now and build §5–§7 as phase 2?

## 5. Owner-supplied content that unblocks the rest

| Needed | Unblocks | Cahier ref |
|---|---|---|
| Project list: title, commune, year, prestations, contract/réception, photos before/during/after | Réalisations catalogue, detail pages, homepage teaser | §5, §2.5 |
| Signed client authorizations (name, logo, photo, quote) | Named cards, references page, client logos | §5.2, §7.1 |
| Signed partner/supplier authorizations | Partenaires block | §7.2 |
| ONEE agrément certificates (both) | Agréments block, `/realisations` qualifications | §3.5, §7.3 |
| Fleet and equipment inventory with photos | Moyens page | §6.1–6.2 |
| Confirmed phone, opening hours, reception address | Contact page, map, footer | §9.1 |
| Official LinkedIn / social accounts | Footer icons, `sameAs` | §9.4, §2.7 |
| English translations of final French copy | EN version | §10.1 |
| Brochure PDF | Download block | §11 |
