import Link from "next/link"

import { COMPANY, CONTACT_MAILTO } from "@/lib/site/company"
import { CONTACT_CNDP_REFERENCE, CONTACT_NOTICE } from "@/lib/site/contact"
import { getRubrique } from "@/lib/site/rubriques"
import type {
  ContactChannelsBlock,
  ContactCtaBlock,
  IntroBlock,
  PageDocument,
  SectionsBlock,
  StepsBlock,
} from "@/lib/content/types"

/**
 * Contact page renderer — email-first, no form (ticket #26).
 *
 * Everything user-visible is either content from the seam (page copy, section
 * headings, ordered steps) or code-owned identity/legal copy (the mailbox, the
 * registered address, the law 09-08 notice). The primary action is a plain
 * `mailto:` to the cleared public mailbox: no form, no client-side storage, no
 * analytics, no third-party embed.
 *
 * Gated channels (phone, opening hours, map, social profiles) are modelled by
 * `ContactChannelsBlock`: while the block is absent — the P1 state — nothing
 * renders, not even an empty shell. Clearing a channel is a content-data change
 * that switches the block on without touching the renderer.
 *
 * Composition follows the decided trame (docs/forms/contact-careers-forms.md
 * §3.1): hero title + intro, the email card, what to write, what happens next,
 * the registered address, then the privacy notice. Section rhythm and colour
 * bands follow docs/brand/brand-direction.md §2.4 on the brand tokens.
 */
export function ContactPage({ page }: { readonly page: PageDocument }) {
  const intro = page.blocks.find(
    (block): block is IntroBlock => block.kind === "intro"
  )
  // The intro block is rendered inside the hero; the other blocks keep their
  // content order after it.
  const contentBlocks = intro ? page.blocks.filter((block) => block !== intro) : page.blocks

  return (
    <article>
      <ContactHero page={page} intro={intro} />

      {contentBlocks.map((block, index) => {
        switch (block.kind) {
          case "contact-cta":
            return <ContactEmailBand key={index} block={block} />
          case "sections":
            return <ContactSection key={index} block={block} index={index} />
          case "steps":
            return <ContactSteps key={index} block={block} index={index} />
          case "contact-channels":
            // Absent at P1: the gated block renders nothing at all.
            return <ContactChannels key={index} block={block} index={index} />
          default:
            // A block this trame does not know is omitted, never replaced by a
            // placeholder (DEV-006). #30 keeps the union and the renderer in sync.
            return null
        }
      })}

      <ContactAddress />
      <ContactNotice />
    </article>
  )
}

function ContactHero({
  page,
  intro,
}: {
  readonly page: PageDocument
  readonly intro?: IntroBlock
}) {
  const [lede, ...paragraphs] = intro?.paragraphs ?? []

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1440px] px-5 pt-14 pb-12 sm:pt-16 sm:pb-14 lg:px-10 lg:pt-24 lg:pb-20">
        <p className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase">
          {COMPANY.brand}
        </p>
        <h1 className="mt-4 max-w-[20ch] font-heading text-[clamp(2.5rem,7vw,4.25rem)] leading-[1.02] tracking-[-0.02em] text-ink">
          {page.title}
        </h1>
        {lede ? (
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-body lg:text-xl">
            {lede}
          </p>
        ) : null}
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="mt-4 max-w-[58ch] leading-relaxed text-body">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}

/** The primary action: the cleared mailbox as a mailto, on the ink band. */
function ContactEmailBand({ block }: { readonly block: ContactCtaBlock }) {
  return (
    <section aria-labelledby="contact-email-title" className="bg-ink text-surface">
      <div className="mx-auto grid max-w-[1440px] items-end gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
        <div>
          <h2
            id="contact-email-title"
            className="max-w-[24ch] font-heading text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.06] tracking-[-0.01em] text-surface"
          >
            {block.title}
          </h2>
          {block.body ? (
            <p className="mt-5 max-w-[48ch] text-sm leading-relaxed text-surface/70 sm:text-base">
              {block.body}
            </p>
          ) : null}
        </div>

        <div className="lg:justify-self-end">
          <a
            href={CONTACT_MAILTO}
            className="inline-flex min-h-12 max-w-full items-center rounded-full bg-orange px-6 py-3.5 font-heading text-base font-medium break-all text-ink transition-colors hover:bg-surface focus-visible:outline-surface sm:px-7 sm:text-lg"
          >
            {COMPANY.email}
          </a>
        </div>
      </div>
    </section>
  )
}

