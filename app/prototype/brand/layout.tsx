import type { Metadata } from "next"
import {
  Archivo,
  Bricolage_Grotesque,
  Inter,
  JetBrains_Mono,
  Poppins,
} from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
})

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
})

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Prototype — direction de marque",
  robots: { index: false, follow: false },
}

export default function PrototypeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${poppins.variable} ${archivo.variable} ${jetbrains.variable} ${bricolage.variable} ${inter.variable}`}
    >
      <style>{`
        @keyframes brand-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes brand-kenburns {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        @keyframes brand-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes brand-glow {
          0%, 100% { opacity: .55; }
          50% { opacity: .9; }
        }
        @keyframes brand-draw {
          from { stroke-dashoffset: var(--dash, 600); }
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-kenburns, .brand-marquee, .brand-rise, .brand-glow, .brand-draw {
            animation: none !important;
          }
        }
      `}</style>
      {children}
    </div>
  )
}
