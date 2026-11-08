# HAY2010 — Legal & Consent Obligations for a Moroccan Corporate Website

**Last updated:** 2026-11-08
**Sources retrieved:** 2026-11-08 (all URLs checked on that date; see §13 for access notes)
**Scope:** Moroccan law and CNDP guidance applicable to a corporate showcase site operated by **HAY2010 SARL** (Rabat) with (a) a contact form, (b) a careers section accepting CV uploads, and (c) optional audience analytics. GDPR is used **only as a comparison** in §12.

> **Not legal advice.** This is desk research against primary sources. It is not a legal opinion, it does not create a lawyer–client relationship, and it cannot substitute for advice from a Moroccan avocat admitted to the bar. Several points below (retention periods, the cookie/consent reading, image releases, transfer strategy) have **no settled statutory answer** and are explicitly flagged as needing local counsel. See §11.

---

## 0. TL;DR

1. **Law 09-08 applies in full.** A contact form, a CV upload and analytics all process "données à caractère personnel" — the definition expressly includes "le son et l'image" and the CNDP treats an IP address as personal data [S1][S10].
2. **Filing with the CNDP is mandatory before go-live**, not a nice-to-have: prior declaration in the general case (art. 12(2)), prior **authorization** where sensitive data or CNI numbers are involved (art. 12(1)) [S1].
3. **Recruitment is not a plain declaration.** CNDP's notification procedures route HR processing through the **F-113 authorization** model (Délibération n° 298-AU-2014), with a candidate consent document attached [S7]. This is a schedule risk: the careers form should not collect CVs before the authorization is issued.
4. **Contact form** → declaration (F-211, or F-214 under a sector model) → 24-hour *récépissé* (art. 19) [S1][S6].
5. **Cookies:** the CNDP's **D-939-2025** (28 Nov 2025) says audience-measurement/statistics cookies **without profiling do not require prior consent**, but personalized advertising and social-sharing cookies do; retention is capped at **6 months**; a simplified declaration (F-214) is required [S4].
6. **The CNDP's 2023 website guidelines (page last modified January 2025) still say "consent before any cookie"** [S3]. The two texts conflict; the 2025 deliberation is later and more specific, but the risk of a control based on the older text is real. See §4.4.
7. **Transfers abroad are the hidden cost.** The CNDP's adequate-country list (D-236-2015) covers the EU/EEA, UK, Switzerland and Canada — **not the United States** [S9]. Vercel/Cloudflare hosting, Google Analytics, Google Fonts/reCAPTCHA or a US email API each create a transfer needing an F-118 authorization (and the base processing must be approved first) [S8].
8. **Mentions légales** are grounded in **loi 5-96 art. 45**: dénomination + "SARL", capital, siège and RC number must appear in "actes, lettres, factures, annonces, publications ou autres documents … destinés aux tiers" [S11]. There is **no Moroccan LCEN** requiring host details or a publication director for a corporate site; the publication-director rule only bites if the site is a "journal électronique" under loi 88-13 [S12].
9. **Two data conflicts block publication of the mentions légales:** the public registry shows two RC numbers (517 vs 87305) and two capital figures (15M vs 6M MAD) for HAY2010 (see the [company research report](hay2010-company-activity-and-careers.md), §1.4). Resolve with an RC extract (modèle J) before printing anything.
10. **Images:** employee photos are personal data (art. 1) needing a specific written authorization, and client logos need the trademark owner's permission (loi 17-97 arts. 154 and 201) [S1][S13].

---

## 1. Method and source discipline

- **Primary sources only**: the law text as republished by the CNDP, CNDP deliberations and forms, CNDP guidance pages, the Ministry of Justice legal database (*adala.justice.gov.ma*), the consolidated company-law text, and the two websites themselves as first-party evidence.
- Where a source could not be read (dead PDF link, blocked portal, scanned decree), this is stated in §13 rather than papered over.
- **Retrieval date is 2026-11-08** for every source. Moroccan texts change; re-verify before publishing.
- The company-identity facts (RC, ICE, capital, address) are **not** re-researched here; they are taken from the [sibling company report](hay2010-company-activity-and-careers.md) and flagged where they conflict.

---

## 2. The legal frame: Law 09-08 and the CNDP

Law 09-08 (dahir n° 1-09-15 of 18 February 2009, BO n° 5714 of 5 March 2009) is Morocco's general data-protection statute. Its application decree is décret n° 2-09-165 of 21 May 2009 (BO n° 5744 of 18 June 2009) [S1][S2]. The regulator is the **Commission Nationale de contrôle de la Protection des Données à caractère Personnel (CNDP)** (arts. 27–31).

### 2.1 Who is the controller

HAY2010 SARL is the *responsable du traitement* for the site's forms, because it determines the purposes and means (art. 1(5)) [S1]. That is true even if the site is hosted abroad and even if a agency built it: the agency and host are *sous-traitants* (processors) and must be bound by a contract that mirrors the security obligations (art. 23(3)).

Practical consequence: the privacy policy names **HAY2010 SARL**, not the agency, as controller.

### 2.2 Lawful basis

Article 4 makes consent the default, with exceptions where processing is necessary for:

- a legal obligation (a);
- performance of a contract or **pre-contractual measures taken at the data subject's request** (b);
- vital interests (c);
- a public-interest mission (d);
- the controller's legitimate interest, provided the data subject's rights are not overridden (e).

For the site:

| Processing | Defensible basis | Comment |
|---|---|---|
| Contact / quote request | Art. 4(b) pre-contractual measures, and/or art. 4(a) consent | CNDP's website guidelines nevertheless ask for consent at collection, so use an unticked consent box plus the art. 4(b) basis [S3] |
| Job application | Art. 4(b) + consent | CNDP's HR model explicitly requires a candidate consent document [S7] |
| Analytics | Consent or legitimate interest | Depends on configuration; see §4 |
| Legal/accounting retention | Art. 4(a) legal obligation | Out of the website's control but must be described |

Note: consent under art. 1(9) must be "libre, spécifique et informée" — an unticked box, a specific purpose, and no bundling with T&Cs.

### 2.3 Information duties at collection (art. 5)

Before collecting, the controller must inform "de manière expresse, précise et non équivoque" of:

- (a) its identity and, where applicable, its representative;
- (b) the purposes;
- (c) additional information where needed for fairness: recipients/categories, whether answers are **mandatory or optional** and the consequences of not answering, and the existence of access and rectification rights;
- (d) **the characteristics of the CNDP declaration receipt or of the authorization issued by the CNDP**.

