# HAY2010 — Brand direction and asset plan

**Status:** resolved 2026-11-08 — ticket [#4](https://github.com/mustaphaelou/hay2010website/issues/4).
**Chosen direction:** **A — Lumière** (editorial monochrome, warm amber accent, Poppins, documentary photography).
**Prototype:** branch `prototype/brand-direction`, route `/prototype/brand?variant=a|b|c` (files in `app/prototype/brand`); screenshots in [`docs/brand/assets/`](assets/).
**Scope:** the website brand only. Stationery, signage, vehicle livery and a full identity manual are out of scope. French only, per the page tree ([#2](https://github.com/mustaphaelou/hay2010website/issues/2)).

---

## 1. The decision

Direction A was chosen by the owner on 2026-11-08. It is the closest to the lamalif reference and the strongest fit for a company that sells public lighting: the subject of the brand is light, and the page is organised like a printed portfolio — full-bleed dusk photography, a large light-weight headline, thin rules, generous space, pill CTAs, one amber accent.

**Why A over the alternatives**

| Direction | What it proposed | Why it was not chosen |
|---|---|---|
| **B — Le Plan** | Paper/ink/copper technical system; diagrams instead of photography; specification-sheet layout | Very credible and cheap to produce, but the owner wanted the warmer, more human editorial register; B reads as an engineering studio first. |
| **C — Réseau** | Cobalt/amber poster system; big claims, block layouts, flat night illustration | Distinctive and mobile-friendly, but closer to an energy startup than a 10-year public-works contractor; the tone is more assertive than the audience expects. |

The full set of variants stays on the prototype branch as the primary source. A is the only direction that ships.

**The trade-off accepted**

A depends on photography. There is currently no owned HAY2010 photography, and the images on `hay2010.ma` are Porto demo stock — not licensed for HAY2010 and not usable. Photography is therefore the critical path in this plan, not a polish item. Section 5 is the brief.

**Principles**

1. **La lumière est le sujet.** The photograph carries the brand; the interface stays quiet around it.
2. **Le vide fait partie du dessin.** Space, rules and a restrained type scale do the work that boxes and shadows usually do.
3. **Un seul accent.** Amber marks the point of light; it is never a decorative second colour.
4. **La preuve avant la décoration.** Real sites, real work, captioned images. No stock construction theatre, no client logos without permission.

---

## 2. Identity system

### 2.1 Logo

**Concept — “deux appuis, un câble, un point de lumière.”** Two vertical supports, a sagging cable between them, one amber point at the centre. It reads as a street-light span and as a network; it survives at favicon size.

- **Lockups:** symbol + wordmark (default), symbol alone, wordmark alone, stacked. Wordmark set in Poppins 600, `HAY2010`, tracking `-0.03em`.
- **Colours:** ink on paper, paper on ink, all-ink mono. The amber dot may be dropped in one-colour reproduction; the mark must still read without it.
- **Clear space:** at least the height of the symbol on all sides. **Minimum sizes:** symbol 16 px, lockup 96 px wide.
- **Files to produce:** SVG master, horizontal/stacked/reversed/mono variants, favicon 16/32/48, apple-touch 180, app icon 512, OG template 1200×630.
- **Ownership:** written assignment of the final artwork to **SOCIETE HAY 2010** before publication. The current `ct-logo*.png` on the site is the **Porto Construction demo logo**, not a HAY2010 asset — do not reuse, redraw or “adapt” it.
- **Before finalising:** the owner must confirm that no real HAY2010 logo exists in an old file, invoice, vehicle or sign. If one does, evaluate it before replacing it. An OMPIC trademark search is advisable if the logo will be registered; it is not a launch blocker for web use.
- **Avoid:** lightning bolts, globes, hard-hat/blueprint clichés, gradients, 3D bevels, taglines locked into the mark.

### 2.2 Palette

| Token | Hex | Use | Contrast check |
|---|---|---|---|
| Ink | `#111217` | Headings, dark sections, footer, primary buttons | 15.7:1 on paper |
| Paper | `#F7F6F1` | Page background | — |
| White | `#FFFFFF` | Header, reversed text, hero text | 18.7:1 on ink |
| Body | `#5E6067` | Body copy, secondary text | 5.8:1 on paper |
| Line | `#DEDDD5` | 1 px rules, borders | 13.7:1 against ink (non-text) |
| Amber | `#F2A33C` | Accent surfaces, the light point, CTA hover, one contact band | Ink on amber 8.98:1 |
| Copper | `#9A5A15` | Small labels, links on paper, accent text | 5.04:1 on paper |
| Footer | `#111217` | Footer background | Paper text 15.7:1 |

Rules:

- Amber is a **surface** colour, not a text colour. Ink on amber is allowed; amber on paper is not (about 1.9:1).
- Copper is the **text-safe** version of the accent for 10–13 px labels. The amber/copper pair is intentional: light colour for surfaces, deep colour for type.
- Body copy never sits on photography without a dark overlay that keeps it above 4.5:1.
- Light theme only in v1. Do not ship a dark mode until the image treatment has been tested in it.

### 2.3 Typography

**Poppins** (SIL Open Font License), self-hosted through `next/font/google`: 300, 400, 500, 600. It is the lamalif baseline and is already familiar to the owner; the brand’s distinctiveness comes from scale, spacing and photography, not from a novelty face.

| Role | Size / line-height | Weight | Tracking |
|---|---|---|---|
| Display / hero | `clamp(42px, 6.4vw, 92px)` / 0.94 | 300 | `-0.035em` |
| H2 | `clamp(30px, 4vw, 54px)` / 1.02 | 300 | `-0.03em` |
| H3 / card title | 18–20 px / 1.2 | 500 | `-0.01em` |
| Body | 15–17 px / 1.6 | 400 | 0 |
| Label | 10.5 px / 1.2, uppercase | 600 | `0.2em` |
| Meta / caption | 10.5 px / 1.4 | 500 | `0.18em` |

- Fallback stack: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`. Do not add a second display family.
- French typesetting: typographic apostrophes (`’`), non-breaking spaces before `: ; ? !` and inside `« »`, accented capitals. Line length 45–65 characters.
- Body text never below 15 px; labels are never the only carrier of meaning (WCAG 1.4.1).

### 2.4 Layout and components

- 12-column grid, max width 1440 px, page margins 20 px mobile / 40 px desktop.
- Section rhythm 80–112 px; full-bleed dark and amber bands break the white page.
- **No cards with shadows.** Content is separated by 1 px rules, space and image crops. Pills are the only fully rounded shape.
- **Buttons:** primary ink pill (white text, amber hover); secondary 1 px outline pill; text link with a thin underline and an arrow. Focus: 2 px visible ring, 2 px offset.
- **Header:** solid white, sticky, 76 px, six items maximum, CTA at the far right. This confirms the page-tree decision ([#2](https://github.com/mustaphaelou/hay2010website/issues/2)); no transparent-over-hero variant.
- **Footer:** ink, four columns, email only, legal line `© 2026 SOCIETE HAY 2010 — Tous droits réservés`. No phone, recruitment email, newsletter or social icons ([#3](https://github.com/mustaphaelou/hay2010website/issues/3)).
- Images: full-bleed hero; 4:3 split blocks; 1 px hairline frames for documents. Always with alt text; captions where the image is evidence.

### 2.5 Imagery

This is the heart of A.

- **Treatment:** warm monochrome — desaturate roughly 60–80 %, keep warm highlights (sodium/LED), deep but open blacks. No HDR, no heavy grain, no Instagram filters, no duotone blue. Skin tones stay natural if people appear.
- **Subjects:** public lighting at dusk, masts and luminaires, cable trenches and jointing, transformer stations, CFO/CFA panel rooms, tools/cable details, teams in PPE.
- **Rules:** no client names or logos in frame; no identifiable worker without a signed release; no restricted infrastructure without written site authorization (transformer stations are sensitive); no stock construction imagery, ever.
- **Hero:** one static image, 16:9 desktop and a 4:5 mobile crop, optional 22 s Ken Burns at scale 1 → 1.08, disabled under `prefers-reduced-motion`. Dark gradient overlay on the copy side to hold contrast.
- **Fallback if no photo is ready:** a **typographic hero** on ink (same headline, no fake image). Never fill the hero with stock or a generated scene. This is the launch fallback, not a permanent option.
- **Alt text:** French, descriptive, no “image de…” prefixes; mention the place/operation only when verified.

### 2.6 Iconography

- 24 px grid, 1.4 px stroke, round caps and joins, `currentColor`. Four custom service icons (lamp, network, transformer, panel) plus eight utility glyphs (arrow, mail, pin, menu, close, chevron, phone-strike, external).
- Line icons only; no filled family, no icon font. Inline SVG so they inherit colour and stroke.
- The four service icons are brand assets and must be drawn once, exported as a set, and reused on home, `/metiers` and the footer.

### 2.7 Motion

- Hero: Ken Burns once on load (22 s), text fade-up 700 ms. No loop, no parallax, no scroll-jacking.
- Interface: 200–300 ms colour/opacity transitions on links and buttons. No entrance animations on every section.
- `prefers-reduced-motion: reduce` disables Ken Burns and fades; content is visible immediately.
- Motion is a consequence of the photograph, not a layer on top of it.

---

## 3. Asset checklist

### 3.1 What we have

| Asset | State | Source |
|---|---|---|
| Legal identity, address, email, approved claims | Confirmed | [`docs/company/facts-register.md`](../company/facts-register.md) |
| Four launch services and French labels | Confirmed | [#2](https://github.com/mustaphaelou/hay2010website/issues/2) |
| Page tree, nav and homepage order | Confirmed | [#2](https://github.com/mustaphaelou/hay2010website/issues/2) |
| Domain `hay2010.ma` | Owned; DNS delegation broken | [#15](https://github.com/mustaphaelou/hay2010website/issues/15) |
| Next.js 16 repo, Tailwind 4, shadcn base-maia, Hugeicons | In place | current repo |
| Poppins licence | OFL, free to self-host | Google Fonts |
| Brand direction, palette, type scale, component rules | This document | #4 prototype |
| Prototype screenshots (A/B/C) | Reference only | [`docs/brand/assets/`](assets/) |

### 3.2 What we need

| Asset | Have | Need | Who provides | Gate |
|---|---|---|---|---|
| **Logo — master and variants** | Nothing usable; current site uses the Porto demo logo | SVG master, horizontal/stacked/reversed/mono, favicon 16/32/48, apple 180, app 512 | Design/build; owner approves | Written ownership assignment before publication |
| **Photography — hero** | Nothing | 1 dusk wide (≥2400 px) + 4:5 mobile crop + 16:9 OG crop | Commissioned photographer; owner arranges access | Licence + site authorization + text-overlay test |
| **Photography — sections** | Nothing | 4–6 frames: intro, one per service, one detail | Photographer / owner archive | Licence; releases for any person |
| **Photography — réalisations** | Nothing | 0–5 approved site photos; optional | Owner, with client permission | Written client permission; fallback `Références sur demande` |
| **Photography — careers** | Nothing | 0–2 team/site frames; optional | Photographer | Model releases |
| **Service icons** | Nothing | 4 custom line icons, 24 px | Design/build | — |
| **Utility icons** | Hugeicons installed | 8 glyphs, matched stroke | Build | Verify licence; prefer inline SVG |
| **Favicon / app icon** | Default Next.js icon | 16/32/48/180/512 | Build from the mark | — |
| **Open Graph image** | Nothing | 1200×630 template, typographic or photo | Build | Photo licence if used |
| **Page copy** | Approved facts + sample prototype copy | Final French copy for all launch pages | Build; owner approves | Must follow the facts register; no gated claims |
| **ONEE agrément block** | Evidence on the ONEE list; certificate pending | Certificate scan and exact scope/dates | Owner | Publish only after the certificate is filed |
| **Image-rights register** | Nothing | Licence, model releases, site authorizations, client permissions | Owner + legal review | Before any photo is published |
| **Phone / recruitment email / social** | None | Omit; add only if confirmed | Owner | Gated by the facts register |
| **DNS / hosting** | Domain; broken delegation | Fix delegation; deploy target | [#7](https://github.com/mustaphaelou/hay2010website/issues/7), [#15](https://github.com/mustaphaelou/hay2010website/issues/15) | Launch |

### 3.3 Who does what

- **Owner:** confirms no legacy logo exists; approves the mark; books/authorises the photo shoot; supplies the ONEE certificate; approves final copy; signs off any client or staff image.
- **Design/build:** logo and icon set; page templates and tokens; photo brief and art direction; retouching direction; implementation and accessibility checks.
- **Photographer:** shoot, colour-grade, deliver RAW + web crops, licence and releases.
- **Legal review:** release and licence wording; image rights under loi 09-08; site authorisation for infrastructure. Not legal advice — route through [#10](https://github.com/mustaphaelou/hay2010website/issues/10).
- **Hosting:** image optimisation and CDN per [#7](https://github.com/mustaphaelou/hay2010website/issues/7).

---

## 4. Placeholder-only — never publish as-is

| Item | Why | Replace with |
|---|---|---|
| The prototype dusk scene (`HeroScene` SVG) | It is a drawn placeholder, not a photograph | Licensed/owned hero photograph, or the typographic hero fallback |
| The gradient “photo” block in the specimen | Same | A real image or no image |
| The prototype logo | Proposal only, ownership not assigned | Approved, assigned final artwork |
| Prototype copy (hero subline, section text) | Sample copy, not reviewed against the register | Approved French copy |
| “Un portefeuille à documenter” block | Internal placeholder | `Références sur demande.` or approved case studies |
| Every image currently on `hay2010.ma` | Porto Construction demo assets; rights not established for HAY2010 | New photography or nothing |
| The Porto `ct-logo*.png` | Third-party demo logo | The new HAY2010 logo |
| Any stock construction photo | Repeats the problem A is meant to solve | Owned/commissioned photography |

Staging may show a placeholder with a visible “visuel provisoire” tag. Production may not.

---

## 5. Photography production brief

**Goal:** 8–10 usable frames that prove HAY2010 builds and maintains real infrastructure, without naming clients or showing identifiable people without consent.

**Format:** two visits — one at dusk (hero and atmosphere), one in daylight (details and work). 2–3 authorised sites in Rabat / Rabat-Salé-Kénitra. PPE and escort required.

| # | Frame | Notes |
|---|---|---|
| 1 | Hero — wide dusk street with working public lighting | 16:9 and 4:5 crops; leave dark space for the headline; no logos, no readable plates |
| 2 | Hero alternate — low angle on a mast/luminaire against sky | Tests the mark/light story on mobile |
| 3 | Intro — hands on a luminaire, mast base or cable joint | Release if a face is identifiable; prefer hands/back |
| 4 | Éclairage public — a lit row of poles at dusk | The most important service image |
| 5 | Réseaux HTA/BT — open trench with ducts/cable, or jointing | Shows the underground network; clean the frame |
| 6 | Postes de transformation — exterior or interior, authorised | Sensitive site: written authorisation first |
| 7 | CFO/CFA — panel room, breakers, labelling | No client name on labels |
| 8 | Detail — copper cable, lugs, tools, light pool on asphalt | Texture for section backgrounds and OG |
| 9 | Team — 2–3 workers in PPE, wide, doing something | Model releases; no staged handshakes |
| 10 | Careers / culture — optional second team frame | Release required |

**Deliverables:** 2400 px long edge, sRGB JPEG (q90) + RAW/DNG; three crops per selected frame (16:9, 4:3, 4:5); contact sheet; French captions and alt text; a signed licence.

**Licence and permissions:**

- Perpetual, worldwide, non-exclusive licence for website, social, OG and presentations; right to crop and retouch; no resale.
- A model release for every identifiable person (loi 09-08 image rights).
- Written site authorisation from the site owner/client; never photograph client logos, names or plates.
- Do not enter or photograph restricted installations without written authorisation.
- File everything in the image-rights register (Section 3.2) before publishing.

---

## 6. Sequence and launch gates

1. **Now:** owner confirms there is no legacy logo; approves A and the logo concept.
2. **Week 1:** finalise logo files and ownership; request photo quotes; request site authorisations (lead time is the risk).
3. **Week 1–2:** build the tokens and components; start [#13](https://github.com/mustaphaelou/hay2010website/issues/13) with the typographic hero fallback.
4. **Week 2–3:** shoot; selects and grade; test text overlay on desktop and mobile.
5. **Week 3–4:** integrate images; write final copy against the facts register; accessibility and performance QA.
6. **Launch:** only when the gates below pass and [#15](https://github.com/mustaphaelou/hay2010website/issues/15) has fixed the DNS.

**Launch gates**

- [ ] Logo ownership assigned in writing; no Porto asset remains in the repo or the site.
- [ ] At least the hero image is licensed and tested with the headline; otherwise the typographic hero is approved.
- [ ] Every published photo has a licence; every identifiable person has a release; every site has an authorisation.
- [ ] No client name or logo without written permission; réalisations fallback is in place.
- [ ] ONEE agrément appears only after the certificate is filed.
- [ ] No placeholder copy, stock photo, demo logo or “visuel provisoire” in production.
- [ ] Contrast, alt text and reduced-motion checks pass.
- [ ] Forms remain disabled until CNDP ([#14](https://github.com/mustaphaelou/hay2010website/issues/14)).

---

## 7. Handoffs

| Ticket | What it receives |
|---|---|
| [#13](https://github.com/mustaphaelou/hay2010website/issues/13) homepage prototype | Direction A tokens, section rhythm, hero fallback, pill/button rules |
| [#5](https://github.com/mustaphaelou/hay2010website/issues/5) content model | Asset fields: image, alt, caption, credit, rights status, focal point, gate |
| [#6](https://github.com/mustaphaelou/hay2010website/issues/6) réalisations | Photography only with permissions; otherwise `Références sur demande` |
| [#10](https://github.com/mustaphaelou/hay2010website/issues/10) legal | Image rights and release wording; photo credits not required on page |
| [#11](https://github.com/mustaphaelou/hay2010website/issues/11) SEO | OG template, favicon, alt text; do not add `logo` to JSON-LD until ownership is assigned |
| [#7](https://github.com/mustaphaelou/hay2010website/issues/7) hosting | Image sizes, formats, CDN/cache policy |
| [#15](https://github.com/mustaphaelou/hay2010website/issues/15) DNS | Canonical URL; keep MX records |

---

## 8. Owner actions

1. **Check for a legacy logo** — old files, invoices, vehicle, site sign. If one exists, send it before the logo is finalised.
2. **Approve the logo concept** (or ask for one round of revisions).
3. **Approve the photo brief and budget**, and nominate the sites; authorisations take longer than the shoot.
4. **Send the ONEE certificate** so the agrément block can be prepared and gated.
5. **Confirm the contact position**: email only, no phone, no social, no recruitment mailbox.
6. **Approve the final French copy** against the facts register.

**Open question:** the accent is sodium amber `#F2A33C`, not the Porto orange `#FF3A2D`. The current orange has no HAY2010 equity — it belongs to the demo theme — and amber tells the public-lighting story. If the owner wants continuity with the current site instead, the accent token can be swapped, but it should be a conscious brand choice, not an inheritance.

---

## 9. Prototype provenance

- All three directions: branch `prototype/brand-direction`, `app/prototype/brand` (`?variant=a|b|c`), plus `docs/brand/assets/` screenshots.
- The prototype is throwaway: no tests, no persistence, no production copy. `main` keeps only this decision and the screenshots.
- The winning direction is A. B and C remain on the branch as rejected alternatives and as evidence of the comparison.
