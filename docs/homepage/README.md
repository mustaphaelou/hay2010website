# HAY2010 — homepage prototype (#13)

**Status:** prototype produced 2026-11-09 — ticket [#13](https://github.com/mustaphaelou/hay2010website/issues/13).
**Branch:** `prototype/homepage` (throwaway; not merged to `main`).
**Route:** `/prototype/homepage?variant=a|b|c` — floating bar, `←`/`→` to cycle.
**Screenshots:** [`assets/`](assets/) — desktop 1440 px and mobile 390 px, one per variant.
**Question:** what should the HAY2010 homepage look like, section by section?

The prototype is a discussion artifact. It does not contain production code, tests or persistence, and it is not linked from the public navigation. It exists so the owner can point at a section and say “this one”.

---

## 1. How to run it

```bash
npm run dev
# → http://localhost:3000/prototype/homepage?variant=a
```

`?variant=` accepts `a`, `b` or `c` (default `a`); the bar is hidden when the build sets
`NEXT_PUBLIC_PROTOTYPE_BAR=off`. The bar is a judging aid, never part of the design.

Everything lives in `app/prototype/homepage/`:

| File               | What it holds                                                            |
| ------------------ | ------------------------------------------------------------------------ |
| `page.tsx`         | variant switch + prototype banner                                        |
| `layout.tsx`       | Poppins, the page shell, reduced-motion guards                           |
| `homepage-data.ts` | copy and service data (approved lines flagged, sample copy flagged)      |
| `components.tsx`   | prototype header (sticky, mobile drawer), footer, buttons, section label |
| `scenes.tsx`       | drawn stand-ins for photography and the visible “visuel provisoire” tag  |
| `icons.tsx`        | the four service icons from the brand work                               |
| `variant-a.tsx`    | A — Éditorial                                                            |
| `variant-b.tsx`    | B — Preuve                                                               |
| `variant-c.tsx`    | C — Chantier                                                             |
| `switcher.tsx`     | the floating variant bar                                                 |

## 2. The three variants

All three follow the section order decided in [#2](https://github.com/mustaphaelou/hay2010website/issues/2):
hero → “Qui sommes-nous” → Nos Métiers → Réalisations → Carrières → contact CTA → footer.
They differ in **structure and hierarchy**, not colour.

|                    | A — Éditorial                                        | B — Preuve                                                    | C — Chantier                                                |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| Hero               | full-bleed dusk scene, copy over it, Ken Burns 22 s  | typographic ink hero, no image, credentials rail on the right | image above the headline, text in the column below          |
| Intro              | 12-column split, oversized approved positioning line | same grid, no image                                           | full-width image band, then positioning line + text columns |
| Métiers            | four icon columns on ink                             | ruled list, one row per service                               | stacked rows, one framed image per service                  |
| Réalisations       | split block, left copy + right “R.” panel            | centred statement on ink                                      | centred panel on paper                                      |
| Carrières          | split, image on the right                            | split, no image                                               | ink band, email right-aligned                               |
| Contact            | orange band, ink text, pill right                    | ink band, centred                                             | paper, centred                                              |
| Photography needed | 1 hero + 2–3 frames                                  | **none**                                                      | 1 hero + 1 band + 4 service frames                          |

## 3. What the prototype established

### 3.1 Structure and rhythm

- **The decided order works as-is.** It reads as a sequence, not a stack of banners: hero → proof of identity → offer → proof of work → secondary audience → conversion → footer.
- **Section labels (`01 — …`) earn their place.** They give the long page a spine and survive the ink/paper alternation. Keep them, at `10.5 px / 0.2em / 600`, copper on paper and orange on ink.
- **A is the cheapest variant that still matches direction A**: one hero, one careers frame, optional intro image. C needs roughly nine licensed images and puts the whole page behind the photography critical path; B needs none but is a different register than the chosen direction.
- **Recommended skeleton for the build: A**, with two borrowings:
  - C's **stacked, image-first reading on mobile** is the strongest small-screen composition; A's overlay hero is still fine (the copy sits over the dark part of the gradient), but the 4:5 crop is non-negotiable.
  - B's **credentials rail is useful but gated**: the ONEE line can only appear after both certificates are filed ([#3](https://github.com/mustaphaelou/hay2010website/issues/3), facts register §2.2). Until then the rail collapses to “Plus de 10 ans d'expérience · Rabat — Maroc”.
- **Drop the “R.” monogram.** It was a device to give the references teaser a graphic anchor; it proves nothing and introduces a letterform that is not in the brand system. Prefer the plain `Références sur demande.` statement with the four service rows (A) or centred (B).
- **The orange contact band is the strongest moment on the page** and is the only large accent surface. It obeys the rule “ink on orange, never white” (ink on `#E97425` = 6.23:1). The white pill must carry ink text, not white text.

### 3.2 Header, footer and components

- **Header:** solid white, sticky, 76 px, 52 px badge, six items from 1024 px, CTA far right. Five items at launch (`Médias` hidden) leaves comfortable room; the row still fits six. No transparent-over-hero variant is needed.
- **Mobile drawer:** full-screen overlay, logo + close, `Accueil` first, then the nav, CTA and `Rabat — Maroc · contact@hay2010.ma` at the bottom. Focus trap, `Escape`, body scroll lock and focus return all behave. The drawer is white even over the dark hero — correct, it never blends.
- **Footer:** four columns fit without a phone number, a recruitment address, social icons or a newsletter. **Use the paper-chip badge**, not the white stencil: at 52 px the stencil's `2010.Sarl` is effectively illegible on ink. If the stencil is wanted, it must be larger or drop the legal form — an owner decision, not a code tweak.
- **Buttons:** ink pill → orange on hover (ink text), outline pill, underlined text link with an arrow. They are visually distinct without shadows, as the brand rules require.
- **Mobile CTA band:** the pill must be `self-start` in the stacked layout; left to the default flex stretch it becomes full-width and reads as a form button. This is now fixed in A.

### 3.3 Accessibility and motion (measured constraints, not yet a QA pass)

- Text contrast: white on ink, ink on paper, `#5E6067` body on paper (5.8:1), copper labels on paper (5.04:1), orange labels on ink (≈5.6:1). Orange is never body text on paper.
- Labels are decorative only; the body copy always states the same thing in words (WCAG 1.4.1).
- Ken Burns (22 s) and the 700 ms rise are disabled under `prefers-reduced-motion: reduce`; content is visible immediately.
- Focus: 2 px ring with offset on interactive elements; the skip link is the first tab stop.
- No layout shift from images: every media block has a fixed aspect ratio.
- The two `next/image` uses are the logo; all photography stand-ins are SVG, so this prototype says nothing about LCP. The real hero must be measured once a licensed 2400 px frame exists.

### 3.4 Copy

- **Approved and used as-is:** the positioning line, “Plus de 10 ans d'expérience”, the four service names and their anchors, `Références sur demande`, `contact@hay2010.ma`, `Rabat — Maroc`, the address in the footer, the legal line `© 2026 SOCIETE HAY 2010 — Tous droits réservés`, and `Gérant : Rahhal Essamlali` (not used on the homepage — it belongs to L'Entreprise).
- **Sample copy awaiting approval:** the hero headline “La lumière, comme infrastructure.”, the hero subline, the four service descriptions, “Quatre métiers, une même exigence.”, the references sentence, the careers sentence and the contact question. The prototype proves they fit; it does not approve them.
- **Careers** must not invite CVs or use `recrutement@` before [#14](https://github.com/mustaphaelou/hay2010website/issues/14) covers F-113, and there is no application form, no CV upload and no “Postuler” button ([#12](https://github.com/mustaphaelou/hay2010website/issues/12)).
- French typesetting applied: typographic apostrophes, non-breaking space before `?`.

### 3.5 Imagery

The drawn scenes are placeholders and are tagged `VISUEL PROVISOIRE`. They exist so the owner judges scale, crop and rhythm without waiting for the shoot, and they must never ship. The hero brief is unchanged: 16:9 ≥ 2400 px with dark negative space on the copy side, plus a 4:5 mobile crop; if no frame is licensed, ship the typographic hero (B's opening) rather than a stand-in.

## 4. What was not prototyped

- The inner pages, the contact form (optional after F-211, and not required at launch), the careers page and the Médias group.
- The CMS wiring (Payload fields, media rights status). The prototype assumes the content model in [#5](https://github.com/mustaphaelou/hay2010website/issues/5).
- Real photography, video and the ONEE agrément block.
- Analytics and consent — none at launch, so no banner and nothing to prototype.

## 5. Next step

Owner reviews A/B/C against the screenshots or the running route, marks the sections to keep, then:

1. Fold the chosen structure into `app/page.tsx` as real components (`Hero`, `IntroSplit`, `ServicesBand`, `ReferencesTeaser`, `CareersTeaser`, `ContactCta`) with the nav data module.
2. Rewrite the prototype copy against the facts register and get it approved.
3. Keep the losing variants and the switcher on `prototype/homepage` only; `main` keeps the decision and these screenshots.
