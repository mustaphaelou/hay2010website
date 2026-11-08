# Research hosting, domain and deployment options

Type: research
Status: open
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
