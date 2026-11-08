# Plan the public launch and domain cutover

Type: grilling
Status: open
Blocked by: 07, 11, 13, 14

## Question

What is the go-live checklist for moving from the temporary deployment URL to `hay2010.ma`?

The user wants to build and deploy first, then set up the domain. This ticket owns the later switch and must not block the first deployment.

Decide and record:

- **DNS:** repair the split Cloudflare/HeberjaHiz delegation; confirm the NINDO HOST registrar login, the Cloudflare zone owner and the HeberjaHiz cPanel/DNS owner. Remove the dead Cloudflare NS or complete the Cloudflare zone as one deliberate change.
- **Email:** preserve MX, `mail`, `webmail`, `cpanel`, `ftp`, the autodiscover SRV, SPF and DKIM; remove `+a` from SPF after the apex A record moves; add DMARC `p=none`; do not enable Cloudflare Email Routing.
- **Website cutover:** attach the apex A and `www` CNAME to the chosen host; keep the old WordPress origin as a rollback; set the change window and rollback trigger.
- **Compliance:** confirm the CNDP filings and receipt numbers are in place before public forms collect real contact data or CVs; publish the privacy policy and mentions légales; finalise analytics/consent.
- **SEO:** canonical host, trailing-slash policy, redirect map from the old WordPress URLs, sitemap/robots, and `www`/apex behaviour.
- **Post-launch:** TLS, monitoring, mail-flow tests, form end-to-end tests, and a 30-day check.

The answer should be an ordered runbook with owners, a change window, and explicit go/no-go criteria.
