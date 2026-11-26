/**
 * Prototype-only drawn scenes. These are NOT photographs and must never be
 * published. They stand in for the commissioned photography briefed in
 * docs/brand/brand-direction.md §5 so the homepage layout can be judged.
 */

export function HeroScene() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="a-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0C0F17" />
          <stop offset="0.38" stopColor="#20222E" />
          <stop offset="0.62" stopColor="#4E423D" />
          <stop offset="0.8" stopColor="#9C6F49" />
          <stop offset="0.93" stopColor="#D49A5E" />
          <stop offset="1" stopColor="#6E4E38" />
        </linearGradient>
        <radialGradient id="a-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFE0AE" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#FFB964" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FF9E2C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="a-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A1A1F" />
          <stop offset="1" stopColor="#090A0D" />
        </linearGradient>
        <linearGradient id="a-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD9A0" stopOpacity="0.32" />
          <stop offset="1" stopColor="#FFD9A0" stopOpacity="0" />
        </linearGradient>
        <filter id="a-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id="a-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#a-sky)" />

      {/* setting sun haze */}
      <ellipse
        cx="1120"
        cy="590"
        rx="430"
        ry="180"
        fill="#E8A15C"
        opacity="0.28"
        filter="url(#a-blur)"
      />
      <circle
        cx="1120"
        cy="595"
        r="52"
        fill="#FFD49A"
        opacity="0.5"
        filter="url(#a-blur)"
      />

      {/* distant town */}
      <g fill="#141620" opacity="0.92">
        <path d="M0 596h90v-34h54v34h74v-62h48v62h96v-26h58v26h84v-78h42v78h104v-40h64v40h88v-56h46v56h118v-22h58v22h92v-48h50v48h120v-30h62v30h108v-68h44v68h96v-26h60v26h120v64H0Z" />
      </g>
      <g fill="#1B1D27">
        <path d="M120 596v-48h26v48M420 596v-40h20v40M760 596v-52h24v52M1050 596v-36h18v36M1330 596v-44h22v44" />
      </g>

      {/* ground */}
      <rect y="628" width="1600" height="272" fill="url(#a-road)" />
      <path d="M0 628h1600" stroke="#4A4038" strokeWidth="1.5" opacity="0.6" />
      <g stroke="#3A3A40" strokeWidth="1" opacity="0.5">
        <path d="M0 690h1600" />
        <path d="M0 792h1600" />
      </g>
      <g stroke="#C9A26B" strokeWidth="2" opacity="0.28">
        <path d="M120 860h90" />
        <path d="M330 860h90" />
        <path d="M540 860h90" />
        <path d="M750 860h90" />
        <path d="M960 860h90" />
        <path d="M1170 860h90" />
        <path d="M1380 860h90" />
      </g>

      {/* far pole */}
      <g stroke="#0E1017" strokeWidth="3" opacity="0.85">
        <path d="M470 626V330" />
        <path d="M470 338h54" strokeWidth="2.5" />
      </g>
      <circle cx="524" cy="342" r="3" fill="#FFD49A" opacity="0.85" />

      {/* main pole left */}
      <g stroke="#0B0D13" strokeWidth="7" strokeLinecap="round">
        <path d="M250 660V208" />
        <path d="M250 216c38 0 58 6 96 34" fill="none" strokeWidth="5" />
        <path
          d="M250 216c34 0 62 3 92 22"
          fill="none"
          strokeWidth="2"
          opacity="0.5"
        />
      </g>
      <g>
        <rect
          x="336"
          y="242"
          width="54"
          height="12"
          rx="3"
          fill="#0B0D13"
          transform="rotate(18 336 242)"
        />
        <ellipse cx="392" cy="262" rx="90" ry="52" fill="url(#a-glow)" />
        <path
          d="M352 266L300 520h210L438 266Z"
          fill="url(#a-beam)"
          opacity="0.5"
        />
      </g>

      {/* main pole right */}
      <g stroke="#0A0C12" strokeWidth="6" strokeLinecap="round">
        <path d="M1280 668V250" />
        <path d="M1280 258c-36 0-54 8-88 36" fill="none" strokeWidth="4.5" />
      </g>
      <g>
        <rect
          x="1156"
          y="288"
          width="48"
          height="11"
          rx="3"
          fill="#0A0C12"
          transform="rotate(-18 1156 288)"
        />
        <ellipse
          cx="1152"
          cy="302"
          rx="72"
          ry="44"
          fill="url(#a-glow)"
          opacity="0.9"
        />
      </g>

      {/* cables */}
      <g fill="none" stroke="#0B0D13" strokeWidth="1.8" opacity="0.9">
        <path d="M250 218Q760 300 1280 260" />
        <path d="M250 232Q760 320 1280 276" opacity="0.6" />
        <path d="M470 342Q760 390 1150 330" opacity="0.55" />
      </g>

      {/* foreground bokeh */}
      <circle
        cx="200"
        cy="720"
        r="80"
        fill="#FFB964"
        opacity="0.08"
        filter="url(#a-blur)"
      />
      <circle
        cx="1440"
        cy="700"
        r="110"
        fill="#FFB964"
        opacity="0.06"
        filter="url(#a-blur)"
      />

      {/* grain + vignette */}
      <rect width="1600" height="900" filter="url(#a-grain)" opacity="0.055" />
    </svg>
  )
}

