# HAY2010 — Contact, careers and application forms

**Status:** Resolved — 2026-11-09.
**Resolves:** GitHub [#12](https://github.com/mustaphaelou/hay2010website/issues/12) (local `11-forms-careers.md`).
**Depends on (resolved):** [#2](https://github.com/mustaphaelou/hay2010website/issues/2) page tree, [#5](https://github.com/mustaphaelou/hay2010website/issues/5) content model, [#8](https://github.com/mustaphaelou/hay2010website/issues/8) hosting, [#10](https://github.com/mustaphaelou/hay2010website/issues/10) legal/consent, [#11](https://github.com/mustaphaelou/hay2010website/issues/11) SEO.
**Depends on (open):** [#14](https://github.com/mustaphaelou/hay2010website/issues/14) CNDP filings and mailbox tests, [#15](https://github.com/mustaphaelou/hay2010website/issues/15) DNS and mail, [#16](https://github.com/mustaphaelou/hay2010website/issues/16) public launch.
**Amends:** the contact and careers sections and the gate table in [`docs/content/content-model.md`](../content/content-model.md) (#5); the form notices, mailbox list and F-214 scope in [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md) (#10); the forms, WAF, SMTP and environment sections in [`docs/hosting/deployment-decision.md`](../hosting/deployment-decision.md) (#8); the contact channels and handoff in [`docs/company/facts-register.md`](../company/facts-register.md) (#3); the contact/careers CTA wording in [#2](https://github.com/mustaphaelou/hay2010website/issues/2).
**Not legal advice.** The notices, retention periods and CNDP scope come from the legal research note and the [#10](https://github.com/mustaphaelou/hay2010website/issues/10) decision. Counsel review before [#16](https://github.com/mustaphaelou/hay2010website/issues/16) remains a launch gate.

> **One-line rule:** no form is required at launch; one **text-only contact form** may be enabled after the F-211 receipt; **careers applications stay email-only**; no CV upload; no submission is stored in the application, the database or object storage.

---

## 1. Decision

| Item | Decision |
|---|---|
| **Forms at launch** | **None by default.** `/contact` shows `contact@hay2010.ma` and the registered address; `/carrieres` uses email. The contact form is built behind `formLive` and may be enabled in the same release train only after F-211, the mailbox tests and the notice review are complete. It is **not** a launch requirement; a form-free launch is the fallback. The **email-only contact route is still covered by F-211**: the site does not launch with real contact collection, by form or by email, before that declaration. |
| **Contact form** | **One form**, on `/contact`, text only. Fields: nom, société (optional), e-mail, téléphone (optional), objet, message, consentement. **No attachments.** |
| **Careers application form** | **None.** Applications are by email to `recrutement@hay2010.ma`, and only after the F-113 authorization covers the mailbox. Before that, `/carrieres` uses `contact@` for questions and **does not invite CVs**. |
| **CV upload** | **Not built.** The mailbox is the CV store. A web upload is a phase-3 option with its own gates: F-113, an 8 GB VPS, ClamAV, private R2, a separate applicant table and a deletion job. It is **not planned**; §5 records the design if the owner ever reopens it. |
| **Form backend** | **Next.js 16 Server Action + Nodemailer**, authenticated SMTP submission through the existing HeberjaHiz mail host. No Formspree, Resend, Postmark, Cloudflare Worker or Payload form builder. |
| **Spam and abuse** | **Turnstile (managed) + honeypot + time trap + application rate limit + one Cloudflare rate-limit rule.** Server-side siteverify is mandatory. |
| **Auto-reply** | **None.** The form shows an on-screen confirmation; the owner replies manually. An auto-reply can create backscatter, needs a second template and mailbox monitoring, and is not worth it at this volume. |
| **Notification / CRM** | **Email only.** No CRM, ATS, spreadsheet integration, Slack/Teams webhook, SMS or ticketing tool. The mailbox is the system of record. |
| **Submission storage** | **None.** No Payload collection, no Postgres table, no R2 object, no analytics event. The notification email is the system of record. Logs carry no name, email, phone or message body. |
| **Routing** | Contact form → `contact@hay2010.ma`; rights → `donnees@hay2010.ma`; careers → `recrutement@hay2010.ma` only after F-113. Form notifications are sent from `no-reply@hay2010.ma` (service mailbox, not a public contact). |
| **Consent** | One required, unticked checkbox per form, with the [#10](https://github.com/mustaphaelou/hay2010website/issues/10) §4.5 notice. A separate, optional 12-month CVthèque consent is offered in the careers email template, never as a condition of applying. |
| **CNDP** | Contact form gated on the **F-211** declaration and a real receipt in the notice; careers CVs gated on the **F-113** authorization. **F-214 is not a form dependency** when Turnstile runs without pre-clearance and sets no cookie. F-118 covers Cloudflare/R2 and the VPS if outside Morocco. |
| **Retention** | Contact 12 months after the last exchange (contract + accounting retention if a contract follows); careers 6 months after the decision; CVthèque 12 months only with separate consent; server logs 6 months. |
| **Accessibility** | WCAG 2.2 AA target; accessible error summary, focus management, no time limit, French messages, email fallback when JavaScript or Turnstile fails. |
| **Job detail pages** | **None at launch.** Openings render inline on `/carrieres`; no `JobPosting` structured data. A detail page is a phase-2 option with the trigger in §4.8. |
| **Flags** | `formLive` (contact form), `recrutementMailboxLive` (publish `recrutement@` and invite CVs), `applicationFormLive` (false), `cvUploadLive` (false), `FORMS_ENABLED` (hard kill switch). All fail closed. |
| **Deliverable** | This decision record. **No production code in #12.** Forms, UI, SMTP wiring, Turnstile and headers land with the page build and [#16](https://github.com/mustaphaelou/hay2010website/issues/16). |

The rest of this document specifies the two surfaces (`/contact`, `/carrieres`), the email backend, the consent and CNDP mechanics, the gates, the test plan and the handoffs.

---

## 2. Scope, phases and states

### 2.1 What is in scope

- The `/contact` page: form-or-email states, fields, validation, notification email, success and error UX, spam protection, accessibility.
- The `/carrieres` page: openings, spontaneous applications, email application flow, mailto template, CV handling, retention.
- The form backend: Next.js Server Action, Nodemailer, SMTP, Turnstile, rate limits, logging, headers.
- The CNDP-facing behaviour: notices, conditional receipt/authorization lines, consent, retention, rights.
- The flags, launch gates and tests.

### 2.2 What is out of scope

- Building a web application form or CV upload (phase 3, §5).
- A CRM, ATS, spreadsheet or applicant database.
- Job detail pages and `JobPosting` structured data (phase 2, §4.8).
- The privacy policy and legal page prose itself ([#10](https://github.com/mustaphaelou/hay2010website/issues/10) owns it; #12 consumes the notices).
- The CNDP filings themselves ([#14](https://github.com/mustaphaelou/hay2010website/issues/14)).
- Email hosting migration ([#15](https://github.com/mustaphaelou/hay2010website/issues/15) preserves MX; no migration).
- Analytics ([#10](https://github.com/mustaphaelou/hay2010website/issues/10): none at launch).
- Visual design of the forms ([#4](https://github.com/mustaphaelou/hay2010website/issues/4), [#13](https://github.com/mustaphaelou/hay2010website/issues/13)); #12 fixes behaviour and copy, not the final visual treatment.

### 2.3 State matrix

| Phase | Trigger | `/contact` | `/carrieres` | Flags / env |
|---|---|---|---|---|
| **Staging** | First deployment | Email CTA only; form absent | Culture copy; no CV invitation; no real data | `FORMS_ENABLED=false`, `formLive=false`, `recrutementMailboxLive=false`, Turnstile test keys |
| **Public launch, F-113 ready** | [#16](https://github.com/mustaphaelou/hay2010website/issues/16) gates pass, **including F-211** | Email CTA with the short notice; optional contact form only if the Turnstile/notice gates also pass | Openings inline; `recrutement@` published; CVs invited by email | `formLive` true only with F-211 + G4/G5; `recrutementMailboxLive=true` |
| **Public launch, F-113 late** | [#16](https://github.com/mustaphaelou/hay2010website/issues/16) gates pass with F-211, late F-113 | Email CTA with the short notice | Openings may be listed; CTA is `contact@` or the existing LinkedIn post; **no CV invitation** | `recrutementMailboxLive=false`; no `recrutement@` on the site |
| **Contact form enabled** | F-211 receipt + `contact@`/`no-reply@` tests + Turnstile + counsel review | Form + notice + email alternative | Unchanged | `FORMS_ENABLED=true`, `formLive=true` |
| **Phase 3 upload** (not planned) | F-113 + volume + 8 GB VPS + ClamAV + R2 + deletion job + counsel | Unchanged | Application form at `/carrieres/postuler`, noindex | `applicationFormLive=true`, `cvUploadLive=true` |

The contact form and the careers email route are **independent**: the form can remain off while careers applications are open, and vice versa. The only shared gate is that both need the relevant CNDP reference and a tested mailbox.

### 2.4 Default launch posture

The default is **no form**. The contact page is not a dead end: it shows the email, the address, a short note that the team replies by email, and the privacy link. The careers page is not a dead end: it shows the openings and the email route when F-113 allows it, and a clear contact route when it does not. No "formulaire bientôt disponible" placeholder is published.

**F-211 is not waived by staying form-free.** The contact/quote processing includes the email route, so the public contact page still waits for the F-211 receipt, the `contact@` test and the policy update ([#10](https://github.com/mustaphaelou/hay2010website/issues/10) §7.2). "No form" removes the form-specific risk and the Turnstile dependency; it does not remove the declaration.

---

## 3. Contact form

### 3.1 Placement and page states

`/contact` is a single page with:

1. Hero label, title and subtitle (copy owned by the page build).
2. Intro block.
3. **Form block** when `formLive` is true; otherwise an **email card** in the same position.
4. Address and access block (no phone; no map until `mapLive`).
5. Privacy link.

| State | What renders |
|---|---|
| `FORMS_ENABLED=false` or `formLive=false` | No `<form>`, no disabled fields, no "coming soon". An email card: `contact@hay2010.ma`, the registered address, a short line that the team replies by email, and the **short data-protection notice with the CNDP receipt** (§3.11). |
| `formLive=true` | The form, its notice, the consent checkbox and the submit button, plus a visible "Vous préférez écrire directement ? contact@hay2010.ma" alternative. |
| Turnstile script blocked or fails to load | The form fields render; the submit is disabled with a visible explanation and the email fallback. The form must not silently fail. |
| JavaScript disabled | The email fallback is visible; the form is not the only route. Server Actions progressively enhance, but Turnstile requires JavaScript, so no-JS users are routed to email. |
| Rate-limited | The form remains; a `429`-style message with a retry delay and the email fallback. |
| Success | The form is replaced by a success panel with a reference; the page does not redirect. |

The email link is always visible, even when the form is live. It is the accessibility and deliverability fallback, not a secondary afterthought.

### 3.2 Fields

| Field | Label (FR) | Type | Required | Constraints | Autocomplete | Notes |
|---|---|---|---|---|---|---|
| `nom` | Nom et prénom | text | Yes | 2–80 characters after trim; no CR/LF | `name` | Single line. |
| `societe` | Société | text | No | 2–120 characters; no CR/LF | `organization` | B2B context; optional. |
| `email` | E-mail | email | Yes | 5–254 characters; valid address; no CR/LF; normalized to lower case | `email` | The only reply channel. |
| `telephone` | Téléphone | tel | No | 6–25 characters; digits, spaces, `+`, `(`, `)`, `.`, `-`; `+212` accepted | `tel` | Never required; no SMS. |
| `objet` | Objet | select | Yes | One of the allowlisted values below | — | Server re-validates the allowlist. |
| `message` | Votre message | textarea | Yes | 20–4 000 characters; line breaks preserved; other control characters stripped | — | Plain text; no HTML. |
| `consent` | Consent checkbox | checkbox | Yes | Exactly `true` | — | Unticked by default; label is short; the notice is linked with `aria-describedby`. |
| `site_web` | — | text (honeypot) | Must be empty | Hidden off-screen, `aria-hidden="true"`, `tabindex="-1"`, `autocomplete="off"` | — | Not a real field; bots that fill it are dropped. |
| `formStartedAt` | — | hidden | Yes | ISO timestamp; accepted between 2 seconds and 2 hours old | — | Heuristic only; forgeable. |
| `submissionId` | — | hidden | Yes | UUID v4 generated per form render | — | Idempotency key. |
| `cf-turnstile-response` | — | hidden (widget) | Yes when Turnstile is live | ≤ 2 048 characters; single use; ≤ 300 seconds old | — | Injected by the widget. |

**Objet values** (server allowlist; the label is what the user sees):

| Value | Label |
|---|---|
| `devis` | Demande de devis |
| `eclairage-public` | Éclairage public |
| `reseaux-hta-mt` | Réseaux HTA/MT & MT/BT |
| `postes-transformation` | Postes de transformation |
| `cfo-cfa` | CFO/CFA |
| `references` | Références |
| `autre` | Autre demande |

No "Candidature" value: careers applications have their own page and must not be mixed into the contact inbox. A candidate who selects "Autre demande" is redirected by the reply, not by the form.

**Deliberately absent:** budget, deadline, address, company size, VAT/ICE, file attachments, newsletter opt-in, phone as a required field, and any sensitive data. A client who needs to send plans is invited to reply to the notification email; the owner requests the files through the existing channel. The form does not accept uploads.

### 3.3 Validation and normalization

A single Zod schema is shared between the client hint and the server action. **The server is the authority**; client validation only improves the experience.

Rules:

- Trim every string; collapse repeated spaces in single-line fields; preserve newlines in `message`.
- Reject NUL and control characters other than `\n` and `\t`; reject CR/LF in every single-line field (header-injection defence).
- Enforce the max lengths **before** composing the email; reject oversized bodies with a generic error.
- Normalize `email` for comparison (lowercase the domain; compare the whole address case-insensitively) and store the trimmed value as entered; do not perform an MX lookup or a disposable-domain check (latency, false negatives, privacy).
- Accept `telephone` as entered after trim; do not force E.164; do not reject a valid Moroccan number because of spacing.
- `objet` must match the allowlist exactly; unknown values fail validation.
- `consent` must be the string `"on"` (or boolean true after parsing) and is re-checked server-side even if the button was disabled.
- `submissionId` must be a UUID; reuse returns the previous success state without a second send.
- `site_web` must be empty; a filled honeypot returns the generic success state **without sending**.
- `formStartedAt` outside 2 s–2 h returns the generic "vérification impossible" state with the email fallback; it is a heuristic, not a security boundary.
- Reject a request whose `Content-Length` is present and above 32 KB before parsing; enforce the field maxima regardless. The Server Action default limit is 1 MB, so the form never approaches it.

Error messages are French, specific and non-judgmental:

| Field / condition | Message |
|---|---|
| `nom` | « Indiquez votre nom (2 caractères minimum). » |
| `email` | « Indiquez une adresse e-mail valide. » |
| `objet` | « Choisissez un objet. » |
| `message` | « Votre message doit contenir au moins 20 caractères. » |
| `consent` | « Vous devez accepter le traitement de vos données pour envoyer le message. » |
| Turnstile | « La vérification anti-robot a échoué. Réessayez ou écrivez à contact@hay2010.ma. » |
| Rate limit | « Trop de tentatives. Réessayez dans quelques minutes ou écrivez à contact@hay2010.ma. » |
| SMTP / unexpected | « L'envoi a échoué. Réessayez dans un instant ou écrivez directement à contact@hay2010.ma. » |
| Success | « Message envoyé. Merci, nous vous répondrons dans les meilleurs délais. » |
| Duplicate / honeypot | Same success copy, no second send. |

### 3.4 Routing and notification email

| Property | Value |
|---|---|
| **To** | `contact@hay2010.ma` |
| **From** | `HAY2010 — Site <no-reply@hay2010.ma>` (service mailbox; never published as a contact) |
| **Reply-To** | The validated submitter address |
| **Envelope / Return-Path** | `no-reply@hay2010.ma`; bounces are monitored |
| **Subject** | `[Site HAY2010] {objet label} — {nom} ({reference})` |
| **Body** | `text/plain; charset=utf-8`; no HTML; no tracking pixel; no attachments |
| **Headers** | No user input in `From`, `To`, `Cc`, `Bcc` or `Return-Path`; the subject is built from an allowlisted label plus a sanitized, truncated name |
| **Reference** | `HAY-YYYYMMDD-XXXXXX` (date + six random base32 characters); returned to the user and included in the subject |
| **Consent record** | The notice version and the checkbox state are included in the body; the email is the record |
| **IP address** | **Not included** in the email; Cloudflare/VPS logs cover security for six months |
| **Links** | Only the privacy policy URL, as text; no tracking parameters |

Body template (values escaped/trimmed; no HTML):

```text
Nouveau message depuis le formulaire de contact.

Référence : HAY-20261109-7K2M4Q
Reçu le : 2026-11-09T16:01:20+00:00

Nom : {nom}
Société : {societe ou "—"}
E-mail : {email}
Téléphone : {telephone ou "—"}
Objet : {objet label}

Message :
{message}

Consentement : accepté — version de notice 2026-11-09
Source : https://hay2010.ma/contact
```

The body is composed server-side from validated values. `message` is not HTML-escaped in a text email (there is no HTML context); if the template ever becomes HTML, every value is escaped with a context-aware escaper. The submitter's email is never put in a `From` header (SPF/DKIM alignment and spoofing).

### 3.5 Submission flow

1. **GET `/contact`**: render the page; if `formLive` is true, render the form and load Turnstile early. The form gets a fresh `submissionId` and `formStartedAt`.
2. **Client hints**: HTML `type`, `required`, `autocomplete`, `inputmode`, plus a shared schema for immediate feedback. The form uses `noValidate` so the French messages are consistent; the server remains authoritative.
3. **POST** to the Server Action on `/contact` (the action ID is in the rendered form; Next.js checks the `Origin` against the host).
4. **Cheap checks first**: `Content-Length` when present, honeypot, timestamp, `submissionId` replay, then schema validation.
5. **Turnstile**: if enabled, call siteverify with the token, `remoteip`, and an `idempotency_key`; require `success`, `action === "contact"` and an allowed `hostname`. Timeout 5 s; fail closed for the form (email fallback shown).
6. **Send rate limit**: check the per-IP and per-email buckets **after** validation and Turnstile, so typos and expired tokens do not consume the send budget. Refuse with a 429-style state if exceeded.
7. **Compose and send** the plain-text email over SMTP with an 8 s timeout; retry once only on a transient failure (4xx/network), never on a permanent 5xx/auth failure.
8. **Return** the success state with the reference, or the mapped error state. No database write, no file, no analytics event.

The action does not redirect. A redirect would create a second URL, risk a refresh resubmission and add an indexable success page. The inline state is easier to make accessible.

### 3.6 Success, error and pending states

| State | UI | Focus / announcement | Notes |
|---|---|---|---|
| **Pending** | Submit button disabled, label changes to « Envoi… », a small status line | `aria-live="polite"`; do not steal focus | Prevent double submit; `submissionId` also protects. |
| **Success** | Form replaced by a success panel: title, reference, « Nous vous répondrons dans les meilleurs délais. », email link | Move focus to the success heading (`tabindex="-1"`); `role="status"` | No redirect; no auto-reply. |
| **Validation error** | Error summary above the form + inline messages; values preserved; Turnstile reset | Move focus to the summary; each item links to its field; `role="alert"` | Consent value preserved; file absent. |
| **Turnstile failure / expiry** | Message above the widget; widget reset; email fallback | Focus the message; `aria-live="assertive"` | Token is single-use and expires after 300 s; reset is mandatory before retry. |
| **Rate limited** | Message with a retry hint and the email link | Focus the message | `Retry-After` where an HTTP response exists; no exact quota disclosure. |
| **SMTP failure** | Generic failure, reference if available, email fallback | Focus the message | Log the SMTP code and reference; never show the provider error. |
| **Unexpected / 5xx** | Generic failure, email fallback | Focus the message | Correlation ID for support; no stack trace. |
| **Honeypot / duplicate** | Same success panel | Focus success | Silent drop; no email; no hint to the bot. |

Success copy is deliberately modest: it does not promise a response time the owner has not agreed to. If the owner wants a service-level line, it is added to the page copy, not hardcoded in the action.

### 3.7 Spam and abuse protection

Layers, in order:

| Layer | Configuration | On failure |
|---|---|---|
| **Cloudflare WAF rate-limit rule** | One rule (Free plan limit): `POST /contact`, 5 requests / 10 s per IP, block 10 s. Pro+ may use a managed challenge and a longer window. | Cloudflare blocks; the origin does not see the request. |
| **Origin lockdown** | The VPS accepts traffic only from Cloudflare (Tunnel or IP allowlist), so `CF-Connecting-IP` is trustworthy. | If the origin is directly reachable, do not trust the header; use the socket/proxy chain and fix the lockdown. |
| **Turnstile** | Managed widget, action `contact`, hostnames `hay2010.ma` (staging: separate widget/test keys), server-side siteverify. | Reject with the Turnstile message and email fallback; log the error code, not the token. |
| **Honeypot** | Hidden `site_web` field; off-screen, not `display:none`, `aria-hidden`, `tabindex="-1"`. | Silent success; no email; increment a counter. |
| **Time trap** | `formStartedAt` 2 s–2 h; server clock. | Generic "vérification impossible" + email fallback; do not reveal the rule. |
| **Application send limit** | Per IP: 5/min, 15/hour, 40/day. Per email: 3/hour. Per `submissionId`: once. In-memory token bucket, cleaned every 5 min; single instance. | 429-style state; `Retry-After`; email fallback. |
| **Content heuristics** | Optional: excessive links or known spam phrases **flag** the message in the subject (`[à vérifier]`), never block it. | Human review; no false-positive rejection. |
| **Email validation** | Syntax, length, no MX/disposable lookup. | Field error. |

**Why not a CAPTCHA-only or email-only defence:** a CAPTCHA is not accessible to everyone and does not stop a determined bot; rate limits alone can be distributed; the combination is the point. The email fallback means a blocked human is never trapped.

**In-memory limiter honesty:** there is no Redis in the stack ([#8](https://github.com/mustaphaelou/hay2010website/issues/8)), and a single app instance is the deployment. The limiter resets on deploy and is per instance. Cloudflare is the durable volumetric layer; the app limiter is defence in depth. If the app is ever scaled horizontally, move the counter to a shared service before relying on it.

### 3.8 Turnstile

| Item | Decision |
|---|---|
| **Widget** | Managed mode; visible; theme `auto`; size `flexible`; `action="contact"`; no `cData`. |
| **Hostnames** | Production `hay2010.ma` (the apex; `www` 301s before the form). Staging uses a separate widget or the test keys, never the production secret. |
| **Keys** | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public) and `TURNSTILE_SECRET_KEY` (server only), both in Coolify; the secret never reaches the client bundle. |
| **Server validation** | `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`, form-encoded, 5 s timeout. Require `success === true`, `action === "contact"`, `hostname` in the allowlist, and a token age ≤ 300 s. Send `remoteip` and an `idempotency_key`. |
| **Token lifecycle** | Single use, 300 s. On any failure, call `turnstile.reset(widgetId)` before the user retries. A page left open longer than 5 minutes may submit an expired token; the message tells the user to retry. |
| **Failure mode** | **Fail closed** for the form: no email is sent without a valid token. The email fallback is always available. Do not fall back to "send anyway" when Cloudflare is down. |
| **Privacy** | Default Turnstile issues a token, not a `cf_clearance` cookie. **Do not enable pre-clearance.** Turnstile processes security signals as a Cloudflare service already listed in the policy; the full notice's "prestataires techniques" is illustrative, and the policy names Cloudflare/Turnstile. If a first-party cookie appears, update the cookie section and assess F-214 before enabling the form. |
| **CSP** | `script-src https://challenges.cloudflare.com` and `frame-src https://challenges.cloudflare.com`; `connect-src` includes `https://challenges.cloudflare.com`. Use the nonce-based approach and `strict-dynamic`; Turnstile propagates the nonce. |
| **Accessibility** | Turnstile is WCAG 2.2 AA per Cloudflare; the surrounding instructions, error message and email fallback are part of the accessible flow. Do not use invisible mode as the only gate. |
| **No-JS** | Turnstile requires JavaScript; the form is not usable without it. The visible email fallback is the no-JS path. |
| **Testing** | Use the test sitekeys/secrets in local and CI: always-pass, always-fail, and duplicate-token combinations. Test keys return `example.com` and no `action`; skip the hostname/action assertions only in the test environment, never in production. |

Turnstile error mapping:

| Error | User message | Action |
|---|---|---|
| `missing-input-response` / empty token | « La vérification anti-robot a échoué. Réessayez. » | Reset widget; focus message. |
| `invalid-input-response` / `timeout-or-duplicate` | « La vérification a expiré. Merci de la refaire. » | Reset widget; the user retries. |
| `internal-error` / network timeout | « La vérification est momentanément indisponible. Écrivez à contact@hay2010.ma. » | Keep the email fallback; log and alert. |
| Hostname/action mismatch | Same generic failure | Log; do not reveal the expected values. |

### 3.9 Rate limits and quotas

| Scope | Limit | Window | Enforcement |
|---|---|---|---|
| Cloudflare, per IP | 5 POSTs | 10 s, block 10 s | WAF rate-limit rule (Free plan; verify plan limits at deploy). |
| App, per IP | 5 sends | 1 min | In-memory token bucket after validation + Turnstile. |
| App, per IP | 15 sends | 1 h | Same bucket. |
| App, per IP | 40 sends | 24 h | Same bucket. |
| App, per email | 3 sends | 1 h | Keyed by normalized email. |
| App, per `submissionId` | 1 send | 10 min replay window | Idempotency map; duplicate returns success. |

The app limiter counts **sends**, not page views or validation errors. A user correcting a typo is not punished; a bot that passes Turnstile still hits the send budget. The 429 response includes `Retry-After: 60` where an HTTP response is available; the server action state carries a human-readable delay.

### 3.10 Accessibility

Acceptance criteria (WCAG 2.2 AA target):

- One `<h1>`; the form has a visible heading and an introduction; the `form` element has an accessible name.
- Every field has a persistent `<label for>`; no placeholder-only labels; required fields are marked with `*` **and** `aria-required="true"`; the "*" is explained once.
- Help text and errors are linked with `aria-describedby`; invalid fields get `aria-invalid="true"`.
- The error summary is at the top, `role="alert"`, focusable, with links to each field; focus moves to it on submit failure. Inline errors follow the field.
- Success is announced with `role="status"` and focus moves to the success heading; no focus trap, no auto-dismiss.
- Pending state uses `aria-live="polite"` and a disabled button with an accessible label; the user can still read the page.
- Keyboard: all controls reachable in order; the Turnstile iframe is reachable; no keyboard trap; Escape does not close anything unexpectedly.
- Contrast: labels, hints, errors and focus rings meet 4.5:1 (text) / 3:1 (UI); errors are not conveyed by color alone.
- Targets: ≥ 44 × 44 CSS px; 16 px minimum input font to avoid iOS zoom; single-column layout; no horizontal scroll at 320 px.
- Zoom/reflow: usable at 200% zoom and 320 px width; no loss of content.
- Motion: no shake or flashing; respect `prefers-reduced-motion`; the pending indicator is not a spinner-only cue.
- Language: `<html lang="fr">`; French error messages; `lang` attributes on any foreign text.
- Autocomplete: `name`, `organization`, `email`, `tel`; `inputmode` for email/tel; `enterkeyhint="send"` on the last field.
- The privacy link opens in a new tab with `rel="noopener"` and a visible hint, so the form is not lost; if the team prefers same-tab, preserve the form state.
- The consent checkbox is a real checkbox, not a sentence; its label is short; the long notice is linked, not stuffed into the label.
- The submit button stays disabled until the required consent box is checked, with a visible explanation next to the button; server-side validation still enforces consent.
- The email fallback is a real link, not an image; the address is selectable text.
- Screen-reader test: NVDA + Firefox on Windows, VoiceOver + Safari on macOS/iOS, TalkBack on Android; keyboard-only test; 200% zoom; `axe`/Lighthouse with no critical issues.

### 3.11 Consent and notice

The notice is **code-owned** and rendered from the approved [#10](https://github.com/mustaphaelou/hay2010website/issues/10) §4.5 text plus the `contact` entry of `cndpReferences`. The owner cannot edit the CNDP line in Payload; `formNotice` is developer-only (or removed and generated by the component).

Exact contact notice (the bracketed values are runtime substitutions; never render `[●]`):

```text
Les champs marqués d'un * sont obligatoires. Vos données sont traitées par SOCIETE HAY 2010 pour répondre à votre demande et, le cas échéant, préparer un devis. Elles sont destinées aux services concernés et à nos prestataires techniques (hébergement, messagerie). Elles sont conservées 12 mois après le dernier échange, ou pendant la durée de la relation contractuelle et les délais légaux de conservation comptable si un contrat en découle. Vous disposez d'un droit d'accès, de rectification, d'opposition et de retrait de votre consentement, à exercer à donnees@hay2010.ma. Ce traitement a fait l'objet d'une déclaration auprès de la CNDP sous le n° {numéro} du {date}. Pour en savoir plus : /politique-de-confidentialite.
```

Checkbox label:

```text
J'accepte que SOCIETE HAY 2010 traite mes données pour répondre à ma demande.
```

Rules:

- The checkbox is unticked by default; no pre-ticked box, no bundled terms, no newsletter.
- The submit button is disabled until it is checked; a visible hint explains why. The server re-validates.
- The CNDP sentence renders **only** when the `contact` reference exists in `cndpReferences`. If it does not exist, `formLive` must be false; the form must never render with a blank number, "en cours" or a placeholder.
- The notice version is a constant (`2026-11-09` at first publication). Any wording change bumps it, and the email body records the version used.
- The privacy link is `/politique-de-confidentialite`; the notice is not a substitute for the policy.
- The notice is placed above the submit button and referenced by `aria-describedby`; it is not hidden in a tooltip or a collapsed accordion by default.
- The form does not ask for consent to analytics, newsletter or marketing. There is none.

**When the form is off**, the page still collects by email, so it still shows a short data-protection notice next to the email CTA. The receipt must be visible in the collection operation even without a form ([#10](https://github.com/mustaphaelou/hay2010website/issues/10) §4.5, law 09-08 art. 19). The short notice is:

```text
Vos données sont traitées par SOCIETE HAY 2010 pour répondre à votre demande. Elles sont destinées aux services concernés et à nos prestataires techniques, et conservées 12 mois après le dernier échange. Vous pouvez exercer vos droits à donnees@hay2010.ma. Ce traitement a fait l'objet d'une déclaration auprès de la CNDP sous le n° {numéro} du {date}. Politique de confidentialité : /politique-de-confidentialite.
```

It is code-owned, uses the same `contact` reference and renders only when that reference exists. Without it, the contact page is not public: the email route is a collection operation and the receipt cannot be omitted just because the form is hidden. The full form notice replaces it when `formLive` is true; do not show both.

### 3.12 Security

| Control | Implementation |
|---|---|
| **CSRF** | Server Actions compare `Origin` with `Host`/`X-Forwarded-Host`; `experimental.serverActions.allowedOrigins` includes the public production and staging hosts only when the proxy does not forward the public host. A route handler (phase 3) repeats the check manually. |
| **Body size** | Server Action default 1 MB; the action rejects a present `Content-Length` > 32 KB and enforces field maxima; the form has no file input. |
| **Header injection** | Single-line fields reject CR/LF; the subject is built from an allowlist; Nodemailer receives structured fields, never raw header strings. |
| **XSS** | The email is text/plain; the page renders user values only as React text (escaped); no `dangerouslySetInnerHTML`; if an HTML email is ever added, escape every value. |
| **CSP** | `default-src 'self'`; nonce-based `script-src` with `https://challenges.cloudflare.com` and `strict-dynamic`; `frame-src https://challenges.cloudflare.com`; `connect-src 'self' https://challenges.cloudflare.com`; `style-src 'self' 'nonce-…'`; `form-action 'self'`; `frame-ancestors 'none'`; `base-uri 'self'`; `object-src 'none'`; `upgrade-insecure-requests`. |
| **Transport** | HTTPS only; HSTS `max-age=31536000; includeSubDomains` (preload only after the subdomains are stable); SMTPS/STARTTLS with certificate validation; no `rejectUnauthorized: false`. |
| **Headers** | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denies camera/microphone/geolocation, `X-Frame-Options: DENY` for legacy browsers. |
| **Secrets** | SMTP and Turnstile secrets in Coolify, scoped to the app; never in the repo, the image, a build arg or `NEXT_PUBLIC_*`. Rotate on handoff. |
| **Origin trust** | Lock the VPS to Cloudflare (Tunnel or IP allowlist) before trusting `CF-Connecting-IP`; otherwise rate limiting and Turnstile `remoteip` are spoofable. |
| **Logging** | Structured logs with `event`, `reference`, `outcome`, `durationMs`, `smtpCode`; **no** name, email, phone, message, token or IP. Retention 6 months; access limited. |
| **Dependencies** | Keep Nodemailer and Next.js current; `npm audit` in CI; no abandoned form package. |
| **Admin** | No admin UI for messages (the mailbox is the UI). `/admin` stays behind Cloudflare Access + Payload auth ([#8](https://github.com/mustaphaelou/hay2010website/issues/8)). |
| **Abuse** | Rate limits + Turnstile + honeypot; alert on a spike in 429s or siteverify failures; do not add a WAF block that would also block the email fallback. |

The contact form has **no database and no file system write**. That removes SQL injection, stored XSS, object-storage ACLs, malware scanning and applicant-data retention from this surface. It also means there is no admin screen and no backup containing messages.

### 3.13 No-JavaScript and failed-script behaviour

- The page always includes a `<noscript>` block with the email address and a short explanation.
- If the Turnstile script is blocked by an extension, the widget's error callback shows the email fallback; the submit button is not left spinning.
- Server Actions progressively enhance, but the Turnstile requirement means the form is effectively JavaScript-dependent. This is disclosed, not hidden.
- The email address is plain text and a `mailto:` link; no obfuscation that breaks copy/paste or screen readers.

### 3.14 Page copy

The page build owns the final prose; these strings are fixed for the form behaviour:

- **Form title:** « Écrivez-nous »
- **Intro:** « Un projet d'éclairage public, de réseaux HTA/BT ou de CFO/CFA ? Décrivez votre besoin ; nous vous répondrons par e-mail. »
- **Submit:** « Envoyer le message »
- **Pending:** « Envoi… »
- **Alternative:** « Vous préférez écrire directement ? contact@hay2010.ma »
- **Required note:** « Les champs marqués d'un * sont obligatoires. »
- **Success title:** « Message envoyé »
- **Success body:** « Merci. Votre message a bien été transmis. Référence : {reference}. Nous vous répondrons dans les meilleurs délais. »
- **No-JS:** « Le formulaire nécessite JavaScript. Écrivez-nous à contact@hay2010.ma. »

The form must not promise a response time, a quote or an intervention. It is a contact channel, not a booking system.

---

## 4. Careers and applications

### 4.1 Page model

`/carrieres` is a single page:

1. Hero label, title, subtitle.
2. Intro / culture block (owner copy; no unverified claims).
3. **Openings** — inline cards from the `jobs` collection; no detail pages at launch.
4. **Spontaneous application** — always relevant; the email route is shown only when F-113 allows it.
5. **Email notice** — the exact [#10](https://github.com/mustaphaelou/hay2010website/issues/10) §4.5 careers email text, with the conditional authorization line.
6. No form, no upload, no "postuler" button that opens a form.

The page is indexable and in the sitemap; there is no `JobPosting` structured data at launch ([#11](https://github.com/mustaphaelou/hay2010website/issues/11) §5.9).

### 4.2 Openings

The owner creates, publishes and closes jobs in Payload. Only `status=open` records whose `closingAt` is null or in the future render. Order: `featured` first, then `postedAt` descending.

Each card shows:

- Title, contract type (`CDI`, `CDD`, `Stage`, `Alternance`), location (default `Rabat`).
- Optional department and experience level.
- `summary` (2–3 lines).
- `postedAt` / `closingAt` as a date, not a countdown.
- An application CTA **only** when `recrutementMailboxLive` is true; otherwise a "Nous contacter" link to `contact@` (questions only) or the existing LinkedIn post URL placed in the description by the owner.

Empty state:

- No open role: « Aucune offre n'est ouverte pour le moment. » + spontaneous section (if F-113) or contact link.
- F-113 pending: no CV invitation; the page may still list roles and link to `contact@` for questions, or to the company's LinkedIn post. It does not show a disabled "Postuler" button.

Content rules (facts register [#3](https://github.com/mustaphaelou/hay2010website/issues/3), brand [#4](https://github.com/mustaphaelou/hay2010website/issues/4)):

- No "créée en 2004", "depuis 2004", "depuis 2011", "entreprise agréée" without the ONEE scope, or an unconfirmed "solaire" service line. A job may mention a technical skill (e.g., "expérience en éclairage public"); the company description must not claim a gated service.
- No employee photos, portraits or testimonials without written releases.
- No client names or logos in the culture copy.
- No salary figure unless the owner publishes one and it is accurate; no "salaire attractif" cliché.
- No discriminatory criteria (age, sex, marital status, nationality, religion, health, union affiliation, etc.); requirements must be job-related. The Code du travail art. 9 discrimination list is the practical reference.
- No "urgent" unless the role is genuinely urgent; no evergreen "talent pipeline" listing disguised as a job.

### 4.3 Decision: no application form

The site does **not** ship a web application form. Applications go to `recrutement@hay2010.ma` by email.

Why:

1. **The F-113 dependency is not a formality.** Recruitment processing needs a CNDP authorization under the HR model, with a candidate consent document. A form that collects CVs before the authorization is a compliance failure, not a UX detail. Email still needs the authorization, but the site avoids adding a second collection surface and a false sense of compliance.
2. **No storage, no scanning, no deletion job.** A web upload requires private object storage, access control, magic-byte validation, malware scanning, a deletion job, an applicant record and a processor/transfer review. The mailbox already provides access control, the mail host's antivirus (to be confirmed) and a retention workflow the owner can operate.
3. **The volume does not justify it.** The company hires a few roles at a time; the existing LinkedIn posts already say "envoyez votre CV et votre lettre de motivation à recrutement@". A form would duplicate that channel, not replace it.
4. **The 4 GB VPS has no room for ClamAV.** The hosting decision's minimum is 4 GB; ClamAV plus the app, Postgres and Coolify needs 8 GB and a new operational surface. Refusing the upload is the safer engineering decision.
5. **Data minimisation.** The fewer systems that hold CVs, the fewer places to secure, declare and delete. Law 09-08 rewards this.

The ticket's fallback ("launch with `recrutement@` only and add the form later") becomes the **default**, not a temporary compromise; reopening it is a new decision with the phase-3 gates in §5.

### 4.4 Email application flow

| State | What the page shows | CTA |
|---|---|---|
| **F-113 pending** | Openings (if the owner publishes them), culture copy, a line that applications are not open on the site | `contact@hay2010.ma` for questions; optional link to the existing LinkedIn post; **no CV invitation**, no `recrutement@`, no "Postuler". |
| **F-113 granted, `recrutementMailboxLive=true`** | Openings, spontaneous section, the careers email notice | « Postuler par e-mail » → `mailto:recrutement@hay2010.ma` with the subject/body template; the address is also visible as text. |
| **F-113 lapses or the mailbox fails** | Revert to the pending state | `recrutementMailboxLive=false`; remove the notice's authorization line; no CV invitation. |

The application email flow:

1. The candidate clicks « Postuler par e-mail » or copies the address.
2. The mail client opens with a pre-filled subject and a short body template (no candidate data in the URL).
3. The candidate attaches the CV and cover letter, and sends.
4. The owner receives it in `recrutement@`, moves it to a dated folder, and records the decision date.
5. The owner replies to the candidate from the same mailbox; no auto-reply.
6. Retention runs from the decision date (6 months; 12 months only with the separate CVthèque consent).
7. Deletion is logged (date, count, folder, operator) without candidate names.

The page tells the candidate what to send and what **not** to send, and links the policy. It does not promise an interview or a response time.

### 4.5 Mailto template

Subject:

```text
Candidature – {intitulé du poste} – {Prénom Nom}
```

For a spontaneous application:

```text
Candidature spontanée – {Prénom Nom}
```

Body:

```text
Bonjour,

Je souhaite candidater au poste de {intitulé du poste} publié sur hay2010.ma.

Nom et prénom :
Téléphone :
E-mail :
Disponibilité :
Lettre de motivation : ci-jointe
CV : ci-joint

J'accepte que SOCIETE HAY 2010 traite mes données pour gérer ma candidature.
[Facultatif — ajoutez cette phrase uniquement si vous acceptez] Je consens à la conservation de ma candidature 12 mois dans la CVthèque de HAY2010.

Cordialement,
{Prénom Nom}
```

For a spontaneous application, replace the first sentence with « Je souhaite vous adresser une candidature spontanée. »

The `mailto:` URL encodes the subject and body with `encodeURIComponent`; keep it under ~1 800 characters so mail clients do not truncate it. The page also renders the address as selectable text and a "Copier l'adresse" button (`navigator.clipboard.writeText`, with a visible `aria-live` confirmation) for users without a configured mail client.

The template is guidance, not a contract. The candidate can write their own message; the notice and consent still apply. The optional CVthèque line is **not** pre-filled as accepted: the candidate must choose to keep it; the owner treats a missing line as "no pool consent".

### 4.6 CV handling by email

The site never receives the file; the mailbox does. The controls therefore sit on the mailbox and the owner's device:

| Control | Requirement |
|---|---|
| **Mail host antivirus** | HeberjaHiz must confirm that inbound attachments are scanned (cPanel/Exim + ClamAV or equivalent) **before the site invites CVs**. If it cannot, the page stays in the F-113-pending state and does not invite CVs; the existing LinkedIn channel remains the owner's responsibility and #14 records the residual risk. Record the confirmation in the [#14](https://github.com/mustaphaelou/hay2010website/issues/14) file. |
| **File types** | The page asks for **PDF** (preferred) or **DOCX**; no archives, executables, macros or images. The mailbox cannot enforce this; the owner rejects anything else and asks for a PDF. |
| **Size** | The page recommends ≤ 5 MB total. The mail host's message limit is the hard limit; confirm it at provisioning. |
| **Opening** | Open attachments only on a patched, access-controlled device with endpoint protection; do not preview on a phone; do not enable macros; if a file looks wrong, delete it and ask the candidate to resend a PDF. |
| **Storage** | The mailbox only. No download to a shared drive, personal Gmail, desktop folder or USB stick. If a local copy is unavoidable, it is encrypted, access-controlled and deleted on the same schedule. |
| **Access** | The `recrutement@` mailbox is limited to the owner and the named recruiter; unique password, 2FA where cPanel supports it, no shared credentials, no forwarding to Gmail. |
| **Transmission** | TLS on the mail host (SMTPS/STARTTLS); the candidate's own mail provider is outside the company's control. |
| **Retention** | 6 months after the decision; 12 months only with the separate CVthèque consent; immediate deletion on request. |
| **Deletion** | Delete from Inbox, Sent, Trash, any local copy and the mail host's backups as far as the provider allows. Confirm the deletion to the candidate by email. |
| **Breach** | If a CV is exposed or a mailbox is compromised, follow the [#14](https://github.com/mustaphaelou/hay2010website/issues/14)/counsel incident procedure; do not improvise notification. |

The page's notice asks candidates **not** to send an ID card, photo, date of birth, marital status, health information, religion, union membership, ethnic/national origin or political opinion. A CV may contain some of these; the owner must not use them in the decision and should delete the unnecessary parts if a copy is kept.

### 4.7 Retention and deletion

| Record | Clock | Action |
|---|---|---|
| **Contact message** | 12 months after the last exchange | Delete from `contact@` (Inbox/Sent/Trash); if a contract followed, move to the contract folder and keep for the contract + accounting period. |
| **Application, rejected/hired** | 6 months after the decision | Delete the application email and attachments from `recrutement@`; log the deletion. |
| **Application, no decision** | 6 months after the last exchange | Delete; do not keep an indefinite "maybe" pile. |
| **CVthèque** | 12 months from the explicit consent | Delete unless the candidate renews in writing; no automatic renewal. |
| **Spontaneous application** | Same as an application | Same 6/12-month rules. |
| **Rights request** | 10 days for rectification; legal deadlines for access/opposition | Handle from `donnees@`; log date, subject, action, closure; no fee. |
| **Server logs** | 6 months | Cloudflare/VPS log retention. |
| **Mail host backups** | Provider rotation | Confirm the rotation; if backups retain deleted mail beyond the stated period, disclose it or exclude the mailbox from backups. |

There is **no application deletion job** because there is no application database. The job is an operational checklist:

- A recurring calendar task (monthly) lists `recrutement@` folders older than 6/12 months.
- The owner deletes them and records the date, count and operator in a simple log (no candidate names).
- A quarterly review checks that no CV sits in `contact@`, a personal inbox, Downloads or a shared drive.
- If a candidate asks for deletion, it happens immediately, not at the next monthly pass.

If phase 3 is ever built, the deletion job moves into the app (§5.6) and this checklist becomes the backstop.

### 4.8 Job detail pages and `JobPosting`

At launch: none. The listing page is the only jobs page, and `JobPosting` is forbidden on a listing page by Google's content policy ([#11](https://github.com/mustaphaelou/hay2010website/issues/11) §5.9).

Reopen when **any** of these is true:

- More than three open roles at once, or a role description that does not fit a card (roughly > 600 words).
- The owner needs shareable per-role URLs for LinkedIn or a job board.
- The owner wants `JobPosting` eligibility in Google Jobs and can supply accurate `datePosted`, `validThrough`, `employmentType`, `jobLocation`, salary (only if published) and a hiring organisation.

Then:

- Route `/carrieres/[slug]`, one job per page, indexable; one `JobPosting` per page, no `JobPosting` on `/carrieres`.
- `JobPosting` fields must match the visible page; no salary markup without a visible salary; `validThrough` must be real; remove the markup when the role closes.
- The application CTA stays email-only unless phase 3 is approved; a `JobPosting` `applicationContact` can point to `recrutement@` only after F-113.
- `jobs.slug` is already reserved in the content model; the route and markup land with the page build, not with #12.

### 4.9 Careers page copy

Fixed behaviour strings:

- **F-113 pending, CTA:** « Une question sur nos offres ? Écrivez-nous à contact@hay2010.ma. »
- **F-113 pending, notice:** no CNDP authorization line; a short line that applications are not open on the site and that the page will be updated when they are. Do not show a blank `n°`.
- **F-113 granted, CTA:** « Postuler par e-mail »
- **F-113 granted, notice:** the exact [#10](https://github.com/mustaphaelou/hay2010website/issues/10) §4.5 careers email text, with the real authorization number and date.
- **Empty state:** « Aucune offre n'est ouverte pour le moment. »
- **Spontaneous title:** « Candidature spontanée »
- **Spontaneous body:** « Vous ne trouvez pas le poste qui correspond à votre profil ? Envoyez-nous votre CV et une courte présentation ; nous l'examinerons avec attention. »
- **Privacy link:** « Politique de confidentialité »

The careers email notice (bracketed values are runtime substitutions):

```text
Les candidatures sont reçues à l'adresse indiquée sur cette page. Vos données (CV, lettre de motivation, coordonnées) sont utilisées uniquement pour gérer votre candidature et conservées 6 mois après la décision, puis supprimées, sauf accord séparé pour 12 mois. Vous pouvez demander leur suppression à tout moment à donnees@hay2010.ma. Ce traitement est soumis à l'autorisation CNDP n° {numéro} du {date}. Pour en savoir plus : /politique-de-confidentialite.
```

The notice renders **only** with a real F-113 reference. If the reference is missing, the page does not invite CVs; it does not show the notice with a blank number.

### 4.10 Notification and CRM

- **Notification:** one email to `contact@` (contact form) or the candidate's email to `recrutement@` (careers). No Slack/Teams webhook, SMS, CRM, ATS, ticketing tool or spreadsheet integration.
- **System of record:** the mailbox. Folders/labels are the workflow; the owner records the decision date and the deletion run.
- **Spreadsheets:** if the owner already keeps a candidate spreadsheet, it is outside the site. It must be access-controlled, encrypted, deleted on the same 6/12-month schedule and included in the F-113 scope; do not link it to the website or put it on a shared drive. The recommended default is not to keep one.
- **Revisit:** a CRM/ATS is a separate ticket with its own CNDP/transfer review. It is not a #12 deliverable.

---

## 5. Application form and CV upload — phase 3, not built

This section records the design **only** so a future decision does not start from zero. Nothing here ships in #12, and the default is not to build it.

### 5.1 Trigger and gates

Build only if **all** are true:

- F-113 is granted and covers the upload, storage, processors and retention.
- The owner confirms a sustained volume (roughly ≥ 20 applications/month) or an operational need that email cannot meet.
- The VPS is ≥ 8 GB RAM (or the scanner runs outside the VPS under a reviewed processor/transfer).
- ClamAV (or an equivalent, contractually covered scanner) is operational with signature updates.
- Private R2 storage, an authenticated download path and a deletion job are designed and tested.
- Counsel has reviewed the notice, the retention and the transfer.
- The owner accepts the operational and legal overhead.

If any is false, stay email-only.

### 5.2 Fields

Same as the contact form, plus:

| Field | Required | Notes |
|---|---|---|
| `poste` | Yes | Select from open jobs + « Candidature spontanée »; server validates against open jobs. |
| `lettre` | Yes | Textarea, 100–4 000 characters; plain text; no HTML. |
| `cv` | Yes | One file; PDF preferred; ≤ 5 MB; magic-byte validation; no macro, archive, executable or encrypted file. |
| `poolConsent` | No | Separate unticked checkbox; 12-month CVthèque; never a condition of applying. |
| `consent` | Yes | Required, unticked; application-processing notice. |

No photo, ID, date of birth, marital status, health, religion, union, ethnic/national origin, political opinion, bank details or salary history.

### 5.3 Upload pipeline

1. `POST /api/candidatures` route handler (Node runtime, not a Server Action: multipart and > 1 MB).
2. Enforce `Content-Length` ≤ 6 MB before parsing; accept exactly one file part.
3. Validate the filename extension **and** the magic bytes; PDF (`%PDF-`) or DOCX (ZIP with `[Content_Types].xml`); reject encrypted PDFs, macros (`vbaProject.bin`), archives and executables.
4. Stream to a temp file outside the web root; compute a SHA-256; generate a random object key (no original filename in the path).
5. Send the file to the internal ClamAV `clamd` over TCP with `INSTREAM`; 30 s timeout; **fail closed** on scanner error.
6. If infected: delete the temp file, increment a metric, notify the admin, return a generic "fichier refusé" message; do not email the file.
7. If clean: write to the private R2 bucket `hay2010-applications` (no public domain, SSE, versioning off so deletion is real), then insert the minimal metadata row.
8. Send a notification email to `recrutement@` with the application ID and a link to the authenticated admin view; **do not attach the CV** (no duplicate copy).
9. Delete the temp file in a `finally` block.

### 5.4 Malware scanning

- ClamAV `clamd` + `freshclam` in a separate Coolify service; 1 GB RAM minimum, 8 GB VPS; signature DB on a volume; daily update; health check.
- The app calls `clamd` over the internal network; no public port.
- If the scanner is unavailable, uploads are **rejected**, not queued; the email fallback stays visible.
- Re-scan on access? No; scanning at upload plus `Content-Disposition: attachment` and endpoint protection is the control. A second scan on download is optional defence in depth.
- Log the scan result (clean/infected/error) and the hash; never the file content.

### 5.5 Storage and access

- Bucket `hay2010-applications`: private, no custom domain, no `r2.dev`, SSE, versioning **off**, object lock off, lifecycle as a backstop only (e.g., 400 days) because the app job enforces the real retention.
- Metadata in a separate Postgres schema `recruiting` (not Payload): `id`, `received_at`, `job_id`, `decision_at`, `pool_consent`, `status`, `object_key`, `sha256`. No CV binary. Restricted DB role; no CMS access.
- Download route `/admin/candidatures/[id]/cv`: Payload auth + role check, `Content-Disposition: attachment; filename="candidature-{id}.{pdf|docx}"`, the matching `Content-Type` (`application/pdf` or the DOCX type), `X-Content-Type-Options: nosniff`, no inline rendering, audit log.
- No presigned URL sent by email; if a signed URL is used, TTL ≤ 5 minutes and the recipient is authenticated.
- Cloudflare Access on `/admin*` remains the outer gate.

### 5.6 Retention job

- Daily Coolify scheduled task calls `/api/internal/retention` with a bearer secret.
- Deletes applications with `decision_at` older than 6 months (or 12 months from `pool_consent`), in order: R2 object, then DB row; logs counts, not identities.
- Deletes incomplete applications 6 months after the last exchange.
- Runs a dry-run mode and a manual trigger; alerts on failure; the R2 lifecycle is a backstop, not the primary control.
- The policy, the F-113 declaration and the job use the same numbers.

### 5.7 Notice

The application form notice is the [#10](https://github.com/mustaphaelou/hay2010website/issues/10) §4.5 "Careers application form" text, with the real F-113 number/date, the required application consent and the separate optional CVthèque consent. The same no-blank rule applies.

### 5.8 Why not now

The upload is the highest-risk feature on the site: it stores CVs (personal data), needs a scanner, an access-controlled bucket, a separate database, a deletion job, a processor/transfer review and a new admin surface. The site has none of that infrastructure today, the VPS is 4 GB in the minimum configuration, and the mailbox route already works. The correct decision is to **not build it** until the volume and the operations justify it.

---

## 6. Backend and infrastructure

### 6.1 Why a custom Next.js backend

- **No new processor, no new transfer.** The mail goes through the existing Moroccan mail host; Cloudflare is already in the stack and the F-118 scope. Formspree/Resend/Postmark would add a US processor, a contract, a transfer analysis and a data-processing review.
- **No PII in a third-party form service.** The submission is composed server-side and sent as email; the form vendor never sees it.
- **Full control of the notice and the CNDP line.** A form SaaS often injects its own branding, retention and sub-processors; the CNDP notice must match the actual processing.
- **The stack already has Next.js, Node and SMTP.** Nodemailer is a small, mature dependency; Payload already needs SMTP for password reset ([#8](https://github.com/mustaphaelou/hay2010website/issues/8) §4.4).
- **No Redis, no queue, no second service.** The form is synchronous; a failure is shown to the user with the email fallback.

### 6.2 Rejected alternatives

| Option | Verdict |
|---|---|
| **Formspree / a form SaaS** | Rejected. US processor, PII outside the stack, new F-118/contract, less control of the notice and retention, monthly dependency. |
| **Resend / Postmark / SendGrid** | Rejected for launch. They solve deliverability but add a US processor and a transfer; use only as a fallback if the HeberjaHiz SMTP path is blocked and #14 covers the provider. |
| **Cloudflare Worker + Email Routing** | Rejected. Email Routing changes MX and breaks the existing mailbox ([#8](https://github.com/mustaphaelou/hay2010website/issues/8) §3.1); a Worker would need a third-party send API anyway. |
| **Payload form builder / a `submissions` collection** | Rejected. It stores personal data in the CMS, contradicts [#5](https://github.com/mustaphaelou/hay2010website/issues/5) §5 ("no personal data in the content database") and adds retention/admin/backup surface. |
| **`mailto:` only** | Rejected for the contact form (no structured consent, no validation, poor mobile UX) but **kept** for careers applications, where the CV travels by email anyway and the volume is low. |
| **Google Forms / Microsoft Forms** | Rejected. Third-party processor, US transfer, branding, no control of the CNDP notice, data outside the mailbox. |
| **A separate API service** | Rejected. A second deployable, secret store and health check for one form is not justified. |

### 6.3 Email transport

Nodemailer (current stable) on Node 22, one pooled SMTP transport:

| Setting | Value |
|---|---|
| Host | `mail.hay2010.ma` (confirm with HeberjaHiz) |
| Port / security | `465` with `secure: true` **or** `587` with `requireTLS: true`; test both, keep the one the host supports |
| Auth | `no-reply@hay2010.ma` (the service mailbox; the `From` matches the auth user) or a dedicated SMTP user if the host supports it; password in Coolify |
| TLS | `minVersion: TLSv1.2`, `rejectUnauthorized: true`, valid certificate for `mail.hay2010.ma` |
| Pool | `pool: true`, `maxConnections: 1`, `maxMessages: 10`, `idleTimeout: 30_000` |
| Timeouts | `connectionTimeout: 8_000`, `greetingTimeout: 5_000`, `socketTimeout: 10_000` |
| From | `no-reply@hay2010.ma` |
| Envelope | `no-reply@hay2010.ma` → `contact@hay2010.ma`; bounces return to the service mailbox |
| Retry | One retry on a transient failure (4xx/network), 250 ms backoff; no retry on auth/5xx |

`transporter.verify()` is **not** run on every request or every health check (it opens a connection and can trigger provider throttling). A daily smoke test or a manual check is enough; deployment health is the app + database check from [#8](https://github.com/mustaphaelou/hay2010website/issues/8).

### 6.4 Data flow

```text
Browser /contact
   │  POST (Server Action, same-origin)
   ▼
Next.js app (Coolify, Node 22)
   ├─ Content-Length / honeypot / timestamp / schema
   ├─ Turnstile siteverify ──► challenges.cloudflare.com
   ├─ rate limit (in-memory)
   └─ Nodemailer ──► mail.hay2010.ma:465/587
                         │
                         ▼
                  contact@hay2010.ma
                  (mailbox, 12-month retention)

No database write. No R2 object. No analytics event.
```

### 6.5 Environment variables

Set in Coolify, scoped to the application; never in the repository or the image:

| Variable | Purpose | Secret? |
|---|---|---|
| `FORMS_ENABLED` | Hard kill switch; `false` disables every form regardless of content flags | No |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile sitekey (public, safe to expose) | No |
| `TURNSTILE_SECRET_KEY` | Turnstile siteverify secret | **Yes** |
| `SMTP_HOST` | `mail.hay2010.ma` | No |
| `SMTP_PORT` | `465` or `587` | No |
| `SMTP_SECURE` | `true` for 465, `false` for 587 | No |
| `SMTP_USER` | SMTP auth user | No |
| `SMTP_PASSWORD` | SMTP auth password | **Yes** |
| `MAIL_FROM` | `no-reply@hay2010.ma` | No |
| `MAIL_TO_CONTACT` | `contact@hay2010.ma` | No |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | Stable Server Action encryption key across deploys | **Yes** |
| `NEXT_PUBLIC_SERVER_URL` | Canonical/staging origin for metadata and links; rebuild when it changes | No |

Startup behaviour: if `FORMS_ENABLED=true` and `formLive=true` but the Turnstile keys, SMTP host/user/password or the `contact` CNDP reference are missing, the app logs a configuration error and **renders the email fallback**, not a broken form. The build must not fail because a secret is absent in a preview.

### 6.6 Failure handling

| Failure | Behaviour |
|---|---|
| **Turnstile siteverify timeout / 5xx** | Fail closed; show the "vérification indisponible" message + email fallback; log; alert if sustained. |
| **SMTP auth failure** | Fail; show the generic message + email fallback; alert immediately (a config/credential problem). Do not retry. |
| **SMTP transient 4xx / network** | One retry; if still failing, show the generic message + email fallback; log. |
| **SMTP accepted but the mailbox is full** | The message bounces; the user saw success. Monitor `no-reply@` bounces and mailbox quota; alert. |
| **Action ID mismatch after a deploy** | Next.js returns "Failed to find Server Action"; the form shows "La page a été mise à jour, rechargez-la" and the email fallback. Keep `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` stable and prefer rolling deploys. |
| **Rate limiter unavailable** | Fail open for availability (Turnstile still protects) but log and alert; do not block every user because an in-memory map failed. |
| **CNDP reference missing at runtime** | Treat as `formLive=false`; render the email card; log a configuration error. Never render a blank number. |

### 6.7 Deliverability

- SPF and DKIM are preserved through [#15](https://github.com/mustaphaelou/hay2010website/issues/15); DMARC is added at `p=none` after the cutover. `no-reply@` is in the same domain.
- The `From` domain aligns with SPF/DKIM; the submitter is only in `Reply-To`.
- Text/plain, no attachments, no tracking pixel, no shortened links.
- Test to Gmail, Outlook, Proton and a Moroccan ISP mailbox; check spam placement and the authentication results.
- Monitor bounces on `no-reply@`; do not forward to Gmail ([#10](https://github.com/mustaphaelou/hay2010website/issues/10) §5.2, F-118).
- Keep the form volume well below the cPanel hourly send limit; confirm the limit with HeberjaHiz.

### 6.8 Staging

- `FORMS_ENABLED=false`; the form is absent, not disabled.
- Turnstile test keys; no production secret.
- Mailpit (or a local SMTP sink) for end-to-end tests; no real recipients, no real contact data.
- The staging legal pages may show placeholders ([#10](https://github.com/mustaphaelou/hay2010website/issues/10) §7.3); the form is not enabled on the shared staging host with a fake CNDP number.
- If a form test is needed end-to-end, run it locally or on a disposable preview with a "test" notice banner and Mailpit; never send to a real mailbox.

### 6.9 Monitoring and logs

- Metrics: submissions/day, success rate, SMTP failures, Turnstile failures, rate-limit hits, p95 action duration.
- Logs: `event`, `reference`, `outcome`, `durationMs`, `smtpCode`; no PII, no token, no message.
- Alerts: any SMTP auth failure; > 3 SMTP failures in 15 min; Turnstile failure rate > 50% over 15 min (likely a config/key issue); mailbox quota > 80%; 429 spike.
- A weekly review of `no-reply@` bounces and the `contact@` inbox for misrouted applications.

### 6.10 Origin IP trust

Cloudflare adds `CF-Connecting-IP`; Traefik forwards it. The header is trustworthy **only** if the origin cannot be reached directly:

- Preferred: Cloudflare Tunnel (no public origin port).
- Otherwise: firewall the origin to Cloudflare's published IP ranges and keep 80/443 closed to the world.
- If the origin is exposed, do not use `CF-Connecting-IP` for rate limiting or siteverify `remoteip`; use the direct socket address and accept that Cloudflare's proxy chain is not authenticated. Fix the lockdown before enabling the form.

The app reads the IP in one helper, not in each action:

```ts
// lib/forms/client-ip.ts (illustrative)
import { headers } from "next/headers"

export async function clientIp() {
  const h = await headers()
  return h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? "unknown"
}
```

The helper is only valid under the origin lockdown above.

### 6.11 Headers and CSP

Minimum headers on the public site:

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{nonce}' 'strict-dynamic' https://challenges.cloudflare.com;
  style-src 'self' 'nonce-{nonce}';
  img-src 'self' data: https://media.hay2010.ma;
  font-src 'self';
  connect-src 'self' https://challenges.cloudflare.com;
  frame-src https://challenges.cloudflare.com;
  form-action 'self';
  frame-ancestors 'none';
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Frame-Options: DENY
```

The exact CSP is implemented in `proxy.ts` once, with a per-request nonce ([#11](https://github.com/mustaphaelou/hay2010website/issues/11) already reserves `proxy.ts`). The Turnstile script tag carries the nonce; Cloudflare propagates it to its dynamically loaded resources. Test with the browser console and `Content-Security-Policy-Report-Only` before enforcing.

---

## 7. Privacy, CNDP and retention

### 7.1 Processing register (forms)

| # | Processing | Data | Purpose | Basis | Recipients | Retention | CNDP |
|---|---|---|---|---|---|---|---|
| 1 | Contact / quote by form or email | Name, company, email, phone, subject, message | Answer, qualify, quote | Art. 4-b pre-contract + consent | Internal services; HeberjaHiz (mail); VPS host; Cloudflare (Turnstile/CDN) | 12 months after last exchange; contract + accounting if a contract follows | **F-211** |
| 2 | Careers by email | Name, contact, CV, cover letter, experience | Recruitment | Art. 4-b + consent | Owner/recruiter; HeberjaHiz (mail); VPS host (no CV storage) | 6 months after decision; 12-month CVthèque with separate consent | **F-113** |
| 3 | Server logs / security | IP, timestamp, URL, user agent, response code | Security, availability | Art. 4-e legitimate interest | Cloudflare; VPS host | 6 months | Covered with hosting/contact filing; #14 confirms |
| 4 | Turnstile | Browser/security signals, IP | Bot detection | Art. 4-e security | Cloudflare | Per Cloudflare's Turnstile privacy terms; no form content | Covered with the Cloudflare F-118; #14 confirms |

There is **no** applicant database, no `submissions` table, no R2 object and no analytics event in #12.

### 7.2 Notices

- **Contact form:** the exact [#10](https://github.com/mustaphaelou/hay2010website/issues/10) §4.5 text, with the `contact` CNDP receipt. The form notice is code-owned.
- **Contact page, form off:** the short notice in §3.11, with the same `contact` receipt; the email route is a collection operation even without a form.
- **Careers email:** the exact [#10](https://github.com/mustaphaelou/hay2010website/issues/10) §4.5 "Careers email notice", with the `careers` authorization. It renders only when the reference exists.
- **Phase 3 application form:** the [#10](https://github.com/mustaphaelou/hay2010website/issues/10) §4.5 "Careers application form" text, with the required consent and the separate optional CVthèque consent.
- The policy, not the short notice, names every processor and transfer. The notice says "prestataires techniques (hébergement, messagerie)"; the policy names Cloudflare, HeberjaHiz and the VPS provider.
- No blank `n°`, no "en cours", no invented number, no copied lamalif receipt.

### 7.3 Consent mechanics

- One required checkbox per form; unticked; specific purpose; no bundling with terms, newsletter or analytics.
- The submit button is disabled until checked, with a visible explanation; the server re-validates.
- The CVthèque consent is separate and optional; it is not a condition of applying. The mailto template includes it only as an optional line the candidate must choose to keep; a missing line means no pool consent.
- The email body records the notice version and the choices; the email is the record. There is no server-side consent cookie or profile.
- Withdrawal: the person writes to `donnees@`; the owner deletes the data and confirms; no fee.
- The consent notice links to `/politique-de-confidentialite`; the link is reachable before submission.

### 7.4 CNDP filings

| Filing | Scope | Gate |
|---|---|---|
| **F-211** contact declaration | Contact/quote by form and email, `contact@`, `no-reply@` as sender, the mail host, server logs as described | `formLive` cannot be true without a real receipt in the notice. The **email-only** contact page is covered by the same declaration: it does not launch with real contact collection before the F-211 receipt and the `contact@` test. The form can stay off while the email route is declared. |
| **F-113** HR authorization (D-298-AU-2014) | Careers, `recrutement@`, CVs by email (or upload if phase 3), 6/12-month retention, the candidate consent document | `recrutementMailboxLive` cannot be true, and the page cannot invite CVs, before the authorization. The existing LinkedIn use of `recrutement@` should be included in the declared processing; the site does not treat it as a safe harbour. |
| **F-214** cookies/analytics (D-939-2025) | Cloudflare Web Analytics (not enabled at launch); cookies if a banner is ever added | **Not a form dependency.** Turnstile default issues a token, not a cookie; no pre-clearance; no F-214 for the contact form. If a cookie appears or pre-clearance is enabled, revisit. |
| **F-118** transfer authorization | Cloudflare/R2, the VPS if outside Morocco, Google only if used/forwarded | Before public data collection; the form adds no new processor (SMTP is Morocco). |

### 7.5 F-214 clarification

The ticket's wording ("The contact form needs an F-211/F-214 declaration") conflates two filings. The [#10](https://github.com/mustaphaelou/hay2010website/issues/10) decision is the authority:

- **F-211** covers the contact/quote processing, including the form and the email route.
- **F-214** covers cookies and audience measurement. The default Turnstile widget sets no first-party cookie and no pre-clearance; the form therefore does not trigger F-214.
- If the team enables Turnstile pre-clearance (`cf_clearance`), or any other cookie appears, the cookie section, the banner (if required) and F-214 come back into scope **before** the form is enabled.
- Validate this in the browser: DevTools → Application → Cookies/Storage on `/contact` with the form live; record the result in the launch checklist. If a cookie is present, update the policy and the filing.

### 7.6 Transfers

- **SMTP:** Morocco (HeberjaHiz), no transfer.
- **Cloudflare/CDN/Turnstile:** United States, covered by the F-118 and the Cloudflare DPA; the policy's transfer paragraph is filled in #14.
- **VPS:** record the country at provisioning; Morocco/EU preferred; US adds F-118 scope.
- **No resend/form SaaS:** no new processor.
- **No forwarding to Gmail:** forwarding would make Google a recipient and grow the F-118 scope. The Gmail remains a private fallback/account-recovery inbox, never a form recipient.

### 7.7 Retention

The numbers are fixed by [#10](https://github.com/mustaphaelou/hay2010website/issues/10); #12 applies them to the email workflow:

| Record | Retention | Enforcement |
|---|---|---|
| Contact | 12 months after last exchange | Mailbox cleanup; contract folder if a contract follows |
| Careers | 6 months after decision | Mailbox cleanup; deletion log |
| CVthèque | 12 months from explicit consent | Mailbox cleanup; no auto-renewal |
| No-decision application | 6 months after last exchange | Mailbox cleanup |
| Logs | 6 months | Cloudflare/VPS retention |
| Mail host backups | Provider rotation | Confirm; disclose or exclude |

Over-retention is an offence under law 09-08 art. 55; the operational checklist is the control. The policy, the CNDP declaration and this table must match.

### 7.8 Rights

- **Contact:** `donnees@hay2010.ma`, monitored by the direction; developer as technical backup.
- **Deadline:** rectification within 10 days; access/opposition within the legal deadlines; log date, subject, action, closure; no fee.
- **Identity check:** only when there is a reasonable doubt; do not collect a CNI copy by default.
- **Deletion:** remove from `contact@`/`recrutement@`, Sent, Trash, local copies and any backup the provider can address; confirm by email.
- **Escalation:** the person can complain to the CNDP (www.cndp.ma).
- **No automated decision:** applications are reviewed by a human; no scoring or auto-rejection.

### 7.9 Prohibited data

Do not request, and do not use in a decision:

- CNI/passport number or a copy of an ID document.
- A photo or portrait (a CV photo is not requested; if one is attached, do not use it).
- Date of birth, age, marital status, family situation.
- Health, disability or genetic data.
- Religion, political opinion, union membership, ethnic/national origin, race, colour, sex.
- Bank details, social security number, salary history.
- Any data unrelated to the role's objective requirements.

The page asks candidates not to include these; the owner deletes unnecessary data if a copy is kept. The Code du travail art. 9 discrimination list is the practical reference; counsel can refine the wording.

### 7.10 Policy and notice updates

Update `/politique-de-confidentialite` in the same release that enables the form or the careers email route:

- Contact processing: purposes, data, recipients, retention, F-211 receipt.
- Careers processing: purposes, data, recipients, retention, F-113 authorization, CVthèque.
- Turnstile/Cloudflare as a security processor; no cookie statement change if no cookie appears.
- `no-reply@` as a technical sender (not a contact channel).
- The rights procedure and the CNDP complaint route.
- The "Dernière mise à jour" date (`lastReviewed`).

If the notice text changes, bump the version and record it in the email body. Do not publish a policy that describes a form, a CV upload or an analytics tool that is not live.

---

## 8. Flags and gates

### 8.1 Flags

| Flag / env | Default | Meaning | Unlocked by |
|---|---|---|---|
| `FORMS_ENABLED` | `false` | Hard kill switch for every form; overrides content flags | Manual; stays false on staging |
| `formLive` | `false` | Renders the contact form on `/contact` | F-211 + `contact@`/`no-reply@` tests + Turnstile keys + notice review + `FORMS_ENABLED=true` |
| `recrutementMailboxLive` | `false` | Publishes `recrutement@` and invites CVs | F-113 + mailbox test + mail-host AV confirmation + notice |
| `applicationFormLive` | `false` | Renders the phase-3 application form | All phase-3 gates (§5.1); not planned |
| `cvUploadLive` | `false` | Enables the CV upload | All phase-3 gates + scanner + R2 + deletion job; not planned |
| `mapLive` | `false` | Contact map (static/link only) | Owner confirms the address is a reception point ([#3](https://github.com/mustaphaelou/hay2010website/issues/3)) |
| `analyticsLive` | `false` | Cloudflare Web Analytics | F-214 ([#10](https://github.com/mustaphaelou/hay2010website/issues/10)); unrelated to forms |

Flags fail closed: a missing flag, a missing secret, a missing CNDP reference or a missing mailbox test means the safer state (form absent / no CV invitation), never a broken form or a blank notice.

### 8.2 Gate table

| Gate | Must be true before | Evidence |
|---|---|---|
| **G1 — Contact mailbox** | Publishing `contact@` | Send/receive test from an external mailbox; SPF/DKIM checked ([#10](https://github.com/mustaphaelou/hay2010website/issues/10) §6). |
| **G2 — No-reply mailbox** | Enabling the contact form | `no-reply@` created, tested, bounce-monitored; not public. |
| **G3 — F-211** | Enabling the contact form **or publishing the email contact page** / collecting contact data | Real receipt number + date in `cndpReferences.contact`; policy and short notice updated. |
| **G4 — Turnstile** | Enabling the contact form | Production widget, hostname `hay2010.ma`, secret in Coolify, siteverify test pass/fail/replay. |
| **G5 — Notice review** | Enabling the contact form / publishing the contact page | Counsel/`legalReviewed` covers the short and full notices; no blank/placeholder. |
| **G6 — F-113** | Publishing `recrutement@` / inviting CVs | Authorization number + date in `cndpReferences.careers`; candidate consent document. |
| **G7 — Recruitment mailbox** | Same as G6 | Send/receive test; access limited; no forwarding. |
| **G8 — Mail-host AV** | Inviting CVs | HeberjaHiz confirms inbound attachment scanning; record it. |
| **G9 — Origin lockdown** | Enabling rate limiting/Turnstile | Tunnel or Cloudflare IP allowlist; `CF-Connecting-IP` trusted. |
| **G10 — Phase 3** | Upload | F-113 + 8 GB VPS + ClamAV + private R2 + applicant table + deletion job + counsel. |

### 8.3 What changes when a gate opens

- **G1/G3/G4/G5:** set `formLive=true`; update the page, policy, sitemap (`/contact` is already there), and the form notice; deploy; smoke-test; monitor.
- **G6/G7/G8:** set `recrutementMailboxLive=true`; publish `recrutement@` on `/carrieres`; add the email notice; update the policy; deploy; test the mailto and the inbox.
- **G10:** a separate ticket; do not flip flags in the same release as the page build.

---

## 9. Handoffs

| Ticket | What it receives from #12 |
|---|---|
| [#5](https://github.com/mustaphaelou/hay2010website/issues/5) content model | Add `applicationFormLive` and `cvUploadLive` (both false); clarify `formLive` = contact form only; `recrutementMailboxLive` = publish `recrutement@`/invite CVs; add a developer-owned `contactNotice` shown even when the form is off (email-only collection still needs the CNDP receipt) and keep `formNotice` form-only (or render both from code); no new collections; no applicant data in Payload; `jobs` stays inline at launch. |
| [#10](https://github.com/mustaphaelou/hay2010website/issues/10) legal/consent | The form notices are used verbatim; F-214 is not a form dependency without a cookie; `no-reply@` is a service mailbox; no auto-reply; the policy names Turnstile/Cloudflare; the careers email notice is used only with F-113. |
| [#11](https://github.com/mustaphaelou/hay2010website/issues/11) SEO | No `JobPosting` at launch; `/contact` stays in the sitemap; no success URL, no form-query URLs; the phase-3 `/carrieres/postuler` is `noindex`; `ContactPage` remains the only contact schema. |
| [#13](https://github.com/mustaphaelou/hay2010website/issues/13) prototype | Form states: default, pending, success, validation, Turnstile, rate limit, SMTP failure, no-JS; `ContactForm` and `CareersApplication` components; the email card when the form is off. |
| [#14](https://github.com/mustaphaelou/hay2010website/issues/14) CNDP | F-211 scope includes the form, `contact@`, `no-reply@` and the mail host; F-113 includes `recrutement@`, the existing LinkedIn use and the candidate consent; F-214 is not needed for Turnstile without pre-clearance; F-118 covers Cloudflare/R2/VPS; confirm the mail-host AV and backup rotation. |
| [#16](https://github.com/mustaphaelou/hay2010website/issues/16) launch | Forms are off at launch unless G1–G5 pass; careers CVs only if G6–G8 pass; the mailbox tests, counsel review and origin lockdown are launch gates; no blank CNDP number. |
| [#8](https://github.com/mustaphaelou/hay2010website/issues/8) hosting | SMTP ports/TLS and `no-reply@`; Turnstile keys; `FORMS_ENABLED`; `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`; origin lockdown; Mailpit on staging; no Redis; ClamAV only in phase 3. |
| [#2](https://github.com/mustaphaelou/hay2010website/issues/2) page tree | `/contact` is email-first, form optional; `/carrieres` is email-only at launch; no job detail pages; no "Postuler" before F-113. |
| [#3](https://github.com/mustaphaelou/hay2010website/issues/3) facts register | `no-reply@` is internal/non-public; `recrutement@` is public only after F-113; no phone; no Gmail; careers copy respects the gated claims. |
| [#6](https://github.com/mustaphaelou/hay2010website/issues/6) réalisations | The CTA remains `mailto:contact@`; no form; no CNDP dependency for the reference request. |

---

## 10. Implementation checklist

### 10.1 Preconditions

- [ ] `contact@`, `donnees@` and `no-reply@` created, send/receive-tested, SPF/DKIM checked.
- [ ] `recrutement@` created and tested; not published until F-113.
- [ ] F-211 receipt in `cndpReferences.contact`; F-113 authorization in `cndpReferences.careers` (for careers).
- [ ] Turnstile production widget for `hay2010.ma`; secret in Coolify.
- [ ] SMTP host/port/TLS confirmed; credentials in Coolify; outbound port open from the VPS.
- [ ] Origin locked to Cloudflare (Tunnel or IP allowlist).
- [ ] Counsel/`legalReviewed` covers the notices and the retention.
- [ ] `docs/legal/analytics-consent-legal-pages.md`, the policy and the notices agree on the numbers.

### 10.2 Code (when the page build starts)

Proposed modules (names may adapt to the page build):

- `lib/flags.ts` — add the flags from §8.1; read env; fail closed.
- `lib/forms/contact-schema.ts` — shared Zod schema; subject allowlist; error keys.
- `lib/forms/client-ip.ts` — single IP helper, valid only under origin lockdown.
- `lib/forms/rate-limit.ts` — in-memory token bucket, cleanup, no PII.
- `lib/forms/turnstile.ts` — siteverify with timeout, action/hostname checks.
- `lib/mail.ts` — Nodemailer transport, timeouts, retry policy, plain-text composition.
- `app/contact/actions.ts` — Server Action: cheap checks → schema → Turnstile → rate limit → send.
- `app/contact/page.tsx` — form-or-email state; metadata.
- `components/forms/contact-form.tsx` — client component with `useActionState`; Turnstile widget; error summary; success panel.
- `components/forms/form-field.tsx`, `form-status.tsx` — accessible primitives; reuse existing UI.
- `proxy.ts` — CSP nonce and headers; Turnstile nonce propagation.
- `next.config.ts` — `experimental.serverActions.allowedOrigins` only if the proxy does not forward the public host; keep the 1 MB body limit.
- `app/carrieres/page.tsx` — openings, spontaneous, email notice; no form.
- `docs/` — this decision record and the cross-doc amendments.

Do **not** add: a `submissions` collection, a `POST /api/contact` route unless the Server Action path fails, a file input, another CAPTCHA or third-party form service, a queue, Redis, a CRM SDK, or a Google Maps iframe.

### 10.3 Acceptance criteria

- `FORMS_ENABLED=false` or `formLive=false` renders **no** form element and no disabled fields; the email CTA and the short data-protection notice with the real CNDP receipt are visible; a missing receipt keeps the page off.
- With `formLive=true` and a valid F-211 reference, a valid submission reaches `contact@` as text/plain with the fields, reference, consent version and no IP.
- A missing consent, invalid email, unknown object, oversized message or CR/LF in a single-line field is rejected server-side with a French message.
- A filled honeypot or duplicate `submissionId` returns success and sends nothing.
- A missing/expired/replayed Turnstile token is rejected; the widget resets; the email fallback appears.
- A rate-limited IP/email sees the 429-style message and the email fallback.
- SMTP failure shows the generic message + email fallback and logs no PII.
- The page has one H1, labelled fields, an error summary, focus management, `aria-live` success, 44 px targets, 200% zoom and keyboard access; `axe` has no critical issues.
- No submission content appears in Postgres, R2, analytics, application logs or the browser URL.
- No blank CNDP number can render; the build/test asserts the placeholder is absent in production mode.
- `recrutementMailboxLive=false` hides `recrutement@` and every "Postuler" CTA; `true` shows the email notice and the mailto.
- The careers page has no `JobPosting` JSON-LD at launch; `/carrieres/[slug]` is 404.
- The privacy policy and the form notices match the enabled processing.
- The `no-reply@` bounce path is monitored; the `contact@` inbox has a retention routine.

### 10.4 Test plan

**Unit**

- Schema: valid/invalid names, emails, phones, objects, messages, consent; CR/LF injection; 32 KB body; Unicode.
- Subject allowlist and header sanitization; email body escaping; reference format.
- Rate limiter: window, per-IP, per-email, idempotency, cleanup.
- Turnstile: success/action mismatch/hostname mismatch/timeout/duplicate; test keys.
- Flag resolver: missing secret/reference → safer state.

**Integration**

- Server Action with mocked Nodemailer/Turnstile: success, validation, 429, SMTP 4xx retry, SMTP 5xx, auth failure, timeout.
- Mail composition: text/plain, no attachments, `Reply-To`, `From`, `Envelope`, subject.
- CSP/headers: Turnstile allowed; no `unsafe-inline` in production; nonce present.

**E2E (Playwright)**

- Form hidden when off; visible when on.
- Happy path with Turnstile always-pass test key.
- Always-fail and duplicate-token test keys → accessible error + reset.
- Validation errors, focus summary, preserved values.
- Rate limit (seed the limiter or use a test hook).
- No-JS fallback (email visible).
- Mobile viewport, 200% zoom, keyboard-only.
- Careers: F-113 off → no `recrutement@`/no "Postuler"; on → mailto + notice; empty state.

**Manual**

- Screen reader (NVDA/Firefox, VoiceOver/Safari, TalkBack).
- Deliverability to Gmail/Outlook/Proton/Moroccan ISP; spam score; authentication results.
- Cookie/storage audit on `/contact`: no unexpected cookie; Turnstile default; record it.
- Mailbox retention dry run; deletion log.
- Origin lockdown check: direct VPS request cannot spoof `CF-Connecting-IP`.

**Privacy**

- Search the app logs, DB, R2 and browser network for the test name/email/message; assert absent.
- Confirm the policy's processors/retention match the live config.

### 10.5 Rollout and rollback

1. Deploy with `FORMS_ENABLED=false`, `formLive=false`; verify the email card and the careers state.
2. On staging/local with Mailpit and Turnstile test keys, run the full test plan.
3. Enable `FORMS_ENABLED=true` and `formLive=true` only after G1–G5; smoke-test one real message to `contact@`; check headers and spam.
4. Monitor for 48 h: SMTP failures, Turnstile failures, 429s, inbox delivery.
5. Rollback: set `formLive=false` (or `FORMS_ENABLED=false`), deploy; the form disappears, the email CTA remains. No data to clean, no migration to reverse.

The careers email route has no deploy switch beyond `recrutementMailboxLive`; rollback is setting it false and removing the address/notice from the page.

---

## 11. Open items and owner decisions

| # | Item | Owner / ticket | Default if unresolved |
|---|---|---|---|
| 1 | Confirm **no application form / no CV upload** at launch | Owner | Email-only, as specified |
| 2 | Supply the **current openings** (title, contract, location, summary, description, closing date) or confirm none | Owner | Empty state + spontaneous section |
| 3 | Confirm whether `recrutement@` is published at launch; file F-113 first | Owner + [#14](https://github.com/mustaphaelou/hay2010website/issues/14) | `contact@` only; no CV invitation |
| 4 | Create `no-reply@` and confirm the SMTP port/TLS and hourly limit with HeberjaHiz | Owner + [#8](https://github.com/mustaphaelou/hay2010website/issues/8) | Form stays off |
| 5 | Confirm the mail host **scans inbound attachments**; record the evidence | Owner + [#14](https://github.com/mustaphaelou/hay2010website/issues/14) | No CV invitation on the site |
| 6 | Confirm the response-time copy (or keep "dans les meilleurs délais") | Owner | Generic copy |
| 7 | Confirm **no auto-reply** | Owner | No auto-reply |
| 8 | Counsel review of the notices, retention and Turnstile/no-cookie position | [#16](https://github.com/mustaphaelou/hay2010website/issues/16) | Forms off |
| 9 | Confirm the VPS country/RAM and origin lockdown | [#8](https://github.com/mustaphaelou/hay2010website/issues/8) / [#15](https://github.com/mustaphaelou/hay2010website/issues/15) | Form off until locked |
| 10 | Decide whether a phase-3 upload will ever be considered | Owner | Not planned |

None of these blocks the **specification**; items 1–9 block enabling the relevant surface.

---

## 12. Sources

- **Next.js 16.4.3 bundled docs:** forms (`01-app/02-guides/forms.md`), Server Actions (`01-app/02-guides/server-actions.md`), route handlers (`01-app/01-getting-started/15-route-handlers.md`), data security (`01-app/02-guides/data-security.md`), CSP (`01-app/02-guides/content-security-policy.md`), `serverActions` config (`01-app/03-api-reference/05-config/01-next-config-js/serverActions.md`). Read from `node_modules/next/dist/docs/` on 2026-11-09.
- **Cloudflare Turnstile:** overview (WCAG 2.2 AA; managed/non-interactive/invisible; no access to form entries), server-side validation (siteverify, 300 s, single use, `remoteip`, `idempotency_key`, action/hostname checks), CSP (`script-src`/`frame-src https://challenges.cloudflare.com`; pre-clearance uses `cf_clearance`), testing (test sitekeys/secrets), widget configurations (action/cData, appearance, size). Retrieved 2026-11-09:
  - https://developers.cloudflare.com/turnstile/
  - https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
  - https://developers.cloudflare.com/turnstile/reference/content-security-policy/
  - https://developers.cloudflare.com/turnstile/troubleshooting/testing/
  - https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/
- **Cloudflare WAF rate limiting:** plan limits and parameters (Free: 1 rule, 10 s period, 10 s mitigation, block; Pro+: more); form-protection example. Retrieved 2026-11-09:
  - https://developers.cloudflare.com/waf/rate-limiting-rules/
  - https://developers.cloudflare.com/use-cases/solutions/protect-sensitive-forms-fraud-abuse/
- **Nodemailer:** SMTP transport, pooling, TLS, timeouts. https://nodemailer.com/smtp/
- **Law 09-08 and CNDP:** the legal research note on branch `research/hay2010-legal-consent` (`docs/research/hay2010-legal-consent.md`, 2026-11-08), and [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md) §4.5, §5, §6, §7. CNDP procedures: https://www.cndp.ma/procedures-de-notification-process/
- **Law 09-08 text:** https://www.cndp.ma/wp-content/uploads/2023/11/Loi-09-08-Fr.pdf
- **F-113 / D-298-AU-2014, F-211, F-214 / D-939-2025, F-118:** as cited in the legal decision and research note. Re-verify before launch; the CNDP has published new deliberations through 2025–2026.
- **WCAG 2.2:** https://www.w3.org/TR/WCAG22/
- **OWASP File Upload Cheat Sheet** (phase 3): https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- **ClamAV** (phase 3): https://docs.clamav.net/
- **Cloudflare R2** private buckets, presigned URLs, lifecycle (phase 3): https://developers.cloudflare.com/r2/
- **Company facts and contact channels:** [`docs/company/facts-register.md`](../company/facts-register.md).
- **Content model and gates:** [`docs/content/content-model.md`](../content/content-model.md).
- **Hosting, SMTP, WAF:** [`docs/hosting/deployment-decision.md`](../hosting/deployment-decision.md).
- **SEO, no `JobPosting`:** [`docs/seo/seo-metadata.md`](../seo/seo-metadata.md) §5.9.
- **Page tree:** [#2](https://github.com/mustaphaelou/hay2010website/issues/2) and `.scratch/hay2010-website/issues/01-page-tree.md`.
- **Careers research (LinkedIn posts, `recrutement@`, role history):** [`docs/research/hay2010-company-activity-and-careers.md`](../research/hay2010-company-activity-and-careers.md).

All sources were retrieved on 2026-11-08/09. Re-check the CNDP texts, the Cloudflare plan limits and the mail-host SMTP/AV setup before enabling the forms.

---

## 13. Change log

| Date | Change |
|---|---|
| 2026-11-09 | Initial decision record. No application form; contact form gated on F-211; careers email-only; no CV upload; custom Next.js + SMTP backend; Turnstile/honeypot/rate limits; F-214 clarified as not a form dependency; phase-3 upload design recorded but not approved. |
