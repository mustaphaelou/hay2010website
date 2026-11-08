# HAY2010 — Hosting, deployment and `hay2010.ma` cutover research

**Last updated:** 2026-11-08
**Status:** Research / decision input. No DNS changes were made, nothing was deployed, no PR was opened.
**Ticket:** `.scratch/hay2010-website/issues/06-hosting-research.md`
**Scope:** the Next.js 16.4.3 site in this repo, the current WordPress/Porto site on `hay2010.ma`, and the cutover between them.

---

## TL;DR

1. **Fix DNS before anything else.** `hay2010.ma` is currently delegated to **four** nameservers: two Cloudflare nameservers and two HeberjaHiz nameservers. The Cloudflare servers return **REFUSED** for the zone; only HeberjaHiz answers authoritatively. Resolvers therefore fail intermittently: in a 12-query sample, Cloudflare's public resolver returned SERVFAIL for `hay2010.ma A` 2/12 times and for `mail.hay2010.ma A` 1/12 times, while Google resolved every time. This is a live availability and email risk, independent of the website migration.
2. **The current site is a WordPress placeholder.** WordPress 7.1.4 + Porto + WooCommerce 10.5.3 + WPBakery + Slider Revolution 6.7.35 on LiteSpeed, with 12 pages, 7 lorem-ipsum posts, 3 categories and 51 media items. WooCommerce has no products. There is no real content to migrate; confirm with the client before discarding.
3. **The current host cannot run Next.js on its shared plan.** HeberjaHiz's shared Linux plans are cPanel + LiteSpeed + PHP/MySQL; no Node.js runtime is documented. Next.js 16 requires Node.js 20.9+. The host is still useful for email and as a rollback origin, and it can serve a static export.
4. **Recommended path: Vercel Pro + repair DNS at HeberjaHiz (remove the dead Cloudflare NS), keep email where it is.** Vercel has first-party Next.js 16 support, preview deployments, automatic SSL, and — crucially — a domain can be attached with only an A/CNAME change, without moving MX or the rest of the zone. Cost: **US$20/month** (Hobby is explicitly non-commercial).
5. **Alternative: Cloudflare Workers + vinext.** The current repo passes `vinext check` at **100% (6 supported, 0 partial, 0 issues)**, and Workers pricing is **$5/month paid, or $0 on the free tier** (100k requests/day, 10 ms CPU; static asset requests are free and unlimited). But vinext is **beta**, the public compatibility run covers Next.js 16.2.6 (this repo is 16.4.3), image optimization is partial, and a Worker custom domain requires the zone to be active on Cloudflare — i.e. a full nameserver migration.
6. **Static export is viable only as a deliberate fallback.** The current template is fully static today, but the planned contact form, careers application with CV upload, possible CMS preview, and legacy redirects need a server (or a third-party form backend plus host-level redirects). Static export also loses `next.config` redirects/headers, ISR, `next/image` optimization and Server Actions.
7. **Email must be treated as production infrastructure.** MX is `mail.hay2010.ma` on the same cPanel server; DKIM (`default._domainkey`) and SPF exist; DMARC does not. If nameservers move, every mail-related record must be recreated exactly, and Cloudflare Email Routing must **not** be enabled (it adds its own MX records).
8. **SPF has a subtle cutover trap.** The current SPF ends with `+a`, which authorizes whatever the apex A record points to. After the website A record moves to Vercel, `+a` would authorize Vercel's IPs to send mail as `hay2010.ma`. Remove `+a` after the cutover and keep `+mx`/the explicit host IPs.
9. **Top open questions:** who controls the Cloudflare zone behind `aaron`/`khloe`; who has the NINDO HOST registrar login; who has the HeberjaHiz cPanel/DNS login; who owns the mailboxes; and whether the budget allows Vercel Pro ($20/month) or requires the Cloudflare path.
10. **Do not layer the hosting cutover on top of the broken delegation.** Repair the delegation first, verify it from multiple resolvers, then change the website A/CNAME.

---

## 1. Method and evidence

- **Retrieval date:** 2026-11-08 (Africa/Casablanca).
- **Live evidence:** HTTP requests with `curl` against `https://hay2010.ma/`, its WordPress REST API and sitemaps; TLS inspection with `openssl s_client`; DNS over HTTPS queries against Cloudflare (`cloudflare-dns.com/dns-query`) and Google (`dns.google/resolve`); direct UDP DNS queries against the delegated authoritative nameservers and the `.ma` parent servers; WHOIS over `whois.registre.ma:43`; RIPE RDAP for the origin IP.
- **Tooling:** `cf` CLI 1.0.0-beta.28 (`cf auth whoami` reports **not logged in**, so no Cloudflare account/zone facts could be inspected); `vinext check` (vinext v1.4.4) on a throwaway copy of this repo; `gh auth status` (authenticated with repo access for this project).
- **Repo facts:** `package.json` pins `next@16.4.3` and `react@19.3.1`; `next.config.ts` is empty; only `app/page.tsx`, `app/layout.tsx`, `app/globals.css` and `app/favicon.ico` exist; there is **no** `wrangler.json*`, `wrangler.toml` or `cloudflare.config.ts` in the repo.
- **Limits:** no admin access to the registrar, the hosting panel, WordPress, Cloudflare, Search Console or analytics. Performance numbers are from a single vantage point and are indicative, not a benchmark. Facts that could not be verified are listed in §9.

---

## 2. What `hay2010.ma` runs today

### 2.1 Live fingerprint

