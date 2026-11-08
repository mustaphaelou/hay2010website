# Choose the brand direction and asset plan

Type: prototype
Status: resolved
Blocked by: none

## Question

What should HAY2010 look and feel like, and which assets exist versus need creating?

The only current visual is the Porto construction template at hay2010.ma — orange accent, generic stock imagery, Porto logo — not a brand. The reference architecture is lamalif's restrained corporate look: monochrome palette, Poppins, full-bleed photography, thin rules, pill CTAs.

Produce two or three concrete directions to react to (moodboard, type/colour specimen, or a rough hero + section mock), covering:

- **Logo:** use an existing HAY2010 logo if one exists, or design a simple wordmark/monogram.
- **Palette:** stay close to lamalif's monochrome system, keep the current orange as a single accent, or propose an electrical/energy palette.
- **Typography:** Poppins as the lamalif baseline, or an alternative pairing.
- **Imagery:** client photos, licensed stock, generated imagery, diagrams or abstract/CGI treatments; specify what must be sourced.
- **Iconography and motion:** line icons vs filled, subtle fade/Ken Burns vs static.

The answer is a chosen direction plus an asset checklist: what we have, what we need, who provides it, and what is placeholder-only.

## Answer

Resolved 2026-11-08 with the owner. Three directions were built on one switchable prototype route (A — Lumière, B — Le Plan, C — Réseau); the owner chose **A — Lumière** and then supplied the existing HAY2010 logo. The full system and asset plan are in [`docs/brand/brand-direction.md`](../../../docs/brand/brand-direction.md).

### Chosen direction

- **Name:** A — Lumière. Editorial monochrome, warm orange accent, Poppins, full-bleed documentary photography, thin rules, pill CTAs — the lamalif register, made specific to public lighting.
- **Logo:** the owner-supplied HAY2010 badge — blue building silhouette, orange arc, red point, white `HAY` / `2010.Sarl` (500 × 500 transparent WebP; artwork 448 × 335; blue `#3E4D9C`, orange `#E97425`, red `#DE212E`). It replaces the proposed “two supports and a cable” mark. Header uses the badge at 52 px; footer uses it on a paper chip or as a one-colour white stencil. **Vector v1** was traced from the supplied raster (full-colour, white and ink SVGs in `public/brand/`); it is production-usable for web after a designer review, not print-approved yet.
- **Palette:** ink `#111217`, paper `#F7F6F1`, body `#5E6067`, line `#DEDDD5`, orange `#E97425`, copper text `#9A5A15`. Orange is aligned to the logo; it is a surface, never text on paper (2.78:1). Copper is the text-safe accent. The logo's blue and red are logo-only. Light theme only.
- **Type:** Poppins 300/400/500/600, self-hosted. Display 42–92 px at 300, labels 10.5 px at 0.2 em uppercase. The badge lettering is part of the supplied artwork; do not recreate it.
- **Imagery:** warm-monochrome documentary photography of real sites. No stock, no Porto assets, no people or client marks without written permission. If the hero photo is not ready, launch on a typographic hero — never stock.
- **Icons:** four custom 1.4 px line icons (lamp, network, transformer, panel) plus eight utility glyphs. No filled set, no icon font.
- **Motion:** one 22 s Ken Burns on the hero, 700 ms text fade; no parallax; disabled under `prefers-reduced-motion`.

### Asset checklist (summary)

- **Have:** confirmed company facts, address and email; page tree; domain; Next.js repo; Poppins licence (OFL); the supplied logo source raster; vector v1 (full-colour, white, ink) and a raster fallback in `public/brand/`; this direction and its tokens.
- **Need:** designer review/approval of the traced vector, favicon/app icon and social avatar, with written ownership; hero + section photography with licences; four service icons; OG template; approved French copy; ONEE certificate (gated); image-rights register.
- **Who:** the owner sends a higher-resolution original if one exists, confirms ownership, approves the traced vector and supplies the certificate, legacy assets and site access; a brand designer/illustrator reviews and cleans the vector and draws the final variants; design/build produces the templates, icons, exports and photo art direction; a commissioned Moroccan industrial/architectural photographer shoots the sites; legal review covers licences, model releases and site authorisations.
- **Placeholder-only:** the 500 px source raster above 52 px (the SVG is the master), the traced curves used for print without review, the prototype's SVG dusk scene, the gradient photo block, sample copy, the “portefeuille à documenter” block, every current `hay2010.ma` image and the Porto logo. Staging may tag them “visuel provisoire”; production may not.

### Critical path and gates

Photography is the critical path, not polish. The plan is a two-visit shoot at 2–3 authorised sites (dusk + daylight), 8–10 frames, 2400 px, RAW + web crops, with model releases and site authorisations. Launch only when: the traced logo vector is approved and ownership confirmed; every published photo is licensed; no client name/logo appears without permission; the ONEE certificate is filed; no placeholder or stock image remains; and forms stay disabled until CNDP ([#14](https://github.com/mustaphaelou/hay2010website/issues/14)).

### Prototype

The three variants live on branch `prototype/brand-direction` (route `/prototype/brand?variant=a|b|c`, files in `app/prototype/brand`); the same screenshots are in [`docs/brand/assets/`](../../../docs/brand/assets/). The prototype header/footer/specimen were updated to the supplied badge. `main` keeps only the decision and the source assets, not the prototype route.

### Amendment — vector v1

No source vector exists; the owner only has the 500 px image. A vector v1 was traced from it on 2026-11-08 (`public/brand/hay2010-logo.svg`, `-white.svg`, `-ink.svg`) and verified at 468 px, 52 px and 32 px. It replaces the raster for web use. A designer review is still required before print or large-format use; the raster remains the reference.