/** Generic titled prose block: « Ce que votre e-mail doit contenir ». */
function ContactSection({
  block,
  index,
}: {
  readonly block: SectionsBlock
  readonly index: number
}) {
  if (block.items.length === 0) return null
  const headingId = `contact-section-${index}`

  return (
    <section
      aria-labelledby={block.title ? headingId : undefined}
      className="border-b border-line"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:py-16 lg:px-10 lg:py-20">
        {block.title ? (
          <h2
            id={headingId}
            className="max-w-[26ch] font-heading text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.1] text-ink"
          >
            {block.title}
          </h2>
        ) : null}

        <dl className="mt-8 divide-y divide-line border-y border-line">
          {block.items.map((item) => (
            <div
              key={item.title}
              className="grid gap-2 py-6 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-10"
            >
              <dt className="font-heading text-base font-medium text-ink">
                {item.title}
              </dt>
              {item.body ? (
                <dd className="max-w-[62ch] text-sm leading-relaxed text-body">
                  {item.body}
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/** Ordered steps: « Ce qui se passe ensuite ». */
function ContactSteps({
  block,
  index,
}: {
  readonly block: StepsBlock
  readonly index: number
}) {
  if (block.items.length === 0) return null
  const headingId = `contact-steps-${index}`

  return (
    <section
      aria-labelledby={block.title ? headingId : undefined}
      className="border-b border-line bg-paper"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:py-16 lg:px-10 lg:py-20">
        {block.title ? (
          <h2
            id={headingId}
            className="max-w-[26ch] font-heading text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.1] text-ink"
          >
            {block.title}
          </h2>
        ) : null}

        <ol className="mt-8 border-y border-line">
          {block.items.map((item, itemIndex) => (
            <li
              key={item.title}
              className="grid gap-2 border-b border-line py-6 last:border-b-0 lg:grid-cols-[4rem_minmax(0,16rem)_1fr] lg:items-baseline lg:gap-8"
            >
              <span
                aria-hidden="true"
                className="font-heading text-sm font-semibold tracking-[0.1em] text-copper"
              >
                {String(itemIndex + 1).padStart(2, "0")}
              </span>
              <span className="font-heading text-base font-medium text-ink">
                {item.title}
              </span>
              {item.body ? (
                <span className="max-w-[62ch] text-sm leading-relaxed text-body">
                  {item.body}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/**
 * Gated optional channels — phone, opening hours, map and social profiles.
 *
 * Absent at P1 (facts register §2.3). Every field is optional and rendered only
 * from content that the facts register has cleared; an empty block renders
 * nothing, never a placeholder row.
 */
function ContactChannels({
  block,
  index,
}: {
  readonly block: ContactChannelsBlock
  readonly index: number
}) {
  const phones = block.phones ?? []
  const openingHours = block.openingHours ?? []
  const rows = [...phones, ...openingHours]
  const hasContent =
    rows.length > 0 || Boolean(block.map) || (block.social?.length ?? 0) > 0
  if (!hasContent) return null
  const headingId = `contact-channels-${index}`

  return (
    <section
      aria-labelledby={block.title ? headingId : undefined}
      className="border-b border-line"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:py-16 lg:px-10 lg:py-20">
        {block.title ? (
          <h2
            id={headingId}
            className="max-w-[26ch] font-heading text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.1] text-ink"
          >
            {block.title}
          </h2>
        ) : null}

        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={`${row.label}-${row.value}`}>
              <dt className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase">
                {row.label}
              </dt>
              <dd className="mt-2 text-base text-ink">
                {row.href ? (
                  <a
                    href={row.href}
                    className="underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}

          {block.map ? (
            <div>
              <dt className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase">
                {block.map.label}
              </dt>
              <dd className="mt-2 text-base">
                <a
                  href={block.map.href}
                  className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
                >
                  {block.map.label}
                </a>
              </dd>
            </div>
          ) : null}

          {block.social?.length
            ? block.social.map((profile) => (
                <div key={profile.href}>
                  <dt className="text-[10.5px] font-semibold tracking-[0.2em] text-copper uppercase">
                    {profile.label}
                  </dt>
                  <dd className="mt-2 text-base">
                    <a
                      href={profile.href}
                      rel="noopener noreferrer"
                      className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
                    >
                      {profile.label}
                    </a>
                  </dd>
                </div>
              ))
            : null}
        </dl>
      </div>
    </section>
  )
}

/** The cleared registered address (code-owned, facts register §2.1). */
function ContactAddress() {
  return (
    <section aria-labelledby="contact-address-title" className="border-b border-line">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-14 sm:py-16 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-10 lg:px-10 lg:py-20">
        <h2
          id="contact-address-title"
          className="font-heading text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.1] text-ink"
        >
          Siège social
        </h2>
        <address className="max-w-[34ch] font-heading text-lg leading-relaxed text-ink not-italic">
          {COMPANY.registeredAddress}
        </address>
      </div>
    </section>
  )
}

/**
 * The code-owned short data notice plus the privacy-policy link.
 *
 * The CNDP sentence is rendered only from a real receipt reference; at P1 the
 * constant is `null`, so nothing about a declaration appears.
 */
function ContactNotice() {
  const privacy = getRubrique("politique-de-confidentialite")

  return (
    <section aria-labelledby="contact-notice-title">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-14 sm:py-16 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-10 lg:px-10 lg:py-20">
        <h2
          id="contact-notice-title"
          className="font-heading text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.1] text-ink"
        >
          {CONTACT_NOTICE.title}
        </h2>

        <div className="max-w-[62ch] space-y-4 text-sm leading-relaxed text-body">
          <p>{CONTACT_NOTICE.processing}</p>
          <p>{CONTACT_NOTICE.noCollection}</p>
          {CONTACT_CNDP_REFERENCE ? (
            <p>
              Ce traitement a fait l’objet d’une déclaration auprès de la CNDP sous le
              n° {CONTACT_CNDP_REFERENCE.number} du {CONTACT_CNDP_REFERENCE.date}.
            </p>
          ) : null}
          <p>
            <Link
              href={privacy.href}
              className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
            >
              {privacy.navLabel}
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
