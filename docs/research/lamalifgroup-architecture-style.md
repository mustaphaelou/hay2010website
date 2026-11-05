# Rebuild spec — lamalifgroup.ma (technical architecture & visual style)

Reference document for recreating https://lamalifgroup.ma/ in a modern stack (Next.js + Tailwind).
Everything below is backed by the site's own HTML/CSS, fetched live in Nov 2026, plus a full saved HTML dump of the homepage: `.../opencode/tool-output/tool_1a7cb10e0001ilE5VO7agRhAEN` [1] ("homepage dump").
Site: **Lamalif Group** — Moroccan urban lighting / street-furniture group, tagline **“De la ville à la vie”** [1]. Document language `fr-FR` [1]; homepage JSON-LD: `datePublished 2017-07-04T06:18:50+00:00`, `dateModified 2021-04-15T09:40:34+00:00` [1] (some inner pages were edited as late as Sept 2024 — see §3).

## 1. Overview

- Corporate site (no e-commerce, no blog loop beyond “Actualités” page) built with **WordPress + the “Doyle” theme (by Bearsthemes, v1.5)** + **WPBakery Page Builder (js_composer 6.0.2)** + **Slider Revolution 5.4.8.3** [1][3][4].
- “…/doyle/” theme folder, `bt-` CSS/element class prefix throughout (`bt-header-v1`, `bt-footer-v1`, `bt-fancy-box-element`, `bt-btn`, …) [1][4]. Theme credits read directly from the theme's `style.css`: `Theme Name: Doyle, Version: 1.5, Author: bearsthemes` [3]. The homepage's video-hero slide still references the demo asset URL `theme.bearsthemes.com/wordpress/doyle/...` — the RevSlider was imported from the theme demo [1].
- Homepage is a `page-nocontainer` (full-bleed) WPBakery template: full-width hero → “Qui sommes-nous ?” split section → “Nos métiers” icon row on a gray band → YouTube-background video hero → footer [1].
- Site-wide constant chrome for every fetched page: white sticky header `bt-header-v1`, identical WordPress menu, dark footer `bt-footer-v1`, Sendinblue (Brevo) newsletter iframe, cookie banner, back-to-top button [1][7–18].

## 2. Technical architecture

### 2.1 Stack inventory

| Layer | Observed value | Evidence |
|---|---|---|
| CMS | WordPress, `generator` meta reports **“WordPress 5.2.30”** | [1] |
| WordPress version reality | **5.2.30 is a real release (Oct 28, 2026)** of the old 5.2 branch — the site is pinned to the legacy 5.2 major branch but kept fully security-backported | [1][21] |
| Theme | **Doyle** by Bearsthemes, v1.5, folder `/wp-content/themes/doyle/`, GNU GPL v2+ | [1][3] |
| Page builder | **WPBakery Page Builder (js_composer) 6.0.2** — `meta generator “Powered by WPBakery Page Builder”`, `wpb-js-composer js-comp-ver-6.0.2 vc_responsive` body classes, `vc_row/vc_section/vc_custom_*` markup | [1][7–18] |
| Slider | **Slider Revolution 5.4.8.3** (2 sliders on homepage; 1 banner slider on inner pages) | [1][10][15][16] |
| Gallery/grid on content | **Filter Gallery plugin (pfg- / filtr- classes)** renders the 39-card references grid on `/nos-realisations/` | [10] |
| Gallery plugins loaded but rendering nothing found in fetched pages | **Essential Grid 2.3.2**, **Total Soft Portfolio (`gallery-portfolio` folder)**, **portfolio-wp (`crp-` prefix, includes owl-carousel + lightgallery + its own buttons CSS)** — all enqueued on every page | [1] |
| Portfolio/theme aux JS | Bootstrap 3.3.7 CSS+JS, FontAwesome, flaticon iconfont, animate.min.css (VC), vc-waypoints, NiceScrollBar, html5lightbox, backtop | [1][4][6] |
| SEO | **All in One SEO Pack 3.3.5** (canonical, JSON-LD `aioseop-schema` on all pages, og from description), `google-site-verification` meta | [1][7] |
| Analytics | **ExactMetrics 7.10.0** dual-tracker GA **UA-186092780-2** (+ events config); **MonsterInsights 7.11.0 loaded but explicitly unconfigured (“No UA code set”)**; **Metricool** `beTracker` script (hash `5fd9703263e809ae9a50f224076fcc3f`) at end of body | [1] |
| Newsletter / forms | Footer subscribe = **Brevo (Sendinblue) embedded form**: `widget_sib_subscribe_form` shell `sib_signup_form_1` + `<iframe src="https://22eed49b.sibforms.com/serve/...">`; `mailin` plugin JS `mailin-front.js` (front object + nonce). Contact form = **Forminator** (REST namespace `forminator/v1`, massive `forminator` inline config on the page). A `Newsletter` plugin 8.7.5 stylesheet is also enqueued (unused as far as observed) | [1][14][19] |
| Cookies | **Cookie Notice plugin v2.0.4**: bar `#cookie-notice`, bottom position, fade, appears after 100 px scroll, cookie `cookie_notice_accepted` 2 592 000 s (30 days). Bar bg `rgba(50,50,58,1)`, copy “Nous utilisons des cookies pour vous garantir la meilleure expérience sur notre site web. …”, buttons “OK” / “Politique de confidentialité” | [1] |
| jQuery stack | jQuery 1.12.4-wp + jquery-migrate 1.4.1 + jQuery UI core 1.11.4; webfont.js 1.5.3 (Google Fonts loader) | [1] |
| Fonts loader | `WebFontConfig.google = Poppins:400,600; Montserrat; Noto Serif:400; Lato:400` (Essential Grid additionally loads Open Sans 300–800, Raleway 100–900, Droid Serif, Poppins 400/500/600; RevSlider loads Open Sans 700/600 + Roboto 500) | [1] |
| Hosting/CDN clues | `data-cfasync="false"` attributes (Cloudflare-boilerplate minorities) only; no other CDN fingerprint found ⚠️ (no hard evidence either way) | [1] |
| Portfolio breadcrumb | Theme has a `bt-titlebar/breadcrumb` system in CSS [4] but pages use a **fullwidth Revolution Slider banner image as the page title** instead (e.g. `médiathèque.png` on /mediatheque/) [15] | |

