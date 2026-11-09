# HAY2010 — Réalisations and portfolio strategy

**Status:** resolved 2026-11-09 — ticket [#6](https://github.com/mustaphaelou/hay2010website/issues/6).
**Owner decision:** the recommended answers (Q1-A, Q2-A, Q3-B, Q4-A, Q5-A) were accepted on 2026-11-09 (owner reply: “recommendation”).
**Scope:** the `/realisations` page, the homepage references teaser, project references, imagery and the permission workflow. Routes are fixed by [#2](https://github.com/mustaphaelou/hay2010website/issues/2); the content model by [#5](https://github.com/mustaphaelou/hay2010website/issues/5); legal wording by [#10](https://github.com/mustaphaelou/hay2010website/issues/10); SEO by [#11](https://github.com/mustaphaelou/hay2010website/issues/11); launch by [#16](https://github.com/mustaphaelou/hay2010website/issues/16).
**Source of truth:** this document for the réalisations strategy; [`docs/company/facts-register.md`](../company/facts-register.md) for legal identity and approved claims; [`docs/content/content-model.md`](content-model.md) for schema and workflow.

> **One-line rule:** publish only what HAY2010 can prove and is allowed to show. Until a project is both documented and cleared, the page says `Références sur demande` and carries the qualifications instead.

---

## 1. The decision

`/realisations` launches as a **credentials-led references page**, not a portfolio.

It has seven blocks:

1. **Hero** — `Réalisations`, `Références sur demande.`, two CTAs.
2. **Intro** — the approved positioning line and why references are sent on request.
3. **Ce que nous réalisons** — the four service blocks; each is the future home of its reference cards.
4. **Nos qualifications** — the two current ONEE agréments, with their exact scope and dates.
5. **Références** — `Références sur demande.` until documented projects are cleared; then anonymized cards inline (1–2) or a two-column list (3+).
6. **Notre méthode** — four delivery steps.
7. **Contact CTA**.

No project is published at launch. The page is complete without one.

### Thresholds

| Threshold | What the page shows |
|---|---|
| **0** | Credentials, method, `Références sur demande` |
| **1–2** | Cards inline under their service; the fallback stays as a line + CTA |
| **3+** | The references block becomes a two-column editorial list; still no filters |
| **3 approved named case studies with rights-cleared photos** | `/realisations/[slug]` detail pages turn on, per [#2](https://github.com/mustaphaelou/hay2010website/issues/2) |

### Why not a portfolio

The 2026-11-09 verification found **zero officially documented awards** to HAY2010 (§12). Every official record is a bid, a loss or a technical eviction; the aggregator’s 14 wins / 78.66 M DH cannot be attributed per project; the Khemisset official PV was not located. A portfolio built from those records would be false.

The only legitimate source of references is the owner’s contract file, and the only path to names, logos and photos is written permission. The page is therefore **inventory-led, permission-gated and credentials-backed**.

### What this changes against the ticket premise

| Ticket premise | What the verification showed | Decision |
|---|---|---|
| “One individually verified public contract (Khemisset)” | The official PV was not located; only the aggregator page names it | Treat as **unverified** until the owner supplies the contract/réception |
| “Aggregator claim of 14 wins / 78.66 M DH” | No per-project attribution; name matching includes a radiée namesake | **Never publish** |
| “No project photos or client logos” | True | No per-project imagery, no logos |
| Named references / anonymized types / service-led case studies | None available without permission | **Anonymized owner-record cards + credentials**, named only with permission |
| Filterable grid / list / fallback | Nothing to filter | **Inline cards then list; fallback at launch** |
| Minimum number of references for launch | Not a portfolio | **Zero**; thresholds above |
| Legal/permission checklist | Unchanged, but now covers public records and expired qualifications | §6 |

---

## 2. Page specification

### 2.1 Copy

| Slot | French copy | Notes |
|---|---|---|
| Nav label | `Réalisations` | Fixed by [#2](https://github.com/mustaphaelou/hay2010website/issues/2) |
| H1 | `Réalisations` | — |
| Hero subline | `Références sur demande.` | Approved wording in the facts register §2.2 |
| Primary CTA | `Demander nos références` | `mailto:contact@hay2010.ma?subject=Demande%20de%20r%C3%A9f%C3%A9rences` (after the mailbox is tested; see #10 §6) |
| Secondary CTA | `Découvrir nos métiers` | `/metiers` |
| Intro | `Depuis plus de 10 ans, HAY2010 accompagne les collectivités et les entreprises dans leurs projets d’éclairage public et d’électrification. Nos références sont transmises sur demande, après accord des maîtres d’ouvrage.` | Lead is the approved positioning line; second sentence is new prose |
| Qualifications label | `Agréments ONEE` | — |
| Method title | `De l’étude à la réception` | — |
| Fallback block | `Références sur demande.` + `Nos références sont transmises sur demande, après accord des maîtres d’ouvrage.` | Exact fallback wording is approved |

Do not use: “portfolio”, “nos projets réalisés”, “ils nous font confiance”, “leader”, “n°1”, “entreprise agréée”, “partenaire officiel”, “depuis 2004/2011”.

### 2.2 Section order

1. **Hero** — typographic on paper or ink at launch; a rights-cleared documentary photo only when one exists. Same headline, no fake image, no stock.
2. **Intro** — the paragraph above; a text link to `/metiers`.
3. **Ce que nous réalisons** — the four services from the `services` collection, each a row with title, one-line summary and `En savoir plus` → `/metiers#…`. Solaire only when `solaireLive` is true.
4. **Nos qualifications** — the ONEE block (§2.4), code-rendered; link `En savoir plus sur l’entreprise` → `/entreprise`.
5. **Références** — fallback or cards (§2.3).
6. **Notre méthode** — four steps (§2.5).
7. **Contact CTA band** — `Un projet d’éclairage public ou d’électrification ?` + `Nous contacter`.

### 2.3 Reference cards

**Anonymized card (default)**

| Element | Value |
|---|---|
| Service label | One of the four, e.g. `Éclairage public` |
| Title | The object, e.g. `Fourniture et pose de câble d’éclairage public` |
| Place | Region only by default, e.g. `Rabat-Salé-Kénitra`; a city only if the owner confirms it does not identify the client |
| Year | Completion or contract year |
| Scope | One line |
| Image | None until a rights-cleared photo exists |
| Buyer | **Omitted** until a signed name permission |
| Logo, amount, testimonial, detail link | **Omitted** |
| Microcopy | Optional `Référence communiquée sur demande.` |

**Named card (after permission)**

- Buyer name only with a signed client authorization.
- Logo only with the client **and** the trademark owner’s permission (loi 17-97 arts. 154/201).
- Photo only with a photographer licence/assignment, a written site authorization, and releases for any identifiable person.
- Testimonial only with written consent; it lives inside the case study, not on the card.
- Amount still not displayed by default; the owner may opt in for a public contract, with the contract reference.
- Detail link only when the case study is published and `caseStudiesLive` is true.

**What a card never shows:** losing bid, participation, “admissible” status, aggregator totals, an expired qualification, a client mark in a photo, an uncredited image.

### 2.4 Qualifications block

Rendered from code (`lib/company.ts`), not editable in the CMS, gated by `agrementLive` and by both certificates being filed:

```text
Agréments ONEE
EE HTA-BT — Études des électrifications HTA-BT souterraines, BT aériennes et souterraines et bâtiment (02/10/2023 – 30/09/2028)
HTA-BT3 — Construction des réseaux HTA-BT (sans plafond) (25/03/2026 – 31/03/2029)
```

- These are the **only two** ONEE agréments documented for HAY 2010. The `HTA-BT0` line (branchements HTA + postes HTA/BT, ≤ 1 MDH TTC) belongs to **HAMZA ANAS ELECTROMECANIQUE**, not HAY2010; never attribute it.
- No current ONEE agrément explicitly covers **postes de transformation**. The service stays on `/metiers` as an offer, but no ONEE agrément is attached to it.
- The **MHVP 4\*\*\*\*** qualification (certif 2051, secteur 4, 4.1/4.2/4.3) was renewed 04/03/2024 → 03/03/2026 and is **expired**. Omit it until a later renewal certificate is produced.
- The ONEE fiche also shows a phone (`05 37 281111`) and the old Ribat Al Fath address; both stay gated by [#3](https://github.com/mustaphaelou/hay2010website/issues/3). The confirmed seat is Hay El Manzeh.

### 2.5 Method block

```text
De l’étude à la réception
1. Étude et dimensionnement — Études techniques et photométriques, plans d’exécution.
2. Chiffrage et approvisionnement — Chiffrage, achats et logistique du matériel.
3. Exécution et coordination — Travaux, coordination de chantier et contrôle de conformité.
4. Réception et mise en service — Essais, réception et mise en service.
```

This is delivery prose supported by the company’s own job requirements (in-house studies, DIALux/AutoCAD, chiffrage, site supervision). It makes no certification claim.

### 2.6 Explicitly not on the page

- A filterable grid, city filters or a 39-card wall (lamalif pattern).
- Client names or logos without permission.
- Project photos before rights clearance.
- Testimonials without consent.
- Losing bids, participations or technical admissibility.
- Aggregator totals (14 wins / 78.66 M DH).
- The expired MHVP qualification presented as current; any generic “entreprise agréée”.
- Stock, AI-generated or Porto demo assets.
- Reused brand photography captioned as if it were a project.
- Amounts by default.

---

## 3. Homepage teaser

- Until **3 published projects** exist: `Références sur demande` + CTA, per [#2](https://github.com/mustaphaelou/hay2010website/issues/2).
- At **3+**: up to three manually featured projects (`referencesTeaser.featuredProjects`), anonymized or named under the same rules.
- No client-logo band, no stats strip, no “14 marchés” line.

## 4. Detail pages (phase 2)

- `/realisations/[slug]` turns on only when **at least 3 approved named case studies** exist, each with `clientPermission`, a rights-cleared cover, releases for any identifiable person, and an approved case-study body.
- The gate `caseStudiesLive` stays false until then; the route returns 404, is absent from the sitemap and has no internal links.
- Anonymized cards never get a detail page; they are static cards.

---

## 5. Owner inventory and permission workflow

### 5.1 Inventory

The owner sends a list of completed projects from internal files. It is the only source of reference cards. Minimum columns:

| Field | Published? | Notes |
|---|---|---|
| Object (French, one line) | Yes | The card title |
| Service | Yes | One of the four; solaire only when live |
| Buyer | No by default | Internal; published only with a signed name permission |
| Buyer type (public/private) | No | Internal |
| Place (city/region) | Region yes; city optional | City only if it does not identify the client |
| Year | Yes | Completion or contract year |
| Amount | No by default | Internal; owner may opt in for public contracts |
| Contract / réception reference | No | Internal `evidenceReference`; the audit trail |
| Permission contact (name, email, phone) | No | Internal; the campaign list |
| Photos (yes/no, rights status) | — | Drives the cover and gallery |
| Permission status | — | None / requested / signed for name, logo, photo, quote |

- Target: **5–10 rows**; **3** is the threshold to show cards.
- **T** is the public launch date set by [#16](https://github.com/mustaphaelou/hay2010website/issues/16).
- Deadline: **T-2 weeks** for the inventory; **T-3 weeks** for the permission window to close.
- If no inventory arrives by T-2: launch on the fallback; no cards. The page still ships.
- **Khemisset** is included only if the owner supplies the contract or réception; the official PV was not located, so it is not a public-record card.

### 5.2 Permission campaign

One campaign, owner-sent, in French, using the inventory’s permission contacts.

Four **separate** asks, each with its own checkbox/signature:

1. **Name** — may we name your organisation as a client?
2. **Logo** — may we display your logo? Requires the client **and** the trademark owner’s permission.
3. **Site photos** — may we photograph and publish the site? The client signs a site authorization; the photographer signs a licence/assignment; people need their own releases.
4. **Quote** — may we publish a testimonial? Written consent, with the exact quote approved.

- One-page letter; three-week window; one reminder; silence means no.
- No implied consent, no “they didn’t say no”, no logo from a public source.
- The developer records the status in the facts register §6 and on the project record, prepares the card, and publishes the day the signed paper is filed.
- The [#10](https://github.com/mustaphaelou/hay2010website/issues/10) decision and its one-off counsel review cover the permission letter and the reference wording before the campaign starts. Not legal advice.

### 5.3 Evidence levels

| Level | Evidence | What may be published |
|---|---|---|
| **A. Owner-confirmed, anonymized** | Contract/réception in the owner’s file, recorded in `evidenceReference` | Service, object, region, year, scope; no buyer, logo, photo, amount |
| **B. Client-authorized, named** | A + signed name permission | A + buyer name |
| **C. Case study** | B + logo/photo/quote permissions as applicable + approved body | Detail page, images, quote |

Level A is enough for a card. B and C are upgrades. The site never publishes a level it cannot evidence.

---

## 6. Imagery

- **No per-project images** until rights-cleared. The card is typographic: service label, object, place/year, 1 px rules, service icon.
- **Page hero:** a rights-cleared documentary photo (no client marks, no identifiable people without releases) or the typographic hero fallback from [#4](https://github.com/mustaphaelou/hay2010website/issues/4). Never stock, AI or Porto.
- **Card cover:** when a photo is cleared, it becomes the cover (16:10 or 4:3), with French alt text and a credit.
- **Site authorization:** written, per site. Transformer stations and restricted installations need explicit authorization.
- **People:** specific written authorization per identifiable person (loi 09-08 art. 1); prefer hands, backs and wide PPE shots.
- **Client marks:** none in frame; crop or retouch to remove.
- **Alt text:** French, descriptive, no keyword stuffing; caption where the image is evidence.

The [#4](https://github.com/mustaphaelou/hay2010website/issues/4) photography brief covers the hero and section frames; réalisations adds **0–5 optional site photos**, not the critical path.

---

## 7. Legal and permission checklist

| Asset / claim | Permission or evidence | Where recorded | Publish rule |
|---|---|---|---|
| Client name | Written client authorization | Project `clientPermissionRef` | Only after signature |
| Client logo | Client authorization + trademark owner permission (loi 17-97 arts. 154/201) | `clientPermission` + `trademarkPermission` | Both signatures |
| Site photo | Client site authorization + photographer licence/assignment | Media `rightsReference` | Both documents |
| Identifiable person | Specific written authorization (loi 09-08 art. 1) | `releaseStatus` + `releaseReference` | Signed release |
| Testimonial | Written consent, exact quote approved | `testimonialPermissionRef` | Signed consent |
| Owner-confirmed project | Contract/réception in the owner’s file | `evidenceReference` | Anonymized card only |
| Public-procurement record | Official PV/contract; buyer name still needs permission per [#3](https://github.com/mustaphaelou/hay2010website/issues/3) | Internal evidence | Anonymized only; no “attributaire” claim without the PV |
| Losing bid / participation | — | — | Never |
| Aggregator totals | — | — | Never |
| Expired qualification | — | — | Never as current |
| ONEE agréments | Both certificates filed | Code-owned block | Verbatim only; `agrementLive` |

- No personal data is stored in the CMS beyond a released photo and its release reference ([#5](https://github.com/mustaphaelou/hay2010website/issues/5), [#14](https://github.com/mustaphaelou/hay2010website/issues/14)).
- The CTA is a `mailto:`; no form. The email route is covered by the contact processing/F-211; there is no additional form-specific CNDP dependency ([#12](https://github.com/mustaphaelou/hay2010website/issues/12)).
- Legal review follows the [#10](https://github.com/mustaphaelou/hay2010website/issues/10) counsel gate; this document is not legal advice.

---

## 8. Content model and gates

`projects` remains the reference type; no new collection. The amendments to [`docs/content/content-model.md`](content-model.md) are:

| Change | Reason |
|---|---|
| `cover` optional for a published project without a rights-cleared image | Typographic anonymized cards must be publishable |
| `evidenceReference` (text, developer-only) | Audit trail for the owner-confirmed contract/réception |
| `clientName` empty = anonymized card | No permission needed for the card; no detail page |
| `caseStudiesLive` gate (default false) | `/realisations/[slug]` stays off until 3 approved named case studies |
| `referencesTeaser.featuredProjects` threshold = 3 | The homepage teaser falls back until 3 published projects |
| No amount field | Amounts stay internal by default; add a field only if the owner opts in |

Publishing rules:

- An anonymized card may publish with `evidenceReference` and no `clientName`.
- A named card requires `clientPermission` and the reference.
- A detail page requires `caseStudiesLive`, 3 approved case studies, a rights-cleared cover and the body.
- The rights gate still blocks any uncleared uploaded image; a missing cover is not an uncleared image.
- Revalidation: `projects` tag, `/realisations`, the homepage, the sitemap.

---

## 9. SEO and structured data ([#11](https://github.com/mustaphaelou/hay2010website/issues/11))

- `/realisations` is **indexable**; it is a launch navigation page. Title and description come from the intro; no “portfolio” keyword stuffing.
- **No `ItemList`, `CreativeWork` or `Review` markup** until 3 published projects; never mark up unverified projects or testimonials.
- Canonical URL; no noindex (the page is not gated).
- The sitemap includes `/realisations`; detail URLs only when `caseStudiesLive` is true.
- OG image: typographic or a rights-cleared photo; no stock.

---

## 10. Launch gates and acceptance criteria

- [ ] `/realisations` renders hero, intro, four services, qualifications, references, method and CTA.
- [ ] Zero project cards at launch; the fallback is exactly `Références sur demande.`
- [ ] No client name, logo, photo, testimonial, amount, aggregator total or losing bid on the page.
- [ ] The two ONEE agréments match the filed certificates; `agrementLive` is true only then; no HTA-BT0 line.
- [ ] The MHVP qualification is absent or, if a later renewal is filed, current; never shown as expired-and-current.
- [ ] The homepage teaser falls back until 3 published projects.
- [ ] `/realisations/[slug]` returns 404 and is absent from the sitemap until `caseStudiesLive` and 3 approved case studies.
- [ ] The fallback CTA opens `mailto:contact@hay2010.ma` with the subject `Demande de références` (after the mailbox is tested).
- [ ] The hero is typographic or a rights-cleared photo; no stock, AI or Porto asset.
- [ ] Contrast, alt text, reduced motion, mobile/desktop layout pass ([#4](https://github.com/mustaphaelou/hay2010website/issues/4), [#13](https://github.com/mustaphaelou/hay2010website/issues/13)).
- [ ] The permission letter and reference wording follow the [#10](https://github.com/mustaphaelou/hay2010website/issues/10) decision and its counsel review; no client name/logo without a signature.
- [ ] [#11](https://github.com/mustaphaelou/hay2010website/issues/11) has confirmed indexing and no structured data.

---

## 11. Owner actions

| # | Action | Unlocks | Deadline |
|---|---|---|---|
| 1 | Send the **internal project inventory** (§5.1) | Cards and the permission campaign | T-2 weeks |
| 2 | Confirm **Khemisset** with the contract/réception, if it should be a card | One verified owner-record card | T-2 weeks |
| 3 | File **both ONEE certificates** (EE HTA-BT, HTA-BT3) | `agrementLive`; the qualifications block | Before launch |
| 4 | Check for an **MHVP renewal after 03/03/2026** | The 4\*\*\*\* qualification, if renewed | Before launch |
| 5 | Approve the **permission letter**; send it; one reminder | Named cards, logos, photos, quotes | T-3 weeks |
| 6 | Approve the **page copy** and the fallback wording | Final page | T-2 weeks |
| 7 | Confirm whether **amounts** may be shown (default: no) | Card variant | T-2 weeks |
| 8 | Confirm the ONEE fiche **phone/address** only if [#3](https://github.com/mustaphaelou/hay2010website/issues/3) reopens | Contact block | Not planned |

---

## 12. Evidence appendix — verification of 2026-11-09

### 12.1 Public-procurement records

Eight official records name HAY2010. In **all eight the company is a bidder, never the awardee**.

| # | Buyer / reference | Object | HAY2010 status | HAY2010 amount (DH TTC) | Winner | Source |
|---|---|---|---|---|---|---|
| 1 | Al Omrane Tanger-Tétouan-Al Hoceïma — 80/TTH/TA/2026 | Travaux d’électrification et éclairage public du lotissement Sania, Tanger | Admissible, non retenu | 550 914,00 | ALPHA PROCESS — 481 440,00 | [PV 1000916](https://www.marchespublics.gov.ma/index.php?page=entreprise.ExtraitPV&refConsultation=1000916&orgAcronyme=j8k) |
| 2 | Commune urbaine d’Aïn Taoujdate — 04/2026 | Poteaux et câblages du réseau d’éclairage public, avenue Far, El Hajeb | Évincé | — | Aucun retenu | [PV 991632](https://www.marchespublics.gov.ma/index.php?page=entreprise.ExtraitPV&refConsultation=991632&orgAcronyme=q0x) |
| 3 | AMEE — 03/2026/AMEE | Systèmes solaires thermiques ECS + économie d’eau, mosquées (lots 1–2) | Évincé (administratif) | — | HARTI POLYSERVICES 2 082 199,10 (lot 1) ; SOLIATECH 1 564 268,00 (lot 2) ; consultation annulée le 20/07/2026 | [PV 987859](https://www.marchespublics.gov.ma/index.php?page=entreprise.ExtraitPV&refConsultation=987859&orgAcronyme=d4q) |
| 4 | CHU Mohammed VI Marrakech — 08/2024/CHM6M | Électricité CFO/CFA, 5e salle opératoire et unité de cardio-pédiatrie | Admissible, non retenu | 1 299 519,60 | BUILDDIS TECH — 1 230 134,40 | [PV 788476](https://www.marchespublics.gov.ma/index.php?page=entreprise.ExtraitPV&refConsultation=788476&orgAcronyme=q9t) |
| 5 | CHU Mohammed VI Marrakech — 39/2025/AOOS/CHM6M | Remise en état électrique de la salle des serveurs, DG | Évincé | — | LENEMA — 136 500,00 | [PV 957033](https://www.marchespublics.gov.ma/index.php?page=entreprise.ExtraitPV&refConsultation=957033&orgAcronyme=q9t) |
| 6 | CHU Mohammed VI Marrakech — 38/2025/AOOS/CHM6M | Fourniture et installation de climatiseurs, hôpital Ibn Tofail | Admissible, non retenu | 242 106,23 | MENUISERIE ELARGOUBI — 204 504,00 | [PV 957030](https://www.marchespublics.gov.ma/index.php?page=entreprise.ExtraitPV&refConsultation=957030&orgAcronyme=q9t) |
| 7 | Bank Al-Maghrib — 90/AOO/BKAM/2025 | Remplacement des groupes électrogènes | Admissible, non retenu | 1 560 564,52 (1 572 064,52 après rectification) | HIBA POWER — 1 589 040,00 | [PV BAM 2025](https://www.bkam.ma/fr/content/download/835994/9085122/Extrait%20de%20PV%2090%20AOO%20BKAM%202025.pdf) |
| 8 | Bank Al-Maghrib — 44/AOO/BKAM/2026 | Prérequis techniques pour nouvelles machines à DAS | Admissible avec réserve, puis évincé | — | BAUENER — 827 148,00 | [PV BAM 2026](https://www.bkam.ma/fr/content/download/848156/9167307/Extrait%20de%20PV%2044%20AOO%20BKAM%202026.pdf) |

Records 3 and 6 are off-trade (solar thermal, HVAC) and are listed only because they name the company; they are not references.

### 12.2 Corrections to earlier search snippets

- **Al Omrane / 1000916:** the `481 440,00 / 550 914,00` pair is the **bid-comparison table**. The “Concurrents Retenus” table contains ALPHA PROCESS alone. HAY2010 lost.
- **Bank Al-Maghrib 90/AOO/2025:** `69 500,00` belongs to HIBA POWER’s recovery amount; HAY2010’s own recovery amount is `11 500,00`. HAY2010 lost.

### 12.3 Khemisset

- The only source is the aggregator page: [Marché 06/CPK/2024 — Province de KHEMISSET, 187 607 DH TTC, 16 bidders](https://alertemarchespublics.com/resultats/bdc-fourniture-et-pose-de-cable-d-eclairage-public-196316.html).
- The **official PV was not located** in the 2026-11-09 verification. The scan walked the portal’s global bons-de-commande register for the 15/11/2024 publication window (pages 22,960–23,100) and found only a different Khemisset contract — `19/BG/2024`, résidence du gouverneur, DAYOCLASS, 225 306,07 MAD. Pages that failed to load were skipped, so this is **“not found”, not “proven absent”**.
- It is not a verified award until the owner supplies the contract/réception or the official result is found.

### 12.4 Aggregator totals

- [Pyramide Marchés — HAY2010 SARL](https://pyramidemarches.ma/company/HAY2010%20SARL): 14 wins / 78.66 M DH / 59 participations / 26.4 % success.
- No per-project attribution. Name matching may include the radiée El Kelaâ namesake. **Never publish.**

### 12.5 Credentials

| Credential | Detail | Status |
|---|---|---|
| ONEE **EE HTA-BT** | Études des électrifications HTA-BT souterraines, BT aériennes et souterraines et bâtiment | 02/10/2023 → 30/09/2028; current |
| ONEE **HTA-BT3** | Construction des réseaux HTA-BT, sans plafond | 25/03/2026 → 31/03/2029; current |
| MHVP **4\*\*\*\*** | Certif 2051, secteur 4, sous-secteurs 4.1/4.2/4.3 | 04/03/2024 → 03/03/2026; **expired** |
| ONEE **HTA-BT0** | Branchements HTA + postes HTA/BT, ≤ 1 MDH TTC | **Not HAY2010** — belongs to HAMZA ANAS ELECTROMECANIQUE |

Sources: [ONEE approved-contractor list, p. 27](https://www.one.org.ma/fr/pages/lear.asp?esp=2&id1=7&id2=192&t1=&t2=1&action=&agrmt=&pays=&raison=&page=28); MHVP `LISTE-QUALIF-SITE-WEB-06-janvier-2025.pdf`, p. 10 (and `LISTE-QUALIF-SITE-WEB-12-decembre-2022.pdf`, p. 16), `mhpv.gov.ma`.

### 12.6 Limits of the verification

- The portal has **no company-name index**; `ExtraitPV` requires a valid `(refConsultation, orgAcronyme)` pair. Absence of awards is **unprovable**; the eight records are a sample, not a census.
- The portal throttled after ~10 requests; the “avis d’attribution” search and per-buyer award lists could not be queried.
- The ONEE list scan was partial (24 of 69 pages failed); the entry was found on page 27.
- RC 87305 and ICE 001459327000056 appear in **no** procurement document; the match is by trading name only. The owner’s inventory is the identity-proof source.

---

## 13. Handoffs

| Ticket | What it receives |
|---|---|
| [#2](https://github.com/mustaphaelou/hay2010website/issues/2) page tree | Amendment: `/realisations` is credentials-led; fallback; cards inline then list; detail pages at 3 approved named case studies; teaser threshold 3. |
| [#3](https://github.com/mustaphaelou/hay2010website/issues/3) facts register | Amendment: two current ONEE agréments (not three; HTA-BT0 is another company); MHVP expired; Khemisset official PV not found; realisations wording and permission campaign. |
| [#5](https://github.com/mustaphaelou/hay2010website/issues/5) content model | Amendment: `cover` optional for typographic cards; `evidenceReference`; `caseStudiesLive`; teaser threshold; anonymized card rules. |
| [#10](https://github.com/mustaphaelou/hay2010website/issues/10) legal | **Resolved** — permission letter, reference wording, public-record position; counsel review gate; no legal advice. |
| [#11](https://github.com/mustaphaelou/hay2010website/issues/11) SEO | Index the page; no `ItemList`/`Review` until 3 published projects. |
| [#13](https://github.com/mustaphaelou/hay2010website/issues/13) prototype | Page layout: hero, service rows, qualifications, fallback, method, CTA. |
| [#16](https://github.com/mustaphaelou/hay2010website/issues/16) launch | Inventory T-2, campaign T-3, the gates in §10. |
| [#12](https://github.com/mustaphaelou/hay2010website/issues/12) forms | The CTA is a `mailto:`; no form. The email route is covered by the contact/F-211 processing; no additional form-specific CNDP impact. |

---

## 14. Change log

| Date | Change |
|---|---|
| 2026-11-09 | Initial decision: credentials-led references page, zero-reference launch, anonymized owner-record cards, permission campaign, no per-project imagery, two ONEE agréments, evidence verification appendix. |
| 2026-11-09 | #12 clarification: the reference CTA is a `mailto:` with no form; the email route is covered by the contact/F-211 processing. |
