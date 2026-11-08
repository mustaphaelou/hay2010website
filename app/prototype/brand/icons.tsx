import type { CSSProperties } from "react"

type IconProps = { className?: string; style?: CSSProperties }

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

/** Streetlight on a mast. */
export function IconLamp({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      style={style}
      {...line}
    >
      <path d="M6 21V4h10" />
      <path d="M13 4h7v4h-7z" />
      <path d="M17 8v2" />
      <path d="M13.5 12l-1 2.5M17 12v2.5M20.5 12l1 2.5" />
    </svg>
  )
}

/** Two nodes joined by a sagging cable. */
export function IconNetwork({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      style={style}
      {...line}
    >
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <path d="M7 7c2 5.5 8 5.5 10 0" />
      <path d="M5 8v12M19 8v12M5 17h14" />
    </svg>
  )
}

/** Transformer station with a winding symbol. */
export function IconTransformer({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      style={style}
      {...line}
    >
      <rect x="4" y="7" width="16" height="12" rx="1" />
      <path d="M8 7V4M16 7V4M8 19v2M16 19v2" />
      <path d="M8.5 12h1.5l1 2 2-4 1 2h1.5" />
    </svg>
  )
}

/** Distribution panel / CFO. */
export function IconPanel({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      style={style}
      {...line}
    >
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M8 7h8M8 11h2.5M13.5 11H16M8 15h2.5M13.5 15H16M8 19h8" />
    </svg>
  )
}

/** Solid pictograms for the poster direction. */
export function IconLampSolid({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      style={style}
      fill="currentColor"
    >
      <rect x="4" y="3" width="3.2" height="18" />
      <rect x="7.2" y="3" width="12.8" height="2.6" />
      <rect x="15" y="5.6" width="5" height="5" />
      <rect
        x="11"
        y="13"
        width="1.6"
        height="4"
        transform="rotate(-35 11 13)"
      />
      <rect x="16.2" y="13" width="1.6" height="4" />
      <rect x="21" y="13" width="1.6" height="4" transform="rotate(35 21 13)" />
    </svg>
  )
}

export function IconNetworkSolid({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      style={style}
      fill="currentColor"
    >
      <circle cx="5" cy="6" r="2.4" />
      <circle cx="19" cy="6" r="2.4" />
      <path d="M6.5 8.2c1.6 4.4 9.4 4.4 11 0l-1.2 5.2c-2.2 2-6.4 2-8.6 0Z" />
      <rect x="4" y="9" width="2" height="12" />
      <rect x="18" y="9" width="2" height="12" />
      <rect x="4" y="17" width="16" height="2" />
    </svg>
  )
}

export function IconTransformerSolid({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      style={style}
      fill="currentColor"
    >
      <rect x="4" y="7" width="16" height="12" />
      <rect x="7.4" y="3.4" width="1.8" height="3.6" />
      <rect x="14.8" y="3.4" width="1.8" height="3.6" />
      <rect x="7.4" y="19" width="1.8" height="2.6" />
      <rect x="14.8" y="19" width="1.8" height="2.6" />
      <path
        d="M8 10.5h2.2l1.3 2.6 1.6-4.4 1.3 2.6H17"
        fill="none"
        stroke="var(--card-bg, #fff)"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function IconPanelSolid({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      style={style}
      fill="currentColor"
    >
      <rect x="4" y="3" width="16" height="18" />
      <g fill="var(--card-bg, #fff)">
        <rect x="7" y="6.5" width="10" height="1.6" />
        <rect x="7" y="10.5" width="4" height="2.4" />
        <rect x="13" y="10.5" width="4" height="2.4" />
        <rect x="7" y="15" width="4" height="2.4" />
        <rect x="13" y="15" width="4" height="2.4" />
      </g>
    </svg>
  )
}