Article 5(2) adds that the documents used for collection must contain that information. Article 19 goes further: the receipt's characteristics "doivent figurer dans toutes les opérations de collecte ou de transmission des données" [S1].

This is the legal root of both the privacy policy and the short notice attached to each form. It also means the **CNDP receipt number is not decorative**: it belongs on the form and in the policy.

### 2.4 Rights (arts. 7–9)

- **Access** (art. 7): confirmation, purposes, data categories, recipients, and a copy in intelligible form.
- **Rectification/erasure/locking** (art. 8): the controller must act **within ten clear days**, free of charge; if it refuses or stays silent, the data subject can ask the CNDP to intervene.
- **Opposition** (art. 9): for legitimate reasons, and **free of charge** for direct-marketing use.

Operationally: a monitored inbox (e.g. `donnees@hay2010.ma`), an identity-check step, a 10-day SLA, and a log of requests. The 10-day deadline is short — a shared mailbox with no owner will miss it.

### 2.5 Retention (art. 3(1)(e))

Data must be kept "pendant une durée n'excédant pas celle nécessaire à la réalisation des finalités". Over-retention is a **criminal offence** under art. 55 (3 months–1 year and/or 20,000–200,000 DH), so retention must be decided, declared, and actually enforced by a deletion job [S1].

There is no statutory retention period for contact inquiries or job applications. See §9 for proposed periods and §11 for the counsel flag.

### 2.6 Security and processors (arts. 23–26)

Article 23 requires "mesures techniques et organisationnelles appropriées" against destruction, loss, alteration, disclosure or unauthorised access, taking account of the state of the art and cost. Article 23(2)–(4) requires a processor chosen for sufficient guarantees and bound by a written contract. Article 26 imposes professional secrecy [S1].

For this site that means, at minimum: TLS, access control on the CV store, no public object-storage bucket, malware scanning of uploads, least-privilege admin accounts, backups, and a written processor agreement with the host, the email provider and the analytics provider.

### 2.7 Transfers abroad (arts. 43–44)

A transfer outside Morocco is allowed only if the destination State ensures a sufficient level of protection (art. 43), or under an art. 44 derogation (explicit consent, contract necessity, public interest, legal claims, etc.), or with the CNDP's express authorization where contractual clauses/internal rules provide sufficient protection.

The CNDP's **Délibération n° 236-2015** lists the States it considers adequate: Germany, Austria, Belgium, Bulgaria, Canada, Cyprus, Denmark, Spain, Estonia, Finland, France, Greece, Hungary, Ireland, Iceland, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Norway, Netherlands, Poland, Portugal, Czech Republic, Romania, **United Kingdom**, Slovakia, Slovenia, Sweden, Switzerland [S9].

**The United States is not on the list.** Neither are Morocco's other common hosting destinations outside the EU/EEA. D-236-2015 nevertheless requires that **any** transfer be notified to the CNDP "suivant le régime approprié", even to an adequate country — and the CNDP's transfer page says the authorization is only examined once the underlying processing has been declared/authorized [S8][S9].

Article 60 makes an unlawful transfer a criminal offence (3 months–1 year and/or 20,000–200,000 DH) [S1].

**Practical mapping for this project** — each of these is a transfer if the provider is US-based or routes data through the US:

| Component | Typical provider | Transfer? |
|---|---|---|
| Hosting / edge | Vercel, Cloudflare, Netlify | Yes (US company; even "EU region" may involve US control plane) — verify |
| Form → email | Resend, SendGrid, Mailgun, Postmark | Yes |
| Analytics | Google Analytics 4 | Yes |
| Fonts / maps / captcha | Google Fonts, Google Maps, reCAPTCHA, Turnstile | Yes |
| CV storage | S3/R2/Blob in EU or MA | Only if outside MA; EU is on the adequate list but still notifiable |

If the whole stack is US, one F-118 covering the processors is the pragmatic route — but the CNDP's practice is not documented publicly at that level of granularity, so this is a counsel question (§11).

### 2.8 Penalties (arts. 52–65)

| Breach | Penalty |
|---|---|
| Processing without the required declaration/authorization (art. 52) | 10,000–100,000 DH |
| Refusing access/rectification/opposition (art. 53) | 20,000–200,000 DH **per infringement** |
| Unlawful collection, purpose diversion (art. 54) | 3 months–1 year and/or 20,000–200,000 DH |
| Over-retention (art. 55) | 3 months–1 year and/or 20,000–200,000 DH |
| Processing in breach of art. 4 (art. 56) | 3 months–1 year and/or 20,000–200,000 DH |
| Sensitive data without express consent (art. 57) | 3 months–1 year and/or 50,000–300,000 DH |
| Failure to implement security (art. 58) | 3 months–1 year and/or 20,000–200,000 DH |
| Unlawful transfer abroad (art. 60) | 3 months–1 year and/or 20,000–200,000 DH |

Article 64 **doubles the fine for legal persons** and allows partial confiscation, closure of the establishment, etc. The fines are small in absolute terms; the reputational and procurement consequences (a public buyer asking about CNDP compliance) are the real exposure.

---

## 3. CNDP formalities: what HAY2010 must actually file

### 3.1 The three processing activities

| # | Activity | Regime | Form | Why |
|---|---|---|---|---|
| 1 | Contact / quote requests, inbound B2B messages | Prior **declaration** (art. 12(2)) | **F-211** (or F-214 under a sector model) | No sensitive data, no CNI number |
| 2 | Careers: CVs, cover letters, applicant follow-up | Prior **authorization** under the HR model | **F-113**, model Délibération n° 298-AU-2014 | CNDP's notification procedures route "gestion des ressources humaines" to F-113 and require a candidate consent document [S7] |
| 3 | Cookies / audience measurement | Prior **declaration** (simplified) | **F-214**, model Délibération n° D-939-2025 | CNDP's procedures page lists cookies under F-214/D-939-2025 [S7] |
| 4 | Any transfer abroad | **Authorization** | **F-118** | Only examined after 1–3 are approved [S8] |

**Why #2 matters commercially:** an authorization is not a 24-hour *récépissé*. If the careers form ships before the F-113 is granted, the site is processing without authorization — art. 52 exposure, and a credibility problem with any client doing vendor due diligence. Either launch the careers page later, or launch it as "send your CV to recrutement@hay2010.ma" (email, still processing, but no public form) until the authorization lands. The email route is not a legal safe harbour — it is a schedule mitigation, not a compliance one.

