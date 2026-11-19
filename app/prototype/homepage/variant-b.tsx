import {
  CAREERS_TEXT,
  CAREERS_TITLE,
  CONTACT_TITLE,
  EMAIL,
  POSITIONING,
  POSITIONING_END,
  REFERENCES_TEXT,
  REFERENCES_TITLE,
  SERVICES,
} from "./homepage-data"
import { IconLamp, IconNetwork, IconPanel, IconTransformer } from "./icons"
import {
  PillButton,
  PrototypeFooter,
  PrototypeHeader,
  SectionLabel,
  SkipLink,
  TextLink,
} from "./components"

const SERVICE_ICONS = [IconLamp, IconNetwork, IconTransformer, IconPanel]

/**
 * Variant B — Preuve.
 * No photography anywhere: a typographic ink hero with a credentials rail,
 * services as a ruled list, a centred ink references panel and an ink
 * contact band. Tests whether the homepage can launch before the shoot.
 */
export function VariantB() {
  return (
    <div
      id="top"
      className="min-h-screen bg-[#F7F6F1] text-[#111217] selection:bg-[#E97425] selection:text-[#111217]"
    >
      <SkipLink />
      <PrototypeHeader />

      <main id="main">
        {/* 1 — Hero (typographic fallback) */}
        <section className="bg-[#111217] text-white">
          <div className="mx-auto max-w-[1440px] px-5 pt-20 pb-16 md:px-10 md:pt-28 md:pb-24">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p className="flex items-center gap-3 text-[10.5px] font-medium tracking-[0.24em] text-white/50 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E97425]" />
                  Électrification & éclairage public — Rabat
                </p>
                <h1 className="mt-6 max-w-[18ch] text-[clamp(38px,5.6vw,84px)] leading-[1.02] font-light tracking-[-0.035em]">
                  L’éclairage public et les réseaux électriques, de l’étude à la
                  mise en service.
                </h1>
                <p className="mt-8 max-w-[52ch] text-[16px] leading-relaxed text-white/60">
                  {POSITIONING_END}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <PillButton href="#metiers" variant="orange">
                    Découvrir nos métiers
                    <span aria-hidden="true">→</span>
                  </PillButton>
                  <TextLink href="#contact" tone="ink">
                    Parler d’un projet
                  </TextLink>
                </div>
              </div>

              <aside className="lg:col-span-4">
                <div className="border-l border-white/15 pl-6">
                  <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#E97425] uppercase">
                    Repères
                  </p>
                  <dl className="mt-6 space-y-6">
                    <div>
                      <dt className="text-[10.5px] tracking-[0.18em] text-white/40 uppercase">
                        Expérience
                      </dt>
                      <dd className="mt-1.5 text-[15px] font-medium">
                        Plus de 10 ans
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10.5px] tracking-[0.18em] text-white/40 uppercase">
                        Agréments
                      </dt>
                      <dd className="mt-1.5 text-[15px] font-medium">
                        ONEE — publication en attente des certificats
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10.5px] tracking-[0.18em] text-white/40 uppercase">
                        Base
                      </dt>
                      <dd className="mt-1.5 text-[15px] font-medium">
                        Rabat — Maroc
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-8 text-[11px] leading-relaxed text-white/35">
                    Texte et mentions provisoires — le bloc agréments n’est
                    publié qu’après dépôt des certificats.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* 2 — Intro Qui sommes-nous */}
        <section
          id="entreprise"
          className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-20 md:px-10 md:py-28"
        >
          <div className="grid gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-3">
              <SectionLabel number="01" label="Qui sommes-nous" />
              <div className="mt-4 h-px w-10 bg-[#111217]" />
            </div>
            <div className="md:col-span-8 md:col-start-5">
              <p className="text-[clamp(24px,3.2vw,42px)] leading-[1.24] font-light tracking-[-0.02em]">
                {POSITIONING}
              </p>
              <p className="mt-7 max-w-[58ch] text-[15px] leading-relaxed text-[#5E6067]">
                {POSITIONING_END}
              </p>
              <div className="mt-8">
                <TextLink href="#entreprise">L’entreprise</TextLink>
              </div>
            </div>
          </div>
        </section>

        {/* 3 — Nos métiers : liste règles, pas de cartes */}
        <section
          id="metiers"
          className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-20 md:px-10 md:py-24"
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel number="02" label="Nos métiers" />
              <h2 className="mt-4 max-w-[18ch] text-[clamp(30px,4vw,54px)] leading-[1.02] font-light tracking-[-0.03em]">
                Quatre métiers, une même exigence.
              </h2>
            </div>
            <p className="max-w-[34ch] text-[13.5px] leading-relaxed text-[#5E6067] md:text-right">
              De l’étude à la mise en service, nous restons responsables de
              l’ouvrage livré.
            </p>
          </div>

          <div className="mt-12 border-t border-[#DEDDD5]">
            {SERVICES.map((service, index) => {
              const Icon = SERVICE_ICONS[index]
              return (
                <div
                  key={service.title}
                  className="grid gap-3 border-b border-[#DEDDD5] px-2 py-7 transition-colors hover:bg-white md:grid-cols-12 md:items-center md:gap-6 md:px-4"
                >
                  <span className="text-[11px] tracking-[0.2em] text-[#9A5A15] md:col-span-1">
                    {service.number}
                  </span>
                  <Icon className="h-6 w-6 text-[#111217] md:col-span-2" />
                  <h3 className="text-[18px] font-medium tracking-[-0.01em] md:col-span-3">
                    {service.title}
                  </h3>
                  <p className="text-[13.5px] leading-relaxed text-[#5E6067] md:col-span-4">
                    {service.description}
                  </p>
                  <div className="md:col-span-2 md:text-right">
                    <a
                      href={service.href}
                      className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] text-[#111217] uppercase underline-offset-4 hover:underline"
                    >
                      En savoir plus <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 4 — Réalisations : panneau ink centré */}
        <section
          id="realisations"
          className="scroll-mt-24 bg-[#111217] text-white"
        >
          <div className="mx-auto max-w-[1440px] px-5 py-24 text-center md:px-10 md:py-32">
            <SectionLabel number="03" label="Réalisations" tone="ink" />
            <h2 className="mx-auto mt-6 max-w-[18ch] text-[clamp(36px,6vw,80px)] leading-[1.04] font-light tracking-[-0.035em]">
              {REFERENCES_TITLE}
            </h2>
            <p className="mx-auto mt-7 max-w-[48ch] text-[15px] leading-relaxed text-white/55">
              {REFERENCES_TEXT}
            </p>
            <div className="mt-10">
              <PillButton href="#contact" variant="orange">
                Demander les références
                <span aria-hidden="true">→</span>
              </PillButton>
            </div>
            <p className="mt-10 text-[11px] tracking-[0.18em] text-white/35 uppercase">
              Aucun projet n’est nommé sans l’accord écrit du maître d’ouvrage
            </p>
          </div>
        </section>

        {/* 5 — Carrières teaser */}
        <section
          id="carrieres"
          className="scroll-mt-24 border-t border-[#DEDDD5] bg-white"
        >
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 md:grid-cols-12 md:px-10 md:py-20">
            <div className="md:col-span-7">
              <SectionLabel number="04" label="Carrières" />
              <h2 className="mt-4 text-[clamp(26px,3vw,40px)] leading-[1.08] font-light tracking-[-0.03em]">
                {CAREERS_TITLE}
              </h2>
              <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-[#5E6067]">
                {CAREERS_TEXT}
              </p>
            </div>
            <div className="md:col-span-5 md:text-right">
              <a
                href={`mailto:${EMAIL}`}
                className="inline-block text-[15px] font-medium text-[#111217] underline underline-offset-4"
              >
                {EMAIL}
              </a>
              <div className="mt-5">
                <TextLink href="#carrieres">Voir les opportunités</TextLink>
              </div>
            </div>
          </div>
        </section>

        {/* 6 — Contact CTA */}
        <section id="contact" className="scroll-mt-24 bg-[#111217] text-white">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 text-center md:px-10 md:py-20">
            <div>
              <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#E97425] uppercase">
                05 — Contact
              </p>
              <h2 className="mx-auto mt-4 max-w-[22ch] text-[clamp(26px,3.4vw,44px)] leading-[1.08] font-light tracking-[-0.03em]">
                {CONTACT_TITLE}
              </h2>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-5 inline-block text-[15px] font-medium text-white underline underline-offset-4"
              >
                {EMAIL}
              </a>
            </div>
            <div>
              <PillButton href="#contact" variant="orange">
                Nous contacter
                <span aria-hidden="true">→</span>
              </PillButton>
            </div>
          </div>
        </section>
      </main>

      <PrototypeFooter />
    </div>
  )
}
