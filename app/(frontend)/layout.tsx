import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { SkipLink } from "@/components/site/skip-link"
import { PAGE_SEO } from "@/lib/seo"
import { SITE, SITE_URL } from "@/lib/seo/site"
import { poppins } from "@/lib/site/fonts"
import { cn } from "@/lib/utils"

import "./globals.css"

/**
 * The site-wide crawler defaults (ticket #32; docs/seo/seo-metadata.md §2.4,
 * §3.2, §3.6, §4.2):
 *
 * - `metadataBase` is mandatory and code-owned: the canonical apex (or the
 *   staging origin via `NEXT_PUBLIC_SERVER_URL`), never localhost;
 * - `title.template` appends the single `— HAY2010` suffix; pages supply the
 *   keyword-led phrase only, and the homepage uses `title.absolute`;
 * - the default Open Graph/Twitter block is complete, because Next's metadata
 *   merge is shallow — each page's helper re-spreads the full object;
 * - `lang` is `fr` on the document below; `robots`, `formatDetection` and the
 *   viewport export are the decided baseline.
 *
 * Icons are gated by #4 (logo ownership): no placeholder icon is added here.
 */
const homepage = PAGE_SEO["/"]
const homepageTitle = `HAY2010 — ${homepage.phrase}`

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    template: "%s — HAY2010",
    default: homepageTitle,
  },
  description: homepage.description,
  applicationName: SITE.name,
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    title: homepageTitle,
    description: homepage.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    images: [SITE.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: homepageTitle,
    description: homepage.description,
    images: [SITE.ogImage],
  },
}

/** Theme/viewport are the `viewport` export, not deprecated metadata fields. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Light theme only in v1 (#4 §2.2); paper is the brand background.
  colorScheme: "light",
  themeColor: "#F7F6F1",
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
