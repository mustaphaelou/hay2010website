# Decide hosting, domain, data residency and cutover plan

Type: grilling
Status: open
Blocked by: 06, 14

## Question

Given the hosting research, where will the site run, where will its data live, who owns the domain/DNS, and what is the cutover plan?

Decide:

- Hosting provider and deployment model (static export, Workers, Vercel, other), including where form submissions, CVs and analytics data are processed (Morocco, EU, US).
- Processor list and transfer exposure: Vercel/Cloudflare, email API, analytics, fonts. US processing triggers an F-118 authorization; the EU/EEA, UK, Switzerland and Canada are on the CNDP adequacy list.
- Staging/preview URL and production domain.
- DNS ownership and access; MX/email preservation. Fix the split Cloudflare/HeberjaHiz delegation before any cutover (see the hosting research).
- Redirect map from current hay2010.ma URLs.
- Who deploys, how often, and how rollbacks work.
- Monitoring/uptime and backup expectations.