### 2.2 URL structure (all actually observed)

Flat root-level slugs — no `/category/`, no `/blog/`, no language prefixes:

```
/                                    (homepage, page-id-657)
/about-us-02/                        (Le Groupe → “Lamalif Group en Bref”)
/mot-du-president/
/chiffres-cles/
/visions-et-strategie/
/valeurs/
/nos-realisations/                   (= “Nos Références”)
/nos-certifications/                 (linked in menu, not fetched)
/nos-filiales/
/espace-carrieres/
/mediatheque/
/actualite/
/lamalif-le-mag/
/lanews/                             (linked in menu, not fetched)
/concoursmadinaty/                   (linked in menu, not fetched)
/madinaty2021/                       (linked in menu, not fetched)
/madinaty2022                        (menu item uses plain http:// and no trailing slash — legacy quirk)
/sip22/                              (STARS IN THE PLACE)
/contact-us-03/
/mentions-legales-conditions-generales/   (footer “Conditions Générales” + cookie banner link)
/plan-de-site/                        (footer “Plan du site”)
/feed/ , /comments/feed/              (RSS advertised in <head>)
/?s=                                  (search form posts to home: action="/")
```

All menu/footer URLs above are quoted verbatim from the rendered menus [1][7][10][14]; pages marked “not fetched” were not visited — do not assume their layout. Retrieved-page URLs share the same root-level pattern (verified for the 12 fetched pages) [7–18].

### 2.3 API / endpoints status

| Endpoint | Result |
|---|---|
| `GET /wp-json/` | **HTTP 200** — REST API fully open; namespaces: `oembed/1.0`, `mailin/v1`, `exactmetrics/v1`, `forminator/v1`, `wp/v2`; site name “Lamalif Group”, description “De la ville à la vie” [19] |
| `GET /xmlrpc.php` | HTTP 405 “XML-RPC server accepts POST requests only.” — endpoint **exists/enabled** (pingback/RSD link `?rsd` also advertised in `<head>`) [1][20] |
| oEmbed | `/wp-json/oembed/1.0/embed?url=...` link advertised in `<head>` [1] |

→ Practical implication: a content migration can pull every page/post programmatically via `wp/v2` REST [19].

## 3. Information architecture

### 3.1 Main navigation (exact French labels, menu `menu-x1`)

Rendered identically on homepage and every fetched inner page [1][7–18]:

