# Fix the hay2010.ma DNS delegation and identify account owners

Type: task
Status: open
Blocked by: none

## Question

Who controls hay2010.ma's registrar and DNS, and how do we fix the split delegation before any cutover?

The hosting research found that the `.ma` parent zone delegates hay2010.ma to four nameservers: two Cloudflare (`aaron.ns.cloudflare.com`, `khloe.ns.cloudflare.com`) and two HeberjaHiz (`server116ns1.heberjahiz.com`, `server116ns2.heberjahiz.com`). The Cloudflare authoritative servers refuse the zone; the HeberjaHiz servers answer authoritatively (zone serial `2026091001`, NS `server134ns1/2`, A `159.8.122.144`). Resolvers can therefore intermittently SERVFAIL.

> **Deferred:** this does not block the first deployment. It is required before the public launch on hay2010.ma; see [Plan the public launch and domain cutover](15-public-launch.md).

This ticket is the manual work needed before the hosting decision:

- Identify who controls the NINDO HOST registrar account (registrar per WHOIS; domain created 2021-03-15, expires 2027-03-15).
- Identify who controls the Cloudflare zone/account and whether it is active for hay2010.ma.
- Identify who controls the HeberjaHiz DNS/hosting account.
- Identify who owns the WordPress admin and the mailboxes (`contact@`, `recrutement@`, direction, aliases, forwarding, SMTP/IMAP).
- Export the full zone (A, AAAA, CNAME, MX, TXT, SRV, CAA) and record TTLs; check the parent/child NS mismatch (`server116ns1/2` vs `server134ns1/2`).
- Choose the target delegation: keep HeberjaHiz only and change A/CNAME at HeberjaHiz (lowest-risk path), or complete the Cloudflare zone and make Cloudflare the sole DNS provider (if choosing Cloudflare Workers).
- Record the current DNS records that must be preserved (MX, TXT/SPF/DKIM, www, verification records).
- Document the exact change plan and rollback; keep the old host as an email and rollback origin.
- Do not change DNS in this ticket; record access and the plan.

The answer should name the account owners, the chosen delegation target, the records to preserve, and the change window.
