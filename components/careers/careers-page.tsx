import Link from "next/link"

import type {
  ContentBlock,
  IntroBlock,
  JobOpening,
  PageDocument,
  SectionsBlock,
} from "@/lib/content/types"
import {
  CAREERS_COPY,
  buildJobApplicationMailto,
  buildSpontaneousApplicationMailto,
  formatFrenchDate,
  renderApplicationNotice,
  type CareersApplicationState,
} from "@/lib/site/careers"
import { CONTACT_MAILTO, COMPANY } from "@/lib/site/company"

/**
 * Carrières body — one page, no detail routes (forms doc §4.1).
 *
 * Order of the decided page model: hero, culture intro, openings listed inline,
 * then the application section. The application section exists in two states
 * decided by the F-113 gate: while it is closed, the page only points to the
 * general mailbox for questions and never invites a CV; once it opens, the
 * spontaneous section, the `recrutement@` CTA and the approved email notice
 * render — the notice only with its real CNDP reference (§4.4/§4.9).
 *
 * Everything visible here comes from the content source (hero, intro, openings)
 * or from the approved code-owned behaviour strings in `lib/site/careers.ts`.
 * No form, no upload and no `JobPosting` data: the mailbox is the CV record
 * (§4.3, §4.8).
 */

export interface CareersPageProps {
  readonly document: PageDocument
  readonly jobs: readonly JobOpening[]
  readonly application: CareersApplicationState
  readonly privacyPublished: boolean
}

function isIntro(block: ContentBlock): block is IntroBlock {
  return block.kind === "intro"
}

function isSections(block: ContentBlock): block is SectionsBlock {
  return block.kind === "sections"
}

function Hero({ document }: { readonly document: PageDocument }) {
  const hero = document.blocks.find((block) => block.kind === "hero")
  const headline =
    hero && hero.kind === "hero" ? hero.headline : (document.title ?? "Carrières")
  const tagline = hero && hero.kind === "hero" ? hero.tagline : undefined

  return (
    <div className="max-w-[62ch]">
      <h1 className="font-heading text-[clamp(2.25rem,6vw,4rem)] leading-[1.05] text-ink">
        {headline}
      </h1>
      {tagline ? (
        <p className="mt-6 text-lg leading-relaxed text-body">{tagline}</p>
      ) : null}
    </div>
  )
}