### 3.2 What the declaration/authorization must contain (art. 15)

- name and address of the controller (and representative);
- designation, characteristics and purposes;
- categories of data subjects and of data;
- recipients or categories of recipients;
- **transfers to foreign States**;
- **retention period**;
- the service where rights can be exercised;
- a general description of confidentiality/security measures;
- interconnections, cross-references and any transfer/outsourcing to third parties.

Any change to those items, and any deletion of the processing, must be notified to the CNDP "sans délai" (art. 15, final paragraph). A site relaunch that adds a form, changes the host or adds analytics is a notifiable change — plan for it.

### 3.3 The 24-hour receipt and the 8-day reclassification

The CNDP issues the *récépissé* within 24 hours of filing; processing may start **on receipt** (art. 19). Within 8 days the CNDP may decide that the processing presents "des dangers manifestes" and move it to the authorization regime (art. 20) [S1][S6]. So the 24-hour receipt is not a clearance — it is a registration that can be reversed.

### 3.4 What goes on the site

- The **receipt/authorization number and date** on each collection form and in the privacy policy (art. 5(1)(d), art. 19; CNDP model clause 5.1) [S1][S3].
- The **CNDP-registered purpose** — keep the wording aligned with the declaration. A form that says "we will also send you our newsletter" when the declaration says "respond to your request" is a purpose diversion (art. 54).
- The **rights contact** (service, address, email).

> Observed failure mode: lamalifgroup.ma reproduces the CNDP model sentence verbatim but leaves the number blank — "Ce traitement a été autorisé par la CNDP sous le n°.." [S18]. That is worse than omitting it: it advertises a filing that is not evidenced. Do not copy the pattern.

---

## 4. Cookies and analytics

### 4.1 What Law 09-08 does and does not say

Law 09-08 contains **no cookie-specific rule**. There is no Moroccan ePrivacy Directive equivalent. Cookies are governed indirectly:

- a cookie identifier or IP address linked to a person is personal data (art. 1; the CNDP FAQ lists "l'adresse IP de l'ordinateur" among personal data) [S1][S10];
- processing needs a basis (art. 4) and information (art. 5);
- the processing must be declared (art. 12(2));
- any transfer abroad needs the art. 43/44 route.

### 4.2 The operative text: Délibération n° D-939-2025 (28 November 2025)

This is the CNDP's dedicated cookie instrument and the most recent primary source [S4]. Key content:

- **Scope:** any declaration by a controller processing personal data through installing, recording or storing cookies on a user's terminal.
- **Permitted purposes:** (i) personalized advertising based on browser/geolocation **without building a personal profile**; (ii) editorial/service personalization; (iii) social-media sharing; (iv) **navigation statistics and audience measurement without building a personal profile**.
- **Profiling is carved out:** any use to establish a personal profile requires **prior CNDP authorization** under art. 12.
- **Consent:** not required for the four purposes **except** for personalized-advertising cookies and social-sharing cookies. Where consent is required it must be "une action claire et explicite", with a refusal path that is respected and stored **for a maximum of six months**.
- **Information before the first cookie:** controller identity, purposes, data categories, recipients **including transfers abroad duly authorized by the CNDP**, rights contact, and **the references of the CNDP receipts**.
- **Retention:** data collected via cookies max **6 months**, then deleted or anonymized.
- **Formality:** simplified declaration via the appropriate forms or the **CNDP-FORMS** platform.
- **Transfers:** no transfer without prior CNDP authorization.

### 4.3 The older guidance still online

The CNDP's "Lignes directrices relatives à la conformité des sites web à la loi 09-08" (page published January 2023, last modified January 2025, i.e. before D-939-2025; its PDF link is now dead) states at §10:

> "Un site internet qui utilise des cookies faisant appel à des données personnelles doit recueillir le consentement de l'internaute avant le dépôt de ces cookies." [S3]

The same guidelines require, at collection: information on the controller, purposes, recipients, mandatory/optional nature, rights, the service, **and the receipt/authorization number**; plus consent, with a **non-pre-checked** acceptance box, and a data-protection clause inside the mentions légales/CGU.

### 4.4 Reconciling the two — and the actual risk

| Reading | Consequence for HAY2010 |
|---|---|
| **2025 deliberation (later, specific)** | Audience measurement without profiling → no consent banner; information + declaration + transfer authorization still required |
| **2023 guidelines (older, general)** | Any cookie using personal data → consent before deposit |
| **Conservative / control-proof** | Ship a consent banner anyway, or avoid cookies entirely |

Recommendation: **avoid the question** rather than litigate it. A cookieless or self-hosted audience-measurement setup (aggregate page views, no cross-site identifiers, no ad features) sits in the D-939-2025 safe harbour, removes the banner, and removes the US transfer. If GA4 is required for business reasons, ship a real consent banner — not because D-939-2025 necessarily demands it, but because GA4's default configuration (Google signals, ad personalization, data sharing) can amount to profiling, which the deliberation puts back under prior authorization.

**A banner, if used, must:** load no non-essential cookie before a choice; offer "Refuser" as prominently as "Accepter"; have no pre-ticked boxes; not block access to the site; re-prompt at most every 6 months; and link to the cookie section of the policy. A banner that only says "OK" and drops GA anyway is worse than no banner.

### 4.5 What the reference site actually does (lamalifgroup.ma)

Observed 2026-11-08 [S18]:

- **No cookie banner / CMP.** No consent script; the page loads third-party scripts unconditionally.
- **Google Analytics present**: `googletagmanager.com/gtag/js?id=UA-186092780-2`. That is a **Universal Analytics** property — a generation of Google Analytics that Google has retired — so it is likely a dead tag, but it is still shipped to every visitor and still contacts Google.
- **Google Fonts loaded remotely** (`ajax.googleapis.com/ajax/libs/webfont/1.5.3/webfont.js`) — an IP transfer to Google on every page view.
- **`/mentions-legales/` exists** and does the identity block properly: SARL, capital 30,000,000 MAD, siège, phone, RC 20719, IF, taxe professionnelle, ICE 001535176000094.
- It also contains a data-protection section, a cookie section and a newsletter section. It states a **transfer to Canada, pre-authorized by the CNDP under arts. 43–44** — consistent with D-236-2015 (Canada is on the adequate list) and with the CNDP's practice of requiring a transfer filing even for adequate countries.
- **Contact form**: uses the CNDP model clause but with the receipt number left blank (`n°..`), plus a consent checkbox.
- **No separate privacy policy** (`/politique-de-confidentialite/` → 404); everything is folded into the mentions légales.
- **Careers**: no upload form — "Déposez votre candidature par email sur recrutement@lamalif.ma" — and no privacy notice on the careers page.