export type SceneKind = "dusk" | "trench" | "panel" | "mast" | "cable"

/**
 * Abstract warm-monochrome stand-in for a photograph. Deliberately simple:
 * the point is to judge scale, crop and rhythm, not the picture.
 */
export function PlaceholderScene({
  kind,
  className,
}: {
  kind: SceneKind
  className?: string
}) {
  const uid = `p-${kind}`
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={className ?? "absolute inset-0 size-full"}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14161D" />
          <stop offset="0.55" stopColor="#2A2622" />
          <stop offset="1" stopColor="#4A3A2C" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#FFD9A0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FF9E2C" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="600" fill={`url(#${uid}-bg)`} />
      <ellipse cx="400" cy="270" rx="360" ry="200" fill={`url(#${uid}-glow)`} />

      {kind === "trench" && (
        <g stroke="#0D0F14" strokeWidth="10" strokeLinecap="round">
          <path d="M-20 480L820 300" />
          <path d="M-20 540L820 360" strokeWidth="7" />
          <path d="M-20 420L820 240" strokeWidth="4" />
        </g>
      )}
      {kind === "trench" && (
        <g stroke="#C9A26B" strokeWidth="2" opacity="0.5">
          <path d="M0 505L800 325" />
          <path d="M0 455L800 275" />
        </g>
      )}

      {kind === "panel" && (
        <g fill="#0D0F14" stroke="#3A3A40" strokeWidth="2">
          <rect x="180" y="120" width="440" height="360" rx="4" />
          <rect x="210" y="150" width="120" height="60" />
          <rect x="350" y="150" width="120" height="60" />
          <rect x="490" y="150" width="90" height="60" />
          <rect x="210" y="240" width="180" height="100" />
          <rect x="410" y="240" width="180" height="100" />
          <rect x="210" y="370" width="380" height="80" />
        </g>
      )}
      {kind === "panel" && (
        <g fill="#E97425" opacity="0.75">
          <rect x="222" y="162" width="40" height="8" />
          <rect x="362" y="162" width="40" height="8" />
          <rect x="502" y="162" width="40" height="8" />
        </g>
      )}

      {kind === "mast" && (
        <g stroke="#0B0D13" strokeLinecap="round">
          <path d="M380 620V80" strokeWidth="18" />
          <path d="M380 120c80 0 120 20 170 80" fill="none" strokeWidth="10" />
          <path
            d="M380 150c60 0 90 14 130 58"
            fill="none"
            strokeWidth="4"
            opacity="0.6"
          />
        </g>
      )}
      {kind === "mast" && (
        <circle cx="560" cy="210" r="46" fill="#FFD49A" opacity="0.85" />
      )}

      {kind === "cable" && (
        <g fill="none" stroke="#0D0F14" strokeWidth="26">
          <circle cx="300" cy="300" r="120" />
          <circle cx="520" cy="300" r="120" />
        </g>
      )}
      {kind === "cable" && (
        <g fill="none" stroke="#C9A26B" strokeWidth="8" opacity="0.8">
          <circle cx="300" cy="300" r="120" />
          <circle cx="520" cy="300" r="120" />
          <path d="M300 180v-80M520 180v-80" strokeWidth="12" />
        </g>
      )}

      {kind === "dusk" && (
        <g>
          <rect x="0" y="420" width="800" height="180" fill="#0B0D13" />
          <g stroke="#0B0D13" strokeWidth="6">
            <path d="M120 600V240" />
            <path d="M680 600V260" />
          </g>
          <circle cx="160" cy="230" r="16" fill="#FFD49A" opacity="0.9" />
          <circle cx="640" cy="250" r="14" fill="#FFD49A" opacity="0.9" />
          <path
            d="M120 250Q400 320 680 270"
            fill="none"
            stroke="#0B0D13"
            strokeWidth="2"
          />
        </g>
      )}
    </svg>
  )
}

/** Visible placeholder tag — staging only, never production. */
export function SceneTag({ label = "visuel provisoire" }: { label?: string }) {
  return (
    <span className="absolute right-3 bottom-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-medium tracking-[0.18em] text-white/80 uppercase backdrop-blur-sm">
      {label}
    </span>
  )
}
