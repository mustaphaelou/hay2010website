/**
 * Code-owned contact-page notice — the short law 09-08 notice the email route
 * must render even when no form exists.
 *
 * Decisions: docs/legal/analytics-consent-legal-pages.md §4.5 (approved short
 * notice) and docs/forms/contact-careers-forms.md §3.11. It is developer-only:
 * the owner cannot edit it in the CMS (docs/content/content-model.md §3), because
 * it carries legal information and, once issued, the CNDP receipt. The approved
 * wording lives here rather than in the content corpus for the same reason the
 * legal identity does — a typo in it is a legal risk, not an editorial choice.
 *
 * The CNDP sentence renders only when a real receipt reference exists
 * (`CONTACT_CNDP_REFERENCE`). At P1 no filing exists, so the sentence is absent:
 * no blank « n° … », no « en cours », no invented declaration.
 */
export const CONTACT_NOTICE = {
  title: "Données personnelles",
  /** Approved short notice, minus the conditional CNDP sentence. */
  processing:
    "Vos données sont traitées par SOCIETE HAY 2010 pour répondre à votre demande. Elles sont destinées aux services concernés et à nos prestataires techniques, et conservées 12 mois après le dernier échange. Vous pouvez exercer vos droits à donnees@hay2010.ma.",
  /**
   * What the site itself does not collect. True of the P1 build and stated
   * plainly so the page is honest about the email-only route: the mail client
   * sends the message, the site stores nothing and measures nothing.
   */
  noCollection:
    "Le site ne comporte ni formulaire de contact, ni base de données des messages, ni mesure d’audience\u00a0: aucun message n’y est stocké et aucun cookie de suivi n’est déposé.",
} as const

/**
 * CNDP receipt for the contact/quote processing (F-211, see #14).
 *
 * `null` until the declaration is filed and a real receipt exists. The notice
 * renders the declaration sentence only when both fields are filled, so the
 * page can never publish a blank reference. Flipping this constant is the whole
 * change when the receipt lands — no layout or content edit.
 */
export const CONTACT_CNDP_REFERENCE: { number: string; date: string } | null = null