**Conclusion:** lamalif is an *architecture and tone* reference, not a compliance reference. Copy the mentions-légales structure (it is a good one), not its cookie behaviour or its blank receipt number.

### 4.6 What hay2010.ma does today

Observed 2026-11-08 [S19]:

- Still the WordPress/Porto placeholder (Lorem ipsum, "Hello world!", WooCommerce and Contact Form 7 loaded).
- A **CookieAdmin** plugin is installed (`cookieadmin` + `cookieadmin-pro` assets), so a consent UI may already render — but there is **no privacy policy and no mentions légales** page, and nothing for the banner to link to.
- No analytics tag detected on the home page.

So the placeholder is in the inverse position from lamalif: a banner without a policy, versus a policy without a banner. Neither is a model.

### 4.7 Recommended analytics decision

| Option | Cookies | Banner | Transfer | Effort |
|---|---|---|---|---|
| **A. Self-hosted Matomo/Plausible** (MA or EU host), IP anonymized, no ad features | None or first-party only | No consent banner; informational notice | None if MA; notifiable if EU | Low–medium |
| **B. GA4 with consent banner** | `_ga`, `_ga_*` | Yes, real CMP | US → F-118 | Medium–high |
| **C. GA4 without banner** | `_ga`, `_ga_*` | No | US → F-118 | **Not recommended** — relies on a contested reading and leaves profiling risk |

If analytics is "possibly" in scope, default to **A** now and revisit later; it is the only option that does not create a filing dependency before launch.

---

## 5. Mentions légales

### 5.1 What is actually required, and by what text

Morocco has **no single "mentions légales" statute** for websites. The obligation is assembled from several texts:

| Item | Required? | Source |
|---|---|---|
| Dénomination sociale + "SARL" | **Yes** | Loi 5-96 art. 45: the name must be "précédée ou suivie immédiatement de la mention « société à responsabilité limitée » ou des initiales « SARL »" [S11] |
| Capital social | **Yes** | Loi 5-96 art. 45 [S11] |
| Siège social | **Yes** | Loi 5-96 art. 45 [S11] |
| Numéro d'immatriculation au registre du commerce | **Yes** | Loi 5-96 art. 45 [S11] |
| These items on the website | **Yes** — a website is a "publication … destinée aux tiers" in the ordinary sense. This is the accepted reading, not an express website clause | Loi 5-96 art. 45 lists "actes, lettres, factures, annonces, publications ou autres documents émanant de la société et destinés aux tiers" [S11] |
| Penalty for omitting name/form/capital | 1,000–5,000 DH | Loi 5-96 art. 112 [S11] |
| Data controller identity, purposes, recipients, rights, CNDP receipt | **Yes** | Loi 09-08 arts. 5 and 19; CNDP website guidelines §5.1 [S1][S3] |
| ICE | **Not by loi 5-96**; required on invoices/commercial documents under the tax rules; universally displayed on Moroccan sites | CGI art. 145-III (DGI) — see §13 access note |
| IF / taxe professionnelle | Not required on a website; conventional | — |
| Host name/address | **Not required** by Moroccan law | No LCEN equivalent found |
| Directeur de la publication | **Only if** the site is a "journal électronique" | Loi 88-13 arts. 2(3) and 15 [S12] |
| "Tous droits réservés" / IP notice | Not required, but recommended | — |

### 5.2 The press-law trap

Loi 88-13 defines a *journal électronique* as a publication "régulièrement mise à jour", under **its own domain name**, using a **content-management system**, communicating to the public via the Internet, where a person "assure la direction de la ligne éditoriale … selon un traitement professionnel à caractère journalistique" (art. 2(3)). Article 15 requires every *écrit périodique*, *journal électronique* or other electronic medium to have a **directeur de publication**, and article 16 sets eligibility conditions (Moroccan nationality, domicile in Morocco, a journalism degree or equivalent, professional journalist status…) [S12].

A pure corporate showcase with a contact form is not a *journal électronique*: there is no journalistic editorial line. But a **"Actualités"/blog section with regular editorial posts** moves the site toward the definition, and the eligibility conditions for a *directeur de publication* are not trivially met by a small SARL. This is a genuine counsel question if the redesign includes a news/blog (§11).

### 5.3 Data to verify before anything is published

The sibling company report documents **contradictory registry data**:

- **RC:** 517 (Rabat) on one Welipro card vs **87305** (Rabat) on another.
- **Capital:** 15,000,000 MAD vs 6,000,000 MAD.
- **Address:** three variants (Hay El Manzeh / Ribat Al Fath / Hay El Fath), with seat transfers logged in 2018 and 2026.
- **ICE:** 001459327000056 (valid checksum per the aggregator, not registry-verified).

Publishing the wrong RC or capital in the mentions légales is a self-inflicted accuracy problem in the one document whose purpose is to be accurate. **Obtain an RC extract (modèle J) and the ICE attestation before writing the page.** Do not copy the figures from the current placeholder site or from aggregators.

### 5.4 Draft outline — Mentions légales (FR)

> Placeholders in `[●]`. To be reviewed by counsel before publication.

```
MENTIONS LÉGALES

1. Éditeur du site
   Le site [www.hay2010.ma] est édité par :
   HAY2010 SARL — société à responsabilité limitée au capital de [●] dirhams
   Siège social : [●], Rabat, Maroc
   Registre du commerce de Rabat : n° [●]
   Identifiant commun de l'entreprise (ICE) : [●]
   Identifiant fiscal : [●]
   Téléphone : [●] — E-mail : [●]
   Représentant légal / gérant : [●] (facultatif)

2. Directeur de la publication
   [●] — à supprimer si le site n'est pas un « journal électronique »
   au sens de la loi n° 88-13.

3. Hébergement
   [Nom, adresse, téléphone de l'hébergeur] — mention de bonne pratique,
   non imposée par un texte marocain général.

4. Propriété intellectuelle
   Structure, textes, images, logos et marques : propriété de HAY2010 SARL
   ou de ses partenaires. Toute reproduction sans autorisation écrite est
   interdite et susceptible de constituer une contrefaçon (loi 17-97).

5. Données personnelles
   Responsable du traitement : HAY2010 SARL.
   Les informations recueillies via les formulaires font l'objet d'un
   traitement destiné à [●]. Destinataires : [●].
   Conformément à la loi n° 09-08, vous disposez d'un droit d'accès, de
   rectification et d'opposition, exercisable à [●].
   Ce traitement a fait l'objet d'une déclaration / autorisation auprès de
   la CNDP sous le n° [●] du [●/●/●].
   → renvoi vers la Politique de confidentialité pour le détail.

6. Cookies
   [Renvoi vers la section « Cookies » de la politique de confidentialité,
   ou paragraphe dédié : finalités, durées, gestion du consentement.]

7. Responsabilité et liens
   [Clause standard : exactitude des informations, disponibilité,
   liens externes.]

8. Droit applicable et juridiction
   Droit marocain — Tribunal de commerce de Rabat.

9. Date de dernière mise à jour : [●]
```

