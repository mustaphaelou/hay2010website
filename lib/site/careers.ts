/**
 * Carrières — code-owned careers constants and the F-113 application gate.
 *
 * `/carrieres` is a utility page (footer-only, never in the primary
 * navigation). Its business rule is the careers application channel:
 * `contact@hay2010.ma` for questions until the CNDP F-113 authorization covers
 * `recrutement@hay2010.ma`, and only then the careers mailbox, the spontaneous
 * application section and the email notice with its real authorization
 * reference (facts register §2.3/§3, forms doc §4.4/§4.9).
 *
 * The gate state is data: it comes from the content source (a fixture scenario
 * today, code-owned deployment configuration once the CMS provider lands —
 * #29/#30), never from a component branch. Everything in this module is
 * code-owned: the mailbox values, the approved fixed behaviour strings from
 * forms doc §4.9 and the approved metadata from the SEO decision §3.3. Page
 * copy (culture text, openings) lives in the content source.
 */
import { getContentSource } from "@/lib/content"
import type { CareersChannel, JobOpening } from "@/lib/content/types"
import { COMPANY, CONTACT_MAILTO } from "@/lib/site/company"
import { getPublishState } from "@/lib/site/rubriques"

/** Canonical route of the utility page (code-owned, registry source of truth). */
export const CAREERS_ROUTE = "/carrieres"

/** Careers mailbox — approved but gated by F-113 (facts register §2.3). */
export const RECRUITMENT_EMAIL = "recrutement@hay2010.ma"

/**
 * Approved metadata (SEO decision §3.3). The live description invites a
 * spontaneous application, so it is a gated claim until F-113 opens; the
 * pending description only points at the openings and the contact route.
 */
export const CAREERS_METADATA = {
  title: "Carrières et offres d’emploi — HAY2010",
  pendingDescription:
    "Découvrez les offres d’emploi de HAY2010, entreprise d’éclairage public et d’électrification à Rabat, et la façon de nous contacter.",
  liveDescription:
    "Rejoignez HAY2010, entreprise d’éclairage public et d’électrification à Rabat. Consultez nos offres d’emploi et envoyez votre candidature spontanée.",
} as const

/**
 * Approved fixed behaviour strings — forms doc §4.9. They are code-owned
 * because they encode the gate: the pending state must never invite a CV and
 * the live state must use the decided wording.
 */
export const CAREERS_COPY = {
  openingsTitle: "Offres d’emploi",
  /** §4.9 empty state — always true, never a placeholder. */
  emptyState: "Aucune offre n’est ouverte pour le moment.",
  /** §4.9 F-113-pending line: applications are not open on the site yet. */
  pendingBody:
    "Les candidatures ne sont pas ouvertes sur ce site pour le moment. Cette page sera mise à jour dès qu’elles le seront.",
  /** §4.9 F-113-pending CTA (questions only, general mailbox). */
  pendingCtaLabel:
    "Une question sur nos offres\u00a0? Écrivez-nous à contact@hay2010.ma.",
  /** §4.9 F-113-granted CTA label. */
  liveCtaLabel: "Postuler par e-mail",
  /** §4.9 spontaneous application section. */
  spontaneousTitle: "Candidature spontanée",
  spontaneousBody:
    "Vous ne trouvez pas le poste qui correspond à votre profil\u00a0? Envoyez-nous votre CV et une courte présentation\u00a0; nous l’examinerons avec attention.",
  /** Per-card questions link while the careers mailbox is still gated. */
  questionsLabel: "Nous contacter",
  /** §4.9 privacy link label (rendered only once the policy page is live). */
  privacyLinkLabel: "Politique de confidentialité",
  /** §4.9 / legal §4.5 careers email notice, with the runtime substitutions. */
  noticeTemplate:
    "Les candidatures sont reçues à l’adresse indiquée sur cette page. Vos données (CV, lettre de motivation, coordonnées) sont utilisées uniquement pour gérer votre candidature et conservées 6 mois après la décision, puis supprimées, sauf accord séparé pour 12 mois. Vous pouvez demander leur suppression à tout moment à donnees@hay2010.ma. Ce traitement est soumis à l’autorisation CNDP n°\u00a0{number} du {date}. Pour en savoir plus\u00a0: /politique-de-confidentialite.",
} as const

