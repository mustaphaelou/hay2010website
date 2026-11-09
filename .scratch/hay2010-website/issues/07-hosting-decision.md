# Decide the first deployment target and staging URL

Type: grilling
Status: resolved
Blocked by: none (the staging URL depends on #15)
Resolved: 2026-11-09

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

## Answer

Resolved 2026-11-09. The user rejected Vercel/Cloudflare Workers hosting and chose to **self-host the full stack on their own ARM64 VPS with Coolify, behind Cloudflare, with media in Cloudflare R2**.

**Decision**

- **Target:** developer-owned **ARM64 VPS** running **self-hosted Coolify** (no Vercel, no Workers, no shared cPanel). Coolify supports arm64; the VPS must meet the minimums below.
- **Staging URL:** **`https://staging.hay2010.ma`**, after #15 makes the zone authoritative on Cloudflare. Until then, a temporary protected hostname is used; it is not the staging URL.
- **Stack:** Next.js 16.4.3 + **Payload 3** in one app (Node 22, Docker, port 3000); **PostgreSQL 17** as a Coolify database; **Cloudflare** DNS/CDN/WAF/Access/TLS; **R2** bucket `hay2010-media` public at `https://media.hay2010.ma`; **no Redis**, no MinIO.
- **Access:** **Cloudflare Access** on the whole staging host (owner + developer, email OTP); Phase 0 uses Coolify Basic Auth. At launch, Access moves to `/admin*` only; Payload auth remains.
- **Backups:** nightly Postgres dump to a private R2 bucket `hay2010-backups`; media versioned in R2; Coolify's own data backed up; restore test before launch.
- **Forms:** hard-disabled on staging; email fallback only. No real contact data or CVs before #14.
- **Deploy:** CI builds the ARM64 image (`ubuntu-24.04-arm`, free for public repos) → GHCR → Coolify pulls, runs `payload migrate`, health-checks and switches; rollback is the previous image plus a pre-migration dump. No preview deployments.
- **First deployment** is the full stack infrastructure with synthetic content: Coolify, app, Postgres, R2 and Cloudflare. The repository is still the template; Payload and the R2 wiring land in the same build. It is not the public site.
- **Deferred:** apex/`www` cutover and WordPress retirement (#16), CNDP/F-118 (#14), analytics/legal (#10), forms/CV (#12), SEO (#11), prototype (#13), production environment and second backup provider (#16).

**Why the Vercel recommendation was dropped:** the user wants the stack on their own server. The research's Vercel path is no longer the first deployment; its DNS, email and cutover findings still apply. The tradeoff is that the developer becomes the hosting provider for a client CMS — single VPS, self-managed patching/backups, and a larger DNS change than the A/CNAME-only path.

**Hard prerequisites**

1. **#15 DNS/Cloudflare zone.** `staging.hay2010.ma` requires the `hay2010.ma` zone active on Cloudflare. The current delegation is split between two dead Cloudflare nameservers and two HeberjaHiz nameservers; Cloudflare refuses the zone. Recover the existing zone or create a new HAY2010-owned zone, copy MX/SPF/DKIM/autodiscover exactly, delegate to Cloudflare only, do not enable Email Routing, and test email before/after. Remove `+a` from SPF once the apex A record moves. If #15 cannot be done, the staging URL decision is re-opened; do not run the client site on an uncontrolled zone.
2. **VPS minimums:** ARM64, 2 vCPU, **4 GB RAM**, 40 GB SSD, Ubuntu 24.04 LTS, public IPv4 (or Tunnel), SSH keys. 8 GB/4 vCPU/80 GB recommended; 2 GB is not supported. Build in CI on 4 GB.
3. **Ownership:** VPS is developer-owned under a written hosting/ops agreement; HAY2010 owns the domain, Cloudflare zone and R2 data; production zone not in a personal account without handoff; exit/export defined.
4. **Backups:** off-site Postgres dump + R2 versioning + Coolify data backup + restore test. Without it, staging only.
5. **Data:** synthetic content only; no public personal data before #14; Cloudflare/R2 are US processors and need F-118.

**First-deployment sequence**

- **Phase 0** — provision the VPS/Coolify/Postgres/R2, deploy the ARM64 image on a temporary protected hostname, synthetic content, forms/email off; verify HTTPS, database connectivity, persistence, rollback and the backup job. Admin and media upload are verified once Payload lands. `hay2010.ma` untouched.
- **Phase 1** — complete #15; add `staging` (proxied) and `media` (R2 custom domain); enable Cloudflare Access; staging URL becomes `https://staging.hay2010.ma`.
- **Phase 2** — build the site (Payload content, pages, SEO, legal, forms disabled).
- **Phase 3** — #16 public launch, separate production environment, apex cutover, CNDP, analytics, final restore test; staging stays behind Access.

**Handoffs:** #15 (zone/delegation/email, prerequisite), #16 (public cutover, production environment, second backup provider, SMTP production), #14 (CNDP/F-118), #12 (forms), #10 (analytics/legal), #11 (SEO), #13 (prototype), #5 (content model).

**Open items:** VPS specs/country; Cloudflare zone access; SMTP credentials for Payload password reset; written ops agreement; R2 backup independence (second provider at #16); exact Dockerfile/CI.

Full spec: [`docs/hosting/deployment-decision.md`](../../../docs/hosting/deployment-decision.md).