---

## 6. Politique de confidentialité

### 6.1 Required content

Derived from arts. 5, 15 and 19 and the CNDP's model clauses [S1][S3]:

1. **Controller** — legal name, form, capital, address, RC, ICE, contact, representative.
2. **Purposes** — one block per processing activity, using the same wording as the CNDP declaration.
3. **Legal basis** — consent / contract / legal obligation / legitimate interest.
4. **Data categories** — and, for each form, which fields are **mandatory** and what happens if they are not filled.
5. **Recipients** — internal services, processors (host, email, analytics, ATS), and any public authority on request.
6. **Transfers abroad** — countries, safeguards, and the **CNDP authorization reference**.
7. **Retention** — a period per activity, matching the declaration.
8. **Rights** — access, rectification (10 days), opposition, withdrawal of consent, how to exercise them, and the CNDP complaint route.
9. **Security** — a short, non-detailed description (no security theatre, no architecture disclosure).
10. **Cookies** — categories, names, purposes, durations, consent management.
11. **CNDP references** — receipt/authorization numbers and dates.
12. **Version/date** and change procedure.

The CNDP's model clause (to adapt, not to copy verbatim) is:

> "Les informations recueillies sur le site www.…… font l'objet d'un traitement destiné à…… Les destinataires des données sont :…… Conformément à la loi n° 09-08 … vous bénéficiez d'un droit d'accès et de rectification … que vous pouvez exercer en vous adressant à :…… Ce traitement a été notifié et autorisé par la CNDP au titre du récépissé / de l'autorisation n°…… du …/…/…." [S3]

### 6.2 Draft outline — Politique de confidentialité (FR)

```
POLITIQUE DE CONFIDENTIALITÉ

1. Qui est responsable de vos données ?
   HAY2010 SARL, [adresse], RC [●], ICE [●].
   Contact données personnelles : [donnees@hay2010.ma] — [adresse postale].

2. Quelles données traitons-nous et pourquoi ?
   2.1 Formulaire de contact / demande de devis
       Données : nom, prénom, société, e-mail, téléphone, objet, message.
       Finalité : répondre à votre demande, préparer un devis.
       Base légale : mesures précontractuelles (art. 4-b) et consentement.
       Obligatoire : champs marqués * ; sans eux, la demande ne peut être traitée.
       Conservation : [12 mois] après le dernier échange / [3 ans] si relation contractuelle.
   2.2 Candidatures (CV, lettre de motivation)
       Données : identité, coordonnées, CV, lettre, parcours.
       Finalité : gestion du recrutement.
       Base légale : mesures précontractuelles et consentement.
       Conservation : [6 mois] après la décision ; [12 mois] si constitution
       d'une CVthèque avec accord exprès ; suppression immédiate sur demande.
   2.3 Mesure d'audience / cookies
       Voir section 7.
   2.4 Gestion de la relation client, contrats, comptabilité
       Données : coordonnées professionnelles, échanges, pièces contractuelles.
       Base légale : contrat et obligations légales.
       Conservation : durée de la relation + [durée légale de conservation comptable].
   2.5 Journaux serveur et sécurité
       Données : adresse IP, horodatage, requêtes.
       Finalité : sécurité et diagnostic.
       Conservation : [6 mois].

3. Qui reçoit vos données ?
   Services internes habilités ; hébergeur [●] ; prestataire e-mail [●] ;
   prestataire de mesure d'audience [●] ; [ATS] ; autorités sur réquisition.
   Contrats de sous-traitance conformes à l'article 23 de la loi 09-08.

4. Vos données sont-elles transférées hors du Maroc ?
   [Oui/Non]. Si oui : [pays], encadrement [clauses contractuelles],
   autorisation CNDP n° [●] du [●].

5. Combien de temps sont-elles conservées ?
   Tableau récapitulatif par finalité (identique à la déclaration CNDP).

6. Quels sont vos droits ?
   Accès, rectification (délai de 10 jours), opposition, retrait du consentement.
   Comment : [e-mail / courrier], avec justificatif d'identité.
   Réclamation : CNDP — [coordonnées], www.cndp.ma.

7. Cookies
   Catégories, finalités, durées, base légale, gestion du consentement,
   lien pour modifier ses choix.

8. Sécurité
   Mesures techniques et organisationnelles (description générale).

9. Modifications
   Version, date, procédure d'information.

10. Références CNDP
    Déclaration n° [●] du [●] (contact) ; autorisation n° [●] du [●] (RH) ;
    déclaration n° [●] du [●] (cookies).
```

### 6.3 Form-level notices

**Contact form** — above or below the submit button, with an unticked box:

> Les champs marqués d'un \* sont obligatoires. Vos données sont traitées par HAY2010 SARL pour répondre à votre demande. Elles sont destinées à [●] et conservées [●]. Vous disposez d'un droit d'accès, de rectification et d'opposition à [●]. Ce traitement a fait l'objet d'une déclaration auprès de la CNDP sous le n° [●].
> ☐ J'accepte que HAY2010 SARL traite mes données pour répondre à ma demande. (non pré-cochée)

**Application form** — in addition to the above:

> Les informations collectées (CV, lettre de motivation, coordonnées) sont utilisées uniquement pour la gestion de votre candidature. Elles sont conservées [6/12] mois puis supprimées. Elles ne sont pas transmises à des tiers en dehors des prestataires techniques [●]. Vous pouvez demander leur suppression à tout moment à [●]. [Transfert : ●].