| Level 1 | → URL | Level 2 |
|---|---|---|
| Accueil | `/` | — |
| Le Groupe | `/about-us-02/` | Mot du président → `/mot-du-president/`<br>Lamalif Group en bref → `/about-us-02/` (same page as parent)<br>Nos chiffres clés → `/chiffres-cles/`<br>Vision & mission → `/visions-et-strategie/`<br>Nos valeurs → `/valeurs/` |
| Nos Réalisations | `/nos-realisations/` | Nos Références → `/nos-realisations/`<br>Nos Certifications → `/nos-certifications/` |
| Espace Carrière | `/espace-carrieres/` | — |
| Medias | `/mediatheque/` | Actualités → `/actualite/`<br>Médiathèques → `/mediatheque/`<br>Lamalif Le Mag’ → `/lamalif-le-mag/`<br>Lamalif La News → `/lanews/` |
| Concours Madinaty | `/concoursmadinaty/` | Présentation du concours → `/concoursmadinaty/`<br>1ère Édition 2021 → `/madinaty2021/`<br>2ème édition 2022 → `http://lamalifgroup.ma/madinaty2022` |
| STARS IN THE PLACE | `/sip22/` | 4ème édition 2022 → `/sip22/` |
| Contact | `/contact-us-03/` | — |

Header right side: mini-search widget (`fa fa-search` toggle → standard WP search form, placeholder “Recherche…”). Mobile: logo 30 px + search + burger (`bt-menu-toggle`); mobile menu is the same list, rendered in a `bt-menu-mobile-wrap` panel [1].

### 3.2 Footer (`bt-footer-v1`, identical on all fetched pages) [1]

Row of 4 widget columns (grid `col-sm-8 → lg-3`, `lg-2`, `lg-2`, `lg-5`):

1. **Brand column** — footer logo image (`logo-15456.png`, 192×45), descriptor “Depuis plus de 20 ans, Lamalif Group contribue à l’esthétique des villes et des territoires au Maroc.”, contact list with FontAwesome icons:
   - `Km 17, Route de Casablanca` (fa-map-marker)
   - `+212 5 24 34 46 69` (fa-phone)
   - `contact@lamalif.ma` (fa-paper-plane-o)
2. **“Le Groupe”** — link list mirroring the 5 Groupe menu entries.
3. **“Nos filiales”** — “Lamalif”, “Lamalif immobilier” → both `/nos-filiales/`.
4. **“Abonnez vous à notre Newsletter”** — Brevo embedded iframe form (540×100).

Footer bottom bar: “**Copyright 2021 Lamalif Group. Tous les droits réservés.**” + right-aligned mini-menu: “Conditions Générales” → `/mentions-legales-conditions-generales/`, “Plan du site” → `/plan-de-site/` [1]. A raw, **unrendered `[smbtoolbar]` shortcode** sits inside a custom-HTML widget (its plugin is missing/inactive) ⚠️ [1].

### 3.3 Page inventory (fetched pages)

