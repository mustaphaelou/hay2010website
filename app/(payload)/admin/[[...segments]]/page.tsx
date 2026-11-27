/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD AND IS COMMITTED ON PURPOSE. */
/* Regenerate with `npm run generate:importmap` after adding a custom admin component. */
import type { Metadata } from "next"
import config from "@payload-config"
import { RootPage, generatePageMetadata } from "@payloadcms/next/views"
import { importMap } from "../importMap"

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap })

export default Page
