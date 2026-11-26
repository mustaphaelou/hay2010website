import type { LegalLink } from "./types"

/**
 * The links the approved legal copy uses. Code-owned like the copy itself:
 * routes come from the registry (`/mentions-legales`,
 * `/politique-de-confidentialite`) and open at P1 with this ticket.
 */
export const POLICY_LINK: LegalLink = {
  label: "politique de confidentialité",
  href: "/politique-de-confidentialite",
}

export const POLICY_PATH_LINK: LegalLink = {
  label: "/politique-de-confidentialite",
  href: "/politique-de-confidentialite",
}

export const POLICY_COOKIES_LINK: LegalLink = {
  label: "« Cookies »",
  href: "/politique-de-confidentialite#cookies",
}

export const SITE_LINK: LegalLink = {
  label: "https://hay2010.ma",
  href: "https://hay2010.ma",
}

export const CONTACT_EMAIL_LINK: LegalLink = {
  label: "contact@hay2010.ma",
  href: "mailto:contact@hay2010.ma",
}

export const DATA_EMAIL_LINK: LegalLink = {
  label: "donnees@hay2010.ma",
  href: "mailto:donnees@hay2010.ma",
}

export const CNDP_WEBSITE_LINK: LegalLink = {
  label: "www.cndp.ma",
  href: "https://www.cndp.ma",
}
