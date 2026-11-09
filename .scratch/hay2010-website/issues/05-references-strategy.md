# Define the réalisations and portfolio strategy

Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

What can HAY2010 legitimately show as réalisations, and in what format?

Public evidence is thin: one individually verified public contract (Province de Khemisset, Marché 06/CPK/2024, 187,607 DH TTC) plus an aggregator claim of 14 wins / 78.66 M DH that cannot be attributed per project. There are no project photos or client logos.

Decide:

- Whether to publish named references (with written client permission), anonymized project types, or service-led case studies ("éclairage public", "poste de transformation", etc.).
- How to present the verified Khemisset contract and any other confirmed work.
- Whether to include a filterable grid like lamalif's, a simpler case-study list, or a "références sur demande" section.
- What imagery to use when no site photos exist (illustrative, diagrams, stock, or no image).
- The legal/permission checklist: client names and logos need the trademark owner's permission (loi 17-97 arts. 154/201); employee photos need specific written authorization; testimonials need consent; project photos need the photographer/owner's permission.

The answer should define the page format, the minimum number of references needed for launch, and the fallback if permissions do not arrive.

## Answer

Resolved 2026-11-09 by a grilling session with the owner. The full page specification, evidence table and handoffs are in [`docs/content/realisations-strategy.md`](../../../docs/content/realisations-strategy.md).

### The decision

`/realisations` launches as a **credentials-led references page**, not a portfolio. It carries the four service rows, the two current ONEE agréments, the method block and `Références sur demande.`; it has no project cards at launch.

### Why

The 2026-11-09 verification of official procurement records found **zero documented awards** to HAY2010: eight records, all bids, losses or technical evictions. The aggregator's 14 wins / 78.66 M DH cannot be attributed per project, and the Khemisset official PV was not located (aggregator only). Publishing any of that as réalisations would be false. The only legitimate source is the owner's contract file; the only path to names, logos and photos is written permission.

### Page and thresholds

- Sections: hero, intro, four services, qualifications, references, method, contact CTA.
- **0 cards** required for launch; **1–2** inline under their service; **3+** a two-column list; no grid, no filters.
- **3 approved named case studies** turn on `/realisations/[slug]`; the homepage teaser falls back until 3 published projects.
- Cards are anonymized by default: service, object, region, year, one-line scope; no buyer, logo, photo, amount, testimonial or detail link.
- Imagery: no per-project images until rights-cleared; typographic cards; typographic hero or a rights-cleared documentary photo.

### Permissions and evidence

- The owner sends an internal project inventory (object, buyer, place, year, amount, contract/réception reference, permission contact) by T-2 weeks.
- One permission campaign ending T-3 weeks, four separate asks: name, logo, site photos, quote. Silence means no. The developer records status in the facts register §6.
- Evidence levels: owner-confirmed anonymized → client-authorized named → case study.
- Legal checklist: client name authorization; client + trademark owner for logos (loi 17-97); photographer licence + site authorization + people releases (loi 09-08); testimonial consent; no losing bids, aggregator totals or expired qualifications.

### Credentials correction

The ONEE list documents **two** current agréments for HAY2010: **EE HTA-BT** (02/10/2023–30/09/2028) and **HTA-BT3** (25/03/2026–31/03/2029). The **HTA-BT0** line belongs to HAMZA ANAS ELECTROMECANIQUE, not HAY2010. The MHVP 4\*\*\*\* qualification was renewed 04/03/2024–03/03/2026 and is **expired**; no current ONEE agrément explicitly covers postes de transformation.

### Handoffs

#2 page-tree amendment; #3 facts register (two agréments, Khemisset, MHVP, inventory/campaign); #5 content model (`cover` optional, `evidenceReference`, `caseStudiesLive`, teaser threshold); #10 legal letter/wording; #11 indexing and no structured data; #13 page layout; #16 launch gates; #12 mailto CTA, no form.
