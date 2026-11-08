# Plan the CNDP filings and launch compliance

Type: task
Status: open
Blocked by: 02, 07, 09, 11

## Question

What must be filed with the CNDP before launch, who owns each filing, and what is the fallback if an authorization is late?

The legal research ([Research Moroccan legal and consent requirements for the site](08-legal-research.md)) found that filing is a launch dependency, not a post-launch chore. Turn that into an owned checklist:

- **Contact/quote form:** prior declaration F-211 (or F-214 under a sector model); record the 24-hour récépissé; display the receipt number on the form and in the privacy policy.
- **Recruitment/CV processing:** prior authorization F-113 under the HR model (Délibération 298-AU-2014), with the candidate consent document. If it is not granted by launch, ship the careers page with `recrutement@hay2010.ma` only and add the form later; the mailbox itself still needs to be covered by the filing.
- **Cookies/analytics:** F-214 simplified declaration under D-939-2025 if analytics is in scope; 6-month maximum retention; consent for personalized ads/social cookies.
- **Transfers abroad:** F-118 for each US processor (Vercel/Cloudflare, GA4, Google Fonts, US email API) after the base processing is approved; check the adequacy list for the EU/EEA, UK, Switzerland and Canada.
- **Newsletter:** D-940-2025 and prior consent if the newsletter ships.
- **Controller details:** data-controller contact, rights contact, retention schedule, security measures, recipient categories.
- **Local counsel review:** the legal note flags 10 points that need a Moroccan avocat.

Record each filing's form, date, receipt/authorization number, owner and status in the answer. Flag any filing that cannot be completed before launch and the corresponding feature cut (for example, careers form delayed until F-113 is granted).
