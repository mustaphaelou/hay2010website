import { LEGAL_IDENTITY } from "@/lib/legal/identity"
import { frenchTypography } from "@/lib/legal/typography"
import { legalLinkClassName } from "@/components/site/legal-text"
import type { ReactNode } from "react"

/** One label/value row of the identity block; the label keeps its colon. */
function IdentityRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="font-medium text-ink">{frenchTypography(`${label} :`)}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/** An identity-row value that is a cleared mailbox (rendered as a mailto). */
function MailboxValue({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className={legalLinkClassName}>
      {email}
    </a>
  )
}

/**
 * The identity block injected on both legal pages (decision §4.1–§4.3, facts
 * register §2.1). Values come from `LEGAL_IDENTITY` and are never part of the
 * content source; the editor variant adds the site and general mailbox of
 * §4.2, the controller variant the two §4.3 contacts.
 */
export function LegalIdentityBlock({
  variant,
}: {
  readonly variant: "editor" | "controller"
}) {
  return (
    <div className="mt-6 border-l-2 border-orange pl-5 sm:pl-6">
      <p className="text-lg font-medium text-ink">{LEGAL_IDENTITY.legalName}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-body">
        {LEGAL_IDENTITY.legalForm}
      </p>

      <dl className="mt-4 space-y-2 text-[15px] leading-relaxed text-body">
        <IdentityRow label="Capital social">{LEGAL_IDENTITY.capital}</IdentityRow>
        <IdentityRow label="Siège social">
          {LEGAL_IDENTITY.registeredAddress}
        </IdentityRow>
        <IdentityRow label="Registre du commerce">
          {LEGAL_IDENTITY.rc}
        </IdentityRow>
        <IdentityRow label="ICE">{LEGAL_IDENTITY.ice}</IdentityRow>
      </dl>

      {variant === "editor" ? (
        <dl className="mt-4 space-y-2 text-[15px] leading-relaxed text-body">
          <IdentityRow label="E-mail">
            <MailboxValue email={LEGAL_IDENTITY.email} />
          </IdentityRow>
          <IdentityRow label="Site">
            <a href={LEGAL_IDENTITY.siteUrl} className={legalLinkClassName}>
              {LEGAL_IDENTITY.siteUrl}
            </a>
          </IdentityRow>
        </dl>
      ) : (
        <dl className="mt-4 space-y-2 text-[15px] leading-relaxed text-body">
          <IdentityRow label="Contact général">
            <MailboxValue email={LEGAL_IDENTITY.email} />
          </IdentityRow>
          <IdentityRow label="Contact données personnelles">
            <MailboxValue email={LEGAL_IDENTITY.dataEmail} />
          </IdentityRow>
        </dl>
      )}
    </div>
  )
}