And: **do not** ask for a photo, date of birth, marital status, CNI number, health information or anything that reveals religion, union membership or ethnic origin. A CNI number flips the processing into the **authorization** regime (art. 12(1)(e)) [S1]; a photo of the candidate is unnecessary and risky.

---

## 7. Images, logos and testimonials

### 7.1 Employee photos

A photograph is expressly personal data ("y compris le son et l'image", art. 1) [S1]. Publishing an employee's photo on the site requires:

- a **defined purpose** (team presentation, project reference, employer branding);
- a **basis**: consent (art. 4) or legitimate interest (art. 4(e)) — but in an employment relationship consent is weakened by subordination, so a signed, specific authorization is the practical answer;
- **proportionality** (art. 3(1)(c)): no photo where a name would do, no identity + role + site + personal social links combined without need;
- a **written authorization** stating the media (website, LinkedIn, brochures), the duration, the possibility of withdrawal, and what happens on departure;
- a **prompt takedown process** — an employee who leaves or withdraws should not have to argue.

There is no statutory Moroccan "image release" form. The authorization is contractual best practice, not a named legal instrument — counsel should draft it (§11).

Practical rule: **internal directory ≠ public website.** Consent for an intranet does not cover the public site.

### 7.2 Client names and logos

Two separate rights:

- **Trademark.** Loi 17-97 art. 154 prohibits, "sauf autorisation du propriétaire", the reproduction, use or affixing of a mark — including use of a reproduced mark or an identical sign — for identical goods/services; art. 155 extends this to similar goods/services where there is a likelihood of confusion. Article 201 characterises any infringement of those rights as **contrefaçon** [S13].
- **Contract.** Public-procurement and private contracts frequently contain confidentiality or communication-approval clauses. A logo wall can breach them even where the trademark owner would not object.

So: **written permission per client**, or text-only references ("Référence : éclairage public — Province de Khemisset, 2024"), or no client list at all. Public awards are public information, but that does not license the buyer's **logo**. Never arrange logos to imply endorsement or partnership that does not exist.

### 7.3 Testimonials

Same analysis as photos plus accuracy: a testimonial is a quote attributable to a person. Get written consent for the quote **and** the name/role/photo, allow withdrawal, and keep the original text on file.

---

## 8. Recruitment data

| Issue | Position | Source |
|---|---|---|
| Regime | **Authorization** (F-113) under the HR model D-298-AU-2014, not a simple declaration | [S7] |
| Required annex | Candidate/stagiaire consent document containing art. 5 information | [S7] |
| Sensitive data | Health, genetic, racial/ethnic origin, political/religious/philosophical opinions, union membership are "données sensibles" → prior authorization, express consent | [S1] art. 1(3), arts. 12(1)(a), 21 |
| CNI number | Triggers the authorization regime (art. 12(1)(e)) — never collect it at application stage | [S1] |
| Discrimination | Code du travail art. 9 prohibits discrimination in hiring based on race, colour, sex, disability, marital status, religion, political opinion, union affiliation, national ancestry or social origin | [S14] |
| Retention | No statutory period; must be declared and justified (art. 3(1)(e)); over-retention is criminal (art. 55) | [S1] |
| Security | Art. 23; access-limited storage, no public bucket, virus scan, deletion on request | [S1] |
| Data minimisation | Only what is needed to assess the application; no photo, no family situation, no ID scan | [S1] art. 3(1)(c) |

**Proposed retention (to validate, not a legal rule):**

- unsuccessful application: **delete 6 months** after the final decision;
- talent pool: **12 months max**, only with an explicit, separately-given consent, renewable;
- spontaneous applications: same as unsuccessful;
- deletion on request: immediate, with a confirmation email.

Why 6/12 rather than "2 years": there is no Moroccan authority for a 2-year default, the CNDP's proportionality principle is the only constraint, and shorter is easier to defend. If HAY2010 wants a longer pool, the consent wording and the declaration must say so explicitly.

**Operational:** a single owner (HR), a named folder/ATS, no CVs in personal inboxes, a quarterly purge, and a documented deletion log. If applications arrive at `recrutement@hay2010.ma`, that mailbox is part of the processing and must be in the declaration and the retention job — not an exception to it.

---

## 9. Proposed retention schedule

| Processing | Data | Proposed retention | Status |
|---|---|---|---|
| Contact / quote | name, company, email, phone, message | 12 months after last exchange; 3 years if contractual | Proposal — validate |
| Recruitment | CV, cover letter, contact details | 6 months after decision; 12 months pool with consent | Proposal — validate |
| Client/contract management | contract, correspondence, invoices | duration + accounting retention (accountant to confirm) | Legal obligation, period TBC |
| Cookies/analytics | cookie identifiers, IP, events | **6 months max** | **Mandatory** — D-939-2025 |
| Cookie consent choice | consent record | **6 months max** | **Mandatory** — D-939-2025 |
| Server logs | IP, timestamp, URL | 6 months | Proposal — validate |
| Newsletter (if any) | email, consent record | until unsubscribe + proof period | Proposal — validate |

The table must be **identical** to what is declared to the CNDP (art. 15(f)) and to what the site says (§6). Three different versions of "we keep it 2 years" is how art. 55 cases start.

---

## 10. Compliance checklist

Ordered by dependency. **[B]** = blocking for launch.

**Identity and content**

- [ ] **[B]** Obtain the **RC extract (modèle J)** and ICE attestation; reconcile RC 517/87305, capital 15M/6M, and the current siège.
- [ ] **[B]** Decide the legal entity details that will appear in the mentions légales and policy (gérant name optional).
- [ ] **[B]** Confirm whether the site will have a news/blog section → loi 88-13 analysis.
- [ ] Draft mentions légales from §5.4 with verified data.
- [ ] Draft politique de confidentialité from §6.2 with the real processing list.

**Filings (before go-live)**

- [ ] **[B]** File **F-211** for contact/quote processing → obtain *récépissé*.
- [ ] **[B]** File **F-113** for HR/recruitment (D-298-AU-2014) → obtain authorization. Do not open the CV upload before.
- [ ] File **F-214** for cookies/analytics (D-939-2025).
- [ ] If any processor/host is outside Morocco: file **F-118** after the base filings are approved.
- [ ] Record the numbers and dates; put them on the forms and in the policy.

**Site build**