| Attribute | Observed value | Evidence |
|---|---|---|
| HTTP server | `server: LiteSpeed`; HTTP/2; `alt-svc: h3` (HTTP/3) | [`curl -I https://hay2010.ma/`](https://hay2010.ma/), 2026-11-08 |
| CDN / proxy | No `cf-ray`, no CDN-specific headers; nameservers are HeberjaHiz | Live headers; DNS in §5 |
| CMS | WordPress **7.1.4** (`meta generator`) | [Homepage HTML](https://hay2010.ma/) |
| Theme | Porto (`/wp-content/themes/porto/`) | [Homepage HTML](https://hay2010.ma/) |
| Page builder | WPBakery Page Builder | [Homepage HTML](https://hay2010.ma/) |
| Slider | Slider Revolution 6.7.35 | [Homepage HTML](https://hay2010.ma/) |
| Commerce | WooCommerce 10.5.3; **no products** | [WooCommerce store API](https://hay2010.ma/wp-json/wc/store/v1/products) returns `[]` |
| Forms | Contact Form 7 REST namespace present | [`/wp-json/`](https://hay2010.ma/wp-json/) |
| Mail plugin | GoSMTP REST namespace present | [`/wp-json/`](https://hay2010.ma/wp-json/) |
| Other | Jetpack, Porto/WooCommerce namespaces, Slider Revolution | [`/wp-json/`](https://hay2010.ma/wp-json/) |
| Canonical host | Apex `https://hay2010.ma/`; `https://www.hay2010.ma/` 301s to apex with `x-redirect-by: WordPress` | Live `curl -I` |
| TLS | Let's Encrypt wildcard `*.hay2010.ma`, SAN `*.hay2010.ma` + `hay2010.ma`, valid 2026-09-10 → **2026-12-09** | `openssl s_client -connect hay2010.ma:443 -servername hay2010.ma` |
| HSTS | Not sent | Live headers |
| Origin IP | `159.8.122.144` | [Cloudflare DoH A](https://cloudflare-dns.com/dns-query?name=hay2010.ma&type=A) |
| IP allocation | SoftLayer (IBM) block, RIPE country **NL**; exact data centre not verified | [RIPE RDAP](https://rdap.db.ripe.net/ip/159.8.122.144) |
| PTR | `serveur134.heberjahiz.com` | Reverse DNS for `159.8.122.144` |

### 2.2 Content inventory — placeholder, not a real site

| Type | Count | Notes |
|---|---|---|
| Pages | 12 | Includes `/`, `/company/`, `/services/`, four generic construction service pages, `/projects/`, `/contact/`, `/sample-page/`, `/cart/`, `/my-account/` |
| Posts | 7 | `hello-world`, `lorem-ipsum-*`, `the-construction-business`, `how-to-grow-your-business`, `consectetur-adipiscing-elit` |
| Categories | 3 | `duis`, `news`, `uncategorized` |
| Media | 51 | Mostly Porto demo assets (`ct-brand-*`, `ct-logo`) and a WooCommerce placeholder |
| WooCommerce products | 0 | Store API returns an empty array |

Sources: [pages](https://hay2010.ma/wp-json/wp/v2/pages?per_page=100), [posts](https://hay2010.ma/wp-json/wp/v2/posts?per_page=100), [categories](https://hay2010.ma/wp-json/wp/v2/categories?per_page=100), [media](https://hay2010.ma/wp-json/wp/v2/media?per_page=100), [sitemap index](https://hay2010.ma/sitemaps.xml) (12 page URLs, 8 post URLs including home, 3 category URLs).

The public site is therefore a **Porto/WordPress demo** with generic construction services ("General Construction", "Plumbing", "Painting", "Pre-Construction"), not HAY2010's electrical-contractor content. The existing company research already flagged it as an unfilled WordPress placeholder. **No content migration is implied by the public evidence**; confirm with the client and take a backup anyway.

### 2.3 Performance of the current origin

Three cold-ish `curl` runs against `https://hay2010.ma/` from the researcher's vantage point on 2026-11-08:

```
ttfb=3.665748s total=3.904566s connect=0.067791s tls=0.133595s size=193133
ttfb=2.255188s total=2.491084s connect=0.068005s tls=0.133306s size=193133
ttfb=2.364977s total=2.601770s connect=0.091442s tls=0.159638s size=193133
```

A static theme CSS asset measured `ttfb=0.174841s`, so the network/TLS path is fast; the 2.2–3.7 s is spent generating the WordPress HTML (cache-control is `public, max-age=0`, i.e. the page is not being served from a page cache). This is a strong argument for a static-first Next.js deployment with an edge cache, but it is a single-vantage-point measurement, not a lab benchmark.

### 2.4 Hosting plan

HeberjaHiz's shared Linux hosting page advertises cPanel, CloudLinux, LiteSpeed, PHP 4–8, MySQL, free SSL and a one-click WordPress installer, at **24 DH/month** (Standard), **49 DH/month** (Business) and **83 DH/month** (Performance) [S32]. **No Node.js runtime is listed.** The provider does sell VPS/dedicated plans [S33], but those are self-managed. Next.js 16 requires Node.js **20.9+** [S6], so `next start` is not a fit for the shared plan as documented.

---

## 3. Hosting options

### 3.1 Current WordPress host (HeberjaHiz)

**What it is good for:** keeping email and a rollback copy of the current site; hosting a **static export** of the Next.js site (HTML/CSS/JS files in `public_html`), which LiteSpeed serves quickly.

**What it is not good for:** running the Next.js server. There is no documented Node.js runtime on the shared plans [S32], and Next.js 16 needs Node 20.9+ [S6]. Even if a Node app could be enabled on a VPS, the team would own the process manager, reverse proxy, TLS renewal, OS patching and deploys.

**Static export on this host:** possible (`output: "export"`, upload `out/`), but:
- no `next start`, so no Server Actions, route handlers that use `Request`, cookies, ISR, `proxy.ts`, or `next.config` redirects/headers [S2];
- redirects must be hand-written in `.htaccess` or LiteSpeed rules;
- no preview deployments and no Git-based CI/CD;
- `next/image` needs a custom loader or `unoptimized` [S2].

**Verdict:** keep it for email and rollback; do not choose it as the Next.js runtime.

### 3.2 Vercel

**Next.js support:** Vercel is the first-party platform for Next.js; its docs describe Next.js deployment as "zero-configuration" with additional platform features [S26]. It is also one of the two adapters listed as **verified** by the Next.js team [S1]. All Next.js features are supported on a Node.js server/Docker deployment, and Vercel runs that model [S1][S3].

**Cost (2026-11-08):** Hobby is **$0** but "for personal, non-commercial use"; Pro is **$20/month** with "$20 of included usage credit", flat-rate CDN and free viewer seats [S23]. A corporate site therefore needs **Pro**. Check seat count, VAT and any usage above the credit; the pricing page lists USD excluding taxes.

**Performance:** 126 PoPs in 94 cities / 51 countries and 19 compute-capable regions [S27]. There is **no Morocco compute region**; the nearest are Paris (`cdg1`), Frankfurt (`fra1`) and Cape Town (`cpt1`). Vercel Functions default to `iad1` (Washington, D.C.) unless the project sets a region [S27]. For a brochure site, most pages should be statically generated and served from the CDN; only form submissions hit a function, so set the function region to `cdg1` to keep those round-trips short.

**Operations:** Git push → preview deployment for non-production branches [S30]; promote to production; instant rollback; Deployment Protection (Vercel Authentication / Password Protection) for staging [S31]. Automatic TLS via Let's Encrypt, HTTP-01 for non-wildcard domains, once DNS points at Vercel [S29].

**Domain cutover:** Vercel's own docs say an apex domain is configured with an **A record**, a subdomain with a **CNAME**, and that "changing only the website's A or CNAME record at your current DNS provider does not require moving the rest of your DNS records." They add that if you do move to Vercel nameservers, copy the existing DNS records first, "including MX records for email" [S28]. This is the lowest-blast-radius cutover available.

**Tradeoffs:** $20/month; no Morocco compute region; vendor dependency; usage-based pricing above the credit (image transformations, bandwidth, function duration). For this site's traffic, the included credit should be ample, but enable spend management.

### 3.3 Cloudflare Workers (vinext / OpenNext)

**Two paths:**

| Path | Status | When to use |
|---|---|---|
| **vinext** | Cloudflare's recommended path for new Next.js apps; currently **beta** | New apps; run `npx vinext check` first [S10] |
| **OpenNext adapter** | Maintained path for existing OpenNext apps | Only if already on OpenNext and blocked from migrating [S11] |

**vinext support:** App Router, Pages Router, RSC, Server Actions, SSR/streaming, static generation/export, ISR, middleware/`proxy.ts`, `next/*` imports mostly, Cloudflare bindings. **Image optimization is partial**; PPR support is in progress [S10]. vinext is a Vite plugin that "reimplements the Next.js API surface", not the Next.js runtime [S10].

**Project-specific check:** `npx vinext check` (vinext **v1.4.4**) on a throwaway copy of this repo reported:

```
Imports: 1/1 fully supported (next/font/google)
Libraries: 2/2 compatible (next-themes, tailwindcss)
Project structure: App Router, 1 page, 1 layout
Overall: 100% compatible (6 supported, 0 partial, 0 issues)
```

That is encouraging for the current template, but the template has no forms, CMS, route handlers or image-heavy pages. **Re-run `vinext check` after those are added.** The public compatibility dashboard's latest run (2026-11-08 02:15 UTC) tests **Next.js 16.2.6**, with 99.6% supported pass rate, 96.1% overall pass rate and 93.9% supported surface coverage [S22]; this repo is on **16.4.3**, so exact-version compatibility is not proven by that run.

**Pricing:** Free: 100,000 requests/day, 10 ms CPU/invocation. Paid: **$5/month** minimum per account, 10 million requests included, 30 million CPU-ms included, then usage-based; no egress charge. **Requests to static assets are free and unlimited** [S12]. Worker size limit is 64 MiB; 20,000 static asset files on Free / 100,000 on Paid; 25 MiB per asset [S13]. A static-first site can therefore run at **$0–5/month**, with only form submissions invoking the Worker.

**Operations:** Cloudflare's vinext migration guide states that `vinext` uses `cloudflare.config.ts` instead of a Wrangler configuration file and deploys with the **`cf` CLI**; the Next.js guide's deploy command is `npx @vinext/cloudflare deploy` [S10][S51]. There is **no** Wrangler or `cloudflare.config.ts` in this repo today. Cloudflare Workers Builds provides Git-connected builds and preview URLs for Wrangler-based Workers [S21]; a vinext project needs its CI wired to the vinext deploy command instead.

**The blocker:** a Worker **Custom Domain requires an active Cloudflare zone** and zone ownership [S14]. If the domain's DNS stays at HeberjaHiz, the Worker can only be reached on `*.workers.dev`; attaching `hay2010.ma` means moving the zone to Cloudflare. That is a full nameserver migration with all the email-record risk in §5.

**Tradeoffs:** cheapest at this scale, strong edge/security story (WAF, Turnstile, R2 for CVs), no egress; but **beta framework**, no first-party Next.js adapter verification, partial image optimization, 10 ms CPU on Free (SSR can exceed it), and DNS/zone coupling.

### 3.4 Static export on any host

`output: "export"` produces an `out/` directory that can be served by any static web server [S2]. It is a legitimate choice for a brochure site with no server-side behavior. But the Next.js docs list the following as **unsupported** in static export: dynamic routes without `generateStaticParams`, route handlers that rely on `Request`, cookies, rewrites, redirects, headers, `proxy`, ISR, the default `next/image` loader, Draft Mode, Server Actions, and intercepting routes [S2].

For HAY2010 that means:
- the contact form and careers/CV upload need a **third-party form backend** (Formspree, Basin, Netlify Forms, etc.) or a separate serverless function;
- legacy WordPress URL redirects must be configured at the host (`_redirects`, `.htaccess`), not in `next.config`;
- no CMS preview/Draft Mode; a CMS can still trigger a rebuild;
- images must be pre-optimized or use a custom loader.

**Verdict:** a valid fallback if the site is frozen to "no server features" and forms are externalized. It is not the best default for the planned scope.

### 3.5 Comparison

| Option | Monthly cost (retrieved 2026-11-08) | Next.js 16 support | Performance | Operations | DNS/email impact | Cutover risk | Fit for HAY2010 |
|---|---|---|---|---|---|---|---|
| **Current HeberjaHiz shared** (static export) | 24–83 DH (~$2.5–8.5) | Static only; no server features | LiteSpeed origin, HTTP/3; no CDN | Manual upload; no previews | None; email stays | Low, but DNS still broken | Fallback only |
| **Vercel Pro** | **$20** + usage | First-party; all features | 126 PoPs; nearest region Paris/Frankfurt | Git CI/CD, previews, rollback, protection | A/CNAME only; MX untouched | **Low** (after DNS repair) | **Recommended** |
| **Cloudflare Workers + vinext (Paid)** | **$5** + usage; $0 Free | vinext beta; broad support; image partial | Edge; static assets free | cf CLI / vinext deploy; Git builds need wiring | Requires Cloudflare zone + NS migration | Medium–high | Strong alternative if Cloudflare-native |
| **Cloudflare Workers + OpenNext** | $5 + usage | Broad; image via Cloudflare Images; Node middleware not yet | Edge | Wrangler-based; more moving parts | Requires Cloudflare zone | Medium–high | Only if already on OpenNext |
| **HeberjaHiz VPS + Node** | Plan-dependent; not quoted here | Full, self-managed | Depends on VPS location | You run Node, proxy, TLS, patching | None | Medium | Not recommended for a small team |

---

## 4. Can the site stay fully static, or does it need server routes?

### 4.1 What exists today

The repo is a fresh template: one page, one layout, no `app/api`, no route handlers, no Server Actions, no CMS client. The current page is fully static and could be exported today. The deployment question is therefore really about **what the finished site will contain**, not what is in the repo now.

### 4.2 What the planned site implies

| Requirement | Static export? | Server runtime? | Notes |
|---|---|---|---|
| French corporate pages (Accueil, Le Groupe, Réalisations, Carrières, Médias, Contact) | Yes (SSG) | Yes (SSG) | Static-first works on either; Vercel/Workers cache at the edge |
| Contact form with spam protection | Only with a third-party backend | Yes, via Server Action or route handler | Ticket 11 is still open; Resend/Postmark + Turnstile is a typical server design |
| Careers application with CV upload | No (needs storage + validation) | Yes (R2/S3 + route handler) or external ATS | Ticket 11; file size/type, retention and privacy matter |
| News/actualités or CMS | Yes if build-time only | Yes if preview/Draft Mode or on-demand revalidation | Ticket 04 is still open; a headless CMS with preview needs a server |
| Redirects from old WordPress URLs | Host-level only | `next.config`/`proxy` or host-level | Static export cannot use `next.config` redirects [S2] |
| `next/image` optimization | Custom loader or `unoptimized` | Default loader works | Vercel handles it; Workers/Cloudflare Images partial |
| ISR / on-demand revalidation | No | Yes | Static export doesn't support ISR [S2] |
| Staging with `noindex`/auth | Host-level headers | `headers()` or platform protection | Vercel Deployment Protection is easiest |

### 4.3 Recommendation: static-first, with server routes only where needed

Build the marketing pages as **statically generated** pages (App Router Server Components, no per-request data), and keep a **small server surface** for:
- the contact form (Server Action or `/api/contact` route handler),
- the careers application (CV upload to object storage + email notification),
- CMS preview/revalidation if a CMS is chosen,
- legacy redirects if not handled at the host.

This gives the performance of a static site and the flexibility the forms/CMS tickets require. Vercel supports this without extra infrastructure; Cloudflare Workers supports it with vinext/OpenNext, but with the beta/zone caveats above.

### 4.4 If the client insists on fully static

Then all of the following must be true:
- forms go to a third-party backend (Formspree/Basin/Netlify Forms or a separate Worker/function);
- no CMS preview, no Draft Mode, no ISR — content changes trigger a rebuild;
- redirects are maintained in host config (`_redirects` or `.htaccess`);
- images are pre-optimized or use a custom loader;
- the site is hosted on the current HeberjaHiz plan (cheapest, no new vendor) or Cloudflare Pages/Workers static assets (needs Cloudflare DNS for a custom domain).

This is a coherent architecture, but it trades away most of the reasons to use Next.js and adds a form vendor. It is a fallback, not the recommended path.

---

## 5. Domain, DNS, SSL and email

### 5.1 Registrar, delegation and the critical DNS finding

**Registrar (WHOIS, `whois.registre.ma:43`, 2026-11-08):**

| Field | Value |
|---|---|
| Domain | `hay2010.ma` |
| Registrar | **NINDO HOST**, 66 Avenue Mohammed V, 4ème étage, N°25, Tanger |
| Created | 2021-03-15 |
| Registry expiry | **2027-03-15** |
| Status | `clientTransferProhibited` |
| Registrant / admin / tech | "ste hay2010"; admin email is a company Gmail address |
| WHOIS last update | 2025-03-17 |

**The delegation is split and partly broken.** The `.ma` parent zone (queried directly at `c.tld.ma`, 81.192.171.139 and 81.192.171.115) returns **four** NS records for `hay2010.ma`:

```
aaron.ns.cloudflare.com
khloe.ns.cloudflare.com
server116ns1.heberjahiz.com
server116ns2.heberjahiz.com
```

Querying those servers directly on 2026-11-08:
- `aaron.ns.cloudflare.com` and `khloe.ns.cloudflare.com` (multiple anycast IPs) return **REFUSED (RCODE 5)** for `hay2010.ma` A, NS and SOA. They answer `cloudflare.com` authoritatively, so this is not a network problem: the Cloudflare zone is not serving `hay2010.ma`.
- `server116ns1/2.heberjahiz.com` (159.8.74.230/231) answer authoritatively: SOA `server134ns1.heberjahiz.com serveurs.arcanes.biz 2026091001 …`, NS `server134ns1/2.heberjahiz.com`, A `159.8.122.144`.

**Impact:** roughly half of the delegated nameservers fail, so recursive resolvers can intermittently SERVFAIL. In a 12-query sample through Cloudflare's public resolver: `hay2010.ma A` → 10× NOERROR, 2× SERVFAIL; `mail.hay2010.ma A` → 11× NOERROR, 1× SERVFAIL; `_dmarc.hay2010.ma TXT` → 7× NXDOMAIN, 5× SERVFAIL. Google's resolver returned NOERROR 12/12 for the A records and NXDOMAIN 12/12 for DMARC. This is consistent with a **half-finished Cloudflare nameserver migration**: the Cloudflare NS were added at the registrar but the zone was never activated/serving, and the old HeberjaHiz NS were left in place.

**A second, lower-severity mismatch:** the parent delegates to `server116ns1/2`, while the child zone's NS records are `server134ns1/2`. Both hostnames currently resolve to the same two IPs (159.8.74.230/231), so the zone answers, but parent and child NS sets should match. Ask HeberjaHiz which pair is canonical before editing.

**What this means for "who controls DNS":** control is fragmented across three parties:
1. **NINDO HOST** — registrar; owns the delegation and the domain lock/expiry.
2. **HeberjaHiz** — hosts the actual DNS zone and the website/email server (`server134ns1/2`, SOA contact `serveurs.arcanes.biz`).
3. **An unknown Cloudflare account** — the source of `aaron`/`khloe`; the zone is not serving, but the NS pair was assigned to some zone at some point.

No DNS changes were made in this research. **Do not start the hosting cutover until this is repaired.**

### 5.2 Current DNS record inventory (observed)

| Type | Name | Value | TTL | Action at cutover |
|---|---|---|---|---|
| A | `@` | `159.8.122.144` | 7200 | Change to the Vercel A value at cutover |
| CNAME | `www` | `hay2010.ma.` | 7200 | Change to the Vercel CNAME value at cutover |
| MX | `@` | `0 mail.hay2010.ma.` | 7200 | **Keep** |
| A | `mail` | `159.8.122.144` | 7200 | **Keep** (DNS-only if Cloudflare) |
| A | `webmail` | `159.8.122.144` | 7200 | **Keep** |
| A | `cpanel` | `159.8.122.144` | 7200 | **Keep** |
| A | `ftp` | `159.8.122.144` | 7200 | **Keep** |
| SRV | `_autodiscover._tcp` | `0 0 443 cpanelemaildiscovery.cpanel.net.` | 7200 | **Keep** |
| TXT | `@` (SPF) | see below | 7200 | **Keep**, then remove `+a` |
| TXT | `default._domainkey` | `v=DKIM1; k=rsa; p=…` (present) | 7200 | **Keep** |
| TXT | `_dmarc` | **none** (NXDOMAIN) | — | Add `p=none` after cutover |
| CAA | `@` | **none** | — | No CA restriction observed |
| DS / DNSKEY | `@` | **none** | — | DNSSEC is not active |

SPF as observed (single line):

```
v=spf1 ip4:159.8.122.144 +mx +a +ip4:159.8.122.146 include:serveur134.heberjahiz.com include:_spf.google.com -all
```

Notes:
- The `+a` mechanism authorizes the current apex A record (the web server). After the website moves to Vercel, `+a` would authorize Vercel's IPs to send as `hay2010.ma`. **Remove `+a`** once the new A record is live, unless you explicitly want the web host to send mail. Keep `+mx` and the explicit `ip4:` entries.
- The SPF already includes `_spf.google.com`, even though the MX is local cPanel. That suggests some mail is sent through Google (the GoSMTP plugin or a Google account). **Confirm with the client before changing SPF**; a missing include can break form notifications.
- The top-level SPF has **four DNS-triggering mechanisms**: `+mx`, `+a`, `include:serveur134.heberjahiz.com` and `include:_spf.google.com` (`ip4` entries do not count). `_spf.google.com` expands into further lookups, so adding a transactional provider (Resend, Postmark, Brevo) must stay under the 10-lookup limit; removing `+a` at cutover also frees one lookup.
- DKIM is a cPanel `default._domainkey` key. Do not regenerate it unless the mail server changes; if you move mail, the new provider will issue its own DKIM.
- There is **no DMARC record**. Add one after the cutover (`p=none`, a reporting mailbox), then move to `quarantine`/`reject` once reports are clean.
- `mail`, `webmail`, `cpanel` and `ftp` all point at the same server. If you move nameservers to Cloudflare, recreate all four as **DNS only** (grey cloud) [S18]; proxying mail/webmail through Cloudflare is not appropriate.

### 5.3 Two ways to repair the delegation

**Option A — keep DNS at HeberjaHiz (lowest risk; recommended with Vercel).**
At NINDO HOST, remove the two Cloudflare NS and keep the two HeberjaHiz NS (or switch them to `server134ns1/2` if HeberjaHiz confirms that is the canonical pair). This restores a consistent delegation with no record migration, because the zone already lives at HeberjaHiz. Then attach Vercel with an A/CNAME change only. Email is untouched. This is the smallest possible change and the easiest to roll back.

**Option B — complete the Cloudflare migration.**
If the Cloudflare zone behind `aaron`/`khloe` is accessible and the team wants Cloudflare (for Workers, WAF, Turnstile, R2, etc.), complete it properly:
1. Create/claim the Cloudflare zone.
2. Import **every** record from the HeberjaHiz zone, including MX, `mail` A, `webmail`/`cpanel`/`ftp`, the autodiscover SRV, SPF, DKIM and any other subdomains. Cloudflare's quick scan is "not guaranteed to find all existing DNS records" [S17].
3. Keep `mail`/`webmail`/`cpanel`/`ftp` **DNS only** [S18].
4. Verify from multiple resolvers that the Cloudflare zone answers correctly for A, MX, TXT and SRV **before** changing the registrar.
5. Turn off DNSSEC at the registrar if it is active (it is not active here: no DS/DNSKEY observed), then change the delegation to the two Cloudflare NS only [S17].
6. Monitor mail flow and the website for 48 hours.

Either way, **do not leave the split delegation in place**. Option A is the recommendation for launch; Option B is the strategic Cloudflare path and should be its own change window, not part of the website cutover.

### 5.4 SSL/TLS implications

- **Current:** Let's Encrypt wildcard `*.hay2010.ma`, valid through **2026-12-09**, issued by `YR2`; no CAA records, so no CA is pinned. HSTS is not sent.
- **Vercel:** automatically requests a Let's Encrypt certificate for every domain added to a project, using HTTP-01 for non-wildcard domains once DNS points at Vercel [S29]. No nameserver change is required. `hay2010.ma` and `www` will each get a certificate; verify both after cutover.
- **Cloudflare:** Universal SSL is free and covers the apex and first-level subdomains on a full setup, issued after the zone is active [S20]. If Cloudflare proxies to Vercel, you add a layer: Cloudflare terminates TLS and needs a valid origin certificate (Full/Full strict), so either use Cloudflare's Origin CA or keep the records **DNS only** initially. DNS-only is simpler and avoids double-TLS/redirect surprises.
- **HSTS:** add `Strict-Transport-Security` only after both apex and `www` are stable on HTTPS and you are confident about the redirect direction. It is not present today, so adding it is a new commitment.
- **Certificate overlap:** if the cutover happens before 2026-12-09, the old wildcard certificate remains valid on the old server for rollback. Do not cancel the old hosting until the new certificate is confirmed.

### 5.5 Email implications (treat as production)

- **Current path:** MX `0 mail.hay2010.ma` → `159.8.122.144`; PTR `serveur134.heberjahiz.com` matches the mail host, which is good for deliverability. DKIM is present; SPF is present and strict (`-all`); DMARC is absent.
- **If DNS stays at HeberjaHiz:** change only the website's A/CNAME. Leave MX, `mail`, `webmail`, `cpanel`, `ftp`, the autodiscover SRV, SPF and DKIM untouched. This is the lowest-risk email path and the main reason to prefer Option A.
- **If nameservers move:** recreate every mail record exactly, verify with `dig`/DoH from multiple resolvers, and send test mail in both directions before and after the NS change. Cloudflare's own docs warn that missing records can make the domain unreachable [S17].
- **Do not enable Cloudflare Email Routing** on this zone: onboarding adds its own MX records to route incoming email to Cloudflare [S19]. That would replace the existing cPanel MX and break the current mailboxes unless you deliberately migrate email.
- **SPF after cutover:** remove `+a`; keep `+mx`, `ip4:159.8.122.144`, `ip4:159.8.122.146`, `include:serveur134.heberjahiz.com`, `include:_spf.google.com`; add the transactional provider's include if forms send mail. Re-test with an external mailbox and check the Authentication-Results headers.
- **DMARC:** add `v=DMARC1; p=none; rua=mailto:<mailbox>` after cutover, monitor, then tighten. Do not start at `p=reject` on a domain with unknown senders (the Google include suggests there may be more).
- **Keep the hosting plan active** as long as the mailboxes live there. Moving the website does not move email; cancelling the plan would.
- **Test matrix:** send from Gmail/Outlook to `contact@hay2010.ma` and `recrutement@hay2010.ma`; reply from those mailboxes; check spam folders; check SPF/DKIM/DMARC pass; test webmail login; test autodiscover in Outlook/Apple Mail.

### 5.6 Domain/registrar implications

- The domain is registered at **NINDO HOST**, not HeberjaHiz, and expires **2027-03-15**. The registrar account is the only place where the nameserver delegation can be changed. Confirm who has that login before planning the cutover.
- `clientTransferProhibited` is normal and does **not** prevent nameserver edits; it prevents registrar transfers.
- There is no public RDAP for `.ma`; the registry WHOIS on port 43 is the primary source. The WHOIS "last update" is 2025-03-17, so the NS set shown there may lag the live delegation. Always verify the live parent zone (`c.tld.ma`) as well.
- No domain transfer is needed for either hosting path. Keep the registrar and renew before 2027-03-15.

---

## 6. Recommended path

### 6.1 Decision

**Launch on Vercel Pro, with DNS kept at HeberjaHiz after repairing the delegation (Option A), and email left untouched.**

Why this one:
1. **First-party Next.js 16 support.** Vercel is a verified Next.js adapter and runs the full feature set [S1][S26]; no beta framework on a client site.
2. **Smallest blast radius.** Only the apex A and `www` CNAME change. MX, `mail`, `webmail`, `cpanel`, `ftp`, the autodiscover SRV, SPF and DKIM stay where they are. Vercel's docs explicitly support this "A/CNAME only" model [S28].
3. **Staging and rollback are built in.** Preview deployments per branch [S30], Deployment Protection [S31], automatic TLS [S29], and a trivial rollback: restore the old A/CNAME while the WordPress origin is still running.
4. **Performance is good enough.** Static pages are served from Vercel's CDN; form submissions run in `cdg1` (Paris). The current origin's 2.2–3.7 s TTFB should improve substantially for cached pages.
5. **Cost is predictable.** $20/month Pro, with $20 included usage credit [S23]. For a brochure site with a contact/careers form, that should be the whole bill; enable spend management and check VAT.

### 6.2 Conditions

- **Repair the delegation first** (§5.3, Option A). Do not change the website A record while two of the four delegated nameservers are refusing queries.
- **Confirm access** to NINDO HOST (registrar), HeberjaHiz cPanel/DNS, WordPress admin and the mailboxes. Without them, neither path is safe.
- **Confirm the Cloudflare zone owner.** If the team wants Cloudflare, switch to Option B and consider Workers; if not, remove the Cloudflare NS.
- **Confirm the forms backend and CV storage** before building the server routes. Resend/Postmark + Turnstile + R2/S3 is a reasonable default; ticket 11 decides.
- **Confirm the CMS decision** (ticket 04). If a CMS with preview is chosen, keep the server runtime; if content is build-time only, static-first still works on Vercel.

### 6.3 When to choose Cloudflare instead

Choose **Cloudflare Workers + vinext** if **all** of these are true:
- the Cloudflare zone is accessible and the team is willing to complete the nameserver migration (Option B);
- the team accepts vinext's beta status and the 16.2.6-vs-16.4.3 compatibility gap;
- the site's Next.js surface stays simple (marketing pages + a contact form; no complex image pipeline or PPR);
- the $15/month saving and Cloudflare-native security/storage (Turnstile, R2) matter more than first-party Next.js support.

If the Cloudflare zone is accessible but the team is not ready for beta, a middle path is **Cloudflare DNS (Option B) + Vercel** with DNS-only records. That gives Cloudflare DNS/WAF options later without committing to vinext now.

### 6.4 What not to do

- **Do not run `next start` on the HeberjaHiz shared plan.** No Node.js runtime is documented, and Next.js 16 needs Node 20.9+ [S32][S6].
- **Do not cancel the HeberjaHiz plan** when the website moves. Email lives there.
- **Do not enable Cloudflare Email Routing** on this zone [S19].
- **Do not move nameservers and change the website A record in the same window.** Repair the delegation first, then cut over the website.
- **Do not use Vercel Hobby for a commercial site**; it is explicitly for personal, non-commercial use [S23].

---

## 7. Cutover checklist

Use this as a runbook. Owners are placeholders; fill them in before the change window. Commands assume a shell with `curl` and `openssl`; `dig` may not be installed, so DNS-over-HTTPS examples are included.

### Phase 0 — Access and inventory (T-14 days)

- [ ] Confirm **NINDO HOST** registrar login, domain lock status and expiry (2027-03-15). Confirm who can edit nameservers.
- [ ] Confirm **Cloudflare** account/zone ownership for `aaron`/`khloe`; check whether a `hay2010.ma` zone exists in "pending" state.
- [ ] Confirm **HeberjaHiz** cPanel/DNS login; export the full zone (A, AAAA, CNAME, MX, TXT, SRV, CAA).
- [ ] Confirm **WordPress admin**; take a full backup (files + database) even if no content will be migrated.
- [ ] Confirm **mailbox ownership**: which addresses must keep working (`contact@`, `recrutement@`, direction, etc.), aliases, forwarding, quotas, SMTP/IMAP settings.
- [ ] Inventory URLs: 12 pages + 7 posts + 3 categories + media; capture the current sitemap and Search Console/Analytics access.
- [ ] Decide canonical host (apex vs `www`) and trailing-slash policy. Current WordPress uses trailing slashes and redirects `www` → apex; Next.js defaults to no trailing slash. Pick one and 301 the other [S8].
- [ ] Decide the forms backend (Server Action + Resend/Postmark vs third-party) and CV storage; write the privacy/retention text.
- [ ] Provision the Vercel project, connect the GitHub repo, set the Node version and environment variables; confirm a production build.
- [ ] Add `staging.hay2010.ma` (or use the auto-generated preview URL), assign it to a non-production branch, and protect it with Deployment Protection [S30][S31]. Add `X-Robots-Tag: noindex` if the staging domain is public [S9].
- [ ] Lower DNS TTL for the apex A and `www` CNAME to **300 s** at least 24–48 h before cutover (current TTL 7200 s).
- [ ] Prepare the rollback record: old A `159.8.122.144`, old `www` CNAME `hay2010.ma`, and a copy of every DNS record.

### Phase 1 — Repair the delegation (T-7 to T-3 days)

Choose **one** path and finish it before touching the website.

**Option A — keep DNS at HeberjaHiz (recommended):**
- [ ] At NINDO HOST, remove `aaron.ns.cloudflare.com` and `khloe.ns.cloudflare.com`; keep the two HeberjaHiz NS. If HeberjaHiz confirms `server134ns1/2` is canonical, consider switching to those to match the child zone.
- [ ] Verify the parent delegation from two `.ma` servers and from public resolvers; confirm there are exactly two NS and both answer authoritatively.
- [ ] Confirm `hay2010.ma A`, `mail.hay2010.ma A`, MX, SPF, DKIM and the autodiscover SRV still resolve.
- [ ] Monitor for 24–48 h; watch for SERVFAIL reports and mail delivery issues.

**Option B — complete the Cloudflare zone:**
- [ ] Import every record into Cloudflare; do not rely solely on the quick scan [S17].
- [ ] Keep `mail`, `webmail`, `cpanel`, `ftp` DNS-only [S18].
- [ ] Verify A, MX, TXT (SPF/DKIM) and SRV from multiple resolvers **before** changing the registrar.
- [ ] Turn off DNSSEC at the registrar if active (none observed here), then set the delegation to the two Cloudflare NS only [S17].
- [ ] Do **not** enable Email Routing [S19]. Monitor mail for 48 h.

### Phase 2 — Staging verification (T-1 day)

- [ ] Deploy the release candidate to Vercel; test on `staging.hay2010.ma` or the preview URL.
- [ ] Verify every route, the French copy, `lang="fr"`, metadata/canonical/OG, sitemap and `robots.txt`.
- [ ] Test the contact form end-to-end (submission → email → auto-reply → spam protection).
- [ ] Test careers/CV upload (file type/size, storage, notification, retention).
- [ ] Test the legacy redirect map (see Appendix A); confirm 301s, not 302s, and no redirect chains.
- [ ] Check mobile, Lighthouse/Core Web Vitals, 404 page, and `www`/apex canonicalisation.
- [ ] Confirm staging is `noindex` and/or password-protected.
- [ ] Send test email to/from `contact@hay2010.ma` and `recrutement@hay2010.ma`; check SPF/DKIM/DMARC results.

### Phase 3 — Cutover (T-0)

- [ ] Freeze WordPress content changes; take a final database backup.
- [ ] Deploy the release candidate to Vercel production; confirm the deployment is healthy.
- [ ] At HeberjaHiz (Option A) or Cloudflare (Option B), change **only**:
  - apex `A` → the exact value Vercel shows in Project → Settings → Domains;
  - `www` `CNAME` → the exact value Vercel shows (it may be a project-specific `*.vercel-dns-*.com` target; do not copy a value from a blog post).
- [ ] Leave MX, `mail`, `webmail`, `cpanel`, `ftp`, the autodiscover SRV, SPF and DKIM unchanged.
- [ ] Wait for the 300 s TTL and propagation; verify from at least two independent resolvers.
- [ ] Verify `https://hay2010.ma/` returns 200 with the new site and a valid certificate for both apex and `www` [S29].
- [ ] Verify `https://www.hay2010.ma/` 301s to the canonical host, and that HTTP → HTTPS still works.
- [ ] Verify all legacy URLs in Appendix A; check for 404s and redirect chains.
- [ ] Verify forms and email again, from outside the office network.
- [ ] Submit the new sitemap in Google Search Console; request indexing for the main pages; keep the old sitemap reachable via 301 or 410.

### Phase 4 — Post-cutover (T+1 to T+30 days)

- [ ] Monitor DNS, HTTP 5xx, TTFB, form submissions and mail flow daily for the first week.
- [ ] Fix 404s and redirect misses; update the redirect map.
- [ ] Remove `+a` from SPF now that the apex A points at Vercel (unless the web host must send mail); keep `+mx` and the explicit IPs.
- [ ] Add DMARC `p=none` with a reporting mailbox; monitor; tighten later.
- [ ] Add HSTS after both apex and `www` are stable on HTTPS.
- [ ] Keep the old WordPress site and HeberjaHiz plan running for at least 30 days; do not cancel email hosting.
- [ ] Lock down or retire the old WordPress install: remove unused plugins/themes, disable REST/user enumeration if it stays online, or replace `public_html` with a maintenance page.
- [ ] If a blog/news section is kept, decide whether it lives in the Next.js site or on `blog.hay2010.ma`; redirect old feeds/categories accordingly.
- [ ] Update Google Business Profile, social profiles, email signatures and any printed material with the new site/URL.
- [ ] Close the loop: confirm the client can update content (if CMS) and knows who to call for incidents.

### Phase 5 — Rollback

- [ ] If the new site is broken, restore the old apex A (`159.8.122.144`) and `www` CNAME (`hay2010.ma`) at the DNS provider; keep TTL at 300 s.
- [ ] If SPF was changed, restore the previous SPF string.
- [ ] Confirm the old WordPress site is still serving and mail still flows.
- [ ] Investigate off-peak; do not retry the cutover until the cause is understood.

### Verification commands

```bash
# Current headers / server / HSTS
curl -sSI https://hay2010.ma/ | sed -n '1,20p'

# TLS certificate (apex and www)
echo | openssl s_client -connect hay2010.ma:443 -servername hay2010.ma 2>/dev/null \
  | openssl x509 -noout -issuer -subject -dates -ext subjectAltName

# Delegation (Cloudflare DoH JSON)
curl -sS -H 'accept: application/dns-json' \
  'https://cloudflare-dns.com/dns-query?name=hay2010.ma&type=NS'

# Mail records
curl -sS 'https://dns.google/resolve?name=hay2010.ma&type=MX'
curl -sS 'https://dns.google/resolve?name=hay2010.ma&type=TXT'
curl -sS 'https://dns.google/resolve?name=mail.hay2010.ma&type=A'

# Redirect checks
for p in /company/ /services/ /projects/ /contact/ /sample-page/ /cart/ /my-account/; do
  printf '%-16s ' "$p"; curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' "https://hay2010.ma$p"
done
```

---

## 8. Open access questions for the user

**A. Domain and DNS**
1. Who has the **NINDO HOST** registrar login, and can they change nameservers? (Needed for any delegation repair.)
2. Who created or controls the **Cloudflare zone** behind `aaron.ns.cloudflare.com` / `khloe.ns.cloudflare.com`? Is there a pending `hay2010.ma` zone in a Cloudflare account? (Decides Option A vs Option B.)
3. Who has the **HeberjaHiz cPanel/DNS** login? Can they export the full zone and edit A/CNAME records?
4. Is there any reason the Cloudflare NS were added (a previous agency, a failed migration, a security product)? Was the migration abandoned?
5. Which HeberjaHiz NS pair is canonical, `server116ns1/2` or `server134ns1/2`? (Parent and child currently disagree.)

**B. Hosting and WordPress**
6. Who has **WordPress admin**? Are there custom plugins, forms, orders or users that must be preserved?
7. Is WooCommerce actually used (orders, customers, subscriptions)? The public store API shows no products.
8. What is the current hosting contract (plan, renewal date, whether email is bundled)? Can the website move while keeping email on the same plan?
9. Is there a **staging** convention or an existing `staging.hay2010.ma`? (It does not resolve today.)

**C. Email**
10. Which mailboxes/aliases must keep working, and who administers them? Is Google Workspace involved (SPF includes `_spf.google.com`)?
11. Do `contact@` and `recrutement@` forward anywhere? What is the desired routing for form notifications and CVs?
12. Is there an existing DMARC/SPF/DKIM policy owner, or can we change SPF/DMARC as part of the cutover?

**D. Accounts and deployment**
13. Who owns the **GitHub** repo/org, and can we install the Vercel GitHub app (or use a deploy token)? Is the repo private?
14. Is there an existing **Vercel** or **Cloudflare** account/team to use, or do we create one? Who pays?
15. What is the budget: Vercel Pro **$20/month**, Cloudflare Workers **$0–5/month**, or stay on the current **24–83 DH/month** hosting? Is a 12-month commitment acceptable?

**E. Content, SEO and legal**
16. Who owns **Google Search Console / Analytics**? Are there backlinks or rankings on the current URLs that must be preserved?
17. Is any current WordPress content real (the public evidence says it is demo/lorem ipsum)? Should it be archived or migrated?
18. Where do CVs and contact-form submissions get stored, for how long, and who can access them? (Moroccan law 09-08 / GDPR if EU visitors.)
19. Who approves French copy, brand assets (logo, photos) and the legal pages?
20. Who maintains the site after launch: a developer, an agency, or the client? What is the incident contact?

---

## 9. Unverified facts and limitations

- **Cloudflare account state:** `cf auth whoami` reports not logged in; no Cloudflare zone or account could be inspected. We know the parent delegation includes Cloudflare NS and that those NS refuse the zone; we do **not** know whether a zone exists in "pending" state, who owns it, or whether the NS were added intentionally.
- **Registrar NS edit process:** the WHOIS confirms NINDO HOST and the delegation, but the registrar's control panel/process was not accessed. WHOIS "last update" is 2025-03-17, so it may lag the live delegation.
- **Physical origin location:** RIPE RDAP shows the IP block allocated to SoftLayer (IBM) with country NL; the exact data centre is not verified. The performance numbers are from one vantage point.
- **Hosting contract/email bundling:** not verified; the current plan may bundle email with the website. Confirm before cancelling anything.
- **WordPress admin data:** public REST/sitemap only. WooCommerce orders/customers, WordPress users, plugins and settings are not public; the "no real content" conclusion is based on public pages/posts/media.
- **SEO/analytics:** no Search Console, Analytics or backlink data was available.
- **Vercel DNS target values:** Vercel shows project-specific A/CNAME values in the dashboard; the docs describe the record types but not a universal IP/CNAME. Use the dashboard values, not stale values from third-party posts.
- **Vercel Pro total cost:** the pricing page lists $20/month with a $20 usage credit; seat count, VAT and overages depend on the account. Confirm the invoice.
- **Cloudflare PoP in Morocco:** not verified from public docs at retrieval time. Do not assume a Casablanca PoP; the performance case for Cloudflare rests on its global anycast network, not a verified local PoP.
- **Node.js on HeberjaHiz VPS:** the VPS/dedicated plans exist, but a supported Node.js runtime/version is not documented. Treat it as self-managed.
- **vinext exact-version compatibility:** `vinext check` passed 100% on the current template, but the public dashboard's latest run is against Next.js **16.2.6**, while this repo uses **16.4.3**. Re-run the check after adding forms/CMS code.
- **`vinext check` scope:** it analyzed the current template only (one page, one layout, no route handlers, no CMS, no image pipeline). A 100% result today is not a guarantee for the finished site.

---

## Appendix A — Current URL inventory and provisional dispositions

The new page tree is still open (ticket 01), so the destinations below are provisional. The important part is to **decide and implement a 301 for every URL that has any external links**, and a 410 for demo pages with no equivalent.

| Old URL | Type | Provisional disposition |
|---|---|---|
| `/` | Page | New home (200) |
| `/company/` | Page | 301 → `/le-groupe` (TBD) |
| `/services/` | Page | 301 → `/nos-metiers` or `/services` (TBD) |
| `/services/general-construction/` | Demo page | 301 → services hub, or 410 if no equivalent |
| `/services/plumbing/` | Demo page | 301 → services hub, or 410 |
| `/services/painting/` | Demo page | 301 → services hub, or 410 |
| `/services/pre-construction/` | Demo page | 301 → services hub, or 410 |
| `/projects/` | Page | 301 → `/realisations` (TBD) |
| `/contact/` | Page | 301 → `/contact` |
| `/sample-page/` | Demo page | 410 |
| `/cart/` | WooCommerce page | 410 (no products; confirm unused) |
| `/my-account/` | WooCommerce page | 410 (no products; confirm unused) |
| `/2026/02/16/hello-world/` | Demo post | 410, or 301 → news hub if a blog launches |
| `/2016/07/23/the-construction-business/` | Demo post | 410, or 301 → news hub |
| `/2016/07/23/consectetur-adipiscing-elit/` | Demo post | 410, or 301 → news hub |
| `/2016/07/23/how-to-grow-your-business/` | Demo post | 410, or 301 → news hub |
| `/2016/07/23/lorem-ipsum-dolor-sit-amet-3/` | Demo post | 410, or 301 → news hub |
| `/2016/07/22/lorem-ipsum-dolor-sit-amet-2/` | Demo post | 410, or 301 → news hub |
| `/2016/07/22/lorem-ipsum-dolor-sit-amet/` | Demo post | 410, or 301 → news hub |
| `/category/duis/` | Demo category | 410, or 301 → news hub |
| `/category/news/` | Demo category | 410, or 301 → news hub |
| `/category/uncategorized/` | Demo category | 410 |
| `/feed/`, `/wp-json/`, `/xmlrpc.php` | WordPress infrastructure | 410/404 on the new site; do not expose |
| `/sitemaps.xml` | Old sitemap | 301 → new `/sitemap.xml` (or 410) |
| `/wp-content/uploads/...` | Media | Keep only if any asset is referenced externally; otherwise 410 |

Note: the current WordPress sitemap lists 12 page URLs, 8 post URLs (including the homepage) and 3 category URLs; the duplicates and demo entries mean the real redirect list is small. Verify with a crawl before cutover.

---

## Appendix B — DNS record inventory (copy before changing anything)

```
; Observed 2026-11-08; TTLs are seconds; values are as returned by the authoritative servers.
hay2010.ma.            7200 IN A      159.8.122.144
www.hay2010.ma.        7200 IN CNAME  hay2010.ma.
hay2010.ma.            7200 IN MX     0 mail.hay2010.ma.
mail.hay2010.ma.       7200 IN A      159.8.122.144
webmail.hay2010.ma.    7200 IN A      159.8.122.144
cpanel.hay2010.ma.     7200 IN A      159.8.122.144
ftp.hay2010.ma.        7200 IN A      159.8.122.144
_autodiscover._tcp.hay2010.ma. 7200 IN SRV 0 0 443 cpanelemaildiscovery.cpanel.net.
hay2010.ma.            7200 IN TXT    "v=spf1 ip4:159.8.122.144 +mx +a +ip4:159.8.122.146 include:serveur134.heberjahiz.com include:_spf.google.com -all"
default._domainkey.hay2010.ma. 7200 IN TXT "v=DKIM1; k=rsa; p=…"
; _dmarc.hay2010.ma: none (NXDOMAIN)
; CAA: none
; DS / DNSKEY: none (DNSSEC not active)
; SOA: server134ns1.heberjahiz.com. serveurs.arcanes.biz. 2026091001 3600 1800 1209600 86400
; Parent delegation: aaron.ns.cloudflare.com, khloe.ns.cloudflare.com,
;                     server116ns1.heberjahiz.com, server116ns2.heberjahiz.com
```

Before changing the delegation, export the zone from cPanel (or ask HeberjaHiz) and compare it with this list. Public DNS cannot show records that are not published, and Cloudflare's quick scan is not guaranteed to find everything [S17].

---

## 10. Sources

All URLs retrieved **2026-11-08** unless noted. Documentation is cited for the claim it supports; live evidence is linked inline above.

| ID | Source | Used for |
|---|---|---|
| S1 | [Next.js — Deploying](https://nextjs.org/docs/app/getting-started/deploying) | Node server supports all features; static export is limited; Vercel is a verified adapter |
| S2 | [Next.js — Static Exports](https://nextjs.org/docs/app/guides/static-exports) | Unsupported features list (Server Actions, redirects, headers, ISR, image loader, proxy, cookies, Draft Mode) |
| S3 | [Next.js — Self-hosting](https://nextjs.org/docs/app/guides/self-hosting) | Image optimization with `next start`; ISR cache on local disk; multi-instance cache caveats; reverse proxy recommendation |
| S4 | [Next.js — Forms](https://nextjs.org/docs/app/guides/forms) | Server Actions for forms |
| S5 | [Next.js — `redirects` config](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) | Redirect rules in `next.config` |
| S6 | [Next.js — Installation](https://nextjs.org/docs/app/getting-started/installation) | Minimum Node.js 20.9 |
| S7 | [Next.js — Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) | Proxy/middleware requires a server; not supported in static export |
| S8 | [Next.js — `trailingSlash`](https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash) | Trailing-slash policy |
| S9 | [Next.js — `headers`](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers) | Adding headers such as `X-Robots-Tag` on a server runtime |
| S10 | [Cloudflare — Next.js (vinext)](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) | vinext beta; supported features; image partial; `vinext check`; deploy command; last updated 2026-11-05 |
| S11 | [Cloudflare — OpenNext adapter](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/) | OpenNext feature support; Cloudflare recommends vinext for new apps; Node middleware not yet |
| S12 | [Cloudflare Workers — Pricing](https://developers.cloudflare.com/workers/platform/pricing/) | Free 100k/day/10 ms; Paid $5/month, 10M requests, 30M CPU-ms; static assets free/unlimited |
| S13 | [Cloudflare Workers — Limits](https://developers.cloudflare.com/workers/platform/limits/) | 64 MiB worker; 20k/100k assets; 25 MiB per asset; CPU limits; 128 MB memory |
| S14 | [Cloudflare Workers — Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) | Requires an active Cloudflare zone and zone ownership |
| S15 | [Cloudflare Workers — Static assets redirects](https://developers.cloudflare.com/workers/static-assets/redirects/) | `_redirects` format; 2,000 + 100 rule limit; not applied to Worker-served responses |
| S16 | [Cloudflare Workers — Static assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) | Static asset requests free/unlimited; range-request limitation |
| S17 | [Cloudflare — DNS full setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/) | Add zone, review records, quick scan not guaranteed, change nameservers, DNSSEC warning |
| S18 | [Cloudflare — Email records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/email-records/) | MX/A/SPF/DKIM/DMARC setup; `mail` A must be DNS only |
| S19 | [Cloudflare — Route emails / Email Routing](https://developers.cloudflare.com/email-service/get-started/route-emails/) | Enabling routing adds MX/SPF/DKIM records — do not enable on the current mail zone |
| S20 | [Cloudflare — Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/) | Free certificate for apex + first-level subdomains after activation |
| S21 | [Cloudflare Workers — Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) | Git integration and preview URLs for Workers |
| S22 | [vinext — Compatibility](https://vinext.dev/compatibility) | Latest run 2026-11-08: Next.js 16.2.6, 99.6% supported, 96.1% overall, 93.9% coverage |
| S23 | [Vercel — Pricing](https://vercel.com/pricing) | Hobby non-commercial; Pro $20/month; $20 usage credit; Hobby 100 GB transfer |
| S24 | [Vercel — Limits](https://vercel.com/docs/limits) | Platform limits (projects, deployments, functions) |
| S25 | [Vercel — Plans](https://vercel.com/docs/plans) | Hobby/Pro/Enterprise plan structure |
| S26 | [Vercel — Next.js](https://vercel.com/docs/frameworks/nextjs) | Zero-config Next.js deployment; platform features |
| S27 | [Vercel — Regions](https://vercel.com/docs/regions) | 126 PoPs / 19 regions; default `iad1`; `cdg1`, `fra1`, `cpt1` |
| S28 | [Vercel — Add a domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain) | Apex A record; subdomain CNAME; A/CNAME-only change doesn't move other records; copy MX if moving nameservers |
| S29 | [Vercel — Working with SSL](https://vercel.com/docs/domains/working-with-ssl) | Automatic Let's Encrypt certificates; HTTP-01 for non-wildcard |
| S30 | [Vercel — Preview deployments](https://vercel.com/docs/deployments/preview-deployments) | Preview per non-production branch; staging options |
| S31 | [Vercel — Deployment Protection](https://vercel.com/docs/deployment-protection) | Protect preview/staging URLs |
| S32 | [HeberjaHiz — Linux hosting](https://www.heberjahiz.com/fr/hebergement_linux.php) | cPanel/LiteSpeed/PHP/MySQL; 24/49/83 DH per month; no Node.js listed |
| S33 | [HeberjaHiz — VPS](https://www.heberjahiz.com/fr/vps.php) | VPS/dedicated plans exist; self-managed |
| S34 | [RIPE RDAP — 159.8.122.144](https://rdap.db.ripe.net/ip/159.8.122.144) | IP block allocated to SoftLayer, country NL |
| S35 | [Live homepage](https://hay2010.ma/) | LiteSpeed, WordPress 7.1.4, Porto, WPBakery, Slider Revolution, TLS, TTFB |
| S36 | [`/wp-json/`](https://hay2010.ma/wp-json/) | WordPress REST index; Contact Form 7, GoSMTP, Jetpack namespaces |
| S37 | [Pages API](https://hay2010.ma/wp-json/wp/v2/pages?per_page=100) | 12 pages, demo content |
| S38 | [Posts API](https://hay2010.ma/wp-json/wp/v2/posts?per_page=100) | 7 demo posts |
| S39 | [Categories API](https://hay2010.ma/wp-json/wp/v2/categories?per_page=100) | 3 demo categories |
| S40 | [Media API](https://hay2010.ma/wp-json/wp/v2/media?per_page=100) | 51 media items, mostly Porto demo assets |
| S41 | [Sitemap index](https://hay2010.ma/sitemaps.xml) | Page/post/category sitemap structure |
| S42 | [Page sitemap](https://hay2010.ma/page-sitemap1.xml) | 12 page URLs |
| S43 | [Post sitemap](https://hay2010.ma/post-sitemap1.xml) | 8 post URLs including home |
| S44 | [Category sitemap](https://hay2010.ma/category-sitemap1.xml) | 3 category URLs |
| S45 | [WooCommerce store API](https://hay2010.ma/wp-json/wc/store/v1/products) | Empty product list |
| S46 | WHOIS, `whois.registre.ma:43`, query `hay2010.ma` (2026-11-08) | Registrar NINDO HOST; dates; status; NS set |
| S47 | Direct authoritative queries, 2026-11-08: `.ma` parent `c.tld.ma` (81.192.171.139/115); `aaron`/`khloe.ns.cloudflare.com`; `server116ns1/2.heberjahiz.com`; `server134ns1/2.heberjahiz.com` | 4-NS delegation; Cloudflare REFUSED; HeberjaHiz authoritative; SOA; NS mismatch |
| S48 | Cloudflare/Google DoH queries, 2026-11-08 (URLs inline in §5) | A, AAAA, NS, MX, TXT, CAA, DS, PTR, subdomains; 12-query SERVFAIL sample |
| S49 | `npx vinext check` (vinext v1.4.4) on a throwaway copy of this repo, 2026-11-08 | 100% compatible (6 supported, 0 partial, 0 issues) |
| S50 | Local repo files: `package.json`, `next.config.ts`, `app/page.tsx`, `app/layout.tsx` | Next 16.4.3; empty next.config; one page/layout; no Wrangler/cloudflare config |
| S51 | [Cloudflare — Migrate Next.js from Vercel to Workers with vinext](https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/nextjs/) | `cloudflare.config.ts` instead of Wrangler; deploys with the `cf` CLI; vinext init details |

---

## Appendix C — Decision tree (one page)

```
Is the Cloudflare zone behind aaron/khloe accessible?
├─ No  → Option A: remove Cloudflare NS at NINDO HOST; keep HeberjaHiz DNS.
│        └─ Vercel Pro + A/CNAME only + email untouched.  [recommended]
└─ Yes → Does the team want Cloudflare-native hosting?
         ├─ No  → Option B: complete Cloudflare DNS, then Vercel with DNS-only records.
         └─ Yes → Option B + Cloudflare Workers/vinext (accept beta; $0–5/month).
                  └─ If beta is unacceptable: Option B + Vercel.

Can the site be fully static?
├─ Yes (forms externalized, no CMS preview, redirects at host) → static export on
│   HeberjaHiz or Cloudflare static assets; accept the feature loss.
└─ No (forms, CV upload, CMS preview) → server runtime (Vercel or Workers).
```

---

*Prepared as research input for the HAY2010 website project. No production changes were made.*
