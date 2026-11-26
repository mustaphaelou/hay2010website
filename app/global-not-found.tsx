import type { Metadata } from "next"
import Link from "next/link"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { SkipLink } from "@/components/site/skip-link"
import { getPublishedNavigation } from "@/lib/site/rubriques"
import { poppins } from "@/lib/site/fonts"
import { NOT_FOUND_MESSAGE, NOT_FOUND_TITLE } from "@/lib/site/site"
import { cn } from "@/lib/utils"

import "@/app/(frontend)/globals.css"

/**
 * The 404 page for the whole site.
 *
 * It is a `global-not-found` document (see docs/build/content-seam.md
 * §"404 page") because the app has no root `app/layout.tsx`: with multiple
 * route groups (`(frontend)` today, `(payload)` from #29) Next.js cannot compose
 * a global 404 from a single layout. This file therefore owns the complete
 * document — `<html lang="fr">`, fonts, global CSS, header and footer — and
 * reuses the same shell components as the site layout so the 404 is a real
 * branded page, never a hollow shell.
 *
 * Two server paths land here and both return a 404 status:
 * - an unmatched URL (Next.js handles it directly, `experimental.globalNotFound`);
 * - a closed gate: `proxy.ts` rewrites the gated route to `/_not-found` before
 *   rendering, which serves this document with a 404 status.
 *
 * The links back are derived from the *published* set through the content seam,
 * so a gated rubrique can never appear on the 404 page. The document is
 * prerendered per build like every other route, so each fixture scenario bakes
 * its own 404 links (the orchestrator rebuilds per scenario).
 */

export const metadata: Metadata = {
  title: `${NOT_FOUND_TITLE} — HAY2010`,
  description:
    "La page demandée n’existe pas ou n’est plus disponible. Retrouvez les rubriques du site HAY2010.",
  robots: { index: false, follow: false },
}

export default async function GlobalNotFound() {
  const navigation = await getPublishedNavigation()

  return (
    <html lang="fr" className={cn(poppins.variable, "font-sans")}>
      <body className="flex min-h-svh flex-col bg-background text-foreground antialiased">
        <SkipLink />

        <SiteHeader />

        <main id="contenu" tabIndex={-1} className="flex-1">
          <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10 lg:py-32">
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase">
              Erreur 404
            </p>
            <h1 className="mt-4 font-heading text-[clamp(2.25rem,6vw,4rem)] leading-[1.05] text-ink">
              {NOT_FOUND_TITLE}
            </h1>
            <p className="mt-6 max-w-[52ch] text-body">{NOT_FOUND_MESSAGE}</p>

            <nav aria-label="Retour aux rubriques" className="mt-12">
              <p className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase">
                Rubriques
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                {navigation.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>
        </main>

        <SiteFooter />
      </body>
    </html>
  )
}
