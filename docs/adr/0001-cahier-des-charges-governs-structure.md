# The cahier des charges governs structure; the facts register governs claims

Status: accepted (2026-11-26)

The structeur's cahier des charges (CDC) arrived after fourteen decisions were already recorded against a lamalifgroup.ma-derived information architecture and a verified-facts register, and it contradicts them on the menu, the domain taxonomy, languages, forms and the réalisations model. We decided that **the CDC is the authority for structure, page composition, vocabulary and phasing**, while **the facts register and the recorded legal/permission constraints remain the authority for what may be claimed, named or published**. `lamalifgroup.ma` stops being the information-architecture reference and becomes only the visual and pattern reference; brand direction A and the homepage prototype stay as they are. Divergences are logged in `docs/cdc/deviation-register.md` and need the structeur's written sign-off before build.

The two sources do not actually collide on truth: the CDC subordinates itself to reality four times — "ne publier que des données exactes" (§2.4), "selon le catalogue réel" (§4.5), "uniquement si sa mention est autorisée" (§5.2), "selon le parc réel" (§6.1). They collide only on layout and scope, and there the client's document must win because it is what the client will judge the site against.

Considered options. (a) The recorded decisions win and the CDC is advisory — rejected: it makes the client's mandate unenforceable and re-litigates settled work. (b) The CDC is absolute — rejected: it would force publishing unverified capabilities and unauthorised client names, which the facts register and Moroccan law forbid.

Consequences: the page tree in `.scratch/hay2010-website/issues/01-page-tree.md` is superseded as IA; the eight CDC rubriques and per-domain sub-pages replace the six-item nav and the single `/metiers` page; every affected ticket's decisions must be re-read against this ADR before build.
