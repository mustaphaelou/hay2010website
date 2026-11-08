# Establish the publishable company facts and legal identity

Type: task
Status: resolved
Blocked by: none

## Question

Which company facts may the site publish, and what is the authoritative source for each?

The public research (`docs/research/hay2010-company-activity-and-careers.md`) conflicts on several facts: founding year (2004 self-described vs 2011 Rabat registration), RC number (517 vs 87305), capital (15M vs 6M MAD), registered address (three variants), and the gérant's identity (only self-declared on LinkedIn). The "entreprise agréée" claim is also self-asserted.

This ticket is the manual work that must happen before the copy, footer and legal pages can be written:

- Obtain an official RC extract (modèle J) or an equivalent recent company document.
- Confirm the legal name, founding year, RC, ICE, IF, capital and current registered address.
- Confirm the gérant's name and whether a "mot du gérant" may be published, with photo and quote.
- Confirm which certifications/agréments may be claimed, with proof.
- Confirm canonical contact details: phone, contact email, recruitment email, social accounts.
- List client references we may name publicly, with written permission.
- Confirm written authorizations for employee photos, client logos and testimonials; client logos also need the trademark owner's permission.
- Confirm the data-controller contact and whether any CNDP filing/receipt already exists for the WordPress site.

Record each confirmed fact with its source and date in the answer. Anything not confirmed stays out of the site.

## Answer

Resolved 2026-11-08 by an evidence session with the owner. The full register, approved French copy, permissions register and source log are in [`docs/company/facts-register.md`](../../../docs/company/facts-register.md). Evidence screenshots: [`docs/company/evidence/`](../../../docs/company/evidence/).

**Official identity — confirmed, publishable**

| Fact | Value | Source (date) |
|---|---|---|
| Legal name | **SOCIETE HAY 2010** | OMPIC DirectInfo fiche 2244319 (2026-11-08); Ministry of Justice RC search (2026-11-08) |
| Legal form | **SARL** | OMPIC (2026-11-08) |
| RC | **87305 — Tribunal de commerce de Rabat** | OMPIC and Ministry of Justice (2026-11-08) |
| ICE | **001459327000056** | OMPIC (2026-11-08) |
| Capital | **15 000 000 MAD** | OMPIC and Ministry of Justice (2026-11-08) |
| Registration date | **26/09/2011** (internal reference; not a public founding claim) | OMPIC (2026-11-08) |
| Status | **En activité** | OMPIC (2026-11-08) |
| Registered address | **Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc** | Owner confirmation + Charika (2026-11-08); RC extract still outstanding |
| Gérant | **Rahhal Essamlali** — name and title only | Owner confirmation (2026-11-08); LinkedIn self-declaration (2025/2026); RC extract still outstanding |
| Public email | **ste.hay2010@gmail.com** | Owner confirmation + Charika (2026-11-08) |
| Domain | **https://hay2010.ma** | Project; DNS is #15 |
| ONEE agrément | **EE HTA-BT — études des électrifications HTA-BT souterraines, BT aériennes et souterraines et bâtiment — 02/10/2023 → 30/09/2028** | ONEE approved-contractor list (2026-11-08); owner approved; certificate to be filed |

**Conflicts resolved**

- **RC 517 vs 87305:** 87305 is the active Rabat company. RC 517 belongs to the **radiée** SARL in El Kelaâ des Sraghna (OMPIC, 2026-11-08); the Ministry of Justice search finds no RC 517 at Rabat. Never publish 517.
- **Capital:** 15 000 000 MAD is official. 6M, 4.7M and 500k are stale or belong to other records/entities.
- **Founding year:** the legal entity was registered 26/09/2011; the 2004 date belongs to the radiée El Kelaâ entity and continuity is unproven. Owner decision: **no year**; use **« Plus de 10 ans d'expérience »**.
- **Legal name:** `SOCIETE HAY 2010` in legal pages and the footer legal line; `HAY2010` as the brand. No accent, no "HAY 2010 SARL" as the dénomination.
- **Address:** the owner confirmed the Charika address; the Ribat Al Fath and Hay El Fath variants are historical. The RC extract is the final check.
- **Gérant:** the owner confirmed Rahhal Essamlali and approved **name only** — no photo, no quote, no `/mot-du-gerant` page.
- **"Entreprise agréée":** replace the generic self-claim with the ONEE-specific agrément above; no other certification may be named.

**What stays out of the site**

- Founding year 2004 or 2011; "créée en 2004"; "depuis 2004"/"depuis 2011".
- RC 517, the 6M/4.7M/500k capital figures, the old addresses.
- **IF 6580342** — it appears only on a third-party card (Welipro); no DGI document was obtained, and loi 5-96 does not require it in the mentions légales. It stays out unless the owner supplies a DGI document and a reason to publish it.
- Generic "entreprise agréée" and any certification other than ONEE (until the certificate is filed).
- The gérant's photo, quote or biography; any `/mot-du-gerant` page.
- Client names, client logos, employee photos and testimonials — **no written permissions exist** (owner, 2026-11-08). Use **« Références sur demande »**.
- Phone, recruitment email and social accounts — the owner confirmed **only** `ste.hay2010@gmail.com`. `recrutement@hay2010.ma` appears in the company's own LinkedIn post but is not confirmed for publication.
- Any CNDP receipt/authorization number. The CNDP public register has **no record** for HAY 2010/SOCIETE HAY 2010 (2026-11-08), and the owner confirms no filing exists. Forms, CV uploads and analytics stay disabled until #14.
- Financials, headcount, revenue and "leader"/"n°1" claims.
- "Solaire & ENR" — still gated by #2.

**Approved French copy**

- Footer legal line: `© 2026 SOCIETE HAY 2010 — Tous droits réservés`
- Mentions légales: legal name, SARL, capital 15 000 000 MAD, registered address, RC 87305 — Tribunal de commerce de Rabat, ICE 001459327000056, contact email.
- L'Entreprise: `Depuis plus de 10 ans, HAY2010 accompagne les collectivités et les entreprises dans leurs projets d'éclairage public et d'électrification.` + `Gérant : Rahhal Essamlali`.
- JSON-LD: Organization with `name`, `legalName`, `url`, `email`, `address`, `identifier` (RC, ICE); **omit** `foundingDate`, `telephone`, `sameAs`, `logo`.

**Handed to other tickets**

- #1: footer amendment — email and "Rabat — Maroc" only; no phone/recruitment email/social icons; `Mot du gérant` stays hidden.
- #4: logo ownership and all imagery; no people photos without releases, no client logos.
- #5: facts module/source of truth; authors may not add gated facts.
- #6: no client permissions; fallback `Références sur demande`; the Khemisset award is internal evidence only.
- #10: exact mentions légales block; no CNDP receipt; no phone; no publication director/host.
- #11: the Organization JSON-LD above.
- #12: no CNDP filing; no CV upload; careers applications to `ste.hay2010@gmail.com`.
- #14: no existing filing; file F-211/F-214 (contact), F-113 (HR) and F-118 (US transfers) before collecting data.
- #15: keep MX records for hay2010.ma when fixing DNS.

**Before launch**

1. File the RC extract or OMPIC detailed sheet and re-check the address and gérant; update the legal pages if either differs.
2. File the ONEE certificate; only then publish the agrément block.
3. Keep the gated list in the register enforced in the content model.
4. Get the CNDP receipts from #14 before enabling any form or CV upload.

The register is the source of truth; this answer is the summary. Anything not confirmed above stays out.