- [ ] **[B]** Unticked consent checkbox on every form, with a link to the policy.
- [ ] **[B]** Short art. 5 notice on each form (purpose, recipients, retention, rights, receipt number).
- [ ] **[B]** Privacy policy and mentions légales reachable from every page footer.
- [ ] No CNI, photo, health, marital-status or religion fields on the application form.
- [ ] CV upload: private storage, access control, malware scan, size/type limits, deletion job.
- [ ] Contact form: spam protection chosen with its transfer impact in mind (see §2.7).
- [ ] Cookie banner **if** non-essential cookies are used: refuse as easy as accept, no pre-tick, no cookie wall, 6-month re-prompt.
- [ ] Analytics configured to avoid profiling (no Google signals, no ad personalization, no data sharing), retention ≤ 6 months, IP handling documented.
- [ ] Security headers, TLS, rate limiting, admin MFA.

**Internal**

- [ ] Rights procedure: named owner, `donnees@` mailbox, identity check, **10-day** rectification SLA, log.
- [ ] Retention jobs actually scheduled (cookies 6 months, CVs 6/12 months, contact 12 months).
- [ ] Processor contracts with art. 23(3) clauses (host, email, analytics, ATS).
- [ ] Employee photo authorizations signed before publishing.
- [ ] Client logo permissions on file before publishing.
- [ ] Breach/incident playbook (who decides, who notifies, what is logged).
- [ ] Annual review + change-notification procedure to the CNDP (art. 15).

---

## 11. Where local counsel is needed

These are the points where the sources do not give a safe answer, or where the answer depends on facts counsel must assess:

1. **Cookie consent.** Whether D-939-2025 displaces the 2023 guidelines' blanket consent rule in a control situation, and whether a given GA4 configuration stays inside "mesure d'audience sans profil".
2. **Filing granularity.** Whether contact, recruitment and cookies can be covered by fewer filings, and whether the contact form fits the "gestion des clients" model (D-32-2015) rather than the generic F-211.
3. **HR authorization scope.** The exact perimeter of D-298-AU-2014 and the wording of the candidate consent document the CNDP expects.
4. **Retention periods.** None of the proposed periods in §9 is statutory; counsel should confirm they are defensible and aligned with the declarations.
5. **Loi 88-13.** Whether the planned "Actualités" section turns the site into a *journal électronique* and requires a *directeur de publication* meeting art. 16 conditions.
6. **Transfers.** Whether a single F-118 can cover a multi-processor US stack, and what the CNDP expects for "EU region" hosting operated by a US company.
7. **Image releases.** Drafting the employee photo authorization (scope, duration, withdrawal, post-departure use) in a subordinated relationship.
8. **Client logos.** Reviewing procurement contracts for communication/confidentiality clauses before any logo wall.
9. **Processor contracts.** Art. 23(3) wording for the host, the email API and the analytics provider.
10. **Tax/ICE.** Confirmation of the exact ICE display obligation on commercial documents (see §13 note) — the company's accountant is the right first call.

---

## 12. GDPR comparison (only as a comparison)

| Topic | Morocco (09-08 / CNDP) | GDPR | Practical difference for HAY2010 |
|---|---|---|---|
| Prior filing | Declaration or authorization **before** processing | No prior filing; accountability | Filing is a launch dependency, not paperwork |
| DPO | Not required | Required in some cases | A named internal contact is still needed for rights |
| DPIA | Not a named instrument | Required for high-risk processing | Not applicable, but proportionality still applies |
| Breach notification | No 72-hour rule in 09-08 | 72 hours to the authority | Still notify affected persons/authority if damage; counsel call |
| Cookie consent | No ePrivacy rule; CNDP deliberation D-939-2025 | ePrivacy + GDPR consent | Morocco is *less* prescriptive on banners, *more* prescriptive on filing |
| Transfers | Adequacy list + authorization (D-236-2015) | Adequacy/SCCs/TIA | US transfers need a CNDP filing, not just SCCs |
| Penalties | Up to 300,000 DH before doubling for legal persons, plus prison | Up to 4% of global turnover | GDPR fines are larger, but Moroccan criminal exposure is real |
| Rights deadlines | Rectification: 10 days | One month | The Moroccan deadline is much shorter |

If the site ever targets EU residents (e.g. an EU-language campaign), GDPR may apply extraterritorially and the analysis changes. Nothing in the current brief suggests that.

---

## 13. Sources

All retrieved **2026-11-08**. Where a source was inaccessible, it is labelled.

