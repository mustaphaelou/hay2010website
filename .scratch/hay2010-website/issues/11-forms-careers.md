# Specify contact, careers and application forms

Type: grilling
Status: resolved 2026-11-09
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

## Answer

Resolved 2026-11-09. Full decision record, field table, email templates, gates and test plan: [`docs/forms/contact-careers-forms.md`](../../../docs/forms/contact-careers-forms.md).

**Contact**

- **No form is required at launch.** The contact page is email-first: `contact@hay2010.ma`, the address, and a **short data-protection notice with the F-211 receipt** (the email route is still a collection). The optional contact form ships only after F-211, the mailbox tests, Turnstile and the #12 gates; `formLive` is false until then.
- **Fields:** nom (required), société (optional), e-mail (required), téléphone (optional), objet (required allowlist), message (20–4 000 characters), required unticked consent. No attachments, budget, newsletter or sensitive data.
- **Routing:** `To: contact@`, `From: no-reply@`, `Reply-To` the submitter, plain text, no attachments, reference in the subject/body. **No auto-reply.**
- **Backend:** Next.js 16 Server Action + Nodemailer over authenticated SMTP to HeberjaHiz. No Formspree/Resend/Worker; no Payload submission collection; **nothing stored** in the app, database or R2.
- **Spam:** managed Turnstile (server-side siteverify, action/hostname, 300 s single-use token), honeypot, time trap, per-IP/per-email app limiter and one Cloudflare rate-limit rule. Origin locked to Cloudflare so `CF-Connecting-IP` is trustworthy.
- **UX/accessibility:** inline success panel with reference, error summary + focus management, `aria-live`, preserved values, 44 px targets, 200% zoom, keyboard and screen-reader pass, email fallback when JS/Turnstile fails. WCAG 2.2 AA target.
- **F-214 is not a form dependency:** the contact form needs **F-211**, not F-214; the default Turnstile widget sets no `cf_clearance` cookie because pre-clearance is off. If a cookie appears, revisit.

**Careers**

- **No application form and no CV upload.** Careers is **email-only**; this is the permanent default, not a temporary fallback. Applications go to `recrutement@` after F-113, with a pre-filled `mailto` subject/body and a visible notice; before F-113, `contact@` for questions and **no CV invitation**.
- **Openings:** inline cards on `/carrieres`; no job detail pages, no `JobPosting` at launch. Reopen with >3 open roles or long descriptions, one job per page and accurate `JobPosting` fields.
- **CV handling:** the mailbox is the store. The page asks for PDF/DOCX ≤ 5 MB, no archives/macros; the mail host must confirm inbound attachment scanning before the site invites CVs; no forwarding to Gmail; access limited; retention 6 months after the decision, 12-month CVthèque only with an explicit separate opt-in; deletion from Inbox/Sent/Trash/local copies, with a log.
- **No CRM or spreadsheet:** email only; the mailbox is the record. A phase-3 upload would need F-113, an 8 GB VPS, ClamAV, private R2, a separate applicant table and a daily deletion job; it is **not built**.

**Gates**

- `formLive` (contact form) needs F-211 + `contact@`/`no-reply@` tests + Turnstile + notice review + `FORMS_ENABLED=true`.
- `recrutementMailboxLive` needs F-113 + mailbox test + mail-host AV confirmation + notice.
- `applicationFormLive` and `cvUploadLive` stay false; no applicant data in Payload or the app.
- The policy, the notices and the CNDP declaration use the same 12/6/12-month retention numbers; no blank CNDP number can render.
