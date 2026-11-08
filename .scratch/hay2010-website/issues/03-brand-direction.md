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

Resolved 2026-11-08 with the owner. Three directions were built on one switchable prototype route (A — Lumière, B — Le Plan, C — Réseau); the owner chose **A — Lumière**. The full system and asset plan are in [`docs/brand/brand-direction.md`](../../../docs/brand/brand-direction.md).

### Chosen direction

- **Name:** A — Lumière. Editorial monochrome, warm amber accent, Poppins, full-bleed documentary photography, thin rules, pill CTAs — the lamalif register, made specific to public lighting.
- **Logo:** two supports, a sagging cable, one amber light point; wordmark `HAY2010` in Poppins 600. No existing HAY2010 logo was found — the current site uses the Porto Construction demo logo, which must not be reused.
- **Palette:** ink `#111217`, paper `#F7F6F1`, body `#5E6067`, line `#DEDDD5`, amber `#F2A33C`, copper text `#9A5A15`. Amber is a surface, never small text; copper is the text-safe accent. Light theme only.
- **Type:** Poppins 300/400/500/600, self-hosted. Display 42–92 px at 300, labels 10.5 px at 0.2 em uppercase.
- **Imagery:** warm-monochrome documentary photography of real sites. No stock, no Porto assets, no people or client marks without written permission. If the hero photo is not ready, launch on a typographic hero — never stock.
- **Icons:** four custom 1.4 px line icons (lamp, network, transformer, panel) plus eight utility glyphs. No filled set, no icon font.
- **Motion:** one 22 s Ken Burns on the hero, 700 ms text fade; no parallax; disabled under `prefers-reduced-motion`.

### Asset checklist (summary)

- **Have:** confirmed company facts, address and email; page tree; domain; Next.js repo; Poppins licence (OFL); this direction and its tokens.
- **Need:** final logo files and written ownership; hero + section photography with licences; four service icons; favicon/app icon and OG template; approved French copy; ONEE certificate (gated); image-rights register.
- **Who:** owner approves the logo and supplies the certificate, legacy assets and site access; design/build produces the logo, icons, templates and photo art direction; a commissioned Moroccan industrial/architectural photographer shoots the sites; legal review covers licences, model releases and site authorisations.
- **Placeholder-only:** the prototype's SVG dusk scene, the gradient photo block, the prototype logo, sample copy, the "portefeuille à documenter" block, every current `hay2010.ma` image and the Porto logo. Staging may tag them "visuel provisoire"; production may not.

### Critical path and gates

Photography is the critical path, not polish. The plan is a two-visit shoot at 2–3 authorised sites (dusk + daylight), 8–10 frames, 2400 px, RAW + web crops, with model releases and site authorisations. Launch only when: the logo ownership is assigned; every published photo is licensed; no client name/logo appears without permission; the ONEE certificate is filed; no placeholder or stock image remains; and forms stay disabled until CNDP ([#14](https://github.com/mustaphaelou/hay2010website/issues/14)).

### Prototype

The three variants live on branch `prototype/brand-direction` (route `app/prototype/brand?variant=a|b|c`); the same screenshots are in [`docs/brand/assets/`](../../../docs/brand/assets/). `main` keeps only the decision, not the prototype route.