| URL | JSON-LD page name | Key sections/headings verbatim | Modified |
|---|---|---|---|
| `/` | “Acceuil” *(sic — misspelling in source)* [1] | RevSlider hero (“De la ville à la vie”, “EN SAVOIR PLUS”); h3 “QUI SOMMES-NOUS ?”; h3 “NOS MÉTIERS” + 3 icon boxes; YouTube-bg video hero | 2021-04-15 [1] |
| `/about-us-02/` | Lamalif Group en Bref [7] | h2 “UN GROUPE QUI DIVERSIFIE SES ACTIVITÉS”, “UN GROUPE EN PLEIN DEVELOPPEMENT”; h3 “LAMALIF GROUP EN BREF”, “Un actionnariat stable”, “Une culture d'entreprise forte”, “Une structure financière solide”, “Une présence sur des marchés pérennes”; h4 “L'INNOVATION COMME MOTEUR”, “NOTRE HISTOIRE” | 2021-04-15 [7] |
| `/mot-du-president/` | Mot de Moulay Lakbir Ismaili [8] | h3 “MOT DE MOULAY LAKBIR ALAOUI ISMAILI”, “Moulay Lakbir Alaoui Ismaili” + 6 h4 lead paragraphs | 2021-04-12 [8] |
| `/chiffres-cles/` | Nos Chiffres Clés [9] | h3 “NOS CHIFFRES CLÉS”; rest = WPBakery image/number rows (no textual headings beyond title) | **2024-09-10** [9] |
| `/nos-realisations/` | Nos Réalisations [10] | h3 “NOS RÉFÉRENCES”; 39-card filterable gallery: “RABAT – AVENUE ANNASR – Maroc”, “RABAT – ROUTE CÔTIÈRE – Maroc”, “TANGER – BOULEVARD MOHAMMED VI – Maroc”, city groups “Rabat” / “Marrakech”, etc. (≈ 25 distinct titles in list) | **2024-09-09** [10] |
| `/nos-filiales/` | Nos Filiales [11] | h3 “NOS FILIALES” | 2021-04-12 [11] |
| `/espace-carrieres/` | Espace Carrières [12] | h1 “L’humain au cœur de notre vision”; h3 “ESPACE CARRIÈRES”, “NOUS REJOINDRE” (+ a closing content element rendered inside a `<footer id="main-footer">`) | 2021-04-15 [12] |
| `/actualite/` | Actualites [13] | h3 “ACTUALITÉS” + news list h3s, e.g. “Fondation Lamalif : Programme des classes d’innovation dans les écoles publiques”, “Lamalif annonce les lauréats de «Madinaty Smart City»”, “Eclairage et mobilier urbain : Lamalif Group cértifié…” | 2021-04-15 [13] |
| `/contact-us-03/` | Contactez nous [14] | h3 “CONTACTEZ-NOUS”, “Adresse”, “Téléphone”, “Email”, “FORMULAIRE DE CONTACT”; legal h3 mentioning Moroccan law “09-08” (right of access/rectification); embedded Google Maps iframe; Forminator form | 2021-04-15 [14] |
| `/mediatheque/` | Médiathèque [15] | h3 “MÉDIATHÈQUES”; RevSlider banner (`médiathèque.png`) + WPBakery single-image rows (900×258 blocks) | 2020-02-29 [15] |
| `/lamalif-le-mag/` | Lamalif-Le-Mag [16] | h3 “LAMALIF LE MAG”; magazine covers as `vc_single_image` (722×1024 pngs) in 3-col rows | 2021-07-27 [16] |
| `/valeurs/` | Valeurs [17] | h2 triplets “L'Kelma - Engagement”, “L'9elb L'kbir - Bienveillance”, “L'Me39oul - Intégrité”; h3 “NOS VALEURS” | 2021-04-12 [17] |
| `/visions-et-strategie/` | Vision & Mission [18] | h2 “NOTRE VISION”, “NOTRE MISSION” | 2021-04-12 [18] |

### 3.4 Language

- `<html lang="fr-FR">` on every fetched page; JSON-LD `inLanguage: "fr-FR"` [1][7].
- **No `hreflang` alternates and no `/en/…` links appeared anywhere** in the metadata or menus of fetched pages → French-only site (as observed; ⚠️ an untranslated page elsewhere is possible but nothing suggests one) [1].
- Exact French labels preserved in menus/footer (§3.1–3.2), including the quirks: “Medias” (no accent), “Acceuil” *(sic)* in JSON-LD only [1][7].

## 4. Visual style tokens

Origin key: [1] = homepage dump `dynamic-css` options block + inline CSS unless noted; [4] = `main_style.css` (2 736 rules, ~795 KB).

### 4.1 Colors

| Token | Hex | Where it is used | Evidence |
|---|---|---|---|
| Page background | `#F8F8F8` | body background site-wide | [1] |
| Ink (headings & strong) | `#171721` | all h1–h6, default link color, footer-top background, dark button bg | [1][4] |
| Body text | `#686876` | body copy, footer text & links | [1] |
| Secondary gray | `#a0a0a0` | `.bt-secondary-color`, gray CTA background, footer contact icon circles | [1][4] |
| Link hover / accents | `#000000` | links (:hover), `.bt-main-color`, separators (`vc_sep_color_black`), one full-width section bg (`vc_custom_1565225790463`) | [1] |
| Menu link (sticky v1) | `#333333` | desktop/sticky menu items, hover → `#000000` | [1] |
| Header bars | `#FFFFFF` | `.bt-header-stick` background (v1), mobile bar | [1] |
| Footer bottom | `#1e1e2b` | copyright bar background | [1] |
| Section band 1 | `#e0e0e0` | “NOS MÉTIERS” section (`vc_custom_1565207059662`) | [1] |
| Section band 2 | `#ededed` | defined in VC inline CSS (`vc_custom_1571329951857`, padding 90/40, bgsize cover) — not in the current homepage markup ⚠️ (used by some rows not fetched) | [1] |
| Gray CTA hover | `#878787` | all `#a0a0a0` buttons on hover | [4] |
| Dark CTA hover | `#020203` | dark buttons on hover | [4] |
| Dropdown panel | `#f1f4fb` | mega-menu / sub-menu panels, min-width 210 px, dividers `rgba(0,0,0,0.1)` | [4] |
| Circle-icon fill | `#dee0ec` | 61 px icon circles behind fancybox icons | [4] |
| Borders/lines family | `#e1e1e1` / `#ececec` / `#e5e5e5` / `#dedede` | separators, table line, borders (frequency: 22/53/52/12 uses) | [4] |
| Blue accent (dormant) | `#0a6edd` | hover color for header v2/v3, onepage & vertical variants (not the active v1) | [1][4] |
| Cookie bar | `rgba(50,50,58,1)` | cookie notice background, text `#fff` | [1] |
| Misc accents | `#00c5d1`, `#00959e`, `#f9f9f9`, `#454545` | minor theme elements (fun-facts, tabs) — 2 uses each | [4] |

