# Specify contact, careers and application forms

Type: grilling
Status: open
Blocked by: 01, 07, 09

## Question

What forms does the site need, what fields, where do submissions go, and how are they protected?

Decide:

- Contact form fields, routing (contact@hay2010.ma?), auto-reply, and spam protection (Turnstile/honeypot/rate limit).
- Careers: current openings vs spontaneous application; job detail pages; CV upload; routing to recrutement@hay2010.ma; file types/size limits; retention and security.
- The CNDP dependency: the careers form needs an F-113 authorization before it can collect CVs. If the authorization is late, launch with `recrutement@hay2010.ma` only and add the form later. The contact form needs an F-211/F-214 declaration and its receipt number must be visible.
- Whether to use a form backend (Resend + route handler, Formspree, Cloudflare Worker, other) or mailto.
- Success/error states and accessibility.
- Privacy consent and data-retention text on each form; do not copy lamalif's blank CNDP receipt number.
- Form-level CNDP notice (purpose, recipients, retention, rights, receipt number) and an unticked consent checkbox linking to the privacy policy.
- Do not collect CNI, photo, health, marital-status or religion data on the application form.
- CV upload: private storage, access control, malware scan, size/type limits, scheduled deletion.
- Notification/CRM needs (email only vs spreadsheet/CRM).

**Input from #10 (resolved 2026-11-09):** the contact form routes to `contact@hay2010.ma`; the rights contact is `donnees@hay2010.ma`; careers uses `contact@` until #14, then `recrutement@hay2010.ma`. `recrutement@` is **not** published and the page does **not** invite CVs before the F-113 authorization — the email route is a schedule mitigation, not a compliance safe harbour. The exact notices and unticked consent wording are in [`docs/legal/analytics-consent-legal-pages.md`](../../../docs/legal/analytics-consent-legal-pages.md) §4.5. No analytics script is involved.
