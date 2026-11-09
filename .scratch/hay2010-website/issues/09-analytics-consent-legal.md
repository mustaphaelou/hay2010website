# Decide analytics, consent and legal page content

Type: grilling
Status: resolved
Blocked by: 02, 07

## Question

Which analytics and consent approach will the site use, and what will the legal pages say?

Decide:

- Analytics: none, GA4, Plausible/Umami, Cloudflare Web Analytics or self-hosted Matomo; who owns the account; what events matter.
- CNDP D-939-2025: non-profiling audience measurement needs no prior consent, but personalized ads and social-sharing cookies do; retention is capped at 6 months and an F-214 declaration is required.
- The conflict with the older CNDP 2023 website guidance (consent before any cookie): choose the risk posture with counsel. Self-hosted/cookieless analytics avoids both the consent banner and the US-transfer F-118.
- US analytics (GA4) triggers an F-118 authorization; EU/EEA, UK, Switzerland and Canada are on the adequacy list.
- Consent: no banner, a lightweight cookie banner, or a full consent manager; which categories; how consent is stored and revoked.
- If a banner is used: refuse as easy as accept, no pre-ticked boxes, no cookie wall, 6-month re-prompt; load analytics only after consent when consent is required.
- Analytics configured to avoid profiling: no Google signals, no ad personalization, no data sharing; retention ≤ 6 months; IP handling documented.
- Legal pages: mentions légales, politique de confidentialité, gestion des cookies; exact company facts to publish; data controller and contact; CNDP receipt/authorization numbers.
- Form consent language for contact and careers applications (law 09-08 rights, retention).
- Cookie/analytics script loading behaviour before consent.
- Newsletter: D-940-2025 and prior consent if the newsletter ships.

## Answer

Resolved 2026-11-09 by a grilling session with the owner. Full decision and legal copy: [`docs/legal/analytics-consent-legal-pages.md`](../../../docs/legal/analytics-consent-legal-pages.md).

**Analytics and consent**

- **No analytics at launch.** No GA4, no tag manager, no Cloudflare Web Analytics beacon, no cookie banner. Only Cloudflare's server-side edge request analytics from the dashboard, for operations and security.
- After [#14](https://github.com/mustaphaelou/hay2010website/issues/14) files the F-214, enable **Cloudflare Web Analytics**: cookieless, no localStorage, six-month retention, page views/SPA routes/Web Vitals, no custom events or UTM, no consent required under D-939-2025. Account owned by HAY2010, developer as admin.
- If a future feature needs a non-essential cookie, add a lightweight banner: accept/refuse equally, no pre-tick, no wall, six-month re-prompt, revocable; load the script only after consent.
- No newsletter; D-940-2025 does not apply.

**Legal pages**

- `/mentions-legales` and `/politique-de-confidentialite`; cookies are a section of the policy, not a third page.
- Exact identity block from the facts register; no publication director, no phone, no host line, no CNDP receipt until #14. The host is a processor in the privacy policy only.
- Controller `SOCIETE HAY 2010`; rights contact `donnees@hay2010.ma`; general contact `contact@hay2010.ma`.
- Retention: contact 12 months after the last exchange; careers 6 months after the decision / 12-month pool with separate consent; logs 6 months; analytics 6 months; consent choice 6 months.
- Form notices and consent wording fixed for [#12](https://github.com/mustaphaelou/hay2010website/issues/12); no CV upload before F-113.
- One-off Moroccan counsel review before [#16](https://github.com/mustaphaelou/hay2010website/issues/16) covers the consent conflict, retention, F-118 and legal wording.

**Mailboxes**

- Owner approved `contact@hay2010.ma`, `donnees@hay2010.ma` and `recrutement@hay2010.ma`; the Gmail becomes a private fallback. The owner creates them in the HeberjaHiz cPanel; `contact@`/`donnees@` are launch gates after a send/receive test; `recrutement@` is public only after #14 covers it.
- Facts register amended; footer, contact page, mentions légales, JSON-LD and content model use `contact@`.