Frequency profile of `main_style.css` hex usage (top): `#000000` (240), `#ffffff` (224), `#a0a0a0` (198), `#171721` (69), `#878787` (57), `#ececec` (53), `#e5e5e5` (52), `#686876` (45), `#e1e1e1` (22), `#0a6edd` (20), `#f9f9f9` (17), `#dee0ec` (15) [4].

### 4.2 Typography

From the `dynamic-css` options block (inline, authoritative — it post-styles the theme) [1]:

| Element | Font | Weight | Size / line-height | Color |
|---|---|---|---|---|
| body | Poppins | 400 | 14 px / 24 px | `#686876` |
| h1 (`.bt-font-size-1`) | Poppins | 600 | 36 / 42 | `#171721` |
| h2 (`.bt-font-size-2`) | Poppins | 600 | 30 / 36 | `#171721` |
| h3 (`.bt-font-size-3`) | Poppins | 600 | 24 / 30 | `#171721` |
| h4 (`.bt-font-size-4`) | Poppins | 600 | 18 / 24 | `#171721` |
| h5 (`.bt-font-size-5`) | Poppins | 600 | 14 / 16 | `#171721` |
| h6 (`.bt-font-size-6`) | Poppins | 600 | 12 / 14 | `#171721` |
| h1–h6 margins | — | — | margin-bottom 15 px (main_style sets `margin-bottom:15px`) [4]; h1–h3 explicitly `margin-top:0;margin-bottom:15px` in dynamic-css [1] | |

Special-purpose fonts (all loaded via Google Fonts) [1]:

- **Montserrat** — pricing-table `.bt-price` (inline custom css) [1]; used size not observed on fetched pages ⚠️.
- **Noto Serif 400** — testimonial carousel `.bt-testimonial-carousel-element.layout1 .bt-content` (inline custom css) [1]; no testimonial markup was found on fetched pages ⚠️.
- **Lato 400** — theme default font (`doyle-fonts` css enqueued) and the (unused) `bt-header-onepage` menu styles [1].
- RevSlider extras — captions in **Open Sans** (hero caption “De la ville à la vie” = Open Sans 600, 40 px, white, line-height 22 px) and the slider CTA in **Roboto 500** (14 px, pill) [1].
- **Loaded but apparently unused on rendered pages**: Open Sans (300–800), Raleway (100–900), Droid Serif (400/700) — all pulled in by Essential Grid's own stylesheet links on every page [1]. FontAwesome is the icon font (66 uses in main_style.css [4]), plus theme `flaticon` [1].

Menu typography (header v1) [1]: desktop/sticky items Poppins 600 14 px, `uppercase`, line-height 60 px, color `#333333`, hover `#000000`; level-2 items Poppins 400 13 px, line-height 38 px, color `#171721` [1]; 40 px logo [1].

### 4.3 Header / nav styling

- Structure: the header **triplicates the nav in the DOM** — `.bt-header-desktop` (static), `.bt-header-stick` (shown when stuck), `.bt-header-mobile` (< 992 px, theme JS switch at `enable_mobile: 991`) [1].
- Sticky bar: bg `#FFFFFF`, horizontal padding 60 px, vertical 0; logo height 40 px (`logo-1.png`, 2019 upload); menu right area includes the search widget [1].
- Menu item paddings 0 10 px; caret icon = FontAwesome `\f107`; sub-menu panel `#f1f4fb`, min-width 210 px, top-entry 13/38 px, hover — panel content styling in [4]; menu animation `menuEffect` 0.4 s [4].
- Mobile: logo 30 px, burger below 991 px, panel `#FFFFFF`; mobile sub-menus toggled via `menu-toggle` [1].
- ⚠️ The “90 px desktop header height” figure sometimes quoted for this theme was **not found** in the CSS: header height is emergent (60 px item line-height + 40 px logo, flex `height:inherit` bar) [1][4]. Do not hard-code a 90 px header.
- `.easing-animation { transition: all 0.4s }` is the site's motion baseline for header/button transitions [4].

