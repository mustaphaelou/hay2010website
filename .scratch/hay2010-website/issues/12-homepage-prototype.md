# Produce the homepage prototype

Type: prototype
Status: resolved 2026-11-09 — variant A chosen
Blocked by: 01, 03

## Question

What should the HAY2010 homepage actually look like, section by section?

Build a rough, concrete homepage prototype using the chosen brand direction and the agreed page tree. Cover:

- Hero (image/video, caption, CTA) and the "Qui sommes-nous ?" split section.
- The services/expertises icon band and the video band (if kept).
- A references teaser and careers teaser.
- Header/nav and footer.
- Mobile and desktop layouts.

Use real HAY2010 copy where verified, placeholders where not. The prototype is a discussion artifact, not production code; link it from this ticket and record what was learned.

## Answer

Prototype produced 2026-11-09. Branch **`prototype/homepage`**, route **`/prototype/homepage?variant=a|b|c`**, `←`/`→` or the floating bar to switch. Screenshots for all three variants at 1440 px and 390 px are in [`docs/homepage/assets/`](../../../docs/homepage/assets/); the full record is [`docs/homepage/README.md`](../../../docs/homepage/README.md).

### What exists

Three structurally different homepages, all on the decided section order (hero → qui sommes-nous → métiers → réalisations → carrières → contact → footer):

- **A — Éditorial:** full-bleed dusk hero with copy over it, 12-column split intro, four icon columns on ink, references split block, careers split, orange contact band. Needs 1 hero + 2–3 section images.
- **B — Preuve:** no photography at all — typographic ink hero with a credentials rail, services as a ruled list, centred references statement, ink contact band. The "ship before the shoot" fallback.
- **C — Chantier:** image above the headline, full-width intro band, stacked service rows with one framed image each, paper references panel. Best mobile reading, most photography-hungry.

### Verdict

**Variant A — Éditorial chosen by the owner on 2026-11-09.** B and C are rejected alternatives kept on the branch as evidence; the switcher and all three variants stay there.

- **A is the page skeleton to build.** It is the only variant that is both direction A and affordable with one commissioned hero; it preserves the ink/paper alternation, the label spine and the orange band.
- **B is the pre-shoot copy fallback**, not the layout: if no licensed hero exists at launch, open with B’s typographic hero and no photography, but keep A’s order and sections.
- **C’s mobile image-first composition** was the strongest small-screen read; it is not adopted, and is revisited only if the real 4:5 crop defeats A’s overlay hero.
- **Drop the “R.” monogram** from the references teaser — it is not in the brand system and proves nothing; keep the `Références sur demande.` statement.
- **Footer uses the paper-chip badge, not the white stencil**: at 52 px the stencil loses `2010.Sarl`.

### What was learned

- The decided section order reads as a sequence and survives the ink/paper alternation; the `01 — …` labels are worth keeping.
- The sticky 76 px white header with the 52 px badge works over the dark hero; five items at launch and six later both fit at 1024 px+.
- The mobile drawer (focus trap, Escape, scroll lock, focus return) behaves; the CTA is the only full-width button on the page.
- Ink on orange (6.23:1) is the only legible combination on the contact band; the white pill needs ink text.
- In the stacked mobile contact band the pill must be `self-start`; otherwise it stretches and reads as a form control.
- B’s ONEE line is **gated** until both certificates are filed; until then the rail collapses to experience + base.
- Photography remains the critical path: C needs ≈9 licensed frames, A needs 3–4, B needs none.
- Approved copy is used where it exists (positioning line, “plus de 10 ans”, four services, `Références sur demande`, `contact@hay2010.ma`, Rabat, legal line). The hero headline and the section sentences are marked sample copy and need owner approval.

### Still open

- **Production build** (new ticket): fold A into `app/page.tsx` as `Hero`, `IntroSplit`, `ServicesBand`, `ReferencesTeaser`, `CareersTeaser`, `ContactCta` with the nav data module, metadata from [#11](https://github.com/mustaphaelou/hay2010website/issues/11) and the gated nav from [#2](https://github.com/mustaphaelou/hay2010website/issues/2).
- Final French copy, the hero photograph (or the typographic fallback) and the footer paper-chip badge.
- Component inventory/token implementation, and the performance acceptance criteria that depend on real images.
- **Inner-page section composition** is no longer blocked: the inner pages reuse A’s header, section labels, CTA patterns and footer.