/** Effective careers application state, resolved through the content seam. */
export interface CareersApplicationState {
  readonly channel: CareersChannel
  /**
   * Effective gate: the scenario says live *and* a real CNDP reference is
   * present. A live channel without a reference fails closed — the notice must
   * never render with a blank number (forms doc §4.9).
   */
  readonly mailboxLive: boolean
  /** Visible application/contact address for this state. */
  readonly email: string
  readonly mailto: string
  readonly authorization?: { readonly number: string; readonly date: string }
}

/** Read the F-113 careers channel from the content source. */
export async function getCareersChannel(): Promise<CareersChannel> {
  const source = await getContentSource()
  return source.getCareersChannel()
}

/** Open job openings, already gated, filtered and ordered by the source. */
export async function getOpenJobs(): Promise<readonly JobOpening[]> {
  const source = await getContentSource()
  return source.getOpenJobs()
}

/** Resolve the effective application state from the seam's channel state. */
export function resolveCareersApplicationState(
  channel: CareersChannel
): CareersApplicationState {
  const authorization = channel.authorization
  const mailboxLive = Boolean(
    channel.recruitmentMailboxLive &&
      authorization?.number.trim() &&
      authorization?.date.trim()
  )
  const email = mailboxLive ? RECRUITMENT_EMAIL : COMPANY.email
  return {
    channel,
    mailboxLive,
    email,
    mailto: `mailto:${email}`,
    authorization: mailboxLive ? authorization : undefined,
  }
}

/** Convenience: resolve the effective application state from the seam. */
export async function getCareersApplicationState(): Promise<CareersApplicationState> {
  return resolveCareersApplicationState(await getCareersChannel())
}

/** Is the privacy policy published? The notice links it only when it is. */
export async function isPrivacyPolicyPublished(): Promise<boolean> {
  const state = await getPublishState("politique-de-confidentialite")
  return state.published
}

/** Approved metadata description for the effective gate state. */
export function getCareersMetadataDescription(
  state: CareersApplicationState
): string {
  return state.mailboxLive
    ? CAREERS_METADATA.liveDescription
    : CAREERS_METADATA.pendingDescription
}

/** Render the approved notice, substituting the real authorization reference. */
export function renderApplicationNotice(
  state: CareersApplicationState
): string | null {
  if (!state.mailboxLive || !state.authorization) return null
  return CAREERS_COPY.noticeTemplate
    .replace("{number}", state.authorization.number)
    .replace("{date}", state.authorization.date)
}

function encodeMailto(subject: string, body: string): string {
  return `mailto:${RECRUITMENT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`
}

/**
 * `mailto:` for one open role — the §4.5 template, encoded. The candidate's
 * own data is never put in the URL: only the role title and the empty template.
 */
export function buildJobApplicationMailto(job: JobOpening): string {
  const subject = `Candidature – ${job.title}`
  const body = `Bonjour,

Je souhaite candidater au poste de ${job.title} publié sur hay2010.ma.

Nom et prénom\u00a0:
Téléphone\u00a0:
E-mail\u00a0:
Disponibilité\u00a0:
Lettre de motivation\u00a0: ci-jointe
CV\u00a0: ci-joint

J’accepte que SOCIETE HAY 2010 traite mes données pour gérer ma candidature.

Cordialement,`
  return encodeMailto(subject, body)
}

/** `mailto:` for a spontaneous application — §4.5 template, encoded. */
export function buildSpontaneousApplicationMailto(): string {
  const body = `Bonjour,

Je souhaite vous adresser une candidature spontanée.

Nom et prénom\u00a0:
Téléphone\u00a0:
E-mail\u00a0:
Disponibilité\u00a0:
Lettre de motivation\u00a0: ci-jointe
CV\u00a0: ci-joint

J’accepte que SOCIETE HAY 2010 traite mes données pour gérer ma candidature.

Cordialement,`
  return encodeMailto(CAREERS_COPY.spontaneousTitle, body)
}

/** A gated-channel questions link: the general mailbox, subject optional. */
export function buildQuestionsMailto(subject: string): string {
  if (!subject) return CONTACT_MAILTO
  return `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}`
}

const FRENCH_DATE = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

/** Render an ISO date as a French date (`2 novembre 2026`), never a countdown. */
export function formatFrenchDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  return FRENCH_DATE.format(date)
}
