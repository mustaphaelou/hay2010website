import Link from "next/link"

import { SiteLogo } from "@/components/site/site-logo"
import { COMPANY, CONTACT_MAILTO } from "@/lib/site/company"
import { getPublishedNavigation, getPublishedUtilities } from "@/lib/site/rubriques"
import { cn } from "@/lib/utils"

/**
 * Ink footer (brand direction §2.4): four-column grid, paper-chip badge, the
 * registered address and the public mailbox from the facts register, legal
 * line at the bottom. No phone, recruitment mailbox, newsletter or social
 * icons while those facts stay gated (facts register §2.3).
 *
 * Links come from the same published set as the header, so a closed gate
 * disappears here too. Carrières and the legal pages appear automatically once
 * #27/#28 publish them in the fixture corpus; until then the utility column is
 * omitted rather than rendered empty.
 */
export async function SiteFooter() {
  const navigation = await getPublishedNavigation()
  const utilities = await getPublishedUtilities()
  const hasUtilities = utilities.length > 0

  return (
    <footer className="bg-ink text-surface">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-10 lg:py-20">
        <div className={cn("sm:col-span-2", hasUtilities ? "lg:col-span-1" : "lg:col-span-2")}>
          <SiteLogo chip />
          <p className="mt-6 max-w-[32ch] text-sm leading-relaxed text-surface/70">
            {COMPANY.experienceLine}
          </p>
        </div>

        <div>
          <p className="text-[10.5px] font-semibold tracking-[0.2em] text-surface/50 uppercase">
            Rubriques
          </p>
          <ul className="mt-5 space-y-3">
            {navigation.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-surface/80 transition-colors hover:text-surface"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {hasUtilities ? (
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-surface/50 uppercase">
              Informations
            </p>
            <ul className="mt-5 space-y-3">
              {utilities.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-surface/80 transition-colors hover:text-surface"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-8">
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-surface/50 uppercase">
              Siège social
            </p>
            <p className="mt-5 max-w-[28ch] text-sm leading-relaxed text-surface/80">
              {COMPANY.registeredAddress}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-surface/50 uppercase">
              Contact
            </p>
            <a
              href={CONTACT_MAILTO}
              className="mt-5 inline-block text-sm font-medium text-surface underline decoration-surface/30 underline-offset-4 transition-colors hover:decoration-surface"
            >
              {COMPANY.email}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-surface/15">
        <div className="mx-auto max-w-[1440px] px-5 py-6 lg:px-10">
          <p className="text-xs text-surface/50">{COMPANY.legalLine}</p>
        </div>
      </div>
    </footer>
  )
}
