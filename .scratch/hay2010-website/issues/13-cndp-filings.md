# Plan the CNDP filings and launch compliance

Type: task
Status: open
Blocked by: 02, 07, 09, 11

## Question

What must be filed with the CNDP before launch, who owns each filing, and what is the fallback if an authorization is late?

The legal research ([Research Moroccan legal and consent requirements for the site](08-legal-research.md)) found that filing is a launch dependency, not a post-launch chore. Turn that into an owned checklist:

- **Contact / quote:** prior declaration **F-211**, whether the message arrives by the optional form or by email; record the 24-hour récépissé; display the receipt in the short contact-page notice, the form notice and the privacy policy. **F-214 is not the contact-form filing**; it is for cookies/analytics.
- **Recruitment/CV processing:** prior authorization F-113 under the HR model (Délibération 298-AU-2014), with the candidate consent document. If it is not granted by launch, the careers page uses `contact@` for questions and does **not** invite CVs; the mailbox itself still needs to be covered by the filing. [#12](https://github.com/mustaphaelou/hay2010website/issues/12) decided **email-only** — no application form, no CV upload.
- **Cookies/analytics:** F-214 simplified declaration under D-939-2025 if analytics is in scope; 6-month maximum retention; consent for personalized ads/social cookies.
- **Transfers abroad:** F-118 for each US processor (Vercel/Cloudflare, GA4, Google Fonts, US email API) after the base processing is approved; check the adequacy list for the EU/EEA, UK, Switzerland and Canada.
- **Newsletter:** D-940-2025 and prior consent if the newsletter ships.
- **Controller details:** data-controller contact, rights contact, retention schedule, security measures, recipient categories.
- **Rights procedure:** named owner, `donnees@` mailbox, identity check, 10-day rectification SLA, and a log.
- **Local counsel review:** the legal note flags 10 points that need a Moroccan avocat.

Record each filing's form, date, receipt/authorization number, owner and status in the answer. Flag any filing that cannot be completed before launch and the corresponding feature cut (for example, careers form delayed until F-113 is granted).

**Input from #10 (resolved 2026-11-09):** no analytics at launch (F-214 only when Cloudflare Web Analytics is enabled); no newsletter (D-940-2025 not applicable); contact/rights mailboxes `contact@`/`donnees@` and careers `recrutement@`; retention 12/6/12/6/6; the policy's structured `cndpReferences`; the one-off counsel review. Full decision: [`docs/legal/analytics-consent-legal-pages.md`](../../../docs/legal/analytics-consent-legal-pages.md).

**Input from #12 (resolved 2026-11-09):** the contact form is optional and gated on F-211; careers is email-only with no application form or CV upload; `no-reply@` is the service sender and must be in the F-211 scope; F-214 is not a form dependency without a cookie; the mail host must confirm attachment scanning and backup rotation. Full decision: [`docs/forms/contact-careers-forms.md`](../../../docs/forms/contact-careers-forms.md).
