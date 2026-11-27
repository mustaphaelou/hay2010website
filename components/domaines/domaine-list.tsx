import Link from "next/link"

import type { DomainDocument } from "@/lib/content/types"
import { getDomainPath } from "@/lib/site/domaines"

/**
 * The published-domain list — the one list the domain index renders.
 *
 * Content-only rows separated by 1 px rules (brand direction §2.4: no cards,
 * no shadows). The title is the link, so the accessible name is the domain
 * name itself; the arrow is decorative. Only domains returned by the seam are
 * passed in, so a gated domain can never reach this list.
 */
export function DomaineList({ domains }: { readonly domains: readonly DomainDocument[] }) {
  if (domains.length === 0) return null

  return (
    <ol className="mt-14 border-t border-line lg:mt-20">
      {domains.map((domain, index) => (
        <li key={domain.slug} className="border-b border-line">
          <div className="grid grid-cols-1 gap-3 py-8 sm:gap-4 lg:grid-cols-12 lg:items-baseline lg:gap-6 lg:py-10">
            <p
              aria-hidden="true"
              className="font-heading text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase lg:col-span-1"
            >
              {String(index + 1).padStart(2, "0")}
            </p>

            <h2 className="font-heading text-2xl leading-tight font-medium text-ink lg:col-span-5 lg:text-[clamp(1.5rem,2.4vw,2.125rem)]">
              <Link
                href={getDomainPath(domain.slug)}
                className="inline-flex items-baseline gap-3 transition-colors hover:text-copper"
              >
                {domain.title}
                <span aria-hidden="true" className="text-base text-copper">
                  →
                </span>
              </Link>
            </h2>

            {domain.summary ? (
              <p className="max-w-[52ch] text-body lg:col-span-6">{domain.summary}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
