# Decide analytics, consent and legal page content

Type: grilling
Status: open
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
