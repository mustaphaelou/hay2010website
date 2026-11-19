# HAY2010 — CNDP filings and launch compliance plan

**Status:** Plan — 2026-11-09.
**Resolves:** GitHub [#14](https://github.com/mustaphaelou/hay2010website/issues/14).
**Depends on:** [#3](https://github.com/mustaphaelou/hay2010website/issues/3) company facts and RC extract; [#8](https://github.com/mustaphaelou/hay2010website/issues/8) hosting and VPS; [#10](https://github.com/mustaphaelou/hay2010website/issues/10) legal pages, retention and counsel; [#12](https://github.com/mustaphaelou/hay2010website/issues/12) forms and mailboxes; [#15](https://github.com/mustaphaelou/hay2010website/issues/15) DNS and mail; [#16](https://github.com/mustaphaelou/hay2010website/issues/16) public launch.
**Sources:** legal research note on branch `research/hay2010-legal-consent` (2026-11-08); [`docs/legal/analytics-consent-legal-pages.md`](analytics-consent-legal-pages.md) (#10); [`docs/forms/contact-careers-forms.md`](../forms/contact-careers-forms.md) (#12); [`docs/company/facts-register.md`](../company/facts-register.md) (#3); CNDP notification procedures and declaration forms, retrieved 2026-11-09.
**Not legal advice.** This plan turns the legal research into an owned checklist. The consent reading, the retention periods, the transfer coverage and the final wording need the counsel review in §10 before launch.

---

## 1. Answer

**What must be filed before launch?** Four formalities, three of which are launch gates:

| Filing                                     | Regime                           | Launch gate?                                                                                          |
| ------------------------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **F-211** contact declaration              | Prior declaration, art. 12(2)    | **Yes** — before any public contact collection, by email or by form                                   |
| **F-113** HR authorization (D-298-AU-2014) | Prior authorization              | **Yes, if `/carrieres` invites CVs**; otherwise the careers route stays closed                        |
| **F-118** transfer authorization           | Prior authorization, arts. 43–44 | **Yes** — before public launch, because Cloudflare (US) processes every visitor                       |
| **F-214** cookies/analytics (D-939-2025)   | Simplified declaration           | **No** — only when Cloudflare Web Analytics is enabled; not required for the no-cookie Turnstile form |
| **D-940-2025** newsletter                  | Simplified declaration           | **No** — there is no newsletter                                                                       |

**Who owns each filing?** HAY2010 is the _responsable du traitement_ and must file. Practically: the **owner** (Mustapha Elouardi, on behalf of SOCIETE HAY 2010) signs and submits; the **developer** prepares the technical annexes (processors, retention, security, rights procedure, notice wording); **counsel** reviews the filing package and the legal pages before submission and launch. The receipt or authorization is issued to the company, not to the developer.

**What is the fallback if an authorization is late?** No public collection of personal data without the corresponding filing. The feature is cut, not the compliance: no `contact@` publication, no form, no CV invitation, no analytics, or no public launch. The mapping is in §6.

**Status:** the CNDP public register has no record for HAY2010 (checked 2026-11-08) and the owner confirms no filing. Every date and receipt/authorization number in §2 is blank until the CNDP issues it. **No number may be invented, copied from another company, or shown as a placeholder on the public site.**

---

## 2. Filing register

### 2.1 Register

| Filing              | Form / model                    | Scope                                                                                                                                                                     | Regime                           | Owner (filer)            | Date filed | Receipt / authorization n° | Status                     |
| ------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------ | ---------- | -------------------------- | -------------------------- |
| Contact / quote     | **F-211** (déclaration normale) | Contact and quote requests by email and optional form; `contact@`, `no-reply@` as sender, `donnees@`; server logs and security; processors HeberjaHiz, Cloudflare, VPS    | Prior declaration, art. 12(2)    | SOCIETE HAY 2010 — owner | `[●]`      | `[●]`                      | **Not filed** (2026-11-09) |
| Recruitment / CVs   | **F-113** (D-298-AU-2014)       | Careers and CVs by email; `recrutement@`; 6/12-month retention; candidate consent document; the existing LinkedIn use of `recrutement@`; no application form or CV upload | Prior authorization              | SOCIETE HAY 2010 — owner | `[●]`      | `[●]`                      | **Not filed** (2026-11-09) |
| Cookies / analytics | **F-214** (D-939-2025)          | Cloudflare Web Analytics, cookieless, six-month retention; any future non-essential cookie                                                                                | Simplified declaration           | SOCIETE HAY 2010 — owner | `[●]`      | `[●]`                      | **Not filed; conditional** |
| Transfers abroad    | **F-118**                       | Cloudflare/R2/Turnstile (US); VPS if outside Morocco; Google only if used or forwarded                                                                                    | Prior authorization, arts. 43–44 | SOCIETE HAY 2010 — owner | `[●]`      | `[●]`                      | **Not filed** (2026-11-09) |
| Newsletter          | D-940-2025                      | None                                                                                                                                                                      | Simplified declaration           | —                        | —          | —                          | **Not applicable**         |

### 2.2 Required annexes

Verified against the CNDP notification procedures on 2026-11-09. An incomplete dossier is rejected and the 24-hour clock restarts when the missing items arrive.

| Filing    | Annexes                                                                                                                                                                                        | Prepared by                                                        | Evidence                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **F-211** | Consent document or other legal basis; information notice; subcontracting contracts with confidentiality clauses where applicable; proof of signing authority                                  | Developer drafts; owner signs                                      | Notice text from [#10 §4.5](analytics-consent-legal-pages.md); consent checkbox from [#12](../forms/contact-careers-forms.md) |
| **F-113** | Employment contract template with a data-protection clause; candidate/stagiaire consent document with the art. 5 clauses; subcontracting contract where applicable; proof of signing authority | Developer drafts; owner signs; counsel reviews the consent wording | Candidate consent document; careers notice from [#10 §4.5](analytics-consent-legal-pages.md)                                  |
| **F-214** | Consent document or other legal basis; information notice; subcontracting contract where applicable; proof of signing authority                                                                | Developer drafts; owner signs                                      | Cookie section of the policy; Cloudflare Web Analytics configuration                                                          |
| **F-118** | Art. 44 basis for each non-adequate destination (express consent, binding corporate rules, or contractual clauses); base filing references                                                     | Developer drafts; owner signs                                      | Cloudflare DPA/self-serve terms; VPS hosting agreement; Google terms if used                                                  |

The CNDP states that the fields marked `*` on the forms are reproduced in the receipt. The declared purposes, recipients, retention and transfers must therefore match the privacy policy and the notices **exactly**. Three different versions of the same processing is how art. 55 over-retention and art. 54 purpose-diversion cases start.

### 2.3 Filing tracker

Update this table as each step completes. Do not publish a receipt number before the CNDP issues it.

| Filing | Form downloaded | Dossier prepared | Counsel review | Submitted | Date filed | Receipt / authorization n° | Register entry verified | Policy / notice updated | Owner sign-off |
| ------ | --------------- | ---------------- | -------------- | --------- | ---------- | -------------------------- | ----------------------- | ----------------------- | -------------- |
| F-211  | [ ]             | [ ]              | [ ]            | [ ]       | `[●]`      | `[●]`                      | [ ]                     | [ ]                     | [ ]            |
| F-113  | [ ]             | [ ]              | [ ]            | [ ]       | `[●]`      | `[●]`                      | [ ]                     | [ ]                     | [ ]            |
| F-214  | [ ]             | [ ]              | [ ]            | [ ]       | `[●]`      | `[●]`                      | [ ]                     | [ ]                     | [ ]            |
| F-118  | [ ]             | [ ]              | [ ]            | [ ]       | `[●]`      | `[●]`                      | [ ]                     | [ ]                     | [ ]            |

---

## 3. Sequence and dependencies

| Step | Filing / action                                                                                                                                                                              | Depends on                                                                                                                                                                                                                                                                                                                      | Expected delay                                                                    | Owner             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------- |
| 0    | Preconditions: RC extract, controller identity, mailbox tests, VPS country, processor list, retention table, rights procedure, notice texts, candidate consent document, processor contracts | [#3](https://github.com/mustaphaelou/hay2010website/issues/3), [#8](https://github.com/mustaphaelou/hay2010website/issues/8), [#10](https://github.com/mustaphaelou/hay2010website/issues/10), [#12](https://github.com/mustaphaelou/hay2010website/issues/12), [#15](https://github.com/mustaphaelou/hay2010website/issues/15) | —                                                                                 | Owner + developer |
| 1    | **F-211** contact declaration                                                                                                                                                                | Step 0                                                                                                                                                                                                                                                                                                                          | 24-hour receipt once the dossier is complete; 8-day reclassification window       | Owner             |
| 2    | **F-113** HR authorization                                                                                                                                                                   | Step 0 + candidate consent document                                                                                                                                                                                                                                                                                             | Authorization, not a 24-hour receipt; start first, in parallel with F-211         | Owner             |
| 3    | **F-118** transfer authorization                                                                                                                                                             | F-211 (and F-113 if careers is in scope) approved                                                                                                                                                                                                                                                                               | The CNDP examines transfers only after the base processing is declared/authorized | Owner             |
| 4    | **F-214** cookies/analytics                                                                                                                                                                  | Only when analytics is enabled                                                                                                                                                                                                                                                                                                  | Simplified declaration; not a launch dependency                                   | Owner             |
| 5    | Post-filing                                                                                                                                                                                  | All issued filings                                                                                                                                                                                                                                                                                                              | —                                                                                 | Owner + developer |

**Scheduling rules**

- **File F-211 early enough that the 8-day reclassification window closes before public launch.** The 24-hour receipt is a registration, not a clearance: within 8 days the CNDP may move the processing to the authorization regime if it finds manifest dangers.
- **Completeness is the schedule driver.** The 24-hour clock starts only when the dossier is complete; a missing annex resets it.
- **F-113 is the most likely late item.** It is an authorization, not a receipt. Start it first and treat the careers feature as the one most likely to be cut.
- **F-118 is the hardest launch gate.** Cloudflare is a US processor for every visitor (DNS, CDN, WAF, Turnstile, R2), so the site cannot collect public data without it unless the stack changes.
- **F-214 is not on the launch path.** Analytics is off at launch; the beacon waits for the F-214 or a written counsel exception.

---

## 4. What each filing must contain

### 4.1 F-211 — contact declaration

The art. 15 content, using the same wording as the policy and notices:

- Controller identity: SOCIETE HAY 2010, SARL, RC 87305, ICE 001459327000056, registered address.
- Purposes: answer contact and quote requests, prepare quotes, follow up the exchange.
- Data subjects: prospects, clients, suppliers.
- Data categories: name, company, email, phone, subject, message; attachments by email only.
- Recipients: internal services; HeberjaHiz (mail); Cloudflare (Turnstile/CDN); VPS host.
- Retention: 12 months after the last exchange; contract duration plus accounting retention if a contract follows.
- Transfers: Cloudflare (US) and the VPS if outside Morocco.
- Rights service: `donnees@hay2010.ma`.
- Security: TLS, access control, least privilege, backups, logging.
- Interconnection/outsourcing: the processor list and contracts.

### 4.2 F-113 — HR authorization (D-298-AU-2014)

The same art. 15 content, plus the HR-model annexes:

- Careers and CVs by email; `recrutement@hay2010.ma`.
- 6 months after the decision; 12 months in a pool only with separate consent.
- Candidate consent document with the art. 5 clauses.
- The existing LinkedIn use of `recrutement@` is included in the declared processing; the site does not treat email as a safe harbour.
- No application form, no CV upload, no sensitive data (no CNI, photo, health, marital status, religion, union membership or ethnic origin).

### 4.3 F-214 — cookies/analytics (D-939-2025)

Only when Cloudflare Web Analytics is enabled, or when any non-essential cookie appears:

- Cookieless, non-profiling audience measurement; six-month retention.
- Personalized-advertising and social-sharing cookies require prior consent; audience measurement without profiling does not (D-939-2025).
- Data categories: page, route, referrer, country, device/browser, Web Vitals.
- Recipients: Cloudflare.
- Transfers: Cloudflare (US).
- Rights contact: `donnees@hay2010.ma`.
- Consent or other legal basis; information notice.
- If Turnstile pre-clearance is enabled or a banner is added, file before enabling the form.

### 4.4 F-118 — transfer authorization

- Destination countries and processors: Cloudflare/R2/Turnstile (US); the VPS provider and country; Google only if used or forwarded.
- Safeguard for each non-adequate destination under art. 44: contractual clauses (Cloudflare DPA), binding corporate rules, or express consent.
- Base filing references (F-211, and F-113 if careers is in scope).
- The adequacy list (D-236-2015) covers the EU/EEA, UK, Switzerland and Canada — not the United States. A transfer to an adequate country is still notifiable.

---

## 5. Ownership and preparation

| Workstream                                                  | HAY2010 (owner)                              | Developer      | Counsel                   | Evidence                                           |
| ----------------------------------------------------------- | -------------------------------------------- | -------------- | ------------------------- | -------------------------------------------------- |
| Filing decision, signature, submission                      | **Owns**; confirms who has signing authority | Assists        | Reviews the package       | Signed forms; proof of authority                   |
| Technical annexes (processors, retention, security, rights) | Approves                                     | **Prepares**   | Reviews                   | This plan; policy §5; processor contracts          |
| F-211 / F-113 / F-214 / F-118 dossiers                      | **Submits**                                  | Prepares       | Reviews before submission | Complete annexes per §2.2                          |
| Mailbox provisioning and tests                              | **Owns**                                     | Supports       | —                         | Send/receive tests; AV/backup confirmation         |
| VPS provider and country                                    | Approves                                     | **Records**    | —                         | Hosting agreement (#8)                             |
| Accounting retention                                        | **Confirms** with the accountant             | —              | —                         | Accountant email                                   |
| CNDP register verification                                  | **Verifies**                                 | Checks         | —                         | Register screenshot                                |
| Policy and notice updates                                   | Publishes                                    | **Implements** | Reviews                   | [#10](analytics-consent-legal-pages.md) change log |

Confirm who has signing authority (the gérant or a delegated person) and attach the proof to each dossier. The receipt is issued in the company's name.

---

## 6. Fallbacks and feature cuts

The rule: **no public collection of personal data without the corresponding filing.** The feature is cut, not the compliance.

| If this is late    | Feature cut                                                                                                                                                | What still works                                                               | Decided at              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| **F-211**          | No public contact collection: `contact@` not published, the contact page not public, the form off. The site stays on staging.                              | Brochure pages and legal pages behind Cloudflare Access; no real contact data. | #16 readiness review    |
| **F-118**          | **No public launch.** Cloudflare processes every visitor, so no public data collection is possible.                                                        | Staging only, with synthetic data and no public collection.                    | #16 readiness review    |
| **F-113**          | Careers may list openings but must not invite CVs; `recrutement@` stays unpublished; general questions go to `contact@`; no application form or CV upload. | The site launches; `/carrieres` is informational only.                         | #16 readiness review    |
| **F-214**          | Analytics stays off; no banner.                                                                                                                            | The site launches; Cloudflare Web Analytics is not enabled.                    | When enabling analytics |
| **Counsel review** | Launch gate. If the owner declines, record the accepted risk and keep the most conservative posture: no analytics, no banner, shorter retention.           | —                                                                              | Owner before #16        |
| **Mailbox tests**  | Addresses are not published.                                                                                                                               | Staging only.                                                                  | #15 / #16               |
| **RC extract**     | Legal pages are not published.                                                                                                                             | —                                                                              | #16                     |

**Flagged risks**

- **F-113 is the most likely late filing.** It is an authorization, not a 24-hour receipt. Start it first.
- **F-118 is the hardest launch gate.** It depends on the VPS country and on the base filings being approved first.
- **F-211 is quick but not a clearance.** The 8-day reclassification window must close before public launch.
- **The old WordPress site and the LinkedIn `recrutement@` use are current exposures.** Inventory and delete any Contact Form 7 submissions; include the LinkedIn use in the F-113 scope. The new filings regularise the new processing; they do not inherit the old site's processing.

---

## 7. Rights procedure

- **Owner:** the company direction names a rights owner; the developer is the technical backup. The name is internal and does not need to be published.
- **Mailbox:** `donnees@hay2010.ma`, monitored; the owner confirms monitoring before publication.
- **Identity check:** only when there is a reasonable doubt; do not collect a CNI copy by default.
- **Deadline:** rectification within **10 days**; access and opposition within the legal deadlines.
- **Log:** record the date, subject, action and closure of every request; store it securely and declare its retention with counsel.
- **Deletion:** remove the data from `contact@`, `recrutement@`, Sent, Trash, local copies and any backup the provider can address; confirm by email.
- **Escalation:** if a request is refused or ignored, the person can complain to the CNDP (www.cndp.ma).
- **No fee:** requests are free.

---

## 8. Retention schedule and deletion controls

The declaration, the policy and the deletion procedures must use the same numbers.

| Processing             | Retention                                                                                            | Enforcement                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Contact / quote        | 12 months after the last exchange; contract duration plus accounting retention if a contract follows | Mailbox cleanup; owner             |
| Careers                | 6 months after the decision; 12 months in a pool only with separate consent                          | Mailbox cleanup; deletion log      |
| Server logs / security | 6 months                                                                                             | Cloudflare/VPS log retention       |
| Analytics              | 6 months maximum                                                                                     | Cloudflare Web Analytics retention |
| Consent choice         | 6 months maximum                                                                                     | Cookie/localStorage expiry         |
| Admin logs             | 6 months                                                                                             | Payload/host log retention         |
| Accounting / contracts | Legal retention                                                                                      | Accountant confirms                |

Over-retention is a criminal offence under art. 55 of law 09-08. Deletion is not optional: schedule the mailbox cleanups and keep the log.

---

## 9. Processor contracts and evidence

| Processor            | Service                                                               | Location                                        | Contract / evidence                                     | Filing                   |
| -------------------- | --------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------- | ------------------------ |
| **Cloudflare, Inc.** | DNS, CDN, WAF, Turnstile, R2 media, optional Web Analytics            | United States                                   | Cloudflare DPA / self-serve terms                       | F-118                    |
| **HeberjaHiz**       | Email hosting for `contact@`, `donnees@`, `recrutement@`, `no-reply@` | Morocco (confirm at provisioning)               | Hosting/processor agreement; AV and backup confirmation | F-211 / F-113            |
| **VPS provider**     | Next.js/Payload app and PostgreSQL                                    | Record at provisioning; Morocco or EU preferred | Written hosting/ops agreement (#8)                      | F-118 if outside Morocco |
| **Google**           | Gmail fallback and account recovery only                              | United States                                   | Google terms; only if used or forwarded                 | F-118 if used            |
| **GitHub**           | Source repository                                                     | United States                                   | No site personal data                                   | Not a site processor     |

- Do **not** forward the cPanel mailboxes to Gmail. Forwarding makes Google a recipient for all forwarded mail and grows the F-118 scope.
- Confirm inbound attachment scanning and the backup rotation with the mail host before inviting CVs; record the evidence.
- The VPS provider and country are recorded at provisioning. Until then the transfer paragraph in the policy is a launch gate, not a shipped placeholder.

---

## 10. Counsel review

Commission one limited Moroccan counsel review before #16. Ask for a short written opinion on the ten points from the legal research note:

1. Whether D-939-2025 displaces the 2023 website guidance for a cookieless, non-profiling beacon, and whether the F-214 is required for Cloudflare Web Analytics.
2. Filing granularity: whether contact, recruitment and cookies can be covered by fewer filings, and whether the contact form fits the client-management model (D-32-2015) rather than the generic F-211.
3. The exact perimeter of D-298-AU-2014 and the wording of the candidate consent document.
4. The proposed retention periods (12/6/12/6/6) and their alignment with the declarations.
5. Whether the gated Actualités/communiqués stream stays outside loi 88-13 and whether the first communiqué needs a publication director.
6. Whether one F-118 can cover the Cloudflare/R2/VPS/Google stack, and what the CNDP expects for an EU-region VPS operated by a non-EU provider.
7. The employee photo authorization (scope, duration, withdrawal, post-departure use).
8. Client logo permissions and procurement-contract confidentiality clauses.
9. Art. 23(3) processor-contract wording for the host, the mail provider and Cloudflare.
10. The ICE display obligation on commercial documents (the accountant is the first call).

Record the reviewer, date and reference in `legalReviewRef`. If the owner declines the review, record the accepted risk and keep the most conservative posture.

---

## 11. Preconditions and evidence checklist

Before any filing is submitted:

- [ ] RC extract (modèle J/7) and ICE attestation obtained; RC 87305, capital and address reconciled.
- [ ] Controller identity and signing authority confirmed.
- [ ] `contact@`, `donnees@`, `recrutement@` and `no-reply@` created and send/receive-tested; SPF/DKIM checked.
- [ ] Mail host confirms inbound attachment scanning and backup rotation; evidence recorded.
- [ ] VPS provider and country recorded; hosting/ops agreement in place.
- [ ] No Gmail forwarding.
- [ ] Processor contracts with art. 23(3) clauses collected.
- [ ] Retention table and deletion jobs defined.
- [ ] Rights procedure owner named; `donnees@` monitoring confirmed.
- [ ] Notice texts final ([#10 §4.5](analytics-consent-legal-pages.md)); candidate consent document drafted.
- [ ] Old WordPress Contact Form 7 submissions inventoried and deleted or brought into retention.
- [ ] Filing package reviewed by counsel.
- [ ] CNDP procedures, forms and deliberations re-checked (§13).
- [ ] No blank CNDP number, no “en cours”, no placeholder anywhere in the public site.

---

## 12. Launch gate checklist for #16

The public launch does not happen until:

- [ ] F-211 is issued and its reference is in the policy and the short contact-page notice; the full form notice carries it too if the form ships.
- [ ] F-118 covers Cloudflare/R2/Turnstile and any other non-adequate processor; the policy's transfer paragraph is filled.
- [ ] F-113 is issued if `/carrieres` invites CVs; `recrutement@` is published and the candidate consent document is on file.
- [ ] F-214 is issued if analytics is enabled; the policy is updated in the same release.
- [ ] The legal pages are counsel-reviewed and `legalReviewed` is set.
- [ ] `contact@` and `donnees@` pass send/receive tests; `no-reply@` is created and tested; `recrutement@` is tested and covered by F-113 or unpublished.
- [ ] The policy's controller, processors, transfers, retention and CNDP references match the declarations.
- [ ] No blank CNDP number, no “en cours”, no publication-director placeholder, no phone placeholder.
- [ ] Analytics is off, or the F-214 is issued and the policy is updated.
- [ ] No form is required; if the contact form is enabled, F-211 and its notice are live; if careers invites CVs, F-113 is live. No application form, no CV upload.
- [ ] The rights procedure is live and the request log exists.
- [ ] Retention jobs are scheduled and the deletion log is in place.
- [ ] Processor contracts are filed with the dossiers.
- [ ] The CNDP register entries are verified and recorded.
- [ ] Staging `noindex`, Cloudflare Access and `X-Robots-Tag` remain in place until the cutover.

If F-211 or F-118 is late, the site stays on staging with forms, analytics and real contact collection disabled — including the email contact route, which is covered by F-211. The legal pages can be reviewed on staging with placeholders; they are not public until the gates pass.

---

## 13. Re-verification

The CNDP has been publishing new deliberations through 2025–2026. Before filing and again before launch:

- [ ] Re-check the notification procedures and the current F-211, F-113, F-214 and F-118 forms.
- [ ] Re-check D-939-2025 (cookies), D-298-AU-2014 (HR), D-236-2015 (adequacy) and D-940-2025 (newsletter), and any newer deliberation.
- [ ] Re-check the adequacy list and the transfer requirements.
- [ ] Re-check the Cloudflare plan limits, Turnstile cookie behaviour and Web Analytics retention.
- [ ] Re-check the mail host's AV and backup configuration.
- [ ] Record the retrieval date and the source URLs in the filing dossier.

---

## 14. Handoffs

| Ticket                                                                       | What it receives                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#16](https://github.com/mustaphaelou/hay2010website/issues/16) launch       | The gate list in §12; the fallback rule in §6; the filing tracker in §2.3.                                                                                                                                                            |
| [#12](https://github.com/mustaphaelou/hay2010website/issues/12) forms        | F-211 scope includes the form, `contact@`, `no-reply@` and the mail host; F-113 includes `recrutement@`, the LinkedIn use and the candidate consent; F-214 is not a form dependency without a cookie; F-118 covers Cloudflare/R2/VPS. |
| [#10](https://github.com/mustaphaelou/hay2010website/issues/10) legal pages  | The receipts and authorization numbers for the policy; the rights procedure; the transfer paragraph; the counsel review.                                                                                                              |
| [#8](https://github.com/mustaphaelou/hay2010website/issues/8) hosting        | The VPS provider and country for the F-118; the processor contracts; the backup/AV evidence.                                                                                                                                          |
| [#15](https://github.com/mustaphaelou/hay2010website/issues/15) DNS/mail     | Mailbox tests; the mail host AV/backup confirmation; the F-211/F-113 mailbox scope.                                                                                                                                                   |
| [#5](https://github.com/mustaphaelou/hay2010website/issues/5) content model  | `cndpReferences` filled from the receipts; the flags `formLive`, `recrutementMailboxLive`, `analyticsLive` and `FORMS_ENABLED`.                                                                                                       |
| [#3](https://github.com/mustaphaelou/hay2010website/issues/3) facts register | The controller identity; the RC extract; the mailbox and rights contacts.                                                                                                                                                             |

---

## 15. Change log

| Date       | Change                                                                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-09 | Initial plan: four filings (F-211, F-113, F-214, F-118), D-940-2025 not applicable; sequence, owners, annexes, fallbacks, rights procedure, retention, processor evidence, counsel review, preconditions, launch gates and re-verification. |
