import type { Metadata } from "next"
import type { ReactNode } from "react"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { SkipLink } from "@/components/site/skip-link"
import { poppins } from "@/lib/site/fonts"
import { cn } from "@/lib/utils"

import "./globals.css"

/**
 * French metadata holding the approved positioning. The full SEO system
 * (title template, canonical, Open Graph, JSON-LD) lands in #32; these are the
 * decided launch defaults from docs/seo/seo-metadata.md §3.3.
 */
export const metadata: Metadata = {
  title: "HAY2010 — Éclairage public et électrification à Rabat",
  description:
    "Entreprise d’éclairage public et d’électrification HTA/MT, MT/BT, postes de transformation et CFO/CFA à Rabat. Plus de 10 ans d’expérience. Études et travaux.",
  applicationName: "HAY2010",
}

/**
 * French root layout of the site, inside the `(frontend)` route group.
 *
 * There is deliberately no `app/layout.tsx`: the embedded Payload admin (#29)
 * brings its own root layout in `app/(payload)/layout.tsx`, which is only legal
 * when no root layout exists at the app root. Each root group owns its
 * `<html lang="fr">` document — see docs/build/content-seam.md §"Layout".
 *
 * Pages are statically rendered from the content source at build time, the
 * production model #29 keeps: a deploy builds with the CMS database reachable
 * and publishes through revalidation. The HTTP suite proves each gate scenario
 * by rebuilding the app with `CONTENT_SCENARIO=<name>` (see
 * docs/build/verification.md), so the tested artefact is always the production
 * build — no runtime flag weakens the render path.
 */

/**
 * One header, one main, one footer around every page. Header and footer render
 * here once, not per page; they derive their links from the published set.
 */
export default function FrontendLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="fr" className={cn(poppins.variable, "font-sans")}>
      <body className="flex min-h-svh flex-col bg-background text-foreground antialiased">
        <SkipLink />

        <SiteHeader />

        <main id="contenu" tabIndex={-1} className="flex-1">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  )
}
