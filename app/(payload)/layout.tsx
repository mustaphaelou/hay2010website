/* THIS FILE IS PART OF THE PAYLOAD ADMIN SETUP. */
/* Keep it in app/(payload)/ — Payload's default routes (`/admin`, `/api`) depend on this location. */
import config from "@payload-config"
import "@payloadcms/next/css"
import type { ServerFunctionClient } from "payload"
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts"
import React from "react"

import { importMap } from "./admin/importMap.js"
import "./custom.scss"

type Args = { children: React.ReactNode }

const serverFunction: ServerFunctionClient = async function (args) {
  "use server"
  return handleServerFunctions({ ...args, config, importMap })
}

/**
 * Root layout of the `(payload)` route group — the admin's own HTML document.
 *
 * The app deliberately has no `app/layout.tsx`: `(payload)` and `(frontend)`
 * are two root layouts. The admin keeps Payload's precompiled CSS
 * (`@payloadcms/next/css`) and must never import the site's Tailwind globals.
 */
const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
