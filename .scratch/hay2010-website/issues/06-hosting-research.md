# Research hosting, domain and deployment options

Type: research
Status: resolved
Blocked by: none

## Question

What are the viable hosting and deployment paths for this Next.js 16 site on hay2010.ma, and what does the cutover from the current WordPress host involve?

Investigate:

- Next.js 16 on Cloudflare Workers (vinext/OpenNext), Vercel, and the current WordPress host; tradeoffs in cost, performance, operations and Next.js feature support.
- What hay2010.ma currently runs on (WordPress/Porto), who controls DNS, and what a safe cutover looks like (staging domain, redirects, email MX preservation).
- Whether the site can stay fully static or needs server routes for forms, CMS, redirects, etc.
- Domain/SSL/email implications.
- A recommended path with a step-by-step cutover checklist and open access questions for the user.

Write findings to `docs/research/hay2010-hosting-deployment.md` on a `research/hay2010-hosting-deployment` branch, cite primary sources, and link the file from this ticket. Do not change DNS or deploy anything.

## Answer

Resolved 2026-11-08 by a research agent. Full note: [docs/research/hay2010-hosting-deployment.md](https://github.com/mustaphaelou/hay2010website/blob/research/hay2010-hosting-deployment/docs/research/hay2010-hosting-deployment.md) (branch `research/hay2010-hosting-deployment`, commit `2ba702a`).

**Recommendation:** launch on **Vercel Pro** ($20/month), repair the DNS delegation at **HeberjaHiz** (remove the dead Cloudflare nameservers, keep HeberjaHiz DNS), and leave email where it is. Change only the apex A and `www` CNAME. This has the smallest blast radius and first-party Next.js 16 support.

**Why not the alternatives**

- **Cloudflare Workers + vinext:** `vinext check` passes 100% on this repo, but vinext is beta, the public compatibility run targets Next.js 16.2.6 (this repo is 16.4.3), image optimization is partial, and a Worker custom domain requires the zone to be active on Cloudflare — i.e. a full nameserver migration. Choose only if the Cloudflare zone is accessible and the team accepts beta.
- **Static export on HeberjaHiz:** possible, but loses Server Actions, route handlers, `next.config` redirects/headers, ISR and `next/image` optimization; forms would need an external backend and redirects hand-written `.htaccess`. Fallback only.
- **`next start` on the shared HeberjaHiz plan:** no Node.js runtime is documented; Next.js 16 needs Node 20.9+.

**Critical DNS finding:** the `.ma` parent delegates `hay2010.ma` to four nameservers — two Cloudflare (`aaron`, `khloe`) and two HeberjaHiz (`server116ns1/2`). The Cloudflare servers return REFUSED for the zone; only HeberjaHiz answers authoritatively. Resolvers intermittently SERVFAIL. Repair the delegation before any website cutover; see [Fix the hay2010.ma DNS delegation and identify account owners](14-dns-delegation.md).

**Current site:** WordPress 7.1.4 + Porto + WooCommerce/WPBakery/Slider Revolution on LiteSpeed; 12 pages, 7 lorem-ipsum posts, 51 media items, no products. It is a placeholder, not real content. Take a backup before discarding.

**Email:** MX is `mail.hay2010.ma` on the same cPanel server; DKIM and SPF exist, DMARC does not. Keep MX, `mail`, `webmail`, `cpanel`, `ftp`, the autodiscover SRV, SPF and DKIM untouched. After the A record moves, remove `+a` from SPF (it would authorize Vercel IPs to send mail); do not enable Cloudflare Email Routing; add DMARC `p=none` after cutover.

**Open access questions**

- Who controls the NINDO HOST registrar login?
- Who controls the Cloudflare account behind `aaron`/`khloe`?
- Who controls the HeberjaHiz cPanel/DNS account?
- Who owns the WordPress admin and the mailboxes?
- Does the budget allow Vercel Pro ($20/month) or does it require the Cloudflare path?

**Handed to other tickets**

- Hosting/data-residency decision → [Decide hosting, domain, data residency and cutover plan](07-hosting-decision.md).
- DNS/account access → [Fix the hay2010.ma DNS delegation and identify account owners](14-dns-delegation.md).
- Form backend and CV storage → [Specify contact, careers and application forms](11-forms-careers.md).
- CMS choice → [Decide the content model and update workflow](04-content-model.md).
