/**
 * The one SEO module (`lib/seo`) — origin/URL policy, page metadata, structured
 * data, robots and sitemap helpers.
 *
 * Decision record: docs/seo/seo-metadata.md. It absorbs the temporary page
 * helper `lib/site/metadata.ts` (#22–#24) and the legal metadata defaults
 * `lib/legal/metadata.ts` (#28), so a page imports one module for its head and
 * its JSON-LD, and the origin has exactly one definition.
 */
export {
  absoluteUrl,
  canonicalPath,
  SITE,
  SITE_ORIGIN,
  SITE_URL,
} from "./site"
export {
  getPageSeoDefault,
  PAGE_SEO,
  type PageSeoDefault,
  type WebPageType,
} from "./pages"
export {
  pageMetadata,
  resolvePageSeo,
  type PageSeo,
  type PageSeoInput,
} from "./metadata"
export {
  buildPageGraph,
  ORGANIZATION_ID,
  WEBSITE_ID,
  type JsonLdGraph,
  type JsonLdNode,
} from "./structured-data"