function Intro({ block }: { readonly block: IntroBlock }) {
  return (
    <div className="mt-10 max-w-[62ch] space-y-4 text-base leading-relaxed text-body">
      {block.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

function TitledSections({ block }: { readonly block: SectionsBlock }) {
  return (
    <section className="mt-16 border-t border-line pt-10 lg:mt-24">
      {block.title ? (
        <h2 className="font-heading text-2xl font-medium text-ink">{block.title}</h2>
      ) : null}
      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        {block.items.map((item) => (
          <div key={item.title}>
            <h3 className="font-heading text-lg font-medium text-ink">{item.title}</h3>
            {item.body ? (
              <p className="mt-2 text-sm leading-relaxed text-body">{item.body}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

/** One opening card: title, contract/location/…, summary, dates and CTA. */
function OpeningCard({
  job,
  application,
}: {
  readonly job: JobOpening
  readonly application: CareersApplicationState
}) {
  const meta = [
    job.contractType,
    job.location,
    job.department,
    job.experience,
  ].filter((value): value is string => Boolean(value))

  return (
    <article className="border border-line bg-surface p-6 sm:p-8">
      <h3 className="font-heading text-xl font-medium text-ink">{job.title}</h3>
      <p className="mt-2 text-sm font-medium text-copper">{meta.join(" · ")}</p>
      <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-body">{job.summary}</p>
      {job.postedAt || job.closingAt ? (
        <p className="mt-4 text-xs text-body">
          {job.postedAt ? <>Publié le {formatFrenchDate(job.postedAt)}</> : null}
          {job.postedAt && job.closingAt ? " · " : null}
          {job.closingAt ? <>Clôture le {formatFrenchDate(job.closingAt)}</> : null}
        </p>
      ) : null}
      <p className="mt-6">
        {application.mailboxLive ? (
          <a
            href={buildJobApplicationMailto(job)}
            className="text-sm font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
          >
            {CAREERS_COPY.liveCtaLabel}
          </a>
        ) : (
          <a
            href={CONTACT_MAILTO}
            className="text-sm font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
          >
            {CAREERS_COPY.questionsLabel}
          </a>
        )}
      </p>
    </article>
  )
}

function Openings({
  jobs,
  application,
}: {
  readonly jobs: readonly JobOpening[]
  readonly application: CareersApplicationState
}) {
  return (
    <section aria-labelledby="offres" className="mt-16 lg:mt-24">
      <h2 id="offres" className="font-heading text-2xl font-medium text-ink">
        {CAREERS_COPY.openingsTitle}
      </h2>
      {jobs.length === 0 ? (
        // The honest empty state (§4.9): no card, no placeholder, no disabled
        // apply button.
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-body">
          {CAREERS_COPY.emptyState}
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => (
            <li key={job.slug}>
              <OpeningCard job={job} application={application} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ApplicationNotice({ notice }: { readonly notice: string }) {
  return (
    <p className="mt-8 max-w-[68ch] border-t border-line pt-6 text-xs leading-relaxed text-body">
      {notice}
    </p>
  )
}

/** F-113 pending: applications are not open on the site; questions only. */
function PendingApplication() {
  return (
    <section aria-label="Candidatures" className="mt-16 lg:mt-24">
      <p className="max-w-[62ch] text-base leading-relaxed text-body">
        {CAREERS_COPY.pendingBody}
      </p>
      <p className="mt-6 text-base leading-relaxed">
        <a
          href={CONTACT_MAILTO}
          className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
        >
          {CAREERS_COPY.pendingCtaLabel}
        </a>
      </p>
    </section>
  )
}

/** F-113 granted: spontaneous applications and the approved email notice. */
function LiveApplication({
  application,
  notice,
  privacyPublished,
}: {
  readonly application: CareersApplicationState
  readonly notice: string
  readonly privacyPublished: boolean
}) {
  return (
    <section aria-labelledby="candidature" className="mt-16 lg:mt-24">
      <h2 id="candidature" className="font-heading text-2xl font-medium text-ink">
        {CAREERS_COPY.spontaneousTitle}
      </h2>
      <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-body">
        {CAREERS_COPY.spontaneousBody}
      </p>

      {/* The address is also visible as text, for visitors without a mail client. */}
      <p className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <a
          href={buildSpontaneousApplicationMailto()}
          className="inline-flex items-center bg-ink px-5 py-3 text-sm font-medium text-surface transition-colors hover:bg-ink/90"
        >
          {CAREERS_COPY.liveCtaLabel}
        </a>
        <span className="text-sm font-medium text-body">{application.email}</span>
      </p>

      <ApplicationNotice notice={notice} />

      {privacyPublished ? (
        <p className="mt-4 text-sm">
          <Link
            href="/politique-de-confidentialite"
            className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
          >
            {CAREERS_COPY.privacyLinkLabel}
          </Link>
        </p>
      ) : null}
    </section>
  )
}

export function CareersPage({
  document,
  jobs,
  application,
  privacyPublished,
}: CareersPageProps) {
  const notice = renderApplicationNotice(application)

  return (
    <article className="mx-auto max-w-[1440px] px-5 pt-16 pb-24 lg:px-10 lg:pt-24 lg:pb-32">
      <Hero document={document} />

      {document.blocks.filter(isIntro).map((block, index) => (
        <Intro key={`intro-${index}`} block={block} />
      ))}

      {document.blocks.filter(isSections).map((block, index) => (
        <TitledSections key={`sections-${index}`} block={block} />
      ))}

      <Openings jobs={jobs} application={application} />

      {application.mailboxLive && notice ? (
        <LiveApplication
          application={application}
          notice={notice}
          privacyPublished={privacyPublished}
        />
      ) : (
        <PendingApplication />
      )}

      {/* Contact fallback: the cleared general mailbox is always reachable. */}
      <p className="mt-12 text-sm leading-relaxed text-body">
        {COMPANY.brand} · {COMPANY.base} ·{" "}
        <a
          href={CONTACT_MAILTO}
          className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
        >
          {COMPANY.email}
        </a>
      </p>
    </article>
  )
}