- **[S1]** Loi n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, dahir n° 1-09-15 du 18 février 2009, BO n° 5714 du 5 mars 2009 — full text PDF as republished by the CNDP: https://www.cndp.ma/wp-content/uploads/2023/11/Loi-09-08-Fr.pdf — articles cited: 1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 14, 15, 19, 20, 21, 23, 26, 43, 44, 52–65.
- **[S2]** Décret n° 2-09-165 du 21 mai 2009 pris pour l'application de la loi 09-08, BO n° 5744 du 18 juin 2009 — https://www.cndp.ma/wp-content/uploads/2023/06/Decret-2-09-165-FR.pdf — **scanned PDF with no extractable text**; cited only for its existence and BO reference (the BO reference is confirmed in the preamble of D-236-2015 [S9]).
- **[S3]** CNDP, *Lignes directrices relatives à la conformité des sites web à la loi 09-08* — https://www.cndp.ma/conformite-des-sites-web/ — page published 2023-01-05, last modified 2025-01-28 (page metadata); HTML text read in full; the linked PDF (`…/2023/01/CNDP-lignes-directrices-conformite-site-web-fr-1.pdf`) returns an HTML error page and **could not be retrieved**.
- **[S4]** CNDP, Délibération n° D-939-2025 du 28/11/2025 relative au modèle de déclaration simplifiée relative au traitement des données à caractère personnel de cookies sur un terminal — https://www.cndp.ma/wp-content/uploads/2025/12/Deliberation-N%C2%B0-D-939-2025-du-28112025-relative-au-modele-de-declaration-simplifiee-relative-au-traitement-des-donnees-a-caractere-personnel-de-cookies-sur-un-terminal.pdf
- **[S5]** CNDP, *Mentions types* (model clauses for forms, contracts, subcontracting, insurance) — https://www.cndp.ma/mentions-types/
- **[S6]** CNDP, *Notifier une déclaration (type de déclaration, formulaires)* — https://www.cndp.ma/notifier-une-declaration-type-de-declaration-formulaires/ ; forms F-211 (https://www.cndp.ma/wp-content/uploads/2025/09/CNDP-Declaration-Normale_F211_20250910_Fr.pdf) and F-214 (https://www.cndp.ma/wp-content/uploads/2025/07/CNDP-Declaration-Normale-Conformement-Decision_F214_20250724_Fr.pdf).
- **[S7]** CNDP, *Procédures de notification* — https://www.cndp.ma/procedures-de-notification-process/ — includes the HR model (Délibération n° 298-AU-2014 du 11/04/2014, form F-113), the cookie model (D-939-2025, form F-214) and the client-management model (D-32-2015).
- **[S8]** CNDP, *Notifier une demande de transfert à l'étranger* (form F-118) — https://www.cndp.ma/notifier-une-demande-de-transfert-a-letranger/
- **[S9]** CNDP, Délibération n° 236-2015 du 18/12/2015 modifiant la délibération n° 465-2013 établissant la liste des États assurant une protection suffisante — https://www.cndp.ma/wp-content/uploads/2023/12/deliberation-n-236-2015-18-12-2015.pdf
- **[S10]** CNDP, *FAQ* — https://www.cndp.ma/faq/ — IP address listed as personal data; no processing before receipt.
- **[S11]** Loi n° 5-96 sur la SNC, la SCS, la SCA, la SARL et la société en participation, dahir n° 1-97-49 — consolidated text, articles 45 and 112 — https://oecrsk.ma/docs/Juridique/LOI%205-96%20societes%20SARL%20SNC%20etc.%20-%20v2019.pdf — *republished by the Ordre des Experts Comptables; the official version is the Bulletin Officiel publication of dahir n° 1-97-49.*
- **[S12]** Loi n° 88-13 relative à la presse et à l'édition, dahir n° 1-16-122 du 10 août 2016 — articles 2(3), 15, 16 — https://adala.justice.gov.ma/api/uploads/2024/03/27/La%20presse%20et%20%C3%A0%20l%27%C3%A9dition-1711531925401.pdf (Ministry of Justice legal database).
- **[S13]** Loi n° 17-97 relative à la protection de la propriété industrielle, telle que modifiée — articles 154, 155, 201 — consolidated text hosted by HACA: https://www.haca.ma/fr/dahir-n%C2%B0-1-00-19-du-15-f%C3%A9vrier-2000-portant-promulgation-de-la-loi-n%C2%B0-17-97-relative-%C3%A0-la-protection
- **[S14]** Code du travail, loi n° 65-99, article 9 — https://adala.justice.gov.ma/api/uploads/2024/04/30/code%20du%20travail-1714463246806.pdf (Ministry of Justice legal database).
- **[S15]** CNDP, *Constitution du Royaume du Maroc* (art. 24, right to private life) — https://www.cndp.ma/constitution-du-royaume-du-maroc/ — cited in the preamble of D-939-2025.
- **[S16]** Direction Générale des Impôts, Code général des impôts, article 145-III (invoicing obligations) — https://tax.gov.ma/ — **the DGI portal returned a 13 KB JavaScript shell instead of the article text on retrieval; the CGI PDF download also returned HTML.** The ICE display obligation on invoices is therefore stated here as "tax rules, to be confirmed with the company's accountant", not as a verified article quotation.
- **[S17]** CNDP, *Publication de nouvelles délibérations* (context for the November 2025 package) — https://www.cndp.ma/la-cndp-publie-de-nouvelles-deliberations/
- **[S18]** First-party observation of **lamalifgroup.ma**, retrieved 2026-11-08: home page, `/mentions-legales/`, `/contact/`, `/espace-carriere/`, `/candidature-spontanee/`. No cookie banner or consent script; `gtag/js?id=UA-186092780-2` and `webfont.js` from `ajax.googleapis.com` loaded unconditionally; mentions légales include RC 20719, IF, taxe professionnelle, ICE 001535176000094, capital 30,000,000 MAD and a stated CNDP-authorized transfer to Canada; contact form carries the CNDP model clause with the receipt number left blank; no separate privacy policy (404).
- **[S19]** First-party observation of **hay2010.ma**, retrieved 2026-11-08: WordPress/Porto placeholder, WooCommerce and Contact Form 7 loaded, CookieAdmin plugin assets present, no mentions légales and no privacy policy, no analytics tag on the home page.

**Sources explicitly not accessible:**

- CNDP website-guidelines PDF (dead link; HTML text used instead) [S3].
- Décret 2-09-165 PDF (scanned images, no text layer) [S2].
- Délibération 298-AU-2014 full text (the CNDP page publishes only the title and one-line subject; no PDF link) — its existence, date and scope are taken from the CNDP procedures page [S7].
- DGI/CGI article 145 full text (portal blocked) [S16].
- The CNDP "Mentions types" page and the F-211/F-214/F-118 forms were read; the *lignes directrices* PDF and the HR deliberation PDF were not.

---

## 14. Open questions

1. **Where will the site and the form data live?** Hosting region and processor nationality drive the entire transfer analysis (F-118) and the choice of analytics.
2. **Is analytics in or out?** If "possibly", the cheapest compliant path is cookieless/self-hosted (option A, §4.7); confirm before build.
3. **Will the careers form ship with an upload at launch?** If the F-113 authorization is not ready, launch with an email address and add the form later — and still declare the mailbox processing.
4. **Is there a newsletter or any marketing email?** If yes, D-940-2025 applies and a separate consent/declaration is needed (art. 10 also requires prior consent for direct marketing).
5. **Do employee photos and client logos appear at launch?** If yes, the authorization/permission paperwork is on the critical path, not a post-launch cleanup.
6. **Was anything ever filed with the CNDP for the WordPress site?** No receipt number is visible on hay2010.ma; if a filing exists, reuse the numbers; if not, the new filings regularise the past.
7. **Who owns the rights contact?** A named person and mailbox are needed before the policy can be published.
8. **What is the correct RC/capital/address?** The sibling report documents contradictions; only an RC extract settles it.
9. **Does HAY2010 have written client authorizations for logo use?** If not, use text references at launch.
10. **Will the site be bilingual (FR/AR)?** The Arabic version is a separate publication of the same notices; both must carry the same CNDP references and be updated together.

---

*Research note (2026-11-08):* the CNDP site was reachable and is the source of the law text, the deliberations, the forms and the website guidelines. The two most consequential findings are (i) the **November 2025 cookie deliberation**, which narrows consent to advertising/social cookies and caps retention at six months, and (ii) the **HR filing route through F-113**, which turns the careers form into an authorization dependency rather than a declaration. Both should be re-checked against the CNDP site before launch, since the CNDP has been actively publishing new deliberations through 2025–2026.
