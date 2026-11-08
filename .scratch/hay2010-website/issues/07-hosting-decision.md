# Decide the first deployment target and staging URL

Type: grilling
Status: open
Blocked by: 06

## Question

Given the hosting research, what is the first deployment target and staging URL, with the domain cutover deferred?

**User decision (2026-11-08):** build the website first, deploy it to a temporary URL, and set up `hay2010.ma` later. This ticket chooses the temporary deployment path. The domain switch is handled by [Plan the public launch and domain cutover](15-public-launch.md).

Decide:

- Platform for the first deployment: Vercel (recommended; `*.vercel.app` preview), Cloudflare Workers (`*.workers.dev`), or another host.
- Whether Vercel Pro ($20/month) or a free/paid Cloudflare path; who owns the account and billing.
- Staging URL and access protection (`noindex`, password/Deployment Protection).
- Whether forms stay disabled or test-only until the CNDP filings and privacy policy are ready. No real contact data or CVs before then.
- Data residency for preview data; note that Vercel/Cloudflare are US processors and trigger an F-118 authorization before public collection.
- Deploy workflow (Git push → preview/production), environment variables, rollback.
- What is explicitly deferred to the public launch: DNS repair, domain cutover, email/SPF preservation, CNDP receipts, final analytics/consent.

The hosting research recommends Vercel Pro for the eventual production site, but the first deployment can use its generated preview URL without touching DNS. Cloudflare Workers/vinext is the beta alternative.
