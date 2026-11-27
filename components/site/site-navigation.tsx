"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { SiteLogo } from "@/components/site/site-logo"
import type { NavigationItem } from "@/lib/site/rubriques"

/**
 * The one navigation component: desktop row + mobile drawer trigger + drawer.
 *
 * The published item list is computed on the server (gates applied there) and
 * passed as props; the only client-side concern is the current section and the
 * drawer's state.
 *
 * Accessibility contract (ticket #21 acceptance):
 * - the current section carries `aria-current="page"`, in the row and drawer;
 * - the trigger is a real button with `aria-expanded` / `aria-controls`;
 * - the drawer is a native modal `<dialog>`: `showModal()` gives the focus
 *   trap, the Escape handling and the inert background for free;
 * - body scroll is locked while open, and focus returns to the trigger on
 *   close (Escape, close button or a followed link);
 * - the closed dialog is display:none, so it is inert to keyboard and screen
 *   readers, and no-JS visitors get the drawers's links through a `<noscript>`
 *   fallback for the mobile breakpoint.
 *
 * No animation is attached to the drawer, so `prefers-reduced-motion` needs no
 * special case here; the global stylesheet still disables motion globally.
 */

const DRAWER_ID = "menu-mobile"

/** Is `href` the section the visitor is in? Domain children mark their parent. */
function isCurrentSection(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Inline 24 px line icon: burger. */
function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      className="size-6"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

/** Inline 24 px line icon: close. */
function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      className="size-6"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export interface SiteNavigationProps {
  readonly items: readonly NavigationItem[]
  readonly utilities: readonly NavigationItem[]
  readonly contactEmail: string
  readonly contactMailto: string
  readonly base: string
}

export function SiteNavigation({
  items,
  utilities,
  contactEmail,
  contactMailto,
  base,
}: SiteNavigationProps) {
  const pathname = usePathname() ?? "/"
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDialogElement>(null)

  // Open/close the native modal and lock the page scroll while it is open.
  useEffect(() => {
    const drawer = drawerRef.current
    if (!drawer) return

    if (open) {
      if (!drawer.open) drawer.showModal()
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }

    if (drawer.open) drawer.close()
  }, [open])

  function closeDrawer() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="hidden items-center gap-7 lg:flex"
      >
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={
              isCurrentSection(item.href, pathname) ? "page" : undefined
            }
            className="text-[13px] font-medium text-body transition-colors hover:text-ink aria-[current=page]:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={DRAWER_ID}
        aria-label="Ouvrir le menu"
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink lg:hidden"
      >
        <MenuIcon />
      </button>

      <dialog
        id={DRAWER_ID}
        ref={drawerRef}
        aria-label="Menu"
        onClose={closeDrawer}
        className="site-drawer m-0 h-svh max-h-none w-screen max-w-none border-0 bg-surface p-0 text-ink"
      >
        <div className="flex h-full flex-col px-5 py-5">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              aria-label="HAY2010 — accueil"
              onClick={closeDrawer}
              className="flex shrink-0 items-center"
            >
              <SiteLogo />
            </Link>
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => drawerRef.current?.close()}
              className="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
            >
              <CloseIcon />
            </button>
          </div>

          <nav
            aria-label="Navigation mobile"
            className="mt-10 flex flex-col gap-1"
          >
            {items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={closeDrawer}
                aria-current={
                  isCurrentSection(item.href, pathname) ? "page" : undefined
                }
                className="border-b border-line/70 py-4 font-heading text-2xl font-medium text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {utilities.length > 0 ? (
            <nav aria-label="Informations" className="mt-6 flex flex-col gap-2">
              {utilities.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={closeDrawer}
                  className="text-sm font-medium text-body transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}

          <p className="mt-auto border-t border-line pt-6 text-sm text-body">
            {base} ·{" "}
            <a
              href={contactMailto}
              className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
            >
              {contactEmail}
            </a>
          </p>
        </div>
      </dialog>

      {/*
       * No-JS fallback: without JavaScript the dialog cannot be opened, so the
       * drawer's links would be unreachable on mobile. Keep them in the flow at
       * the mobile breakpoint instead (the desktop row is unaffected).
       */}
      <noscript>
        <style>{`
          @media (max-width: 1023px) {
            #${DRAWER_ID} { display: block; position: static; width: auto; height: auto; }
            #${DRAWER_ID} > div { height: auto; }
            #${DRAWER_ID} button { display: none; }
          }
        `}</style>
      </noscript>
    </>
  )
}
