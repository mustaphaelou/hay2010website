# Research Moroccan legal and consent requirements for the site

Type: research
Status: resolved
Blocked by: none

## Question

What legal/consent obligations apply to a Moroccan corporate website with a contact form, careers applications and (possibly) analytics?

Investigate:

- Law 09-08 (personal data protection) and CNDP obligations for a company website collecting contact/application data.
- Whether a cookie consent banner is required for analytics; what the lamalif site does and what is actually required.
- Required contents of mentions légales and a privacy policy for a Moroccan SARL (RC, ICE, capital, address, host, data controller, retention, rights).
- Rules for publishing client names/logos and employee photos.
- Retention and security expectations for job applications.
- A recommended compliance checklist and draft page outlines; flag where local counsel is needed.

Write findings to `docs/research/hay2010-legal-consent.md` on a `research/hay2010-legal-consent` branch, cite primary sources, and link the file from this ticket. Do not present this as legal advice.

## Answer

Resolved 2026-11-08 by a research agent. Full note: [docs/research/hay2010-legal-consent.md](https://github.com/mustaphaelou/hay2010website/blob/research/hay2010-legal-consent/docs/research/hay2010-legal-consent.md) (branch `research/hay2010-legal-consent`, commit `b0195ed`). The note is not legal advice and flags where a Moroccan avocat is needed.

**What applies**

- Law 09-08 covers the contact form, the CV upload and analytics; a CNDP filing is required **before go-live**.
- Contact/quote requests: prior **declaration** on F-211 (or F-214 under a sector model). The CNDP issues a 24-hour récépissé, but may reclassify to authorization within 8 days.
- Recruitment/CV processing: prior **authorization** on F-113 under the HR model (Délibération 298-AU-2014), with a candidate consent document. This is a schedule dependency: if the authorization is late, launch the careers page with `recrutement@hay2010.ma` only and add the form later.
- Cookies/analytics: D-939-2025 (28 Nov 2025) exempts non-profiling audience measurement from prior consent, requires consent for personalized ads/social cookies, caps retention at 6 months, and requires an F-214 declaration. The older CNDP 2023 website guidance still says consent before any cookie; the conflict is a control risk. Recommended: self-hosted/cookieless analytics to avoid a pre-launch filing dependency.
- Transfers: the CNDP adequacy list (D-236-2015) covers the EU/EEA, UK, Switzerland and Canada, **not the US**. Vercel/Cloudflare, GA4, Google Fonts and US email APIs each need an F-118 authorization.
- Mentions légales: loi 5-96 art. 45 requires name + SARL, capital, siège and RC. There is no Moroccan LCEN host/publication-director rule for a normal corporate site; loi 88-13 only applies if the site becomes a "journal électronique".
- Employee photos need specific written authorization; client logos need the trademark owner's permission (loi 17-97 arts. 154/201).
- The reference sites are not compliance models: lamalifgroup.ma has no cookie banner, loads a dead UA Google tag and Google Fonts unconditionally, leaves the CNDP receipt number blank, and has no privacy policy; hay2010.ma has no legal pages.

**Handed to other tickets**

- Data residency and processor choice → [Decide hosting, domain and cutover plan](07-hosting-decision.md).
- Analytics choice and consent posture → [Decide analytics, consent and legal page content](09-analytics-consent-legal.md).
- Careers form launch dependency → [Specify contact, careers and application forms](11-forms-careers.md).
- RC/capital/address verification → [Establish the publishable company facts and legal identity](02-company-facts.md).
- Photo/logo permissions → [Establish the publishable company facts and legal identity](02-company-facts.md) and [Define the réalisations and portfolio strategy](05-references-strategy.md).
- News/blog and loi 88-13 → [Decide the content model and update workflow](04-content-model.md).
- CNDP filing plan → [Plan the CNDP filings and launch compliance](13-cndp-filings.md).
