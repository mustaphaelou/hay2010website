import Link from "next/link"

import { SiteLogo } from "@/components/site/site-logo"
import { SiteNavigation } from "@/components/site/site-navigation"
import { CONTACT_MAILTO, COMPANY } from "@/lib/site/company"
import { getPublishedNavigation, getPublishedUtilities } from "@/lib/site/rubriques"

/**
 * Site header (brand direction §2.4, homepage README §3.2): sticky solid-white
 * bar, 76 px high, 52 px badge linking home, horizontal rubrique row from
 * 1024 px, full-screen drawer below.
 *
 * The item list is derived from the rubrique registry through the content
 * seam, so a closed gate disappears from the row, the drawer and the footer at
 * once. No dropdowns, no separate contact button (spec decision).
 */
export async function SiteHeader() {
  const navigation = await getPublishedNavigation()
  const utilities = await getPublishedUtilities()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-8 px-5 lg:px-10">
        <Link
          href="/"
          aria-label="HAY2010 — accueil"
          className="flex shrink-0 items-center"
        >
          <SiteLogo priority />
        </Link>

        <div className="flex items-center gap-8">
          <SiteNavigation
            items={navigation}
            utilities={utilities}
            contactEmail={COMPANY.email}
            contactMailto={CONTACT_MAILTO}
            base={COMPANY.base}
          />
        </div>
      </div>
    </header>
  )
}
