import { Poppins } from "next/font/google"

/**
 * Poppins, the single brand family (brand direction §2.3): weights 300/400/500/600,
 * self-hosted by the framework, swapped in without layout shift.
 *
 * One instance shared by the site root layout and the global 404 document, so
 * both serve the same self-hosted font files and CSS variable.
 */
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
})
