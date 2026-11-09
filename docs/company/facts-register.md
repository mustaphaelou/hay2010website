# HAY2010 — Publishable company facts and legal identity

**Status:** resolved 2026-11-08; amended 2026-11-09 for the mailboxes.
**Amended 2026-11-09:** the ONEE entry now lists the two current agréments, re-verified live on 2026-11-09; the réalisations fallback, reference cards and permission campaign are defined in [`docs/content/realisations-strategy.md`](../content/realisations-strategy.md) (ticket [#6](https://github.com/mustaphaelou/hay2010website/issues/6)).
**Amended 2026-11-09 (#10):** the owner approved three domain mailboxes — **`contact@hay2010.ma`** (public general contact), **`donnees@hay2010.ma`** (law 09-08 rights contact) and **`recrutement@hay2010.ma`** (careers, not public before #14). `ste.hay2010@gmail.com` becomes a private fallback and account-recovery inbox, never a published channel. The addresses are **C** only after creation and a send/receive test; see [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md) §6.
**Owner decisions:** confirmed in session on 2026-11-08, with the mailbox amendment on 2026-11-09 (both recorded in §10).
**Purpose:** the single source of truth for copy, footer, legal pages and structured data. If a fact is not in §2, it does not go on the site.

> **One-line rule:** publish only the identity block, the four launch services, the contact mailboxes, the owner-confirmed address, the gérant's name and the ONEE agréments (once both certificates are filed). Everything else stays gated.

---

## 1. Status legend and publication rule

| Code | Meaning | May it be published? |
|---|---|---|
| **O** | Official — a Moroccan government registry, regulator or public buyer source, captured on the date shown | Yes, as written |
| **C** | Confirmed — owner-confirmed in this session; where available, corroborated by an independent source; the named document is still outstanding | Yes, with the stated caveat; re-verify before launch |
| **S** | Self-declared — company marketing copy or a social profile, with no independent proof | Only as positioning, never as a legal fact, and only with the approved wording |
| **G** | Gated — not confirmed, contradicted, or no written permission | **No** — hidden from copy, footer, legal pages, metadata and structured data |

Anything not listed in §2 is **G** by default. The register is deliberately narrower than the public research, which is allowed to contain unverified leads.

---

## 2. Publishable now

### 2.1 Legal identity block

| Fact | Value to publish | Status | Source and date | Where it may appear |
|---|---|---|---|---|
| Legal name (dénomination) | **SOCIETE HAY 2010** | **O** | OMPIC DirectInfo fiche `2244319` (2026-11-08); Ministry of Justice RC search, query "HAY 2010" (2026-11-08) | Mentions légales; footer legal line; JSON-LD `legalName`; any document destined to third parties |
| Brand / wordmark | **HAY2010** | **C** | Project brief and map; owner confirmation (2026-11-08) | Logo, body copy, metadata, social handles when created |
| Legal form | **Société à responsabilité limitée (SARL)** | **O** | OMPIC fiche (2026-11-08) | Mentions légales |
| Registre du commerce | **RC 87305 — Tribunal de commerce de Rabat** | **O** | OMPIC fiche (2026-11-08); Ministry of Justice RC search (2026-11-08) | Mentions légales; JSON-LD `identifier` |
| ICE | **001459327000056** | **O** | OMPIC fiche (2026-11-08); matches the research card (2026-11-04) | Mentions légales; JSON-LD `identifier` |
| Capital social | **15 000 000 MAD** | **O** | OMPIC fiche (2026-11-08); Ministry of Justice RC search (2026-11-08); Charika (2026-11-08) | Mentions légales |
| Registered address (siège social) | **Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc** | **C** | Owner confirmation (2026-11-08); Charika card (2026-11-08); consistent with the 11/03/2026 seat-transfer event. RC extract still outstanding. | Mentions légales; footer contact block; JSON-LD `address`; contact page |
| Gérant | **Rahhal Essamlali — Gérant** | **C** | Owner confirmation (2026-11-08); LinkedIn job-poster self-declaration (2025/2026). RC extract still outstanding. **Name and title only; no photo, no quote.** | L'Entreprise (direction line). **Never** on `/mot-du-gerant` or in a testimonial block. |
| Public contact email | **contact@hay2010.ma** | **C** — owner-approved 2026-11-09; mailbox pending creation/test | Owner confirmation (2026-11-09); the legacy Gmail `ste.hay2010@gmail.com` remains a private fallback. Publish only after the send/receive test. | Footer; contact page; mentions légales; privacy policy; JSON-LD `email` |
| Website | **https://hay2010.ma** | **C** | Project domain; DNS work is [#15](https://github.com/mustaphaelou/hay2010website/issues/15) | Canonical URL, metadata, JSON-LD `url` |
| Base | **Rabat — Maroc** | **C** | Registered seat; public procurement region (Rabat-Salé-Kénitra); owner confirmation of the address | Contact page, footer, JSON-LD `address`; "Interventions au Maroc" only after the owner confirms national coverage |

**Do not publish:** the registration date (26/09/2011) as a founding claim; the "En activité" status as a marketing line; the IF; the activity wording from the registry as public copy.

### 2.2 Business facts and approved claims

| Fact / claim | Approved wording | Status | Source and date | Where |
|---|---|---|---|---|
| Experience, no founding year | **« Plus de 10 ans d'expérience »** | **C** | Owner decision (2026-11-08): no year; the legal entity was registered 26/09/2011 and the 2004 date is not defensible | Home intro, L'Entreprise, metadata description |
| Four launch services | **Éclairage public · Réseaux HTA/MT & MT/BT · Postes de transformation · CFO/CFA** | **C** | Project scope [#2](https://github.com/mustaphaelou/hay2010website/issues/2); company postings and procurement record (research 2026-11-04) | Home services band; `/metiers`; footer Métiers column; JSON-LD `knowsAbout` if used |
| ONEE agréments | **« Agréments ONEE — EE HTA-BT : études des électrifications HTA-BT souterraines, BT aériennes et souterraines et bâtiment (02/10/2023 – 30/09/2028) ; HTA-BT3 : construction des réseaux HTA-BT (sans plafond) (25/03/2026 – 31/03/2029) »** | **C** — owner-approved [#6](https://github.com/mustaphaelou/hay2010website/issues/6) 2026-11-09; certificates outstanding | ONEE approved-contractor list, entry "HAY 2010", p. 27, re-verified 2026-11-09 | L'Entreprise agréments block; `/realisations` qualifications block; `/metiers` secondary line. **Publish only after both certificates are filed in this repo.** **No ONEE agrément covers branchements HTA or postes HTA/BT for HAY 2010; never attribute the HTA-BT0 line to the company — it belongs to HAMZA ANAS ELECTROMECANIQUE.** |
| Project references | **« Références sur demande »** | **C** | Owner decision (2026-11-08): no permissions yet | `/realisations`, home references teaser, footer |
| Legal representative line | **« Gérant : Rahhal Essamlali »** | **C** | Owner confirmation (2026-11-08) | L'Entreprise only |

**Do not use:** "entreprise agréée" without naming ONEE and the scope; "certifié", "ISO", "leader", "n°1", "partenaire officiel", "depuis 2004", "depuis 2011", "créée en 2004", "plus de 20 ans".

Logo and brand assets are gated by [#4](https://github.com/mustaphaelou/hay2010website/issues/4); do not publish a logo until ownership is confirmed.

### 2.3 Contact channels

| Channel | Value | Status | Note |
|---|---|---|---|
| Public general email | **contact@hay2010.ma** | **C** — owner-approved 2026-11-09; mailbox pending | The public contact once created and tested. Replaces the Gmail in the footer, contact page, mentions légales, policy and JSON-LD. |
| Data-protection email | **donnees@hay2010.ma** | **C** — owner-approved 2026-11-09; mailbox pending | Law 09-08 rights contact; published in the policy and form notices after creation/test. Public-launch gate. |
| Recruitment email | **recrutement@hay2010.ma** | **C** — owner-approved 2026-11-09; mailbox pending; public use gated by #14 | Create now and use on staging. Publish on `/carrieres` only after the F-113 authorization covers the mailbox; until then careers uses `contact@`. |
| Gmail fallback | **ste.hay2010@gmail.com** | **C** | Private fallback and account recovery; **never publish** it on the site, legal pages, JSON-LD or metadata. If mail is forwarded to it, Google enters the policy and the F-118 scope. |
| Phone | — | **G** | Not confirmed. Omit from footer, contact page and JSON-LD. |
| LinkedIn / Facebook | — | **G** | No official account confirmed. Omit `sameAs` and social icons. |
| Contact form | — | **G** | No CNDP filing; forms stay disabled until [#14](https://github.com/mustaphaelou/hay2010website/issues/14) and [#12](https://github.com/mustaphaelou/hay2010website/issues/12). |
| Map | — | **G** | Only after the owner confirms the registered address is a public reception point. |

---

## 3. Gated facts and claims (must not appear on the site)

| Claim / fact | Why it is gated | What would unlock it |
|---|---|---|
| Founding year **2004** or "créée en 2004" | Contradicted by the 26/09/2011 registration; the 2004 RC 517 entity is a **radiée** SARL in El Kelaâ des Sraghna, not the Rabat company (OMPIC, 2026-11-08) | Documentary proof of legal continuity + owner reversal; not expected |
| Founding year **2011** or "depuis 2011" | Owner chose no year (2026-11-08); using a date reopens the 2004/2011 debate | Owner reversal |
| **RC 517** | Belongs to the radiée El Kelaâ entity (OMPIC, 2026-11-08); the Ministry of Justice RC search returns no RC 517 at Rabat | Never for this company |
| Capital **6 000 000 MAD**, **4 700 000 MAD**, **500 000 MAD** | Stale or mis-associated aggregator snapshots; 15 000 000 MAD is the official figure | Never |
| Address **M 2/4 Ribat Al Fath CYM, Rabat** | Historical seat (pre-2018 transfer) | Never, unless the RC extract shows it again |
| Address **Hay El Fath** / **174 Logement Amal 6, Hay El Fath** | Historical or directory snippets; not the current seat | Never, unless the RC extract shows it |
| **IF 6580342** | Only on a third-party card; no DGI document; not required by loi 5-96 for mentions légales | A DGI document, if it ever needs publishing |
| Generic **"entreprise agréée"** | Self-asserted; only the ONEE agréments are evidenced | Replace with the ONEE-specific wording in §2.2 |
| Other certifications / agréments | No evidence | A certificate for each claim |
| Gérant **photo, quote, biography, `/mot-du-gerant`** | Owner approved the name only (2026-11-08) | Written authorization + approved quote + photo release |
| **Client names** | No written permission | Signed client authorization |
| **Client logos** | No written permission from the client **and** the trademark owner (loi 17-97) | Both written permissions |
| **Employee photos / portraits** | No image releases | Signed authorization per person (loi 09-08) |
| **Testimonials** | No written authorization | Signed testimonial release |
| **Phone and social accounts** | Not confirmed; the owner confirmed the three mailboxes only (2026-11-09) | Owner confirmation + verification |
| **`recrutement@hay2010.ma` on the public site** | The mailbox is approved but the careers processing needs the F-113 authorization; the address must not invite CVs before #14 covers it | F-113 authorization from [#14](https://github.com/mustaphaelou/hay2010website/issues/14) |
| **`ste.hay2010@gmail.com` as a public channel** | Replaced by `contact@hay2010.ma`; kept private as a fallback | Never publish; remove after the migration |
| **CNDP receipt / authorization number** | No public entry and owner confirms no filing (2026-11-08) | CNDP receipt from [#14](https://github.com/mustaphaelou/hay2010website/issues/14) |
| **Financials, revenue, headcount, key figures** | Not verified; Charika financials are paywalled | Audited figures + owner decision |
| **"Solaire & ENR"** | Gated by [#2](https://github.com/mustaphaelou/hay2010website/issues/2); no contract evidence; 2026 job posts mention it but that is not proof | Owner confirmation of capability + proof |
| **Public procurement award (Khemisset, 187 607 DH TTC)** | The official PV was **not located** on 2026-11-09; only the aggregator page names it. The buyer is not authorized as a named reference. | The owner supplies the contract/réception (then an anonymized card is possible) **and** a written buyer permission for the name |
| **Aggregator totals (14 wins / 78.66 M DH)** | Unattributable per project; name matching includes the radiée El Kelaâ namesake | Never |
| **Losing bids, participations, technical admissibility** | Not réalisations; presenting them as wins would be false | Never |
| **MHVP 4\*\*\*\* qualification after 03/03/2026** | Renewed 04/03/2024–03/03/2026; expired; no later list found | A later renewal certificate |
| **"Références sur demande" replaced by a client list** | No permissions | Signed permissions |

---

## 4. Conflicts in the public research — resolved

### 4.1 RC number: 517 vs 87305

**Resolved: 87305 only.**

- OMPIC DirectInfo search for "HAY 2010" returns two distinct records:
  - **SOCIETE HAY 2010 — RC 87305 — RABAT — EN ACTIVITE** — activity "NEGOCIANT, MD EFFECTUANT IMPORTATION EXPORTATION, ENTREPRENEUR DE TRAVAUX DIVERS ET ENTREPRENEUR ELECTRIQUES."
  - **SOCIETE HAY 2010 — RC 517 — KALAA-SRAGHNA — RADIEE** — the 2004 El Kelaâ des Sraghna entity.
- The Ministry of Justice RC search at the Tribunal de commerce de Rabat:
  - query "HAY 2010" → RC **87305**, SARL, capital **15 000 000**, status **Valide**;
  - query "SOCIETE HAY 2010" → no record (the tribunal indexes the short denomination);
  - query RC **517** at Rabat → no record.
- Therefore the research's "RC 517 Rabat" card is a mis-associated aggregator record. It must never appear on the site.

### 4.2 Capital: 15M vs 6M vs 500k vs 4.7M

**Resolved: 15 000 000 MAD.**

- OMPIC fiche and the Ministry of Justice RC search both show **15 000 000 MAD** and status **Valide** (2026-11-08).
- 6 000 000 MAD belongs to the second Welipro card, which is not the active Rabat record; 500 000 MAD is the 2004 El Kelaâ entity; 4 700 000 MAD was a stale brief figure with no live source.

### 4.3 Founding year: 2004 vs 2011

**Resolved for publication: no year; use "Plus de 10 ans d'expérience".**

- The current legal entity was registered on **26/09/2011** (OMPIC, 2026-11-08). The 2004 date belongs to a **radiée** SARL registered in El Kelaâ des Sraghna, and public sources do not establish legal continuity.
- The company's job posts say "créée en 2004" (2022–2026), but that is a self-description, not a registry fact.
- Owner decision: do not publish either year; use the neutral experience line. This is accurate under either reading.

### 4.4 Legal name: "SOCIETE HAY 2010" vs "HAY 2010" vs "HAY2010 SARL"

**Resolved:**

- **OMPIC legal name:** `SOCIETE HAY 2010`.
- **Ministry of Justice search denomination:** `HAY 2010` (short form).
- **Brand:** `HAY2010`.
- **Rule:** legal pages and the footer legal line use `SOCIETE HAY 2010`; body copy and the logo use `HAY2010`; never use "SOCIÉTÉ HAY 2010" with an accent or "HAY 2010 SARL" as the dénomination.

### 4.5 Registered address: three variants

**Resolved for publication (owner-confirmed, not yet registry-verified):**

`Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc`

- The 09/05/2018 and 11/03/2026 "transfert du siège social" events explain the variants. "M 2/4 Ribat Al Fath CYM" and "Hay El Fath" are historical.
- The owner selected the Charika address on 2026-11-08. The RC extract remains the final check; if it differs, the legal pages and footer must be updated before launch.

### 4.6 Gérant: LinkedIn self-declaration

**Resolved for publication (name only):**

`Rahhal Essamlali — Gérant`

- Owner confirmed the name and chose **name only** (no photo, no quote, no dedicated page).
- The 28/04/2025 "cession de parts" means the mandate should still be re-verified on the RC extract. If the extract names someone else, the L'Entreprise line must change before launch.

### 4.7 "Entreprise agréée"

**Resolved: replace the generic claim with the ONEE-specific agréments.**

- The 2025/2026 job posts say "entreprise agréée" with no authority named. That is self-asserted.
- ONEE's approved-contractor list shows **HAY 2010** for **two** agréments (re-verified live on 2026-11-09, page 27):
  - **EE HTA-BT** — études des électrifications HTA-BT souterraines, BT aériennes et souterraines et bâtiment, valid **02/10/2023 – 30/09/2028**;
  - **HTA-BT3** — construction des réseaux HTA-BT (sans plafond), valid **25/03/2026 – 31/03/2029**.
- The adjacent **HTA-BT0** line (branchements HTA et postes HTA/BT) belongs to **HAMZA ANAS ELECTROMECANIQUE**, not HAY 2010; never attribute it.
- The owner approved publishing **ONEE only**, with **both certificates** to be filed. No other agrément or certification may be named.

---

## 5. Approved French copy

### 5.1 Mentions légales — identity block

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

Do **not** add a CNDP receipt line until [#14](https://github.com/mustaphaelou/hay2010website/issues/14) provides one. Do not add a publication director or a phone number; neither is required by loi 5-96 and neither is confirmed. The hosting provider is not a mentions légales requirement in Morocco, but it must be named as a processor in the privacy policy ([#10](https://github.com/mustaphaelou/hay2010website/issues/10)). The exact legal prose and publication gates are in [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md) §4.

### 5.2 Footer

- **Legal line:** `© 2026 SOCIETE HAY 2010 — Tous droits réservés`
- **Contact block:** `Rabat — Maroc` · `contact@hay2010.ma`
- **No** phone, Gmail, recruitment email, social icons, client logos or newsletter.
- Footer columns from [#2](https://github.com/mustaphaelou/hay2010website/issues/2) otherwise stand.

### 5.3 L'Entreprise

- Positioning line: `Depuis plus de 10 ans, HAY2010 accompagne les collectivités et les entreprises dans leurs projets d'éclairage public et d'électrification.`
- Direction line: `Gérant : Rahhal Essamlali`
- Agréments block: publish only after **both** ONEE certificates are filed, using the exact §2.2 wording:
  `Agréments ONEE — EE HTA-BT : études des électrifications HTA-BT souterraines, BT aériennes et souterraines et bâtiment (02/10/2023 – 30/09/2028) ; HTA-BT3 : construction des réseaux HTA-BT (sans plafond) (25/03/2026 – 31/03/2029)`
- Do not add a `Mot du gérant` link or page.

### 5.4 Réalisations

- **Page shape:** credentials-led references page, not a portfolio. Full strategy: [`docs/content/realisations-strategy.md`](../content/realisations-strategy.md).
- **Launch fallback:** `Références sur demande.` — no project cards are required for launch.
- **Qualifications block:** the two ONEE agréments in §2.2, only when `agrementLive` is true and both certificates are filed. No HTA-BT0 line; no ONEE claim over branchements or postes.
- **Reference cards:** anonymized by default (service, object, region, year, one-line scope); no buyer, logo, photo, amount, testimonial or detail link. Named cards only with the permissions in §6. Cards are built from the owner's contract file, never from public-procurement participations.
- **Method block:** `De l’étude à la réception`, delivery prose, no certification claim.
- **Never on the page:** losing bids, participations, aggregator totals, the expired MHVP qualification, stock or AI imagery, client logos without permission.
- **Detail pages:** `/realisations/[slug]` only after three approved named case studies with rights-cleared photos.
- **Imagery:** no per-project images until rights-cleared; typographic cards; typographic hero or a rights-cleared documentary photo.

### 5.5 JSON-LD Organization (handoff to #11)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "HAY2010",
  "legalName": "SOCIETE HAY 2010",
  "url": "https://hay2010.ma",
  "email": "contact@hay2010.ma",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Local N° 21, Hay El Manzeh, Hay Er-Riad",
    "addressLocality": "Rabat",
    "addressCountry": "MA"
  },
  "identifier": [
    { "@type": "PropertyValue", "name": "RC", "value": "87305" },
    { "@type": "PropertyValue", "name": "ICE", "value": "001459327000056" }
  ]
}
```

**Omit:** `foundingDate`, `telephone`, `sameAs`, `logo`, `numberOfEmployees`, `awards`. They are gated by §3. Add `sameAs` only after official social accounts are confirmed.

---

## 6. Permissions register

| Asset / person / client | Permission required | Status (2026-11-08) | Evidence on file | Publishable? |
|---|---|---|---|---|
| Client names | Written client authorization | **None** | — | No |
| Client logos | Client authorization + trademark owner permission (loi 17-97 arts. 154/201) | **None** | — | No |
| Employee photos / portraits | Specific written authorization (loi 09-08 art. 1) | **None** | — | No |
| Testimonials | Written authorization | **None** | — | No |
| Gérant photo / quote | Written authorization | **None** (name only) | Owner decision 2026-11-08 | No |
| ONEE certificates (EE HTA-BT, HTA-BT3) | Company documents | **Approved; certificates promised** | Owner decision 2026-11-08; ONEE list re-verified 2026-11-09 | After filing both |
| Company logo | Ownership confirmation | **Gated** | [#4](https://github.com/mustaphaelou/hay2010website/issues/4) | After #4 |
| Hero / site photography | Licence or company ownership; releases for people | **Gated** | [#4](https://github.com/mustaphaelou/hay2010website/issues/4) | After #4 |
| Public procurement award (Khemisset) | Buyer permission to be named | **None** | Public result page | Only as internal evidence; not a named reference |

The fallback for every "No" is **`Références sur demande`**, with no logos and no people.

---

## 7. CNDP and data-protection position

- **Public register check:** `https://rn-pdp.cndp.ma/fr/list/1.html` was searched on 2026-11-08 for `HAY 2010`, `HAY2010`, `SOCIETE HAY 2010` and `SOCIETE HAY`. It returned **no record** for the company. The register itself works: a control query for `LAMALIF GROUP` returned several declarations/authorizations.
- **Owner confirmation:** no CNDP filing or receipt exists for the current site, contact processing or recruitment (2026-11-08).
- **Consequence:** no receipt number may be published. The privacy policy must not claim a filing. Contact forms and CV uploads stay disabled until [#14](https://github.com/mustaphaelou/hay2010website/issues/14) files the declarations/authorizations and issues the receipt. Analytics is off at launch; the cookieless Cloudflare Web Analytics beacon waits for the F-214.
- **Data controller:** `SOCIETE HAY 2010`, registered address above. Public contact: `contact@hay2010.ma`; rights contact: `donnees@hay2010.ma`. Both mailboxes are owner-approved (2026-11-09) but must be created and tested before publication; the Gmail is a private fallback. Careers uses `recrutement@hay2010.ma` only after #14 covers it.
- **Legal/analytics decision:** [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md) — no analytics at launch, Cloudflare Web Analytics after F-214, no banner, the two legal pages, retention 12/6/12/6/6 and the mailbox gates.
- **Handoff:** the filing plan is [#14](https://github.com/mustaphaelou/hay2010website/issues/14); the form behaviour is [#12](https://github.com/mustaphaelou/hay2010website/issues/12); the legal copy is [#10](https://github.com/mustaphaelou/hay2010website/issues/10). See the legal research note on branch `research/hay2010-legal-consent` for the F-211/F-214, F-113 and F-118 requirements.

---

## 8. What the owner still needs to do

| # | Action | Unlocks | Owner decision |
|---|---|---|---|
| 1 | Send the **RC extract (modèle 7)** or the OMPIC detailed legal sheet; verify the address and gérant | Final confirmation of §2.1; correct legal pages if either differs | Pending |
| 2 | Send **both ONEE certificates** (EE HTA-BT, HTA-BT3) | Publication of the ONEE agréments block | Approved, documents pending |
| 3 | Confirm a **phone** and any **official social accounts**, or confirm they should be omitted permanently; the three mailboxes are approved | Footer/contact page/JSON-LD additions | Phone/social omitted for now; mailboxes approved 2026-11-09 |
| 4 | Create and send/receive-test **`contact@`, `donnees@` and `recrutement@`** in the HeberjaHiz cPanel; publish `contact@`/`donnees@` after the test; hold `recrutement@` until #14; then file the CNDP declarations | Footer, contact page, legal pages, JSON-LD, forms, CVs, privacy policy receipt line | Owner action; [#14](https://github.com/mustaphaelou/hay2010website/issues/14) |
| 5 | Collect **written permissions** for any client name/logo, employee photo or testimonial | Réalisations and Médias content | None yet; fallback stands |
| 6 | Confirm whether **Solaire & ENR** is a real service line, with proof | `/metiers#solaire`, home card, nav | Gated |
| 7 | Confirm **logo ownership** and supply brand assets | Header, footer, metadata | [#4](https://github.com/mustaphaelou/hay2010website/issues/4) |
| 8 | Send the **internal project inventory** (object, buyer, place, year, amount, contract/réception reference, permission contact) | Réalisations cards and the permission campaign | [#6](https://github.com/mustaphaelou/hay2010website/issues/6) |
| 9 | Check for an **MHVP renewal after 03/03/2026** | Publication of the 4\*\*\*\* qualification, if renewed | Pending |

---

## 9. Handoffs

| Ticket | What it receives from this register |
|---|---|
| [#1](https://github.com/mustaphaelou/hay2010website/issues/1) page tree | **Amendment:** footer contact column is `contact@hay2010.ma` + "Rabat — Maroc" only; no phone, Gmail, recruitment email or social icons. `Mot du gérant` stays hidden (name only, no page). Médias stays hidden. |
| [#4](https://github.com/mustaphaelou/hay2010website/issues/4) brand | Logo ownership/asset; no people photos without releases; no client logos. |
| [#5](https://github.com/mustaphaelou/hay2010website/issues/5) content model | The facts module/source of truth; editors may not add gated facts. Suggested fields: legal identity, contact channels, gated claims, permission status. |
| [#6](https://github.com/mustaphaelou/hay2010website/issues/6) réalisations | Credentials-led page; the two ONEE agréments; `Références sur demande`; owner inventory and permission campaign; no public-record cards. Full strategy: [`docs/content/realisations-strategy.md`](../content/realisations-strategy.md). |
| [#10](https://github.com/mustaphaelou/hay2010website/issues/10) legal pages | **Resolved** — [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md): exact mentions légales block; privacy policy; no CNDP receipt; no phone; no publication director; host only as a processor; three mailboxes. |
| [#11](https://github.com/mustaphaelou/hay2010website/issues/11) SEO/JSON-LD | The Organization object in §5.5 with `email: contact@hay2010.ma`; omit `foundingDate`, `telephone`, `sameAs`, `logo`; do not publish `donnees@` or `recrutement@` in metadata. |
| [#12](https://github.com/mustaphaelou/hay2010website/issues/12) forms | No CNDP filing; no CV upload; `contact@` for the contact form and `recrutement@` for careers only after #14; `donnees@` as rights contact; notices in the #10 decision §4.5. |
| [#14](https://github.com/mustaphaelou/hay2010website/issues/14) CNDP | No existing filing; controller identity; the three mailboxes; the 12/6/12/6/6 retention schedule; F-211/F-113/F-214/F-118 scope; file before any public collection. |
| [#15](https://github.com/mustaphaelou/hay2010website/issues/15) DNS | Canonical URL `https://hay2010.ma`; the domain carries `contact@`, `donnees@` and `recrutement@`, so keep MX/SPF/DKIM/autodiscover when fixing delegation and re-test all three mailboxes after the change. |

---

## 10. Source log

| Source | URL / reference | Retrieved | Proves |
|---|---|---|---|
| OMPIC DirectInfo — company fiche | https://www.directinfo.ma/fiche-detail/2244319/SOCIETE-HAY-2010 | 2026-11-08 | Dénomination, RC 87305, ICE, SARL, 26/09/2011, 15 000 000 MAD, active status, activity |
| OMPIC DirectInfo — search | https://www.directinfo.ma/resultat-search-mot-cle (query "HAY 2010") | 2026-11-08 | RC 87305 Rabat active vs RC 517 Kalaa-Sraghna **radiée** |
| Ministry of Justice — online documents portal | https://servicesenligne.justice.gov.ma/ → Nouvelle demande → Registre de commerce → Modèle 7 → Tribunal de commerce Rabat → search "HAY 2010" | 2026-11-08 | RC 87305, SARL, 15 000 000 MAD, **Valide**; "SOCIETE HAY 2010" and RC 517 return no record |
| Charika (Inforisk) — company card | https://www.charika.ma/societe-hay-2010-144738 | 2026-11-08 | Address "Local N° 21, Hay El Manzeh, Hay Er-Riad", capital 15 000 000 DHS, email, legal events (2015/2016/2018/2025/2026) |
| ONEE — approved contractors list | https://www.one.org.ma/fr/pages/lear.asp?esp=2&id1=7&id2=192&t1=&t2=1&action=&agrmt=&pays=&raison=&page=27 | 2026-11-09 (live page, entry "HAY 2010", p. 27) | HAY 2010 — EE HTA-BT (02/10/2023 → 30/09/2028) and HTA-BT3 (25/03/2026 → 31/03/2029), both current; the adjacent HTA-BT0 line belongs to HAMZA ANAS ELECTROMECANIQUE |
| CNDP national register | https://rn-pdp.cndp.ma/fr/list/1.html | 2026-11-08 | No record for HAY 2010 / SOCIETE HAY 2010; control query LAMALIF GROUP returns records |
| Alertemarchéspublics — Khemisset award | https://alertemarchespublics.com/societes/hay2010-sarl.html | 2026-11-04 (research) | Public procurement record; not a naming permission |
| LinkedIn job 4126129601 | https://www.linkedin.com/jobs/view/4126129601/ | 2026-11-04 (research) | Rahhal Essamlali self-described "Gérant de la ste Hay2010 Sarl" |
| LinkedIn job 4481173694 | https://ma.linkedin.com/jobs/view/4481173694 | 2026-11-04 (research) | `recrutement@hay2010.ma` in the company's own post; the address was owner-approved on 2026-11-09, with public use gated by #14 |
| Legal research note | `docs/research/hay2010-legal-consent.md` on branch `research/hay2010-legal-consent` | 2026-11-08 | Loi 5-96 art. 45 fields; CNDP F-211/F-214/F-113/F-118; image/logo permissions |
| Owner confirmations | This session | 2026-11-08 | Address, gérant name-only, no founding year, ONEE-only, no CNDP filing, no permissions |
| Owner mailbox decision | This session ([#10](https://github.com/mustaphaelou/hay2010website/issues/10)) | 2026-11-09 | `contact@`, `donnees@`, `recrutement@`; Gmail private fallback; owner provisions in cPanel; `recrutement@` public after #14 |
| Legal/analytics decision | [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md) | 2026-11-09 | No analytics at launch; Cloudflare Web Analytics after F-214; no banner; two legal pages; retention 12/6/12/6/6; forms/CV gated |

**Owner decisions (2026-11-08, verbatim summary; mailbox amendment 2026-11-09):**

- Address: `Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat`.
- Gérant: `Rahhal Essamlali — name only, no photo/quote`.
- Founding: `no year — "plus de 10 ans d'expérience"`.
- Certifications: `ONEE only — both certificates to be sent` (amended 2026-11-09: EE HTA-BT and HTA-BT3).
- Contact: `only ste.hay2010@gmail.com for now` (superseded 2026-11-09: `contact@hay2010.ma` public, `donnees@hay2010.ma` rights, `recrutement@hay2010.ma` careers after #14; Gmail private fallback).
- CNDP: `no filing — plan the filings in #14`.
- Permissions: `none yet — use the fallback`.
- Mailboxes: `contact@ + donnees@ + recrutement@; owner creates in cPanel; Gmail fallback`.
- Analytics/legal: `no analytics at launch; Cloudflare Web Analytics after F-214; no banner; two legal pages; one-off counsel review`.

**Evidence images:** `docs/company/evidence/ompic-directinfo-2026-11-08.png` and `docs/company/evidence/justice-rc-search-2026-11-08.png`.

---

## 11. Re-verification checklist before launch

- [ ] RC extract or OMPIC detailed sheet confirms the address and the current gérant. If either differs, update §2.1, §5.1, §5.3 and §5.5 before launch.
- [ ] Both ONEE certificates filed; the agrément block matches each certificate's scope and dates.
- [ ] No "depuis 2004" or "depuis 2011" anywhere in the copy, metadata or structured data.
- [ ] No RC 517, no 6M/4.7M/500k capital, no old address, no IF.
- [ ] No client names/logos, employee photos or testimonials without a signed permission in this register.
- [ ] No phone or social links unless confirmed after 2026-11-09.
- [ ] `contact@` and `donnees@` created, send/receive-tested, and published; `recrutement@` published only after #14; the Gmail is not on the site, legal pages, JSON-LD or metadata.
- [ ] No CNDP receipt number until #14 issues one; forms disabled until then; `recrutement@` does not invite CVs before F-113.
- [ ] Footer legal line and mentions légales use `SOCIETE HAY 2010`; body copy uses `HAY2010`; the footer contact is `contact@hay2010.ma`.
- [ ] JSON-LD has `email: contact@hay2010.ma` and no `foundingDate`, `telephone`, `sameAs` or `logo`.
- [ ] Legal pages match [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md): no publication director, no phone, no host line, no blank CNDP number.
- [ ] No losing bid, participation, aggregator total or expired MHVP qualification is presented as a reference.
- [ ] Both ONEE agréments match the filed certificates; no HTA-BT0 line is attributed to HAY 2010.
- [ ] No reference card without an `evidenceReference`; no named card without a signed permission.