### 4.4 Layout & spacing

- Grid: **Bootstrap 3.3.7** shipped by the theme (standard container 1170 px @ ≥1200) [6]; `boxed` variant caps at 1200 px but the site uses the **`wide`** layout [1][4].
- Two page templates: `page-nocontainer` (full-bleed VC sections: homepage, `/about-us-02/`, `/espace-carrieres/`, `/contact-us-03/`) and `page-template-default` (content inside container) [1][7–18].
- Observed section paddings (WPBakery `vc_custom_*` rules) [1]:
  - `vc_custom_1499675135426` → padding 60 px / 60 px (“QUI SOMMES-NOUS ?”).
  - `vc_custom_1565207059662` → padding-top 90 / bottom 60 + bg `#e0e0e0` (“NOS MÉTIERS”).
  - `vc_custom_1571329951857` → 90 / 40 + `#ededed` bg (defined but not on fetched markup ⚠️).
  - `vc_custom_1565225790463` → `#000000` bg row (defined; not on fetched markup ⚠️).
- Footer: top padding 90/60, bottom 35/0; theme default `.bt-footer{margin-top:90px}` overridden to 0 inline on this install [1].
- In-content spacers via `vc_empty_space` 32 px / 55 px [1].
- Homepage hero slider metrics: responsive levels [1240, 1240, 778, 480], grid heights [550, 550, 520, 520]; video hero grid width 1800, heights [700, 700, 400, 270] [1].
- Titlebar pattern (breadc pages): padding 120/90 @≤991, 90/60 @≤767; breadcrumb text 18 px, ls 0.3em [4].

### 4.5 Buttons, cards, misc components

- `.bt-btn` base: 14/24, weight 700, `letter-spacing:0.04em`, **border-radius 3 px** [4].
- Gray solid CTA (most common): `uppercase` 600 14/24, white on `#a0a0a0`, `min-width:180px`, `padding:8px 40px`, hover `#878787` [4].
- Dark solid CTA: white on `#171721`, `padding:8px 50px`, hover `#020203` (`bt-about-section` style) [4].
- Hero pill CTA: transparent on image, 1 px white border, **radius 30 px**, white text (Roboto 500) [1].
- Play button: 60×60 circle, 1 px `#000` border, hover `#ffffff` on `#222222` [4].
- Icon circles (service cards): 61 px `#dee0ec` disc, hover → `#a0a0a0` + `hvr-pulse`; icon-top variant does `hvr-wobble-skew`; section titles get a 35×2 px black underline bar that widens to 50 px and grays on hover [4].
- WC window: border-radius distribution across main_style.css: `50%` (206 uses — circles/avatars), `0` (61), `3px` (12 — .bt-btn), `30px` (12 — pills), `60px` (6 — play), then minor [4].
- VC buttons on content (“En savoir plus” on homepage): `vc_btn3 shape-rounded style-modern color-grey` (WPBakery default grays) [1].
- Forminator default markup on /contact-us-03/ (label+input pattern, plugin CSS) [14]; WPBakery single-image “cards”: `vc_box_rounded vc_box_border_grey` figures [1][15][16].

## 5. Template & component inventory

