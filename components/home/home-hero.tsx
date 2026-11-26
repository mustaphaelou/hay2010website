import Image from "next/image"
import Link from "next/link"

import type { HeroBlock, MediaRecord } from "@/lib/content/types"
import { COMPANY } from "@/lib/site/company"

/**
 * Accueil hero — the one section that carries the page h1 (ticket #23).
 *
 * Two content states, never a third: a licensed documentary photograph when the
 * content source carries a cleared media record with intrinsic dimensions, and
 * otherwise the typographic ink fallback. Stock, generated and placeholder
 * images are forbidden (docs/brand/brand-direction.md §2.5, §4), so an absent
 * image is rendered as type on ink — not as a grey frame or a drawn scene.
 *
 * No layout shift: the image is an absolutely positioned backdrop inside a
 * fixed-minimum-height hero and carries `width`/`height` so the aspect ratio is
 * reserved before the bytes arrive. Motion (Ken Burns + copy rise) is declared
 * only under `prefers-reduced-motion: no-preference` in `globals.css`.
 */

/** A media record good enough to render as the hero photograph. */
type RenderableHeroMedia = MediaRecord & {
  readonly src: string
  readonly width: number
  readonly height: number
}

function renderableMedia(
  media: MediaRecord | null
): RenderableHeroMedia | null {
  if (!media?.src || !media.width || !media.height) return null
  return media as RenderableHeroMedia
}

export function HomeHero({
  block,
  media,
  title,
}: {
  /** The hero block from the page document; absent blocks fall back to the title. */
  readonly block: HeroBlock | null
  /** The cleared media record resolved through the content seam, if any. */
  readonly media: MediaRecord | null
  /** Page title, used as the headline when the hero block is absent. */
  readonly title: string
}) {
  const headline = block?.headline ?? title
  const image = renderableMedia(media)
  const links = block?.links ?? []

  return (
    <section
      aria-labelledby="accueil-titre"
      className="relative isolate overflow-hidden bg-ink text-surface"
    >
      {image ? (
        <>
          <div className="accueil-hero-media absolute inset-0">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="100vw"
              loading="eager"
              className="h-full w-full object-cover"
            />
          </div>
          {/* Ink overlay on the copy side so the headline keeps its contrast. */}
          <div aria-hidden="true" className="absolute inset-0 bg-ink/45" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-r from-ink via-ink/70 to-ink/10"
          />
        </>
      ) : null}

      <div className="accueil-hero-copy relative mx-auto flex min-h-[560px] max-w-[1440px] flex-col justify-end px-5 pt-28 pb-16 md:min-h-[640px] md:px-10 lg:min-h-[720px] lg:pb-24">
        <p className="text-[10.5px] font-semibold tracking-[0.2em] text-orange uppercase">
          {COMPANY.brand} · {COMPANY.base}
        </p>

        <h1
          id="accueil-titre"
          className="mt-6 max-w-[18ch] text-[clamp(42px,6.4vw,92px)] leading-[0.94] font-light tracking-[-0.035em]"
        >
          {headline}
        </h1>

        {block?.tagline ? (
          <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-surface/75 md:text-[17px]">
            {block.tagline}
          </p>
        ) : null}

        {links.length > 0 ? (
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            {links.map((link, index) =>
              index === 0 ? (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-orange hover:text-ink"
                >
                  {link.label}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="inline-flex items-center gap-2 border-b border-surface/40 pb-1 text-sm font-medium text-surface transition-colors hover:border-surface"
                >
                  {link.label}
                  <span aria-hidden="true">→</span>
                </Link>
              )
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
