import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Poppins } from "next/font/google"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { cn } from "@/lib/utils"

import "./globals.css"

/**
 * Poppins, the single brand family (brand direction §2.3): weights 300/400/500/600,
 * self-hosted by the framework, swapped in without layout shift.
 */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
})

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
 * French root shell: one header, one main, one footer around every page.
 *
 * The skip link is the first focusable element and targets the `main` landmark
 * (`#contenu`), which is programmatically focusable so keyboard navigation
 * lands in the content. Header and footer render here once, not per page.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="fr" className={cn(poppins.variable, "font-sans")}>
      <body className="flex min-h-svh flex-col bg-background text-foreground antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:self-start focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-surface"
        >
          Aller au contenu
        </a>

        <SiteHeader />

        <main id="contenu" tabIndex={-1} className="flex-1">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  )
}