| Component | Where | Engine / markup | Evidence |
|---|---|---|---|
| Header (3 bars) + mega/dropdown menu | every page | `bt-header-v1` + WordPress `menu-x1` + mini-search widget | [1] |
| Hero slider (image, Ken Burns 100→150 over 10 s, caption “De la ville à la vie”, vertical bullet nav on right hidden < 780 px) | homepage | `rev_slider_1_1` — Slider Revolution 5.4.8.3 | [1] |
| Video hero (`sliderType: hero`, YouTube `uww0W7WKnDg`, muted, 00:06–01:40 loop, overlay rgba(0,0,0,.25)) | homepage bottom | `rev_slider_4_2` — RevSlider | [1] |
| Split intro section | homepage | VC row: 50/50 image (`LOG.png` 683×456) + justified paragraphs + VC gray button | [1] |
| “NOS MÉTIERS” icon row | homepage | `bt-core-features-section3` + 3 × `bt-fancy-box-element icon-top` with 240 px pictogram images (`picto-AI-03/04/05.png`) | [1] |
| Page-title banner | inner pages | embedded `wpb_revslider_element` fullwidth slider with static slide (b.g. `médiathèque.png`) — theme's own `bt-titlebar` not used | [15][16] |
| References grid | `/nos-realisations/` | **Filter Gallery (pfg)**: `filter_gallery_4040 filtr-container filters-div`, filter bar `filtr-control-4040 simplefilter`, 39 cards `filtr-item filtr_item_4040 single_one col-lg-3 col-md-3 col-sm-4 col-xs-6`, title boxes `pfg_title_4040` (h3 “VILLE – LIEU – Maroc”); grid = 4/3/2 columns (lg/md/sm/xs) | [10] |
| Contact form | `/contact-us-03/` | **Forminator** (1478 `forminator` tokens = plugin inline config & fields) + Google Maps iframe | [14] |
| Newsletter | every page (footer) | Brevo/Sendinblue iframe embed inside `sib_signup_form_1` shell (provides its own error/success alert CSS: red `#f2dede/#a94442`, green `#dff0d8`, yellow) | [1] |
| News listing | `/actualite/` | WPBakery text/image list (one `bt-element` found); article h3s + content — exact carrier element not identified ⚠️ | [13] |
| Magazine covers / media blocks | `/lamalif-le-mag/`, `/mediatheque/` | plain `wpb_single_image` grids (col-sm-4 / col-sm-3) — **not** Essential Grid, **not** Total Soft, despite both plugins enqueued | [15][16] |
| Testimonials carousel | CSS only (Montserrat/Noto Serif rules) — **no testimonial markup found on any fetched page** ⚠️ (dead feature or on an unfetched page) | `.bt-testimonial-carousel-element.layout1` | [1] |
| Search | header widget | standard WP `?s=` search form (action `/`) | [1] |
| Cookie banner | all pages | Cookie Notice 2.0.4 (config in §2.1) | [1] |
| Back-to-top | all pages | square `#site_backtop` + fa-arrow-up | [1] |
| Scroll animations | content | WPBakery `wpb_animate_when_almost_visible fadeInUp/fadeInLeft/fadeInDown` + vc-waypoints + animate.css | [1][4] |

**Plugin-vs-renderer reality check** (important for the rebuild): Essential Grid 2.3.2, Total Soft Portfolio and portfolio-wp all inject CSS/JS on **every** page [1], but the only grid actually rendering in fetched pages is the Filter Gallery (pfg) grid on `/nos-realisations/` [10]; Médiathèque/Le Mag are plain WPBakery image stacks [15][16].

## 6. Notes & caveats

- **“WordPress 5.2.30” is genuine**: the 5.2 branch was patched up to 5.2.30 released **Oct 28, 2026** [21]. So this is not a forged version string but a site kept on a 7-year-old major branch with security backports only.
- **Plugin bloat**: two analytics plugins (MonsterInsights shipped unconfigured [1]), three gallery plugins enqueued but at most one renders (§5) [1][10], plus `Newsletter` 8.7.5’s stylesheet while the real newsletter is Brevo [1], plus the never-rendered `[smbtoolbar]` shortcode [1], and 4 unused font families (Open Sans, Raleway, Droid Serif + Roboto slider-only) [1].
- Demo leftovers: the video hero references `theme.bearsthemes.com/wordpress/doyle/...` assets [1]; JSON-LD homepage name is “Acceuil” *(sic)* [1]; menu label “Medias” lacks its accent while sub-item “Médiathèques” has it [1].
- Data freshness mixed: footer copyright still says “Copyright 2021” [1]; homepage JSON-LD modification 2021-04-15 [1] but `/chiffres-cles/` and `/nos-realisations/` were edited Sept 2024 [9][10].
- Unverified / not observed (do not assume): explicit 90 px header height (§4.3) ⚠️; any `/en/` locale ⚠️; page layout of `/nos-certifications/`, `/lanews/`, `/concoursmadinaty/`, `/madinaty2021/`, `/sip22/`, `/plan-de-site/`, `/mentions-legales-conditions-generales/` (menu links seen but pages not fetched) ⚠️; the actual renderer of the `/actualite/` listing beyond WPBakery ⚠️; webfont-rendered hover feedback on desktop (vs. sticky) bar beyond colors documented [1].
- Typography source quirk: `main_style.css` declares h1–h6 at `font-weight:700` [4], but the inline `dynamic-css` block then re-declares everything at **Poppins 600 (36/42 → 12/14)** [1] — the table above reflects the effective values.

## 7. Rebuild implications for Next.js

