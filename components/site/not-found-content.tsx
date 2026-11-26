import Link from "next/link"

import { getPublishedNavigation } from "@/lib/site/rubriques"
import { NOT_FOUND_MESSAGE, NOT_FOUND_TITLE } from "@/lib/site/site"

/**
 * The 404 body — one implementation for the two places that can render it:
 *
 * - `app/global-not-found.tsx`: unmatched URLs and closed gates (the proxy
 *   rewrites a closed route to `/_not-found`), rendered as its own document
 *   because the app has no root `app/layout.tsx`;
 * - `app/(frontend)/not-found.tsx`: a page or route segment that calls
 *   `notFound()` at render time (the CMS gate from #29, `generateStaticParams`
 *   misses), rendered inside the normal site layout.
 *
 * Links come from the published set through the content seam, so a gated
 * rubrique can never appear on the 404 page.
 */
export async function NotFoundContent() {
  const navigation = await getPublishedNavigation()

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10 lg:py-32">
      <p className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase">
        Erreur 404
      </p>
      <h1 className="mt-4 font-heading text-[clamp(2.25rem,6vw,4rem)] leading-[1.05] text-ink">
        {NOT_FOUND_TITLE}
      </h1>
      <p className="mt-6 max-w-[52ch] text-body">{NOT_FOUND_MESSAGE}</p>

      <nav aria-label="Retour aux rubriques" className="mt-12">
        <p className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase">
          Rubriques
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          {navigation.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
