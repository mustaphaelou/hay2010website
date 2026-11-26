import type { Metadata } from "next"

import { NotFoundContent } from "@/components/site/not-found-content"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { SkipLink } from "@/components/site/skip-link"
import { poppins } from "@/lib/site/fonts"
import { NOT_FOUND_TITLE } from "@/lib/site/site"
import { cn } from "@/lib/utils"

import "@/app/(frontend)/globals.css"

/**
 * The 404 document for the whole site.
 *
 * It is a `global-not-found` document (see docs/build/content-seam.md
 * §"404 page") because the app has no root `app/layout.tsx`: with multiple
 * route groups (`(frontend)` and `(payload)` from #29) Next.js cannot compose a
 * global 404 from a single layout. This file therefore owns the complete
 * document — `<html lang="fr">`, fonts, global CSS, header and footer — and
 * reuses the same shell components as the site layout so the 404 is a real
 * branded page, never a hollow shell.
 *
 * Two server paths land here and both return a 404 status:
 * - an unmatched URL (Next.js handles it directly, `experimental.globalNotFound`);
 * - a closed gate: `proxy.ts` rewrites the gated route to `/_not-found` before
 *   rendering, which serves this document with a 404 status.
 *
 * A page that calls `notFound()` during render (the CMS gate in #29) is served
 * by `app/(frontend)/not-found.tsx`, which renders the same
 * `NotFoundContent` inside the normal layout.
 */

export const metadata: Metadata = {
  title: `${NOT_FOUND_TITLE} — HAY2010`,
  description:
    "La page demandée n’existe pas ou n’est plus disponible. Retrouvez les rubriques du site HAY2010.",
  robots: { index: false, follow: false },
}

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={cn(poppins.variable, "font-sans")}>
      <body className="flex min-h-svh flex-col bg-background text-foreground antialiased">
        <SkipLink />

        <SiteHeader />

        <main id="contenu" tabIndex={-1} className="flex-1">
          <NotFoundContent />
        </main>

        <SiteFooter />
      </body>
    </html>
  )
}
