# Specify contact, careers and application forms

Type: grilling
Status: open
Blocked by: 01, 07

## Question

What forms does the site need, what fields, where do submissions go, and how are they protected?

Decide:

- Contact form fields, routing (contact@hay2010.ma?), auto-reply, and spam protection (Turnstile/honeypot/rate limit).
- Careers: current openings vs spontaneous application; job detail pages; CV upload; routing to recrutement@hay2010.ma; file types/size limits; retention.
- Whether to use a form backend (Resend + route handler, Formspree, Cloudflare Worker, other) or mailto.
- Success/error states and accessibility.
- Privacy consent and data-retention text on each form.
- Notification/CRM needs (email only vs spreadsheet/CRM).
