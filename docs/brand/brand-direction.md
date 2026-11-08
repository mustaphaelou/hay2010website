# HAY2010 — Brand direction and asset plan

**Status:** resolved 2026-11-08 — ticket [#4](https://github.com/mustaphaelou/hay2010website/issues/4).
**Chosen direction:** **A — Lumière** (editorial monochrome, warm accent, Poppins, documentary photography), with the **owner-supplied HAY2010 badge**.
**Amended 2026-11-08:** the owner supplied the existing logo after the direction was chosen. The proposed mark is withdrawn; the real badge is the brand mark, and the site accent is aligned to its orange. A vector v1 was traced from the supplied raster (see §2.1 and `public/brand/`). Details in §2.1, §2.2 and §10.
**Prototype:** branch `prototype/brand-direction`, route `/prototype/brand?variant=a|b|c` (files in `app/prototype/brand`); screenshots in [`docs/brand/assets/`](assets/).
**Scope:** the website brand only. Stationery, signage, vehicle livery and a full identity manual are out of scope. French only, per the page tree ([#2](https://github.com/mustaphaelou/hay2010website/issues/2)).

---

## 1. The decision

Direction A was chosen by the owner on 2026-11-08. It is the closest to the lamalif reference and the strongest fit for a company that sells public lighting: the subject of the brand is light, and the page is organised like a printed portfolio — full-bleed dusk photography, a large light-weight headline, thin rules, generous space, pill CTAs, one warm accent.

The owner then supplied the existing **HAY2010 badge** (blue building silhouette, orange arc, red point, white `HAY` / `2010.Sarl`). That mark is now the brand; the prototype's proposed “two poles and a cable” mark is withdrawn. The system is unchanged except that the accent moves from the provisional amber `#F2A33C` to the logo's orange `#E97425`, so the site and the badge share the same warm note.

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
3. **Un seul accent.** Orange marks the point of light; it is never a decorative second colour. The logo's blue and red stay inside the badge.
4. **La preuve avant la décoration.** Real sites, real work, captioned images. No stock construction theatre, no client logos without permission.

---

## 2. Identity system

### 2.1 Logo — the supplied badge

**The mark.** A blue building silhouette with two towers, an orange arc sweeping across it, a red point at the left, and the lettering `HAY` over `2010.Sarl` in white. It is a compact, 4:3 badge designed to work on a white page and on a vehicle/sign.

**What we received (2026-11-08).** A 500 × 500 transparent WebP (artwork bounds 448 × 335, placed with transparent padding). Exact colours sampled from the file:

| Element | Hex |
|---|---|
| Blue | `#3E4D9C` |
| Orange | `#E97425` |
| Red | `#DE212E` |
| Lettering | `#FFFFFF` |

The raster is compressed and only 500 px on the long edge. It is the reference. A **vector v1** was traced from it on 2026-11-08 — full-colour, white and ink SVGs in `public/brand/`. It is faithful at 468 px, 52 px and 32 px; it is not print-approved until a designer reviews the curves and lettering at 400 %.

**Do not redesign it in this project.** The mark has existing equity and appears on the company's site, documents and probably signage. The job here is to **productionise** it: vector redraw, clean edges, exact colours, variants. The vector v1 is that productionised form; the remaining work is review, favicon/app icons, the OG template and a print master. A redesign is a separate decision that needs the owner's brief.

- **Header:** the badge at 52 px high, with no adjacent wordmark (the name is inside the badge). The header is 76 px high; the badge has 12 px of air above and below. Do not shrink below 44 px on desktop; at that size `2010.Sarl` stops being legible.
- **Footer:** full-colour badge on a paper `#F7F6F1` chip (8 px padding), or a one-colour white stencil on ink when no chip is wanted. The prototype tests both.
- **One-colour version:** the white stencil is a traced vector (v1): the badge becomes white and the lettering/arc/point are transparent cut-outs so the background shows through. The same geometry serves as the ink version. Review the fine edges before print.
- **Files:** the supplied composition is the lockup; do not invent a horizontal variant unless the owner asks. **Produced:** full-colour SVG, one-colour white SVG, one-colour ink SVG, and a trimmed raster fallback. **Remaining:** designer review of the traced curves, favicon crop, Apple touch icon, app icon, OG/social avatar template, and a print master.
- **Favicon:** the full badge at 16/32 px is too dense. Test a crop of the building + arc + `HAY` (without `2010.Sarl`) at 32 px, and a simplified 16 px reduction; do not ship a mush of the full badge.
- **`.Sarl` in the mark:** the badge includes the legal form. Keep it for v1; a web-only reduction without `.Sarl` would be cleaner at small sizes but changes the existing mark, so it is an owner decision, not a designer shortcut. The legal pages and footer legal line still use `SOCIETE HAY 2010` ([#3](https://github.com/mustaphaelou/hay2010website/issues/3)).
- **Ownership:** the owner supplied the file, but written confirmation is still needed that **SOCIETE HAY 2010** owns the artwork (or holds a licence from the designer). If a source AI/SVG/EPS/PDF exists, get it — do not redraw from the raster unless the source is lost.
- **Trademark:** an OMPIC search is advisable if the mark will be registered; it is not a launch blocker for web use.
- **Never reuse:** the Porto `ct-logo*.png` demo logo, or any “adapted” version of it. It is not a HAY2010 asset.

### 2.2 Palette

| Token | Hex | Use | Contrast check |
|---|---|---|---|
| Ink | `#111217` | Headings, dark sections, footer, primary buttons | 15.7:1 on paper |
| Paper | `#F7F6F1` | Page background | — |
| White | `#FFFFFF` | Header, reversed text, hero text | 18.7:1 on ink |
| Body | `#5E6067` | Body copy, secondary text | 5.8:1 on paper |
| Line | `#DEDDD5` | 1 px rules, borders | 13.7:1 against ink (non-text) |
| Orange | `#E97425` | Accent surfaces, CTA hover, one contact band, small labels on ink | Ink on orange 6.23:1; orange on paper 2.78:1 — **not text on paper** |
| Copper | `#9A5A15` | Small labels and links on paper | 5.04:1 on paper |
| Logo blue | `#3E4D9C` | **Logo only** — not a UI colour | 7.07:1 on paper (reference) |
| Logo red | `#DE212E` | **Logo only** — the point | — |

Rules:

- **Orange is the accent**, aligned to the logo's orange. Ink on orange passes AA (6.23:1); white on orange does not (3.0:1) — never put white text on an orange field.
- Orange on paper is not a text colour (2.78:1). Use copper for small labels and links on paper.
- Orange is allowed for small labels on ink (about 5.6:1) and for the contact band with ink text.
- **Blue and red are logo colours only.** Do not introduce a blue link colour, a red error style borrowed from the mark, or a blue band. The logo is a self-contained badge; the page stays ink/paper/orange.
- Light theme only in v1. Do not ship a dark mode until the image treatment has been tested in it.

### 2.3 Typography

**Poppins** (SIL Open Font License), self-hosted through `next/font/google`: 300, 400, 500, 600. It is the lamalif baseline and is already familiar to the owner; the brand's distinctiveness comes from scale, spacing and photography, not from a novelty face.

The badge's lettering is part of the supplied artwork. Do not recreate it in Poppins or “fix” its spacing; set the website type alongside it.

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
- Section rhythm 80–112 px; full-bleed dark and orange bands break the white page.
- **No cards with shadows.** Content is separated by 1 px rules, space and image crops. Pills are the only fully rounded shape.
- **Buttons:** primary ink pill (white text, orange hover); secondary 1 px outline pill; text link with a thin underline and an arrow. Focus: 2 px visible ring, 2 px offset.
- **Header:** solid white, sticky, 76 px, 52 px badge, six items maximum, CTA at the far right. This confirms the page-tree decision ([#2](https://github.com/mustaphaelou/hay2010website/issues/2)); no transparent-over-hero variant.
- **Footer:** ink, four columns, email only, legal line `© 2026 SOCIETE HAY 2010 — Tous droits réservés`. Logo on a paper chip (or one-colour stencil). No phone, recruitment email, newsletter or social icons ([#3](https://github.com/mustaphaelou/hay2010website/issues/3)).
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

- 24 px grid, 1.4 px stroke, round caps and joins, `currentColor`. Four custom service icons (lamp, network, transformer, panel) plus eight utility glyphs (arrow, mail, pin, menu, close, chevron, external, phone-strike).
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
| **HAY2010 logo — source + vector v1** | 500 × 500 transparent WebP, artwork 448 × 335, exact colours sampled; SVG v1 full-colour, white and ink | Owner, 2026-11-08; [`assets/hay2010-logo-source.webp`](assets/hay2010-logo-source.webp); `public/brand/*.svg` |
| **Logo web exports** | SVGs + trimmed full-colour raster fallback in `public/brand/` | Derived from the source; see `public/brand/README.md` |
| Domain `hay2010.ma` | Owned; DNS delegation broken | [#15](https://github.com/mustaphaelou/hay2010website/issues/15) |
| Next.js 16 repo, Tailwind 4, shadcn base-maia, Hugeicons | In place | current repo |
| Poppins licence | OFL, free to self-host | Google Fonts |
| Brand direction, palette, type scale, component rules | This document | #4 prototype |
| Prototype screenshots (A/B/C) | Reference only | [`docs/brand/assets/`](assets/) |

### 3.2 What we need

| Asset | Have | Need | Who provides | Gate |
|---|---|---|---|---|
| **Logo — vector master** | Vector v1 traced from the 500 px raster: full-colour, white, ink | Designer review/cleanup, print master, approval | Brand designer/illustrator; build exports | Owner approves; ownership confirmed |
| **Logo — variants** | Full-colour, white and ink SVGs | Favicon crop, Apple/app icons, social avatar, monochrome print | Designer; build exports | Approval before publication |
| **Logo — header/footer exports** | SVGs + 468 × 355 WebP fallback | Test at 44/52/56 px; raster only where SVG is not accepted | Build | Use SVG; do not upscale the raster |
| **Photography — hero** | Nothing | 1 dusk wide (≥2400 px) + 4:5 mobile crop + 16:9 OG crop | Commissioned photographer; owner arranges access | Licence + site authorization + text-overlay test |
| **Photography — sections** | Nothing | 4–6 frames: intro, one per service, one detail | Photographer / owner archive | Licence; releases for any person |
| **Photography — réalisations** | Nothing | 0–5 approved site photos; optional | Owner, with client permission | Written client permission; fallback `Références sur demande` |
| **Photography — careers** | Nothing | 0–2 team/site frames; optional | Photographer | Model releases |
| **Service icons** | Nothing | 4 custom line icons, 24 px | Design/build | — |
| **Utility icons** | Hugeicons installed | 8 glyphs, matched stroke | Build | Verify licence; prefer inline SVG |
| **Favicon / app icon** | Default Next.js icon | 16/32/48/180/512, tested with the badge crop | Build + designer | Vector source; no mush at 16 px |
| **Open Graph image** | Nothing | 1200×630 template, typographic or photo | Build | Photo licence if used |
| **Page copy** | Approved facts + sample prototype copy | Final French copy for all launch pages | Build; owner approves | Must follow the facts register; no gated claims |
| **ONEE agrément block** | Evidence on the ONEE list; certificate pending | Certificate scan and exact scope/dates | Owner | Publish only after the certificate is filed |
| **Image-rights register** | Nothing | Licence, model releases, site authorizations, client permissions | Owner + legal review | Before any photo is published |
| **Phone / recruitment email / social** | None | Omit; add only if confirmed | Owner | Gated by the facts register |
| **DNS / hosting** | Domain; broken delegation | Fix delegation; deploy target | [#7](https://github.com/mustaphaelou/hay2010website/issues/7), [#15](https://github.com/mustaphaelou/hay2010website/issues/15) | Launch |

### 3.3 Who does what

- **Owner:** sends the logo source file and confirms ownership; approves the vector redraw and whether `.Sarl` stays in the web badge; approves the accent alignment; books/authorises the photo shoot; supplies the ONEE certificate; approves final copy.
- **Brand designer/illustrator:** vector redraw of the supplied badge, one-colour stencil, favicon reduction, social avatar; no redesign unless separately briefed.
- **Design/build:** page templates and tokens; logo exports and integration; photo brief and art direction; retouching direction; implementation and accessibility checks.
- **Photographer:** shoot, colour-grade, deliver RAW + web crops, licence and releases.
- **Legal review:** release and licence wording; image rights under loi 09-08; site authorisation for infrastructure. Not legal advice — route through [#10](https://github.com/mustaphaelou/hay2010website/issues/10).
- **Hosting:** image optimisation and CDN per [#7](https://github.com/mustaphaelou/hay2010website/issues/7).

---

## 4. Placeholder-only — never publish as-is

| Item | Why | Replace with |
|---|---|---|
| The 500 px source raster used above 52 px | It is the reference, not the master; compressed | The SVG master; raster only as a fallback at ≤52 px |
| The traced curves used for print without review | Faithful at web sizes, not print-approved | Designer review/cleanup before print or large format |
| The prototype dusk scene (`HeroScene` SVG) | It is a drawn placeholder, not a photograph | Licensed/owned hero photograph, or the typographic hero fallback |
| The gradient “photo” block in the specimen | Same | A real image or no image |
| Prototype copy (hero subline, section text) | Sample copy, not reviewed against the register | Approved French copy |
| “Un portefeuille à documenter” block | Internal placeholder | `Références sur demande.` or approved case studies |
| Every image currently on `hay2010.ma` | Porto Construction demo assets; rights not established for HAY2010 | New photography or nothing |
| The Porto `ct-logo*.png` | Third-party demo logo | The supplied HAY2010 badge |
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

1. **Now:** owner sends the logo source file (AI/SVG/EPS/PDF) if it exists; confirms ownership; approves the vector redraw, the `.Sarl` decision and the orange accent.
2. **Week 1:** review and approve the traced vector; produce favicon/app icons; request photo quotes and site authorisations (lead time is the risk).
3. **Week 1–2:** build the tokens and components; start [#13](https://github.com/mustaphaelou/hay2010website/issues/13) with the typographic hero fallback.
4. **Week 2–3:** shoot; selects and grade; test text overlay on desktop and mobile.
5. **Week 3–4:** integrate images; write final copy against the facts register; accessibility and performance QA.
6. **Launch:** only when the gates below pass and [#15](https://github.com/mustaphaelou/hay2010website/issues/15) has fixed the DNS.

**Launch gates**

- [ ] Logo ownership confirmed in writing; vector master and variants delivered; no Porto asset remains in the repo or the site.
- [ ] Favicon tested at 16 px; no unreadable badge.
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
| [#13](https://github.com/mustaphaelou/hay2010website/issues/13) homepage prototype | Direction A tokens, 52 px badge in the header, section rhythm, hero fallback, pill/button rules |
| [#5](https://github.com/mustaphaelou/hay2010website/issues/5) content model | Asset fields: image, alt, caption, credit, rights status, focal point, gate; logo source/derivatives |
| [#6](https://github.com/mustaphaelou/hay2010website/issues/6) réalisations | Photography only with permissions; otherwise `Références sur demande` |
| [#10](https://github.com/mustaphaelou/hay2010website/issues/10) legal | Image rights and release wording; logo ownership; photo credits not required on page |
| [#11](https://github.com/mustaphaelou/hay2010website/issues/11) SEO | OG template, favicon, alt text; do not add `logo` to JSON-LD until ownership is confirmed |
| [#7](https://github.com/mustaphaelou/hay2010website/issues/7) hosting | Image sizes, formats, CDN/cache policy |
| [#15](https://github.com/mustaphaelou/hay2010website/issues/15) DNS | Canonical URL; keep MX records |

---

## 8. Owner actions

1. **Send a higher-resolution original if one exists** — the supplied 500 px file is the reference; otherwise the traced SVG v1 is the working master. Confirm in writing that SOCIETE HAY 2010 owns the artwork; if the designer still holds rights, get an assignment or a broad licence.
2. **Approve the traced vector v1** (or ask for a designer cleanup) and decide whether `.Sarl` stays in the web badge (recommended: keep for v1).
3. **Approve the orange accent** `#E97425`, aligned to the logo. The earlier amber `#F2A33C` is retired; if you prefer it, it is a one-token change, but the logo's orange is the brand's actual orange.
4. **Approve the photo brief and budget**, and nominate the sites; authorisations take longer than the shoot.
5. **Send the ONEE certificate** so the agrément block can be prepared and gated.
6. **Confirm the contact position**: email only, no phone, no social, no recruitment mailbox.
7. **Approve the final French copy** against the facts register.

**Open question:** keep the supplied badge exactly as it is (including `2010.Sarl`), or produce a web-only reduction without `.Sarl` for small sizes? Recommendation: keep the supplied mark for v1; revisit only if the fine text proves illegible at 44–52 px on real screens.

---

## 9. Prototype provenance

- All three directions: branch `prototype/brand-direction`, `app/prototype/brand` (`?variant=a|b|c`), plus `docs/brand/assets/` screenshots.
- The winning direction is A. B and C remain on the branch as rejected alternatives and as evidence of the comparison.
- The prototype was first built with a proposed “two poles/cable/light” mark. After the owner supplied the real badge, the prototype header/footer/specimen were updated to the badge (52 px header, paper chip footer, one-colour specimen). The proposed mark is withdrawn.
- The supplied source is `docs/brand/assets/hay2010-logo-source.webp`; the vector v1 (full-colour, white, ink) was traced from it with VTracer on 2026-11-08. Web exports are in `public/brand/`, documented in `public/brand/README.md`.
- The prototype is throwaway: no tests, no persistence, no production copy. `main` keeps the decision, the source logo, the exports and the screenshots — not the prototype route.

---

## 10. Amendment log

| Date | Change | Reason |
|---|---|---|
| 2026-11-08 | Direction A chosen; proposed logo mark specified | Ticket #4 |
| 2026-11-08 | Supplied HAY2010 badge replaces the proposed mark; accent changes from amber `#F2A33C` to logo orange `#E97425`; logo production (vector/variants/ownership) added to the asset plan | Owner supplied the existing logo after the decision |
| 2026-11-08 | Vector v1 traced from the supplied raster (full-colour, white, ink); plan updated from “vector needed” to “review/approve the trace” | Owner has only the 500 px image; no source vector exists |
