"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { VARIANTS, type VariantKey } from "./brand-data"

type Props = { current: VariantKey }

export function PrototypeSwitcher({ current }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const go = useCallback(
    (key: VariantKey) => {
      router.replace(`${pathname}?variant=${key}`, { scroll: false })
    },
    [pathname, router]
  )

  const step = useCallback(
    (dir: -1 | 1) => {
      const index = VARIANTS.findIndex((v) => v.key === current)
      const next = VARIANTS[(index + dir + VARIANTS.length) % VARIANTS.length]
      go(next.key)
    },
    [current, go]
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target?.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        step(-1)
      }
      if (event.key === "ArrowRight") {
        event.preventDefault()
        step(1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [step])

  // The bar is a judging aid, never part of the design being judged.
  if (process.env.NODE_ENV === "production") return null

  const active = VARIANTS.find((v) => v.key === current) ?? VARIANTS[0]

  return (
    <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 print:hidden">
      <div className="flex items-center gap-1 rounded-full border border-white/15 bg-[#0d0e12]/95 py-1.5 pr-3 pl-1.5 text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,.7)] backdrop-blur">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Direction précédente"
          className="grid size-9 place-items-center rounded-full text-lg text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB03A]"
        >
          ←
        </button>
        <div className="flex min-w-[13.5rem] flex-col items-center px-2 leading-none">
          <span className="text-[12px] font-semibold tracking-wide">
            {active.label}
          </span>
          <span className="mt-1 text-[9px] tracking-[0.18em] text-white/45 uppercase">
            prototype · direction {active.key}
          </span>
        </div>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Direction suivante"
          className="grid size-9 place-items-center rounded-full text-lg text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB03A]"
        >
          →
        </button>
        <div className="ml-1 hidden items-center gap-1 border-l border-white/10 pl-3 sm:flex">
          {VARIANTS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => go(v.key)}
              aria-label={`Voir la direction ${v.key.toUpperCase()}`}
              aria-pressed={v.key === current}
              className={`grid size-7 place-items-center rounded-full text-[11px] font-semibold transition ${
                v.key === current
                  ? "bg-white text-[#0d0e12]"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {v.key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-center text-[9px] tracking-[0.2em] text-black/40 uppercase">
        ← → pour changer · prototype jetable
      </p>
    </div>
  )
}
