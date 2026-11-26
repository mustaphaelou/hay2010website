import type { NextConfig } from "next"

/**
 * `output: "standalone"` emits `.next/standalone` (server.js + the traced subset
 * of node_modules) for the ARM64 runtime image (docs/hosting/deployment-decision.md
 * §5). The Dockerfile copies `.next/standalone`, `.next/static` and `public`.
 */
const nextConfig: NextConfig = {
  output: "standalone",
}

export default nextConfig
