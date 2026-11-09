# HAY2010 — Analytics, consent and legal pages

**Status:** Decided — 2026-11-09.
**Amended 2026-11-09 (#12):** the contact form is optional and gated on the F-211 receipt; **careers stays email-only** (no application form, no CV upload); the short contact-page notice applies even when the form is off; `no-reply@hay2010.ma` is a service sender; **F-214 is not a form dependency** when Turnstile runs without pre-clearance and sets no cookie. Full form decision: [`docs/forms/contact-careers-forms.md`](../forms/contact-careers-forms.md).
**Resolves:** GitHub [#10](https://github.com/mustaphaelou/hay2010website/issues/10) (local `09-analytics-consent-legal.md`).
**Depends on:** [#14](https://github.com/mustaphaelou/hay2010website/issues/14) for the CNDP receipts, the F-118 and the rights procedure; [#12](https://github.com/mustaphaelou/hay2010website/issues/12) for the forms; [#16](https://github.com/mustaphaelou/hay2010website/issues/16) for the public launch; [#15](https://github.com/mustaphaelou/hay2010website/issues/15) for DNS and mail.
**Amends:** the contact channels in [`docs/company/facts-register.md`](../company/facts-register.md) (#3); the footer and careers handoff in [#2](https://github.com/mustaphaelou/hay2010website/issues/2); the analytics note in [`docs/hosting/deployment-decision.md`](../hosting/deployment-decision.md) (#8); the contact fields in [`docs/content/content-model.md`](../content/content-model.md) (#5); the fallback CTA in [`docs/content/realisations-strategy.md`](../content/realisations-strategy.md) (#6).
**Not legal advice.** This is a decision record built on the legal research note on branch `research/hay2010-legal-consent` (2026-11-08). The consent posture, the retention periods, the F-118 coverage and the final legal wording need the one-off Moroccan counsel review described in §7.4 before the public launch.

---

## 1. Decision

| Item | Decision |
|---|---|
| **Analytics at launch** | **None.** No client-side analytics, no tag manager, no third-party script. Cloudflare's server-side edge request analytics is used from the dashboard for operations and security only. |
| **Analytics after #14** | **Cloudflare Web Analytics**, cookieless, no banner, **six-month retention**, on the HAY2010 Cloudflare account. Enabled only after #14 files the F-214 (or counsel confirms in writing that cookieless measurement is outside it). |
| **Consent banner** | **None at launch.** A lightweight first-party banner appears only when a non-essential cookie or script is added. |
| **Events** | Page views, SPA route changes and Core Web Vitals. No custom events, no UTM logging, no user identifiers, no advertising features. |
| **Legal pages** | `/mentions-legales` and `/politique-de-confidentialite`; cookies are a **section of the privacy policy**, not a third page; both linked from every footer. |
| **Controller** | **SOCIETE HAY 2010**, SARL, RC 87305, ICE 001459327000056, 15 000 000 MAD, Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat. |
| **Contact addresses** | **`contact@hay2010.ma`** public; **`donnees@hay2010.ma`** rights contact; **`recrutement@hay2010.ma`** careers, published only after #14 covers the mailbox. `ste.hay2010@gmail.com` becomes a private fallback and account-recovery inbox, never a published channel. |
| **Mailboxes** | Owner creates `contact@`, `donnees@`, `recrutement@` and the service mailbox `no-reply@` in the HeberjaHiz cPanel, tests send/receive, and publishes each public address only after the test. `no-reply@` is never a public contact. #15 must preserve MX/SPF/DKIM and the mailboxes are re-tested after the DNS change. |
| **Retention** | Contact 12 months after the last exchange; careers 6 months after the decision, 12 months in a pool only with separate consent; logs 6 months; analytics 6 months; consent choice 6 months. |
| **Forms** | **No form is required at launch.** The contact form is optional and gated on F-211; careers is **email-only** (no application form, no CV upload). The notices and consent wording are specified in §4.5 for #12. The email-only contact page still needs the short notice and the F-211 receipt. |
| **F-214** | **Not a form dependency.** It covers cookies/analytics; the default Turnstile widget sets no `cf_clearance` cookie because pre-clearance is disabled. Revisit if a cookie appears or a banner is added. |
| **Newsletter** | **None.** D-940-2025 does not apply. If one is ever added, it needs its own opt-in, filing and policy update. |
| **Counsel** | One limited Moroccan counsel review before #16, covering the 2023-versus-2025 consent conflict, the retention periods, the F-118 coverage and the legal-page wording. Not an ongoing retainer. |

The site therefore launches with no analytics script, no consent banner, no form by default, no newsletter and no advertising or social plugin. It publishes the two legal pages, uses `contact@` and `donnees@` (with `recrutement@` held back until #14), and follows the contact channels in the facts register. The contact form can be enabled later behind `formLive`; careers applications remain email-only.

---

## 2. Analytics

### 2.1 Launch: no audience-measurement tool

The site launches with **no client-side analytics**. That means:

- no Google Analytics, no Google Tag Manager, no Meta pixel;
- no Plausible, Umami or Matomo instance;
- no Cloudflare Web Analytics beacon on day one;
- no analytics cookie, no `localStorage` identifier, no fingerprinting script.

The only measurement available at launch is **Cloudflare's server-side edge request analytics**, which exists because the zone is proxied through Cloudflare. It is used from the Cloudflare dashboard for:

- traffic volume, status codes and cache behaviour;
- security events and bot/WAF activity;
- origin health and performance;
- rough path/URL reporting where the plan exposes it (the Free plan's URL breakdown is limited; advanced HTTP analytics is a paid feature).

It is **not** a marketing analytics product, not a source of audience profiles and not used to build a user-level history. The privacy policy describes server logs and security processing (§4.3 and §5.1). The CNDP filing covers the hosting/security processing; #14 owns the exact form.

This posture deliberately keeps launch independent of the F-214. It also removes the 2023-guidance versus D-939-2025 consent argument from the launch path: no cookie is deposited, so there is nothing to consent to. The strictly necessary Cloudflare cookies are disclosed in the policy (§4.4).

### 2.2 After #14: Cloudflare Web Analytics

Once #14 has filed the F-214 (or counsel has confirmed in writing that a cookieless, non-profiling beacon is outside the cookie declaration), the site may enable **Cloudflare Web Analytics**:

| Property | Value |
|---|---|
| Tool | Cloudflare Web Analytics, same HAY2010 Cloudflare account as the zone |
| Cookies / localStorage | None. Cloudflare states it does not use client-side state, does not fingerprint, and does not track individuals across sites. |
| Retention | Six months in the dashboard; unsampled beacon data is kept briefly, then aggregated. Meets the D-939-2025 six-month cap. |
| Metrics | Page views, route changes in the SPA, referrers, countries, device/browser, Core Web Vitals |
| Custom events | **Not supported.** No UTM support; query strings are not logged. |
| Blocking | The beacon is blocked by some ad blockers; counts are directional, not a full census. |
| Consent | **None required** for cookieless, non-profiling audience measurement under D-939-2025. The 2023 guidance is not triggered because no cookie is deposited. |
| F-214 | Required before enabling (unless counsel records the written exception). The receipt is added to the policy. |
| Account owner | HAY2010's Cloudflare account; developer as administrator, owner as read-only. No personal Google or analytics account. |

**Implementation notes**

- Use the automatic injection for the proxied zone or the manual snippet with `type="module"`; do not add a tag manager.
- If a CSP is introduced, allow `https://static.cloudflareinsights.com` in `script-src` and either `'self'` (automatic setup) or `https://cloudflareinsights.com` (manual setup) in `connect-src`.
- Do not set `Cache-Control: public, no-transform` on HTML, or Cloudflare cannot inject the beacon.
- The beacon measures the public site only. Staging stays behind Cloudflare Access and `noindex`; no analytics on staging.
- The policy must be updated in the same release that enables the beacon. Retention and the "no cookies" statement must match the configuration.

### 2.3 Events that matter

At launch: **none**, because no analytics runs.

When Cloudflare Web Analytics is enabled:

| Event | Why |
|---|---|
| Page view per route | Which pages are found and read |
| SPA route change | Next.js client-side navigation is measured correctly |
| Core Web Vitals | LCP, INP and CLS by page group |
| Referrer / country / device | Whether the audience is local, direct or search-led |
| 404 and redirect hits | Broken links and legacy WordPress URLs |

Deliberately **not** measured:

- no custom CTA or `mailto:` click events (Cloudflare Web Analytics has no custom events);
- no form-start, form-abandon or application-funnel events (there is no public form at launch);
- no user IDs, no cross-session profiles, no advertising audiences;
- no query-string or search-term logging.

If click-level conversion data becomes necessary, the next step is a first-party event endpoint or a self-hosted Umami instance, with the same cookieless, six-month, non-profiling rules. It is not a reason to add GA4 or GTM.

### 2.4 Why not the alternatives

| Option | Verdict |
|---|---|
| **GA4** | Rejected. It needs a real consent banner, a US transfer (F-118), careful disabling of Google signals, ad personalization and data sharing, and it is easy to drift into profiling. The business case for a brochure site does not justify it. |
| **GA4 without a banner** | Rejected outright. It relies on a contested reading of D-939-2025 and creates a visible compliance failure if the 2023 guidance is applied. |
| **Plausible self-hosted** | Rejected for now. It needs ClickHouse plus Postgres and roughly 1 GB of RAM on top of the app; the 4 GB VPS has no headroom for another stateful service. |
| **Matomo self-hosted** | Rejected. Heavier than Plausible, cookie-based by default, and the consent configuration is exactly the problem this decision avoids. |
| **Umami self-hosted** | Rejected for launch, kept as a fallback if custom events become necessary. Cookieless and light, but still another service, database schema, upgrade path and backup. |
| **Cloudflare edge analytics only, forever** | Not chosen. It is enough for launch, but page-level views and Web Vitals are worth the cookieless beacon after #14. |
| **No analytics ever** | Not chosen. The owner should be able to see whether the site is found and which pages are read. |

---

## 3. Consent

### 3.1 No banner at launch

The site deposits **no non-essential cookie** and stores **no client-side identifier** for analytics, advertising or social sharing. The only cookies are:

- Cloudflare's strictly necessary security cookies (`__cf_bm`, `cf_clearance`, and `_cfuvid` if rate limiting uses it);
- the Payload admin session cookie, only for authenticated administrators;
- no analytics, advertising or social cookie.

Strictly necessary cookies do not require consent. The privacy policy discloses them, their purpose and their duration (§4.4). The site therefore shows **no cookie banner, no "accept all" interstitial and no cookie wall**.

The 2023 CNDP website guidance says consent is required before any cookie that uses personal data. That guidance is in tension with D-939-2025 for audience measurement. This decision does not resolve the tension in the abstract; it removes the trigger by not depositing an analytics cookie. If counsel later concludes that the beacon itself is caught by the 2023 guidance despite being cookieless, the fallback is to keep analytics off, not to add a banner around a cookieless script.

### 3.2 If a banner is ever needed

A banner is required as soon as any of these appears:

- a cookie or `localStorage` entry that is not strictly necessary (advertising, social sharing, embedded video, embedded map, a cookie-based analytics tool);
- a third-party script that sets its own cookie;
- a personalized-ads or remarketing tag.

The banner must then follow these rules:

| Rule | Implementation |
|---|---|
| Refuse as easy as accept | Two equally prominent buttons, same visual weight, on the first layer |
| No pre-ticked boxes | Every non-essential category starts off |
| No cookie wall | The site remains usable without consent; only the non-essential feature is blocked |
| Granular categories | **Nécessaires** (always), **Mesure d'audience** (only if the tool uses cookies), **Contenus externes** (if embeds), **Publicité** (not planned) |
| Six-month re-prompt | Consent or refusal stored for at most six months, then asked again |
| Easy revocation | A permanent **Gérer mes cookies** link in the footer and in the policy opens the same panel |
| Load after consent | No non-essential script is loaded, parsed or preconnected before the matching consent |
| No dark patterns | No "continue browsing = consent", no close-button consent, no confusing toggle |
| Record | First-party cookie or `localStorage` with the choice, the policy version and the date; no server-side profile; deleted after six months |

The consent record is not a marketing profile. It exists only to remember the choice and is capped at six months by D-939-2025.

### 3.3 Newsletter

There is **no newsletter** and no marketing email. The content model deliberately excludes it ([#5](https://github.com/mustaphaelou/hay2010website/issues/5)), and the page tree drops lamalif's newsletter ([#2](https://github.com/mustaphaelou/hay2010website/issues/2)). D-940-2025 therefore does not apply.

If a newsletter is added later, it needs all of the following before the first send:

- a separate, unticked opt-in, not bundled with a contact request or a job application;
- a double opt-in confirmation;
- an unsubscribe link in every message and a suppression list;
- a D-940-2025 declaration and, if the provider is outside Morocco, an F-118;
- retention until unsubscribe plus the proof-of-consent period, stated in the policy;
- a policy update and a CNDP reference.

This is a new ticket, not a configuration switch.

### 3.4 Form consent

No public form is required at launch. The contact form is optional and gated on F-211; the careers route is email-only, with no application form and no CV upload ([#12](https://github.com/mustaphaelou/hay2010website/issues/12)). The consent wording for #12 is fixed in §4.5. The rules are:

- an unticked, specific checkbox for the processing purpose, never bundled with terms;
- a short law 09-08 notice next to the submit button, with a link to the policy;
- a short contact-page notice **even when the form is off**, because the email route is still a collection;
- a separate, optional checkbox for the 12-month talent pool (form) or an explicit optional line in the careers email template;
- no CNI number, photo, health, marital-status or religion field;
- the CNDP receipt or authorization number only when a real number exists;
- the form gate stays off until #14 has issued the receipt and #12 has implemented the notice;
- no application form and no CV upload; the mailbox is the CV record.

---

## 4. Legal pages

### 4.1 Routes and structure

| Page | Route | Content |
|---|---|---|
| Mentions légales | `/mentions-legales` | Publisher identity, intellectual property, data protection summary, cookies summary, liability, applicable law |
| Politique de confidentialité | `/politique-de-confidentialite` | Controller, processing purposes and bases, recipients, transfers, retention, rights, cookies, security, CNDP references |

- Cookies are a **section of the privacy policy** (`/politique-de-confidentialite#cookies`), not a separate page. This follows the page tree in [#2](https://github.com/mustaphaelou/hay2010website/issues/2).
- Both pages are linked from the footer bottom bar on every page, next to the copyright line.
- The pages are French only. If an Arabic version is ever added, it is a separate publication of the same notices and must carry the same versions and references.
- The identity block is **code-owned** from `lib/company.ts`; the owner cannot edit it in Payload. The prose is Payload-owned and developer-published.
- The “Dernière mise à jour” date is `lastReviewed`, not the CMS publish date.

### 4.2 Mentions légales — approved copy

The identity block is injected by the template. The prose is:

```text
MENTIONS LÉGALES

Dernière mise à jour : [lastReviewed]

1. Éditeur du site

Le site https://hay2010.ma est édité par :

SOCIETE HAY 2010
Société à responsabilité limitée (SARL)
Capital social : 15 000 000 MAD
Siège social : Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc
Registre du commerce : RC 87305 — Tribunal de commerce de Rabat
ICE : 001459327000056
E-mail : contact@hay2010.ma
Site : https://hay2010.ma

2. Propriété intellectuelle

Le site, sa structure, ses textes, ses images, ses logos et ses marques sont la propriété de SOCIETE HAY 2010 ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite et peut constituer une contrefaçon au sens de la loi n° 17-97 relative à la protection de la propriété industrielle.

3. Données personnelles

SOCIETE HAY 2010 est responsable du traitement des données personnelles collectées via le site.

Les données sont traitées pour répondre aux demandes de contact et de devis, gérer les candidatures et assurer la sécurité du site, dans les conditions détaillées dans la politique de confidentialité.

Conformément à la loi n° 09-08, vous disposez d'un droit d'accès, de rectification, d'opposition et de retrait de votre consentement. Pour exercer ces droits : donnees@hay2010.ma.

[Conditional — render only when cndpReferences is non-empty]
Ce traitement a fait l'objet d'une déclaration / autorisation auprès de la CNDP sous la référence indiquée dans la politique de confidentialité.
[/Conditional]

Le détail des traitements, des destinataires, des durées de conservation et des transferts est disponible dans la politique de confidentialité : /politique-de-confidentialite.

4. Cookies

Le site ne dépose aucun cookie de mesure d'audience, de publicité ou de réseaux sociaux. Seuls des cookies strictement nécessaires à la sécurité et au fonctionnement du site peuvent être déposés par Cloudflare. Le détail est disponible dans la politique de confidentialité, section « Cookies ».

5. Responsabilité

SOCIETE HAY 2010 s'efforce d'assurer l'exactitude des informations publiées, sans pouvoir garantir qu'elles soient exemptes d'erreurs. Le site peut contenir des liens vers des sites tiers dont le contenu n'engage pas la responsabilité de SOCIETE HAY 2010.

6. Droit applicable

Le site est soumis au droit marocain. Tout litige relatif à son utilisation relève de la compétence du Tribunal de commerce de Rabat, sous réserve des règles impératives applicables.

7. Mise à jour

Dernière mise à jour : [lastReviewed]
```

**Deliberately omitted, and must not be added as blank lines:**

- **No publication director.** The site is not a *journal électronique* under loi 88-13: it is a corporate showcase, and Actualités is a gated communiqué stream capped at six a year with no journalistic editorial line ([#5](https://github.com/mustaphaelou/hay2010website/issues/5)). If the owner ever wants a real news operation, reopen #5 and take advice before adding a director line.
- **No phone.** It is not confirmed and is gated by the facts register.
- **No host line.** Moroccan law does not require one for a corporate site; the host is named as a processor in the privacy policy.
- **No CNDP blank.** The conditional sentence renders only when a real reference exists. Never publish “n° …” or “en cours de déclaration”.
- **No gérant line.** The legal representative is not required by loi 5-96 on the website, and the facts register approves the gérant's name only on L'Entreprise. Do not add a “Représentant légal” block here.

### 4.3 Politique de confidentialité — approved copy

The identity block is injected by the template; the prose is:

```text
POLITIQUE DE CONFIDENTIALITÉ

Dernière mise à jour : [lastReviewed]

La présente politique explique quelles données personnelles SOCIETE HAY 2010 traite lorsque vous utilisez le site https://hay2010.ma, pourquoi et comment. Elle s'applique aux visiteurs, aux personnes qui nous contactent et aux candidats.

1. Responsable du traitement

SOCIETE HAY 2010
Société à responsabilité limitée (SARL)
Capital social : 15 000 000 MAD
Siège social : Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc
Registre du commerce : RC 87305 — Tribunal de commerce de Rabat
ICE : 001459327000056

Contact général : contact@hay2010.ma
Contact données personnelles : donnees@hay2010.ma

2. Quelles données, pour quelles finalités et sur quelle base ?

2.1 Demandes de contact et de devis

Données : nom, prénom, société, adresse e-mail, numéro de téléphone, objet et message, ainsi que les pièces jointes que vous choisissez d'envoyer.

Finalité : répondre à votre demande, préparer un devis et assurer le suivi de l'échange.

Base légale : mesures précontractuelles prises à votre demande (article 4-b de la loi n° 09-08) et, le cas échéant, votre consentement.

Caractère obligatoire : les champs marqués d'un astérisque sont obligatoires. Sans eux, nous ne pouvons pas traiter votre demande.

Conservation : 12 mois après le dernier échange. Si une relation contractuelle en découle, les données sont conservées pendant la durée de la relation et les délais légaux de conservation comptable applicables.

Destinataires : les services internes concernés et nos prestataires techniques (hébergement du site et de la messagerie), dans les conditions prévues à la section 3.

2.2 Candidatures

Données : identité, coordonnées, curriculum vitae, lettre de motivation et parcours professionnel.

Finalité : gérer votre candidature et le processus de recrutement.

Base légale : mesures précontractuelles prises à votre demande (article 4-b) et votre consentement.

Caractère obligatoire : les informations nécessaires à l'évaluation de la candidature sont obligatoires ; les informations facultatives sont signalées comme telles.

Conservation : 6 mois après la décision, puis suppression. Si vous y consentez séparément, la candidature peut être conservée 12 mois maximum dans notre CVthèque. La suppression peut être demandée à tout moment.

Destinataires : le service recrutement et nos prestataires techniques. Aucune transmission à un tiers extérieur au recrutement.

Lorsque les candidatures sont ouvertes, elles sont adressées à recrutement@hay2010.ma, l'adresse indiquée sur la page Carrières. Avant l'autorisation CNDP F-113, la page ne sollicite pas de CV et les demandes générales passent par contact@hay2010.ma. Aucune pièce d'identité, photographie, donnée de santé, situation matrimoniale ou donnée révélant une origine, une religion ou une appartenance syndicale n'est demandée.

2.3 Sécurité et journaux serveur

Données : adresse IP, horodatage, URL demandée, agent utilisateur, code de réponse et événements de sécurité.

Finalité : assurer la sécurité et la disponibilité du site, prévenir les abus et diagnostiquer les incidents.

Base légale : intérêt légitime du responsable du traitement (article 4-e), sans préjudice de vos droits.

Conservation : 6 mois.

Destinataires : Cloudflare (réseau et sécurité) et notre hébergeur. Ces journaux ne sont pas utilisés à des fins de prospection.

2.4 Mesure d'audience

La mesure d'audience est désactivée à la mise en ligne.

Lorsqu'elle est activée, les données traitées sont : pages vues, route, référent, pays, type d'appareil et de navigateur, et métriques de performance. Aucun cookie n'est déposé, aucun identifiant persistant n'est créé et aucun profil n'est établi.

Finalité : comprendre l'usage du site et améliorer son contenu.

Base légale : intérêt légitime du responsable du traitement (article 4-e).

Conservation : 6 mois maximum.

Prestataire : Cloudflare Web Analytics. Aucune publicité, aucun profilage, aucune revente de données.

2.5 Administration du site

Données : nom du compte, adresse e-mail, journal de connexion et actions d'administration, pour les personnes autorisées.

Finalité : administrer le site et le système de gestion de contenu, et tracer les accès.

Base légale : intérêt légitime et exécution de la relation de service.

Conservation : pendant la durée du compte, puis 6 mois pour les journaux de connexion.

Destinataires : l'hébergeur et les administrateurs autorisés.

2.6 Cookies

Voir la section 7.

3. Qui reçoit vos données ?

Vos données sont accessibles aux services internes habilités de SOCIETE HAY 2010, dans la limite de leurs attributions.

Elles sont également traitées par les sous-traitants techniques suivants :

- HeberjaHiz — hébergement de la messagerie électronique — Maroc [à confirmer] ;
- Cloudflare, Inc. — DNS, CDN, sécurité (dont la protection anti-robot Turnstile), stockage des médias (R2) et, le cas échéant, mesure d'audience — États-Unis ;
- [Hébergeur du VPS] — hébergement de l'application et de la base de données — [pays à confirmer] ;
- Google — boîte Gmail historique, utilisée uniquement comme secours et pour la récupération de compte — États-Unis, si elle est utilisée.

Ces prestataires sont liés par des contrats de sous-traitance conformes à l'article 23 de la loi n° 09-08. Aucune donnée n'est vendue, louée ou transmise à des fins publicitaires. Les autorités publiques peuvent en recevoir sur réquisition légale.

4. Vos données sont-elles transférées hors du Maroc ?

Oui, pour les prestataires indiqués ci-dessus qui sont établis ou traitent des données hors du Maroc, notamment Cloudflare aux États-Unis. Ces transferts sont encadrés par l'autorisation de la CNDP n° [●] du [●/●/●] [à compléter par #14]. Aucun transfert n'est effectué vers un pays ne figurant pas sur la liste d'adéquation sans autorisation de la CNDP.

[Si le VPS est au Maroc ou dans un pays adéquat, adapter la phrase ; ne pas inventer un pays.]

5. Combien de temps conservons-nous vos données ?

| Traitement | Durée |
|---|---|
| Demande de contact ou de devis | 12 mois après le dernier échange ; durée de la relation contractuelle et délais légaux de conservation comptable si un contrat en découle |
| Candidature | 6 mois après la décision ; 12 mois maximum dans la CVthèque avec consentement séparé |
| Journaux serveur et sécurité | 6 mois |
| Mesure d'audience | 6 mois maximum |
| Choix de consentement (si un bandeau est ajouté) | 6 mois maximum |
| Compte d'administration | Durée du compte ; journaux de connexion 6 mois |
| Comptabilité et contrats | Durée légale de conservation applicable |

Ces durées sont identiques à celles déclarées à la CNDP. Elles sont mises en œuvre par des suppressions effectives, pas seulement par une mention dans la politique.

6. Quels sont vos droits ?

Conformément à la loi n° 09-08, vous disposez des droits suivants :

- accès à vos données et aux informations sur leur traitement ;
- rectification des données inexactes ou incomplètes, dans un délai de 10 jours ;
- effacement et verrouillage dans les cas prévus par la loi ;
- opposition, pour des raisons légitimes, et opposition gratuite à toute prospection ;
- retrait de votre consentement à tout moment, sans affecter la licéité du traitement effectué avant le retrait.

Pour exercer ces droits, écrivez à donnees@hay2010.ma en précisant votre demande. Une pièce justificative d'identité peut être demandée en cas de doute raisonnable sur votre identité. La demande est traitée dans les délais légaux, avec un objectif de 10 jours pour les rectifications.

Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP) — www.cndp.ma.

7. Cookies

Le site ne dépose aucun cookie de mesure d'audience, de publicité ou de réseaux sociaux.

Les cookies strictement nécessaires suivants peuvent être déposés par Cloudflare pour la sécurité et le fonctionnement du site :

| Cookie | Émetteur | Finalité | Durée |
|---|---|---|---|
| `__cf_bm` | Cloudflare | Gestion des bots et protection contre le trafic automatisé | 30 minutes d'inactivité |
| `cf_clearance` | Cloudflare | Preuve de réussite d'un défi de sécurité | Durée du défi / selon la configuration |
| `_cfuvid` | Cloudflare | Limitation de débit lorsque l'option est activée | Session |
| `payload-token` | HAY2010 (Payload) | Session authentifiée de l'administration | Session |

Ces cookies sont nécessaires au service demandé et ne requièrent pas de consentement. Aucun cookie publicitaire, social ou de mesure d'audience n'est déposé.

Lorsque Cloudflare Web Analytics est activé, il fonctionne sans cookie et sans stockage local : il ne crée pas d'identifiant persistant et ne permet pas de suivre un visiteur d'un site à l'autre. La politique est mise à jour dans la même version.

Vous pouvez configurer votre navigateur pour refuser ou supprimer les cookies. Le refus des cookies strictement nécessaires peut affecter la sécurité ou le fonctionnement de certaines pages. Le site ne bloque pas l'accès en l'absence de consentement, puisqu'aucun consentement n'est requis.

[Si un bandeau est ajouté plus tard]
Un bandeau permet alors d'accepter ou de refuser les catégories non nécessaires. Le choix est conservé six mois maximum et peut être modifié à tout moment via le lien « Gérer mes cookies » présent dans le pied de page.
[/Si]

8. Sécurité

SOCIETE HAY 2010 met en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données contre la destruction, la perte, l'altération, la divulgation ou l'accès non autorisé : chiffrement TLS, contrôle des accès, comptes nominatifs, moindre privilège, sauvegardes, journalisation et procédure de traitement des incidents. Les pièces jointes et les CV ne sont pas stockés dans un espace public. Les prestataires sont liés par des obligations de confidentialité et de sécurité.

9. Modifications

Cette politique peut être mise à jour pour refléter un changement de traitement, de prestataire, de durée de conservation ou de réglementation. La date de dernière mise à jour figure en tête. Les changements substantiels sont signalés sur le site. La version applicable est celle publiée à la date de votre utilisation.

10. Références CNDP

[Render only filled entries; never a blank “n° …”]

- Déclaration de contact : F-211, récépissé n° [●] du [●/●/●].
- Autorisation de recrutement : F-113, autorisation n° [●] du [●/●/●].
- Déclaration de mesure d'audience : F-214, récépissé n° [●] du [●/●/●] [si activée].
- Autorisation de transfert : F-118, autorisation n° [●] du [●/●/●].

11. Contact

Pour toute question relative à cette politique : donnees@hay2010.ma.
Pour toute question générale : contact@hay2010.ma.
Adresse postale : Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc.
```

**Publication rules for this copy**

- The `[●]` placeholders are replaced only from real CNDP receipts and real provider details. Empty fields are omitted, not printed.
- The transfer paragraph is adapted to the actual VPS country. If the VPS is in Morocco, the sentence says so; if it is in the EU/EEA, the country is named and the F-118 position is stated; if it is in the US, the F-118 paragraph is mandatory.
- The `HeberjaHiz — Maroc [à confirmer]` line is confirmed at mailbox provisioning. If the mail host is outside Morocco, it goes into the transfer analysis.
- The “Google/Gmail” line stays only while the Gmail fallback is actually used or forwarded. If it is retired completely, remove it and update the F-118 scope.
- The form-specific paragraphs in 2.1 and 2.2 are activated with #12; at launch, the policy describes email correspondence only.
- The analytics paragraph 2.4 stays in the “désactivée” state until #14 and the policy update. Do not publish a policy that says analytics is active while the beacon is off, or vice versa.

### 4.4 Cookies section — implementation

The cookie section is §7 of the privacy policy. It has three states:

1. **Launch — no analytics, no non-essential cookie.** Table of Cloudflare strictly necessary cookies and the admin session; statement that no analytics/advertising/social cookie is used; no banner.
2. **Cloudflare Web Analytics enabled.** Add one paragraph: cookieless, no localStorage, no persistent identifier, six-month retention, Cloudflare as processor, F-214 reference. No banner, no cookie table entry.
3. **A future cookie-based feature.** Add the category, the cookie names/durations, the consent basis, the banner and the “Gérer mes cookies” link. The table grows; the banner appears.

Do not create a separate `/cookies` route. The page tree fixes the cookie content inside the privacy policy.

### 4.5 Form notices for #12

These texts are approved for the forms ticket. The contact form may be published only after the F-211 receipt; the careers email notice only after the F-113 authorization. The "Careers application form" text is reserved for the phase-3 form, which is **not built** ([#12](https://github.com/mustaphaelou/hay2010website/issues/12)).

**Contact page short notice — form off**

The email route is still a collection, so the contact page shows a short notice even when `formLive` is false:

```text
Vos données sont traitées par SOCIETE HAY 2010 pour répondre à votre demande. Elles sont destinées aux services concernés et à nos prestataires techniques, et conservées 12 mois après le dernier échange. Vous pouvez exercer vos droits à donnees@hay2010.ma. Ce traitement a fait l'objet d'une déclaration auprès de la CNDP sous le n° [●] du [●/●/●]. Politique de confidentialité : /politique-de-confidentialite.
```

It is a shortened form of the contact notice, not a replacement for the policy; counsel reviews it with the full notice. It renders only with the real F-211 reference.

**Contact form**

```text
Les champs marqués d'un * sont obligatoires. Vos données sont traitées par SOCIETE HAY 2010 pour répondre à votre demande et, le cas échéant, préparer un devis. Elles sont destinées aux services concernés et à nos prestataires techniques (hébergement, messagerie). Elles sont conservées 12 mois après le dernier échange, ou pendant la durée de la relation contractuelle et les délais légaux de conservation comptable si un contrat en découle. Vous disposez d'un droit d'accès, de rectification, d'opposition et de retrait de votre consentement, à exercer à donnees@hay2010.ma. Ce traitement a fait l'objet d'une déclaration auprès de la CNDP sous le n° [●] du [●/●/●]. Pour en savoir plus : /politique-de-confidentialite.

☐ J'accepte que SOCIETE HAY 2010 traite mes données pour répondre à ma demande. (non pré-cochée)
```

**Careers application form**

```text
Les informations collectées (CV, lettre de motivation, coordonnées) sont utilisées uniquement pour gérer votre candidature. Elles sont conservées 6 mois après la décision, puis supprimées, sauf si vous acceptez qu'elles soient conservées 12 mois dans notre CVthèque. Vous pouvez demander leur suppression à tout moment à donnees@hay2010.ma. Ce traitement a fait l'objet d'une autorisation de la CNDP sous le n° [●] du [●/●/●]. Pour en savoir plus : /politique-de-confidentialite.

☐ J'accepte que SOCIETE HAY 2010 traite mes données pour gérer ma candidature. (obligatoire, non pré-cochée)
☐ J'accepte que ma candidature soit conservée 12 mois dans la CVthèque de HAY2010. (facultatif, non pré-coché)
```

**Careers email notice at launch**

```text
Les candidatures sont reçues à l'adresse indiquée sur cette page. Vos données (CV, lettre de motivation, coordonnées) sont utilisées uniquement pour gérer votre candidature et conservées 6 mois après la décision, puis supprimées, sauf accord séparé pour 12 mois. Vous pouvez demander leur suppression à tout moment à donnees@hay2010.ma. Ce traitement est soumis à l'autorisation CNDP n° [●] du [●/●/●]. Pour en savoir plus : /politique-de-confidentialite.
```

**Rules**

- The CNDP line renders only when the matching reference exists. A blank `n° …` is forbidden.
- The checkbox is a real, unticked checkbox, not a sentence; the submit button stays disabled until the required box is checked, but the user can still read the page without consent.
- The policy link opens in the same tab or a new tab; either way it is reachable before submission.
- Do not ask for a photo, date of birth, marital status, CNI, health data or anything revealing religion, union membership or ethnic origin.
- **No application form and no CV upload** at launch or in the default plan; careers is email-only. The email-only route is a schedule mitigation, not a compliance safe harbour: the mailbox itself must be covered by the F-113 declaration.
- **F-214 is not required for the contact form** when Turnstile runs without pre-clearance and no cookie is deposited. If a cookie appears, or pre-clearance is enabled, update the cookie section and the filing before enabling the form.
- The 12-month pool consent is separate, optional, and never a condition of applying. In the email-only flow, the candidate must opt in explicitly; a missing line means no pool consent.

---

## 5. Data map, processors and retention

### 5.1 Processing register

| # | Processing | Data subjects | Data | Purpose | Basis | Recipients | Retention | CNDP |
|---|---|---|---|---|---|---|---|---|
| 1 | Contact / quote by email or form | Prospects, clients, suppliers | Name, company, email, phone, subject, message; attachments by email only (the form has none) | Answer, quote, follow up | Art. 4-b pre-contract + consent | Internal services; mail host; hosting; Cloudflare (Turnstile/CDN) | 12 months after last exchange; contract + accounting retention | F-211 |
| 2 | Careers / CVs by email | Candidates | Identity, contact, CV, cover letter, experience; stored in the mailbox, not the app | Recruitment | Art. 4-b + consent | Recruitment; mail host; hosting | 6 months after decision; 12-month pool with separate consent | F-113 |
| 3 | Server logs / security | Visitors | IP, timestamp, URL, user agent, response code, security events | Security, availability, diagnostics | Art. 4-e legitimate interest | Cloudflare; VPS host | 6 months | Covered with hosting/contact filing; #14 confirms |
| 4 | Audience measurement | Visitors | Page, route, referrer, country, device, Web Vitals (no cookie/ID) | Improve content | Art. 4-e legitimate interest | Cloudflare | 6 months | F-214, only when enabled |
| 5 | Cookies / consent | Visitors | Choice, policy version, timestamp | Remember choice | Consent | First-party only | 6 months | F-214 if a banner is added |
| 6 | Admin accounts | Owner, developer, editor | Name, email, login log | Administer the site | Legitimate interest / service contract | Hosting; Cloudflare Access | Account duration; logs 6 months | Covered with hosting |

### 5.2 Processors and transfers

| Processor | Service | Location | Transfer route | Contract / evidence |
|---|---|---|---|---|
| **HeberjaHiz** | Email hosting for `contact@`, `donnees@`, `recrutement@` and the service sender `no-reply@` | Morocco (confirm at provisioning) | None if Morocco | Hosting/processor agreement; #14 |
| **Cloudflare, Inc.** | DNS, CDN, WAF, Turnstile, R2 media, optional Web Analytics | United States | US → F-118 | Cloudflare DPA / self-serve terms; #14 |
| **[VPS provider]** | Next.js/Payload app and PostgreSQL | [TBD at provisioning] | Morocco/EU: no or adequate; US: F-118 | Hosting/processor agreement; #8/#14 |
| **Google** | Gmail fallback/account recovery only | United States | US → F-118 if used/forwarded | Google terms; #14 |
| **GitHub** | Source repository | United States | No site personal data | Not a site processor |

- The VPS provider and country are recorded at provisioning (#8). The privacy policy must name them before public launch; until then the field is a launch gate, not a placeholder shipped to production.
- If mail is forwarded from the cPanel mailboxes to Gmail, Google becomes a recipient for all forwarded mail and the F-118 scope grows. The default is **no forwarding**.
- Cloudflare and R2 are already required by the hosting decision (#8); adding Cloudflare Web Analytics does not add a new processor. GA4 would.
- The legal pages do not name the host in the mentions légales; the privacy policy does.

### 5.3 Retention

| Processing | Retention | Enforcement |
|---|---|---|
| Contact / quote | 12 months after last exchange | Mailbox cleanup / archive rule; owner |
| Contractual relationship | Duration + legal accounting retention | Accountant confirms the period |
| Careers | 6 months after decision | Recruitment mailbox cleanup; no app job; deletion log |
| Talent pool | 12 months maximum, separate consent | Annual purge; proof of consent |
| Server logs | 6 months | Cloudflare/VPS log retention; Docker log rotation |
| Analytics | 6 months | Cloudflare Web Analytics retention |
| Consent choice | 6 months | Cookie/localStorage expiry |
| Admin logs | 6 months | Payload/host log retention |

The policy, the CNDP declaration and the deletion procedures must use the same numbers. Deletion is not optional: over-retention is an offence under article 55 of law 09-08.

### 5.4 Rights procedure

- **Owner:** `donnees@hay2010.ma`, monitored by the company direction; the developer is the technical backup.
- **Identity check:** only when there is a reasonable doubt; do not collect a CNI copy by default.
- **Deadline:** rectification within 10 days; access and opposition within the legal deadlines; log every request with date, subject, action and closure.
- **Escalation:** if a request is refused or ignored, the person can complain to the CNDP (www.cndp.ma).
- **Deletion:** contact messages and CVs are deleted from the mailbox and any local copy; confirm by email.
- **No fee:** requests are free.

---

## 6. Mailboxes

### 6.1 Addresses and publication gates

| Address | Purpose | Public? | Gate |
|---|---|---|---|
| **`contact@hay2010.ma`** | General contact, quotes, footer, contact page, mentions légales, JSON-LD | Yes, once tested | Owner creates; send/receive test; update facts register, footer, JSON-LD and policy |
| **`donnees@hay2010.ma`** | Law 09-08 rights, privacy policy, form notices | Yes, once tested | Owner creates; send/receive test; **public-launch gate**; #14 uses it for the rights procedure |
| **`recrutement@hay2010.ma`** | Careers applications and recruitment correspondence | Only after #14 covers it | Owner creates now; used on staging; public only after F-113; until then `/carrieres` uses `contact@` |
| **`no-reply@hay2010.ma`** | Service sender for contact-form notifications and transactional mail; bounce mailbox | **No** | Owner creates; SMTP auth/From; never public; monitor bounces; include in F-211 scope |
| **`ste.hay2010@gmail.com`** | Private fallback, account recovery, legacy correspondence | **No** | Never publish; if forwarded to, Google enters the policy and F-118 |

### 6.2 Owner provisioning checklist

Do this in the HeberjaHiz cPanel (or the mail panel the account actually uses), not by changing DNS:

- [ ] Log in to the HeberjaHiz cPanel with the account that owns `hay2010.ma`.
- [ ] Create `contact@hay2010.ma`, `donnees@hay2010.ma`, `recrutement@hay2010.ma` and `no-reply@hay2010.ma`.
- [ ] Confirm that inbound attachments are scanned (cPanel/Exim + ClamAV or equivalent) before the site invites CVs; record the evidence for #14.
- [ ] Set a mailbox quota that matches expected volume (contact and recruitment need more than `donnees@`).
- [ ] Generate a strong, unique password for each; store it in the company password manager, not in the repository.
- [ ] Enable IMAP/SMTP (or the webmail-only mode if that is the deliberate choice) and document the client settings.
- [ ] Set the sender display name to `HAY2010` and a signature with the postal address and the website.
- [ ] Do **not** enable forwarding to Gmail. If forwarding is later required, record it as a new processing/transfer and update the policy and F-118.
- [ ] Send a test message from an external mailbox (Gmail or another provider) to each address and reply from each address.
- [ ] Check SPF, DKIM and spam placement for the test messages; do not change MX.
- [ ] Test password reset/recovery and record who holds the recovery access.
- [ ] Confirm the mail host's backup rotation; if backups retain deleted mail beyond the stated retention, disclose it or exclude these mailboxes.
- [ ] Add a calendar reminder to review mailbox access when a person leaves.
- [ ] After #15 changes the DNS delegation, repeat the send/receive and SPF/DKIM tests.
- [ ] Publish `contact@` only after the first tests pass; publish `donnees@` only after the rights owner confirms monitoring; publish `recrutement@` only after #14 confirms the F-113 coverage; never publish `no-reply@`.

### 6.3 What changes when the mailboxes go live

- **Footer:** `contact@hay2010.ma` replaces the Gmail address; no `donnees@` or `recrutement@` in the footer.
- **Contact page:** `contact@hay2010.ma`; the Gmail is not shown.
- **Mentions légales:** `contact@hay2010.ma` and `donnees@hay2010.ma`.
- **Privacy policy:** `contact@` and `donnees@`; careers uses “the address shown on the Carrières page”.
- **JSON-LD:** `"email": "contact@hay2010.ma"`; the rest of the Organization object is unchanged ([#11](https://github.com/mustaphaelou/hay2010website/issues/11)).
- **Carrières:** `recrutement@hay2010.ma` only when the flag `recrutementMailboxLive` is true; otherwise `contact@`.
- **Payload/SMTP:** transactional mail uses the mail host; the contact form sends from `no-reply@hay2010.ma` with the submitter in `Reply-To`. Do not use a public mailbox as the bounce address. `no-reply@` is a service sender, never a public contact.
- **Facts register:** the contact-channel table and the owner-actions table are amended in the same commit as this document.
- **CNDP:** #14 declares the mailboxes, `no-reply@` as sender, the mail host and the attachment-scanning/backup arrangements as recipients/processors.

---

## 7. CNDP, counsel and launch gates

### 7.1 Filings owned by #14

| Filing | Scope | When |
|---|---|---|
| **F-211** contact declaration | Contact/quote by email and form, `contact@`, `no-reply@` as sender, `donnees@`, server logs as described | Before the public site collects a real contact message, by form or by email |
| **F-113** HR authorization (D-298-AU-2014) | Careers, `recrutement@`, CVs by email (no upload planned), 6/12-month retention, candidate consent document | Before `/carrieres` invites applications; the mailbox itself is covered |
| **F-214** cookies/analytics (D-939-2025) | Cloudflare Web Analytics, cookieless, 6-month retention; cookies if a banner is added | Before the beacon is enabled; **not** required for the default Turnstile/no-cookie contact form |
| **F-118** transfer authorization | Cloudflare/R2/Turnstile, VPS if outside Morocco, Google only if used/forwarded | After the base filings are approved; before public data collection |
| **D-940-2025** newsletter | None | Not applicable; no newsletter |

The contact form needs **F-211**, not F-214. F-214 becomes relevant only if the form deposits a cookie (for example, Turnstile pre-clearance) or if analytics is enabled. Validate the absence of a cookie in the browser before enabling the form; record it in the launch checklist.

The CNDP public register has no record for HAY2010 (2026-11-08) and the owner confirms no filing. No receipt number may be invented, copied from lamalif or shown as a blank.

### 7.2 Launch gates for #16

The public launch does **not** happen until:

- [ ] F-211 contact declaration is issued and its reference is in the policy and the short contact-page notice; when the contact form ships, the full form notice carries it too.
- [ ] F-118 covers Cloudflare/R2/Turnstile and any other non-adequate processor; the policy's transfer paragraph is filled.
- [ ] The legal pages are reviewed by counsel and `legalReviewed` is set.
- [ ] `contact@` and `donnees@` pass send/receive tests; `no-reply@` is created and tested; `recrutement@` is either tested and covered by F-113, or not published.
- [ ] The privacy policy's controller, processors, transfers, retention and CNDP references match the declarations.
- [ ] No blank CNDP number, no “en cours”, no publication-director placeholder, no phone placeholder.
- [ ] Analytics is off, or the F-214 is issued and the policy is updated.
- [ ] No form is required; if the contact form is enabled, F-211 and its notice are live; if careers invites CVs, F-113 is live. No application form, no CV upload.
- [ ] The staging `noindex`, Cloudflare Access and `X-Robots-Tag` remain in place until the cutover.

If F-113 is late, the careers page may list openings but must not invite CVs; `recrutement@` stays unpublished and the page uses `contact@` for general questions only. If F-211 or F-118 is late, the site stays on staging with forms, analytics and real contact collection disabled — including the email contact route, which is covered by F-211. The legal pages can be reviewed on staging with placeholders; they are not public until the gates pass.

### 7.3 Staging behaviour

- Legal pages are reachable behind Cloudflare Access for owner/developer review.
- The pages are `noindex`; staging keeps a disallow-all `robots.txt` and `X-Robots-Tag: noindex`.
- No analytics, no form, no CV upload, no real contact data.
- The CNDP reference blocks are hidden or marked `[à compléter]` in the staging preview, never published with a fake number.
- The privacy policy can describe the intended processing; the public version must match the actual configuration.

### 7.4 Counsel review

Commission one limited review before #16. Ask for a short written opinion on:

1. Whether D-939-2025 displaces the 2023 website guidance for a cookieless, non-profiling beacon, and whether the F-214 is required for Cloudflare Web Analytics.
2. Whether the proposed retention periods (12/6/12/6/6) are defensible and aligned with the declarations.
3. Whether one F-118 can cover the Cloudflare/R2/VPS/Google stack, and what the CNDP expects for an EU-region VPS operated by a non-EU provider.
4. The mentions légales and privacy policy wording, the form notices (including the short contact-page notice and the email-only careers notice), the no-cookie Turnstile position, the rights procedure and the mailbox setup.
5. Whether the gated Actualités/communiqués stream stays outside loi 88-13 and whether the first communiqué needs a publication director.

The review is not an ongoing retainer. Record the reviewer, date and reference in `legalReviewRef`. If the owner declines the review, record the accepted risk in this document and keep the most conservative posture (no analytics, no banner, shorter retention).

---

## 8. Handoffs

| Ticket | What it receives |
|---|---|
| [#11](https://github.com/mustaphaelou/hay2010website/issues/11) SEO | `contact@hay2010.ma` in JSON-LD and metadata; `donnees@` not in public metadata; no analytics script at launch; CSP entries for Cloudflare Web Analytics when enabled; legal pages indexable; no CNDP blank in structured data. |
| [#12](https://github.com/mustaphaelou/hay2010website/issues/12) forms | Exact notices in §4.5; short contact-page notice even when the form is off; unticked checkboxes; separate pool consent; no sensitive fields; **no application form and no CV upload**; email-only careers; `formLive`/`recrutementMailboxLive` gates; F-214 not a form dependency; `donnees@` rights contact; CNDP reference conditional. |
| [#14](https://github.com/mustaphaelou/hay2010website/issues/14) CNDP | F-211/F-113/F-214/F-118 scope; mailbox coverage; rights procedure; retention table; processor contracts; receipts for the policy. |
| [#16](https://github.com/mustaphaelou/hay2010website/issues/16) launch | The gate list in §7.2; mailbox tests; legal review; no public data before F-211/F-118; careers gated on F-113. |
| [#5](https://github.com/mustaphaelou/hay2010website/issues/5) content model | `cndpReferences` array instead of one `cndpReceipt`; contact channels in `lib/company.ts`; `recrutementMailboxLive` and `analyticsLive` flags; legal prose stays developer-published; no analytics script in Payload. |
| [#2](https://github.com/mustaphaelou/hay2010website/issues/2) page tree | Footer `contact@`; careers `recrutement@` after #14; legal pages and cookies section unchanged in structure; no third legal page. |
| [#3](https://github.com/mustaphaelou/hay2010website/issues/3) facts register | Mailbox amendment: `contact@`, `donnees@`, `recrutement@` (gated), Gmail private fallback; footer, JSON-LD and legal block updated. |
| [#8](https://github.com/mustaphaelou/hay2010website/issues/8) hosting | Mailboxes on HeberjaHiz; SMTP for Payload; MX preservation; no client-side analytics at launch; Cloudflare Web Analytics after #14; VPS country for the transfer section. |
| [#15](https://github.com/mustaphaelou/hay2010website/issues/15) DNS | Preserve MX/SPF/DKIM/autodiscover; re-test all four mailboxes (`contact@`, `donnees@`, `recrutement@`, `no-reply@`) after the delegation change; do not enable Email Routing. |
| [#6](https://github.com/mustaphaelou/hay2010website/issues/6) réalisations | Fallback CTA uses `mailto:contact@hay2010.ma`, not the Gmail. |

---

## 9. Sources and evidence

- **Law 09-08** (dahir n° 1-09-15, 18 February 2009), articles 1, 3, 4, 5, 7–9, 12, 15, 19, 23, 43–44, 52–65 — CNDP consolidated text: https://www.cndp.ma/wp-content/uploads/2023/11/Loi-09-08-Fr.pdf
- **D-939-2025** (28 November 2025), simplified cookie declaration — https://www.cndp.ma/wp-content/uploads/2025/12/Deliberation-N%C2%B0-D-939-2025-du-28112025-relative-au-modele-de-declaration-simplifiee-relative-au-traitement-des-donnees-a-caractere-personnel-de-cookies-sur-un-terminal.pdf
- **CNDP 2023 website guidelines** (last modified January 2025) — https://www.cndp.ma/conformite-des-sites-web/
- **D-236-2015** adequacy list — https://www.cndp.ma/wp-content/uploads/2023/12/deliberation-n-236-2015-18-12-2015.pdf
- **CNDP notification procedures** (F-211, F-214, F-113, F-118) — https://www.cndp.ma/procedures-de-notification-process/
- **Loi 5-96**, article 45 (mentions légales) — https://oecrsk.ma/docs/Juridique/LOI%205-96%20societes%20SARL%20SNC%20etc.%20-%20v2019.pdf
- **Loi 88-13** (presse et édition), articles 2(3), 15–16 — https://adala.justice.gov.ma/api/uploads/2024/03/27/La%20presse%20et%20%C3%A0%20l%27%C3%A9dition-1711531925401.pdf
- **Loi 17-97** (propriété industrielle), articles 154–155, 201 — https://www.haca.ma/fr/dahir-n%C2%B0-1-00-19-du-15-f%C3%A9vrier-2000-portant-promulgation-de-la-loi-n%C2%B0-17-97-relative-%C3%A0-la-protection
- **Cloudflare Web Analytics FAQ** (six-month retention, no custom events/UTM, SPA routes, ad-blocker behaviour) — https://developers.cloudflare.com/web-analytics/faq/
- **Cloudflare Web Analytics limits** — https://developers.cloudflare.com/web-analytics/limits/
- **Cloudflare cookies** (strictly necessary cookies and durations) — https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/
- **Cloudflare edge analytics** (available to proxied zones; advanced URL analytics on paid plans) — the Web Analytics FAQ and the 2026-10-02 analytics changelog: https://developers.cloudflare.com/changelog/post/2026-10-02-30-days-analytics-on-every-plan/
- **Legal research note** — `docs/research/hay2010-legal-consent.md` on branch `research/hay2010-legal-consent` (2026-11-08), the source for the CNDP analysis, the retention proposals and the page outlines.
- **Facts register** — [`docs/company/facts-register.md`](../company/facts-register.md), the source for the identity block, the gated claims and the mailbox amendment.
- **Page tree** — [#2](https://github.com/mustaphaelou/hay2010website/issues/2), the source for the two legal routes and the footer.
- **Content model** — [`docs/content/content-model.md`](../content/content-model.md), the source for the legal global and the code-owned identity.
- **Hosting decision** — [`docs/hosting/deployment-decision.md`](../hosting/deployment-decision.md), the source for the Cloudflare/Coolify stack and the staging gates.

All sources were retrieved on 2026-11-08/09. The CNDP has been publishing new deliberations through 2025–2026; re-verify the cookie and transfer texts before the public launch.

---

## 10. Change log

| Date | Change |
|---|---|
| 2026-11-09 | Initial decision: no analytics at launch; Cloudflare Web Analytics after F-214; no banner; two legal pages; retention 12/6/12/6/6; `contact@`/`donnees@`/`recrutement@` mailboxes; Gmail private fallback; one-off counsel review. |
| 2026-11-09 | Forms amendment (#12): contact form optional and F-211-gated; careers email-only with no application form or CV upload; short contact-page notice when the form is off; `no-reply@` service mailbox; F-214 clarified as not a form dependency; attachment-scanning/backup checks added. |
