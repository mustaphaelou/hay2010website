#!/usr/bin/env node
/**
 * Generate the single typographic Open Graph card of the site — ticket #32,
 * docs/seo/seo-metadata.md §4.1.
 *
 *   node scripts/generate-og-card.mjs
 *
 * The committed output is `public/og/hay2010-default.png`: 1200 × 630, sRGB,
 * ink background, paper foreground, one orange rule, the `HAY2010` wordmark set
 * as text in Poppins Light (the badge artwork is gated by #4), the approved
 * service line and the site origin. No photograph, no logo, no external asset:
 * the PNG is generated from the two Poppins TTF files committed next to this
 * script (SIL Open Font License, `OFL.txt`) and rendered with Next's bundled
 * `next/og` (satori + resvg), so a checkout can rebuild it offline.
 *
 * Why a static file and not a runtime `ImageResponse` route: the SEO decision
 * (§4.4) rejects a dynamic card at launch — it adds a runtime route, font
 * loading and a large handler bundle for no benefit, while a static file is
 * cached at the edge. The generator is a build-time developer script, not part
 * of the server.
 *
 * Regenerate and commit the PNG whenever the card copy or the brand tokens
 * change; the HTTP suite asserts the served bytes are a 1200 × 630 PNG.
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

import React from "react"

const require = createRequire(import.meta.url)
const { ImageResponse } = require("next/og")

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const fontDir = path.join(projectRoot, "scripts", "assets", "og")
const outputFile = path.join(projectRoot, "public", "og", "hay2010-default.png")

/** Brand tokens (docs/brand/brand-direction.md §2.2) — keep in sync by hand. */
const INK = "#111217"
const PAPER = "#F7F6F1"
const ORANGE = "#E97425"

const poppinsLight = fs.readFileSync(path.join(fontDir, "Poppins-Light.ttf"))
const poppinsRegular = fs.readFileSync(path.join(fontDir, "Poppins-Regular.ttf"))

const element = React.createElement(
  "div",
  {
    style: {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: INK,
      color: PAPER,
      padding: "96px",
      fontFamily: "Poppins",
    },
  },
  // Top block: one orange rule, then the wordmark as text (never the badge).
  React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column" } },
    React.createElement("div", {
      style: {
        display: "flex",
        width: "72px",
        height: "6px",
        backgroundColor: ORANGE,
      },
    }),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          marginTop: "48px",
          fontSize: "172px",
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: "-0.04em",
        },
      },
      "HAY2010"
    )
  ),
  // Bottom block: the approved service line, then the origin bottom-right.
  React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column" } },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          fontSize: "38px",
          fontWeight: 400,
          letterSpacing: "0",
          lineHeight: 1.25,
        },
      },
      "Éclairage public · Réseaux HTA/MT · CFO/CFA"
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "32px",
          fontSize: "24px",
          fontWeight: 400,
          letterSpacing: "0.02em",
          color: "rgba(247, 246, 241, 0.64)",
        },
      },
      "hay2010.ma"
    )
  )
)

const response = new ImageResponse(element, {
  width: 1200,
  height: 630,
  fonts: [
    { name: "Poppins", data: poppinsLight, weight: 300, style: "normal" },
    { name: "Poppins", data: poppinsRegular, weight: 400, style: "normal" },
  ],
})

const buffer = Buffer.from(await response.arrayBuffer())
fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, buffer)

const { width, height } = readPngSize(buffer)
console.log(
  `wrote ${path.relative(projectRoot, outputFile)} — ${width}×${height}, ${buffer.length} bytes`
)

/** Read the IHDR dimensions without an image library. */
function readPngSize(png) {
  if (png.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("ImageResponse did not return a PNG signature")
  }
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
}
