/* eslint-disable @next/next/no-img-element */
"use client"

import Image from "next/image"
import { useEffect, useRef, useState, type ReactNode } from "react"

import {
  ADDRESS,
  EMAIL,
  FOOTER_POSITIONING,
  LOCATION,
  NAV,
  SERVICES,
} from "./homepage-data"
import { HeroScene, PlaceholderScene, SceneTag } from "./scenes"

/**
 * Shared prototype chrome. The real header/footer will be built from the nav
 * data module once the pages exist; these stand-ins keep the prototype
 * self-contained and judgement-ready.
 */

const SECTION_HREF: Record<string, string> = {
  "L’Entreprise": "#entreprise",
  "Nos Métiers": "#metiers",
  Réalisations: "#realisations",
  Carrières: "#carrieres",
  Contact: "#contact",
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-[#111217] focus:px-4 focus:py-2 focus:text-white"
    >
      Aller au contenu
    </a>
  )
}

export function PrototypeHeader() {
  const [open, setOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = "hidden"

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== "Tab") return
      const drawer = drawerRef.current
      if (!drawer) return
      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
      previouslyFocused?.focus()
    }
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-[#DEDDD5] bg-white/95">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-10">
        <a
          href="#top"
          className="flex items-center"
          aria-label="HAY2010 — accueil"
        >
          <Image
            src="/brand/hay2010-logo.webp"
            alt="HAY2010"
            width={468}
            height={355}
            priority
            className="h-[52px] w-auto"
          />
        </a>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Principale"
        >
          {NAV.map((item) => (
            <a
              key={item.label}
              href={SECTION_HREF[item.label] ?? item.href}
              className="text-[13px] font-medium text-[#3C3E45] transition-colors hover:text-[#111217]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden rounded-full bg-[#111217] px-5 py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#E97425] hover:text-[#111217] sm:inline-flex"
          >
            Nous contacter
          </a>
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            aria-controls="prototype-mobile-menu"
            className="grid size-10 place-items-center rounded-full border border-[#DEDDD5] lg:hidden"
          >
            <span className="flex w-4 flex-col gap-[5px]" aria-hidden="true">
              <span className="h-px w-full bg-[#111217]" />
              <span className="h-px w-full bg-[#111217]" />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="prototype-mobile-menu"
          ref={drawerRef}
          className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex h-[76px] items-center justify-between border-b border-[#DEDDD5] px-5">
            <img
              src="/brand/hay2010-logo.svg"
              alt="HAY2010"
              className="h-[44px] w-auto"
            />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="grid size-10 place-items-center rounded-full border border-[#DEDDD5]"
            >
              <span className="text-lg leading-none" aria-hidden="true">
                ×
              </span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
            <a
              href="#top"
              onClick={() => setOpen(false)}
              className="block border-b border-[#DEDDD5] py-4 text-[15px] font-medium"
            >
              Accueil
            </a>
            {NAV.map((item) => (
              <a
                key={item.label}
                href={SECTION_HREF[item.label] ?? item.href}
                onClick={() => setOpen(false)}
                className="block border-b border-[#DEDDD5] py-4 text-[15px] font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="border-t border-[#DEDDD5] px-5 py-5">
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-[#111217] px-5 py-3.5 text-center text-[13px] font-medium text-white"
            >
              Nous contacter
            </a>
            <p className="mt-4 text-center text-[12px] text-[#5E6067]">
              {LOCATION} · {EMAIL}
            </p>
          </div>
        </div>
      )}
    </header>
  )
}

export function SectionLabel({
  number,
  label,
  tone = "paper",
}: {
  number: string
  label: string
  tone?: "paper" | "ink"
}) {
  const color = tone === "paper" ? "text-[#9A5A15]" : "text-[#E97425]"
  return (
    <p
      className={`text-[10.5px] font-semibold tracking-[0.2em] uppercase ${color}`}
    >
      {number} — {label}
    </p>
  )
}

export function PillButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string
  children: ReactNode
  variant?: "primary" | "outline" | "white" | "orange"
  className?: string
}) {
  const styles = {
    primary: "bg-[#111217] text-white hover:bg-[#E97425] hover:text-[#111217]",
    outline:
      "border border-[#111217]/20 text-[#111217] hover:border-[#111217] hover:bg-[#111217] hover:text-white",
    white: "bg-white text-[#111217] hover:bg-[#E97425]",
    orange: "bg-[#E97425] text-[#111217] hover:bg-[#111217] hover:text-white",
  } as const

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[13px] font-medium transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </a>
  )
}

export function TextLink({
  href,
  children,
  tone = "paper",
}: {
  href: string
  children: ReactNode
  tone?: "paper" | "ink"
}) {
  const color = tone === "paper" ? "text-[#111217]" : "text-white"
  const border = tone === "paper" ? "border-[#111217]/25" : "border-white/25"
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2 border-b ${border} pb-1 text-[13px] font-medium ${color} transition-colors hover:border-current`}
    >
      {children}
      <span
        className="transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        →
      </span>
    </a>
  )
}

export function PlaceholderImage({
  kind,
  ratio = "aspect-[16/9]",
  label = "visuel provisoire",
  className = "",
}: {
  kind: "dusk" | "trench" | "panel" | "mast" | "cable"
  ratio?: string
  label?: string
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden bg-[#14161D] ${ratio} ${className}`}
    >
      {kind === "dusk" ? (
        <HeroSceneWrapper />
      ) : (
        <PlaceholderScene kind={kind} />
      )}
      <SceneTag label={label} />
    </div>
  )
}

function HeroSceneWrapper() {
  return <HeroScene />
}

export function PrototypeFooter() {
  return (
    <footer className="bg-[#111217] text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src="/brand/hay2010-logo-white.svg"
              alt="HAY2010"
              className="h-[52px] w-auto"
            />
            <p className="mt-6 max-w-[30ch] text-[13px] leading-relaxed text-white/55">
              {FOOTER_POSITIONING}
            </p>
            <p className="mt-6 text-[13px] leading-relaxed text-white/55">
              {ADDRESS}
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-3 inline-block text-[13px] font-medium text-white underline-offset-4 hover:underline"
            >
              {EMAIL}
            </a>
          </div>

          <nav aria-label="L’Entreprise">
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-white/40 uppercase">
              L’Entreprise
            </p>
            <ul className="mt-5 space-y-3 text-[13px]">
              <li>
                <a
                  className="text-white/70 transition-colors hover:text-white"
                  href="#entreprise"
                >
                  L’Entreprise
                </a>
              </li>
              <li>
                <a
                  className="text-white/70 transition-colors hover:text-white"
                  href="#realisations"
                >
                  Réalisations
                </a>
              </li>
              <li>
                <a
                  className="text-white/70 transition-colors hover:text-white"
                  href="#carrieres"
                >
                  Carrières
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Nos métiers">
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-white/40 uppercase">
              Nos métiers
            </p>
            <ul className="mt-5 space-y-3 text-[13px]">
              {SERVICES.map((service) => (
                <li key={service.title}>
                  <a
                    className="text-white/70 transition-colors hover:text-white"
                    href="#metiers"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Contact et informations légales">
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-white/40 uppercase">
              Contact
            </p>
            <ul className="mt-5 space-y-3 text-[13px]">
              <li>
                <a
                  className="text-white/70 transition-colors hover:text-white"
                  href="#contact"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  className="text-white/70 transition-colors hover:text-white"
                  href="#mentions-legales"
                >
                  Mentions légales
                </a>
              </li>
              <li>
                <a
                  className="text-white/70 transition-colors hover:text-white"
                  href="#politique-de-confidentialite"
                >
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[11.5px] text-white/45 md:flex-row md:items-center md:justify-between">
          <p>© 2026 SOCIETE HAY 2010 — Tous droits réservés</p>
          <p>{LOCATION}</p>
        </div>
      </div>
    </footer>
  )
}
