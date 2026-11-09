# HAY2010 — First deployment target and staging URL

**Status:** Decided — 2026-11-09.
**Resolves:** GitHub [#8](https://github.com/mustaphaelou/hay2010website/issues/8) (local `07-hosting-decision.md`).
**Depends on:** GitHub [#15](https://github.com/mustaphaelou/hay2010website/issues/15) for the `hay2010.ma` zone and delegation; [#16](https://github.com/mustaphaelou/hay2010website/issues/16) for the public cutover.
**Supersedes:** the Vercel Pro recommendation in the hosting research ([#7](https://github.com/mustaphaelou/hay2010website/issues/7)) **for the first deployment only**. The research's DNS and email-cutover findings still apply and are now a prerequisite, not a launch-time detail.

---

## 1. Decision

| Item | Decision |
|---|---|
| **First deployment target** | The developer's **ARM64 VPS**, running **self-hosted Coolify**. No Vercel, no Cloudflare Workers, no shared cPanel. |
| **Staging URL** | **`https://staging.hay2010.ma`** — after [#15](https://github.com/mustaphaelou/hay2010website/issues/15) makes the zone authoritative on Cloudflare. Until then, a temporary protected hostname (Phase 0) is used; it is not the staging URL. |
| **Runtime** | Next.js 16.4.3 with **Payload 3** embedded, Node 22, Docker, port 3000, one application container. |
| **Database** | **PostgreSQL 17** as a Coolify database resource, internal network only. |
| **Media** | **Cloudflare R2** bucket `hay2010-media`, public via `https://media.hay2010.ma`, versioned. No MinIO. |
| **Edge** | **Cloudflare** DNS, proxy/CDN, WAF, Access and TLS. |
| **Redis** | **Not deployed.** No component in this stack consumes it; Coolify's own Redis is for Coolify. Add a separate Coolify Redis only when a concrete cache, queue, session or rate-limit consumer exists. |
| **Staging access** | **Cloudflare Access** on the whole staging host — owner + developer, email OTP. Phase 0 uses Coolify Basic Auth. |
| **Backups** | Nightly Postgres dump to a private R2 bucket `hay2010-backups`; media versioned in R2; Coolify's own data backed up; restore test before launch. |
| **Forms** | **Hard-disabled** on staging. Email fallback only. No real contact data or CVs before [#14](https://github.com/mustaphaelou/hay2010website/issues/14). |
| **Public cutover** | Deferred to [#16](https://github.com/mustaphaelou/hay2010website/issues/16). Only `staging` and `media` subdomains are in scope now. |

The **first deployment brings up the full stack infrastructure**: Coolify, the application, Postgres, R2 and the Cloudflare edge, with synthetic content. The current repository is still the template; Payload and the R2 wiring land in the same build, not in a later hosting change. It is not a throwaway static preview, and it is not the public site.

---

## 2. Why this stack

- **User decision.** The owner/developer chose self-hosting on their own VPS with Coolify, Cloudflare and R2, replacing the Vercel Pro path. The stack is coherent: Coolify supports arm64 ([requirements](https://coolify.io/docs/start-with-self-hosted)), and Cloudflare supplies the edge, access control and object storage that Vercel would otherwise bundle.
- **No MinIO.** R2 removes the media volume from the VPS, so a server loss does not lose photographs and no second storage service runs on the box.
- **No Redis.** Payload 3 is Postgres-backed; a single Next.js instance has no shared cache to coordinate. Adding Redis without a consumer only consumes RAM and creates another thing to patch and back up.
- **One application, one database.** Payload runs inside the Next.js app, matching the content model ([`docs/content/content-model.md`](../content/content-model.md)), so there is no separate CMS server to deploy.
- **Cloudflare Access instead of Basic Auth** gives identity-based staging access, a free tier up to 50 users, and a path to protecting `/admin` at launch without shipping a password around.
- **Predictable cost.** No new platform subscription: the VPS is already paid for; Cloudflare's Free plan covers DNS/CDN/WAF/Access, and R2 is usage-based with no egress fees. The real cost is operations time.

**Accepted tradeoffs**

- A single VPS is a single point of failure. Backups and a tested restore are conditions of this decision, not optional polish.
- The developer becomes the hosting provider for a client CMS; ownership and exit are recorded in §3.3.
- Using Cloudflare CDN/Access and an R2 custom domain **requires the `hay2010.ma` zone to be active on Cloudflare**. That is a larger DNS change than the research's A/CNAME-only path, and it touches email. It is why #15 is pulled forward.
- HTML is not cached at the edge initially; only static assets and media are. Stale content is worse than a slower first byte.

---

## 3. Prerequisites (hard gates)

### 3.1 DNS and the Cloudflare zone — #15

The current delegation is split between two Cloudflare nameservers (`aaron`, `khloe`) and two HeberjaHiz nameservers (`server116ns1/2`). The Cloudflare servers return REFUSED for the zone; only HeberjaHiz answers authoritatively, so resolvers intermittently SERVFAIL. `staging.hay2010.ma` cannot be served through Cloudflare while that is true.

Before the staging URL is used:

1. **Recover the existing Cloudflare zone** if the account is accessible, or **create a new zone** for `hay2010.ma` in a HAY2010-owned Cloudflare account. Export the current DNS inventory first (the research's §5.2 / Appendix B).
2. **Copy every mail record exactly** before changing nameservers: MX (`mail.hay2010.ma`), `mail`/`webmail`/`cpanel`/`ftp` A records, the `_autodiscover._tcp` SRV, SPF, and DKIM (`default._domainkey`). DMARC does not exist today; add `p=none` after the cutover.
3. **Set the registrar delegation to the active Cloudflare zone's nameservers** at NINDO HOST — the existing pair if the zone is recovered, otherwise the new pair. Remove the HeberjaHiz pair and any stale Cloudflare pair that is not the active zone's pair; Cloudflare must be authoritative for the proxied hostnames.
4. **Do not enable Cloudflare Email Routing.** It adds its own MX records and will break the existing mailbox.
5. **Test email both ways** (send and receive, webmail, password reset) before and after the nameserver change. Verify DNS from multiple resolvers, not one.
6. **Remove `+a` from SPF** once the apex A record no longer points at the mail server; otherwise Cloudflare/VPS addresses become authorised senders.
7. Add `staging` and `media` only after the zone is stable. The apex/`www` cutover remains #16.

If #15 cannot be completed — the zone is unrecoverable and the registrar will not delegate — the first deployment stays on a temporary protected hostname and the staging URL decision is re-opened. Do not run the client site on a zone the project does not control.

### 3.2 VPS

| Requirement | Minimum | Recommended |
|---|---|---|
| Architecture | ARM64 (aarch64) | ARM64 |
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disk | 40 GB SSD | 80 GB SSD |
| OS | Ubuntu 24.04 LTS (64-bit) | Ubuntu 24.04 LTS |
| Network | Public IPv4, or Cloudflare Tunnel | Public IPv4 |
| Access | root or sudo SSH | SSH keys only |

A 2 GB VPS is not supported for this stack: Coolify alone needs ~2 GB, and Postgres plus the app leave no headroom. On 4 GB, builds must run in CI and a 2 GB swap file is prudent; on 8 GB, Coolify-native builds are acceptable.

Record the VPS provider and country at provisioning. A US-located VPS is a US processor in addition to Cloudflare/R2; Morocco or the EU is preferred for the CNDP position.

### 3.3 Accounts, ownership and billing

- **VPS:** developer-owned for the first deployment. A written hosting/ops agreement covers access, backups, cost and exit. If the client does not accept developer-hosted infrastructure, the target changes to a client-owned VPS; the stack is unchanged.
- **Domain, Cloudflare zone and R2:** HAY2010-owned. The developer is a member/administrator. A production zone must not sit in a personal account without a written handoff and a plan to transfer it before launch.
- **Mailboxes:** HAY2010-owned, on the existing HeberjaHiz mail host. The owner creates `contact@`, `donnees@` and `recrutement@` (see [#10](https://github.com/mustaphaelou/hay2010website/issues/10) §6); `recrutement@` is not public before #14. Email hosting does not move.
- **GitHub:** the repository stays under the developer for now; the client receives access and a handoff at launch. The repository is public, so no platform account is needed to deploy it.
- **Billing:** the VPS is the developer's existing cost; Cloudflare Free and R2 usage are billed to the HAY2010 account; the domain renewal stays with the client. Commercial terms are outside this ticket; the technical ownership and exit path are not.
- **Exit:** the client can export content (Payload JSON or `pg_dump`), media from R2, DNS records and the deployment repository, and move to another host. The runbook must make that possible without the developer.

### 3.4 Data and compliance

- Staging holds **synthetic content only**. Forms are hard-disabled; no contact messages, CVs or applicant data. The only personal data is the admin accounts and Cloudflare Access identities.
- Cloudflare and R2 are US processors; the VPS may be outside Morocco. [#14](https://github.com/mustaphaelou/hay2010website/issues/14) must file the CNDP declarations and the F-118 transfer authorization **before** the public site collects real data. Staging with synthetic data and two admin accounts does not open public collection.
- Media containing people stays gated by the rights workflow in the content model; no unreleased photo is uploaded to the public bucket.
- The public privacy policy and mentions légales are decided in [#10](https://github.com/mustaphaelou/hay2010website/issues/10): [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md). They are launch gates, together with the mailbox tests and the CNDP references.

### 3.5 Backups

The decision is conditional on:

- a nightly Postgres dump written to a bucket **outside the VPS**;
- R2 versioning for media;
- a backup of Coolify's own data and database;
- a **restore test** recorded before launch.

If off-site backup is not settled, the VPS is a staging environment, not a production host.

---

## 4. Architecture

```
Internet
   │
   ▼
Cloudflare zone hay2010.ma
   ├─ staging.hay2010.ma  ── Access (owner + developer) ── proxy ── VPS :443
   ├─ media.hay2010.ma    ── R2 custom domain (public read, cached)
   └─ email records: MX / SPF / DKIM / autodiscover → HeberjaHiz (unchanged)
                                   │
                                   ▼
                         Coolify on the ARM VPS
                         ├─ Application hay2010-web  (Next.js + Payload, :3000)
                         ├─ Database hay2010-postgres (Postgres 17, internal)
                         └─ scheduled tasks / backups
                                   │
                                   ├─ R2 hay2010-media   (public via media.hay2010.ma)
                                   └─ R2 hay2010-backups (private, nightly pg_dump)
```

### 4.1 Coolify resources

- **Application `hay2010-web`** — Git repository or prebuilt image (see §5), port 3000, health-check endpoint, environment variables, domain `staging.hay2010.ma`, scheduled tasks.
- **Database `hay2010-postgres`** — PostgreSQL 17, internal only, generated credentials, scheduled backups to R2. Do not reuse Coolify's own database.
- **No Redis**, no MinIO, no separate CMS service.
- **Persistent storage** — the application is stateless except `/app/.next/cache` for the image optimiser. Mount a volume there if image optimisation is enabled; otherwise the cache resets on deploy, which is acceptable for a brochure site but makes the first image request after a deploy slower. Media is never on the container filesystem.

### 4.2 Cloudflare

- **Zone** — `hay2010.ma`, active on Cloudflare, delegated to Cloudflare only. DNSSEC is optional; if enabled, verify the DS record at the registrar.
- **DNS** — `staging` proxied to the VPS (A/AAAA) or to a named Cloudflare Tunnel; `media` is the R2 custom domain; apex/`www` remain untouched until #16; mail records are preserved.
- **TLS** — Cloudflare edge certificate; origin certificate via Coolify's Let's Encrypt or a Cloudflare Origin CA certificate; SSL/TLS mode **Full (strict)**. If a tunnel is used, Cloudflare terminates TLS and the origin leg is private.
- **Access** — application on `staging.hay2010.ma` for the whole host; policy allows the owner and developer emails with one-time PIN; session 24 hours. At launch, a second application covers `hay2010.ma/admin*`; the public site stays open. Payload's own auth remains the application-level gate.
- **Cache** — staging: **bypass all caching** (Access responses must not be shared, and there is no traffic to optimise). Production: cache `/_next/static/*`, brand assets and R2 media aggressively; **bypass HTML**, `/admin*` and `/api/*`. Add a purge-on-publish hook only if HTML caching is introduced later.
- **WAF** — default managed rules; rate-limit the admin login and any public API. Turnstile arrives with the forms in [#12](https://github.com/mustaphaelou/hay2010website/issues/12).
- **Analytics** — no GA, no third-party tags, no tag manager. At launch, only Cloudflare's server-side edge request analytics from the dashboard; no client-side beacon and no consent banner. After #14 files the F-214, the cookieless Cloudflare Web Analytics beacon may be enabled with six-month retention. Full decision: [#10](https://github.com/mustaphaelou/hay2010website/issues/10) and [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md) §2.

### 4.3 Cloudflare R2

- **`hay2010-media`** — public read through the `media.hay2010.ma` custom domain; bucket itself not listed; object versioning on; lifecycle for noncurrent versions; long cache for immutable image derivatives. Payload's S3 adapter (`@payloadcms/storage-s3`; the content model also allows the R2 adapter) writes here.
- **`hay2010-backups`** — private, no custom domain, versioning/object-lock as available; access token scoped to this bucket only.
- **Credentials** — one R2 API token per purpose (app media, backups); stored in Coolify secrets, never in the repository; rotate on handoff.
- **Phase 0** — before `media.hay2010.ma` exists, use the R2 S3 API and `r2.dev` only for smoke tests; never publish `r2.dev` URLs.

### 4.4 Email (Payload transactional mail)

Payload needs SMTP for password reset and publish notifications. The stack does **not** include a mail server.

- Preferred: the existing `mail.hay2010.ma` host over SMTP submission. The owner creates `contact@`, `donnees@` and `recrutement@` in the HeberjaHiz cPanel ([#10](https://github.com/mustaphaelou/hay2010website/issues/10) §6); a separate `no-reply@` service mailbox may be created for transactional mail if the owner prefers, but it is not a public contact.
- Fallback: a transactional provider (Resend/Postmark) — a US transfer that must be included in #14's F-118.
- Staging: email disabled or pointed at a test inbox. No real recipients, no announcements.
- Do not run Postfix on the VPS; deliverability and reputation are not worth it for a brochure site.
- Keep MX/SPF/DKIM/autodiscover unchanged through #15; re-test all public mailboxes after the DNS cutover.

### 4.5 Scheduled jobs

- **Daily** jobs-expiry revalidation: `GET /api/revalidate?tag=jobs` with a bearer secret, via a Coolify scheduled task (or host cron if the resource type does not support it).
- **Nightly** Postgres backup via Coolify's database backup schedule.
- **Monthly** Coolify update and backup verification; **quarterly** restore test.
- Media lifecycle is handled by R2 rules, not a job.

---

## 5. ARM64 build

The VPS is ARM64, so the image must be ARM64. Do not cross-build with QEMU; it is slow and hides native-module failures.

**Rules**

- Base image: `node:22-bookworm-slim` (Debian/glibc), not Alpine. The prebuilt binaries for `sharp`, `@tailwindcss/oxide` and `@next/swc` are the reliable path; musl variants exist but are a needless variable.
- Build on ARM natively: either Coolify on the VPS (only if ≥8 GB) or GitHub Actions `ubuntu-24.04-arm` (free for public repositories) pushing to GHCR.
- **Default: CI-built image.** It keeps build memory off the VPS, makes the artifact reproducible and pins the architecture. Coolify pulls the image and keeps the previous tags for rollback. If the VPS has ≥8 GB and simplicity matters more, a Coolify Git Application with a Dockerfile is acceptable.
- Pin the image tag/digest per deploy; do not deploy `latest` blindly.
- `next.config.ts` sets `output: "standalone"`; the Dockerfile copies `.next/standalone`, `.next/static` and `public`, runs as a non-root user, exposes 3000, and has a health check.
- Verify the build log resolves the ARM64 variants (`@img/sharp-linux-arm64`, `@tailwindcss/oxide-linux-arm64-gnu`, `@next/swc-linux-arm64-gnu`). A wrong-architecture install usually means the build ran on amd64 or under QEMU.
- No `--platform=linux/amd64` anywhere; no amd64-only helper images. Postgres and cloudflared have arm64 images; the R2 client is a JavaScript SDK and architecture-independent.
- The CI workflow runs `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build` and the Docker build/push. Tests are added with the application.

---

## 6. Deployment workflow

1. **Push to `main`** → GitHub Actions builds the ARM64 image, tags it with the commit SHA, pushes to GHCR, triggers the Coolify deployment (webhook or API).
2. **Coolify** pulls the image, runs the pre-deployment migration (or a one-off job), starts the new container, waits for the health check and then switches traffic.
3. **Migrations** — `payload migrate` as a Coolify pre-deployment command or a one-off container, never on every application start. Take a database dump before a migration. Migrations are forward-only; a rollback restores the previous image and, if the schema changed incompatibly, the pre-migration dump.
4. **Health** — add `/api/health` (checks the app and a trivial database query). Coolify must not switch traffic on a failing check.
5. **Rollback** — Coolify's image rollback for code; database restore for data. Both are documented in the runbook. Rollback does not undo a migration by itself.
6. **Environment variables** — set in Coolify, scoped to the resource:
   - `DATABASE_URL` (internal Postgres URL)
   - `PAYLOAD_SECRET`
   - `NEXT_PUBLIC_SERVER_URL` (final staging URL; rebuild when it changes)
   - `S3_ENDPOINT`, `S3_REGION=auto`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL=https://media.hay2010.ma`
   - `FORMS_ENABLED=false`
   - `REVALIDATE_SECRET`
   - SMTP variables only when email is enabled
   - No secret in the repository, the image or a build argument.
7. **Previews** — disabled for now. A preview would need its own database and a wildcard DNS/Access policy; that is not worth the surface for a one-developer site. Revisit if the review workflow needs it.
8. **Deploy logs and alerts** — Coolify notifications to the developer; deployment failure, backup failure and disk thresholds must reach a human.

---

## 7. Security and operations

- **SSH** — keys only, no password login; UFW allows 22 (restricted where possible), 80 and 443 only; fail2ban; unattended security upgrades. Docker and Coolify are root-equivalent: protect the dashboard accordingly.
- **Coolify dashboard** — strong password and 2FA where supported; do not expose port 8000 publicly. Use an SSH tunnel, an IP allowlist, or a separate hostname behind Cloudflare Access. A compromised Coolify instance is a compromised server.
- **Postgres/R2** — no public database port; R2 tokens scoped per bucket; rotate on handoff. No credentials in logs.
- **Admin** — Cloudflare Access + Payload auth on staging; at launch, Access on `/admin*` and a strong Payload password. No admin link from the public site; `noindex` on the admin paths.
- **noindex** — staging sets `X-Robots-Tag: noindex` and a disallow-all `robots.txt`; Cloudflare Access already prevents indexing, but the header is defence in depth. Staging keeps it permanently; production removes it only at the public cutover.
- **Monitoring** — external uptime check on `staging.hay2010.ma` (with an Access service token or a bypass path), Coolify server metrics, disk and backup alerts. Cloudflare analytics covers edge traffic.
- **Patching** — monthly OS/Docker/Coolify/Postgres minor updates; update Coolify after a backup; pin major versions; read release notes before upgrading.
- **Runbook** — DNS records, env var names, backup/restore commands, rollback, certificate renewal, access list, ownership and exit. Stored outside the repository if it contains secrets.
- **Ownership** — developer is the technical owner; HAY2010 owns the domain, content and Cloudflare/R2 data. The written agreement and the exit path are prerequisites for calling this production.

---

## 8. First-deployment sequence

### Phase 0 — stack smoke test (no client DNS)

- Provision or verify the VPS, Coolify, Postgres and the R2 buckets.
- Build the ARM64 image; deploy with a temporary protected hostname (Coolify Basic Auth + `noindex`), or a Cloudflare quick tunnel if the VPS has no public IPv4.
- Use synthetic content; forms off; email off.
- Verify: HTTPS, database connectivity, persistence across a redeploy, health check, rollback and the backup job. Admin login and media upload to R2 are verified as soon as the Payload upload path lands; they are not a reason to delay the infrastructure smoke test.
- Nothing is announced; `hay2010.ma` is untouched.

### Phase 1 — staging URL

- Complete #15: zone, delegation, mail-record preservation, resolver checks, email tests.
- Add `staging` (proxied) and `media` (R2 custom domain).
- Enable Cloudflare Access; switch from Basic Auth to Access; confirm the owner can log in on a phone.
- Point the R2 public URL at `media.hay2010.ma`; re-test image upload and delivery.
- The staging URL is now **`https://staging.hay2010.ma`**.

### Phase 2 — build the site

- Payload content model, pages, SEO, legal pages, forms disabled. This is the build phase, not part of #8.
- Every deploy goes to staging; every migration is backed up.

### Phase 3 — public launch (#16)

- Production Coolify environment (separate app/database/buckets or a deliberate promotion), apex/`www` cutover, CNDP filings, the #10 legal-page and consent gates, forms, final restore test, WordPress retirement, email/SPF/DMARC verification and the mailbox tests.
- Staging remains behind Access after launch.

---

## 9. Deferred / out of scope

- Apex `hay2010.ma` and `www` cutover, old WordPress retirement, redirects — [#16](https://github.com/mustaphaelou/hay2010website/issues/16).
- CNDP declarations and F-118 — [#14](https://github.com/mustaphaelou/hay2010website/issues/14).
- Analytics, consent and legal page copy — resolved in [#10](https://github.com/mustaphaelou/hay2010website/issues/10): [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md). No analytics at launch; Cloudflare Web Analytics after the F-214.
- Contact, careers and CV forms — [#12](https://github.com/mustaphaelou/hay2010website/issues/12).
- SEO metadata, structured data, sitemap — [#11](https://github.com/mustaphaelou/hay2010website/issues/11).
- Homepage prototype and inner-page composition — [#13](https://github.com/mustaphaelou/hay2010website/issues/13).
- Production environment, second backup provider, SMTP production credentials and the written ops agreement — launch prerequisites, tracked in #16.
- Email hosting migration — not happening; MX stays at HeberjaHiz. Only the DNS records move to Cloudflare in #15.

---

## 10. Open items and assumptions

- **VPS specs and country** are not yet recorded. The decision assumes the minimums in §3.2. If the VPS is 2 GB, upgrade before deploying; if it is x86 rather than ARM64, the build target changes but the stack is unchanged.
- **Cloudflare zone access** is unresolved until #15. The decision assumes the project can recover the existing zone or create a new HAY2010-owned zone and delegate at NINDO.
- **SMTP credentials** for Payload password reset are not confirmed. The owner creates `contact@`, `donnees@` and `recrutement@` (see #10 §6); a transactional mailbox (`no-reply@`) or provider must still be chosen before admin handoff, not before the Phase 0 smoke test.
- **Ops agreement** and the exact hosting commercial terms are outside this ticket but are conditions for production.
- **R2 backup independence** — a second provider is deferred to #16; until then, the backup bucket is in the same Cloudflare account as the media.
- The Vercel research remains valid as an alternative if the self-hosted path is abandoned; it is not the current decision.

---

## 11. References

- Hosting research: [#7](https://github.com/mustaphaelou/hay2010website/issues/7), note on branch `research/hay2010-hosting-deployment` (`docs/research/hay2010-hosting-deployment.md`).
- Content model: [`docs/content/content-model.md`](../content/content-model.md).
- Company facts and contact channels: [`docs/company/facts-register.md`](../company/facts-register.md).
- Coolify: [self-hosted requirements](https://coolify.io/docs/start-with-self-hosted), [databases and backups](https://coolify.io/docs/databases), [Basic Auth](https://coolify.io/docs/core/networking/proxy/traefik/basic-auth), [scheduled tasks](https://coolify.io/docs/applications/operations/scheduled-tasks), [rollbacks](https://coolify.io/docs/applications/deployments/rollbacks), [Docker Compose](https://coolify.io/docs/applications/builds/docker-compose).
- Cloudflare: [Access](https://developers.cloudflare.com/cloudflare-one/policies/access/), [R2 custom domains](https://developers.cloudflare.com/r2/buckets/public-buckets/), [Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/), [cache rules](https://developers.cloudflare.com/cache/how-to/cache-rules/).
- Payload: [S3 storage adapter](https://payloadcms.com/docs/upload/storage-adapters#s3).
- Next.js: [self-hosting](https://nextjs.org/docs/app/guides/self-hosting) and `output: "standalone"`.
- GitHub Actions arm64 runners: [public repositories](https://github.blog/changelog/2025-08-07-arm64-hosted-runners-for-public-repositories-are-now-generally-available/).
