# Decide hosting, domain, data residency and cutover plan

Type: grilling
Status: open
Blocked by: 06, 14

## Question

Given the hosting research, where will the site run, where will its data live, who owns the domain/DNS, and what is the cutover plan?

The research recommends **Vercel Pro** ($20/month) with DNS kept at HeberjaHiz after removing the dead Cloudflare nameservers; Cloudflare Workers/vinext is the alternative if the Cloudflare zone is accessible and beta is acceptable. Confirm or reject that path.

Decide:

- Hosting provider and deployment model (Vercel Pro, Cloudflare Workers/vinext, static export, other), including where form submissions, CVs and analytics data are processed (Morocco, EU, US).
- Budget: Vercel Pro $20/month vs Cloudflare $0–5/month; who owns the account and billing.
- Processor list and transfer exposure: Vercel/Cloudflare, email API, analytics, fonts. US processing triggers an F-118 authorization; the EU/EEA, UK, Switzerland and Canada are on the CNDP adequacy list.
- Staging/preview URL and production domain; `noindex` or password protection for staging.
- Canonical host (apex vs `www`) and trailing-slash policy, aligned with the redirect map.
- DNS ownership and access; MX/email preservation. Fix the split Cloudflare/HeberjaHiz delegation before any cutover (see the hosting research). Keep MX, `mail`, `webmail`, `cpanel`, `ftp`, the autodiscover SRV, SPF and DKIM; remove `+a` from SPF after the A record moves; do not enable Cloudflare Email Routing; add DMARC `p=none` after cutover.
- Redirect map from current hay2010.ma URLs (12 pages, 7 posts, 3 categories).
- Who deploys, how often, and how rollbacks work.
- Monitoring/uptime and backup expectations; keep the old host as an email and rollback origin.
