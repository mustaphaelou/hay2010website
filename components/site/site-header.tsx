import Link from "next/link"

import { SiteLogo } from "@/components/site/site-logo"
import { MAIN_NAVIGATION } from "@/lib/site/navigation"

/**
 * Sticky solid-white header (brand direction §2.4 and homepage README §3.2):
 * 76 px high, 52 px badge linking home, horizontal rubrique row from 1024 px.
 *
 * Below 1024 px the header shows the logo only. Ticket #21 adds the mobile
 * drawer: it mounts its trigger in the `header-actions` slot and its overlay
 * after the bar, without rewriting this component. The P1 row has no contact
 * button by decision.
 */
export function SiteHeader() {
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
          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-7 lg:flex"
          >
            {MAIN_NAVIGATION.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-[13px] font-medium text-body transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* #21 mounts the mobile drawer trigger here; the drawer is not built yet. */}
          <div data-slot="header-actions" className="flex items-center gap-3" />
        </div>
      </div>
    </header>
  )
}