- **Hero(s)**: replace both Revolution Sliders — image hero becomes a static section (`next/image` 1920×1077, CSS Ken Burns `scale(1)→(1.5)` 10 s linear + centered 40 px Open Sans-like caption + white pill CTA); video hero becomes a muted looping `<video>`/YouTube background (start 00:06, loop, dark overlay 25%). Vertical bullets optional → simple scroll indicator.
- **WPBakery sections → React sections**: map `vc_section/vc_row` to `<section class="py-15 md:py-[90px]…">` components; keep the pattern: centered h3 + 35×2 px rule + content rows; “nocontainer” pages = full-bleed sections, “default” pages = wrapped content.
- **Fonts**: load via `next/font/google`: Poppins (400/600), Montserrat, Noto Serif (400); drop Open Sans/Raleway/Droid Serif/Lato/Roboto or add per-hero only.
- **Tailwind token map** (from §4): colors `ink #171721`, `muted #686876`, `gray #a0a0a0` (+ hover `#878787`, dark hover `#020203`), `page #F8F8F8`, `header #FFFFFF`, `footer #171721` / `#1e1e2b`, `band-gray #e0e0e0` / `#ededed`, `menu #333333`, `dropdown #f1f4fb`, `circle #dee0ec`, `cookies rgba(50,50,58,1)`; radii defaults: buttons 3 px, pills 30 px, circles 50 %; headings scale 36/42 · 30/36 · 24/30 · 18/24 · 14/16 · 12/14, body 14/24.
- **References grid**: rebuild as a client filterable grid (raw data: 39 items, layout grid-cols-2 / sm:3 / lg:4 to match `col-xs-6 / col-sm-4 / col-lg-3`), with a lightbox (e.g. Yet Another React Lightbox) if needed.
- **Médiathèque / Le Mag**: simple `Image`-card grids (4-per-row media blocks, 3-per-row covers).
- **Header**: one sticky header component (not 3 DOM copies), menu from a single data module with exact French labels; breakpoints: desktop ≥992 px, mobile menu below.
- **Forms**: contact = React form + Next.js route handler, mirroring the Forminator fields and the law 09-08 consent note; newsletter = Brevo embedded form iframe or Brevo API.
- **REST migration**: `GET /wp-json/wp/v2/pages` is open (no auth) [19] — crawl it in the migration script to pull real copy/images; XML-RPC unused.
- **Cookie banner**: small custom modal/banner, same copy & 30-day consent cookie.
- **SEO**: reproduce title pattern `«Title page» | Lamalif Group`, meta description, canonical, JSON-LD Organization + WebSite (+ fix “Acceuil”).
- **Analytics**: GA property UA-186092780-2 was the live one (via ExactMetrics); decide GA4 + Metricool script equivalents consciously.

## Sources

1. Homepage HTML dump (head + body, hosted by parent session): `/home/eloaurdi/.local/share/opencode/tool-output/tool_1a7cb10e0001ilE5VO7agRhAEN` — original of https://lamalifgroup.ma/
2. https://lamalifgroup.ma/ — homepage (same document as [1])
3. https://lamalifgroup.ma/wp-content/themes/doyle/style.css — theme header (Doyle 1.5, bearsthemes)
4. https://lamalifgroup.ma/wp-content/themes/doyle/assets/css/main_style.css — theme main styles (2 736 rules)
5. https://lamalifgroup.ma/wp-content/themes/doyle/assets/css/custom_style.css — **0 bytes** (HTTP 200) — no site-specific overrides
6. https://lamalifgroup.ma/wp-content/themes/doyle/assets/vendors/bootstrap/css/bootstrap.min.css — Bootstrap 3.3.7
7. https://lamalifgroup.ma/about-us-02/
8. https://lamalifgroup.ma/mot-du-president/
9. https://lamalifgroup.ma/chiffres-cles/
10. https://lamalifgroup.ma/nos-realisations/
11. https://lamalifgroup.ma/nos-filiales/
12. https://lamalifgroup.ma/espace-carrieres/
13. https://lamalifgroup.ma/actualite/
14. https://lamalifgroup.ma/contact-us-03/
15. https://lamalifgroup.ma/mediatheque/
16. https://lamalifgroup.ma/lamalif-le-mag/
17. https://lamalifgroup.ma/valeurs/
18. https://lamalifgroup.ma/visions-et-strategie/
19. https://lamalifgroup.ma/wp-json/
20. https://lamalifgroup.ma/xmlrpc.php
21. https://wordpress.org/download/releases/ — confirms `5.2.30` released Oct 28, 2026
