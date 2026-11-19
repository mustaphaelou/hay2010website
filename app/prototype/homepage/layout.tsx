import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Prototype — page d’accueil",
  description:
    "Prototype jetable de la page d’accueil HAY2010. Textes et visuels provisoires.",
  robots: { index: false, follow: false },
}

export default function HomepagePrototypeLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div
      className={`${poppins.variable} bg-[#F7F6F1] text-[#111217]`}
      style={{ fontFamily: "var(--font-poppins)" }}
    >
      <style>{`
        .prototype-kenburns {
          animation: prototype-kenburns 22s ease-out both;
        }
        .prototype-rise {
          animation: prototype-rise 700ms ease-out both;
        }
        @keyframes prototype-kenburns {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        @keyframes prototype-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .prototype-kenburns, .prototype-rise {
            animation: none !important;
          }
        }
      `}</style>
      {children}
    </div>
  )
}
