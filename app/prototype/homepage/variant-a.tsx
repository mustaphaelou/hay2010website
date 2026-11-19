import {
  CAREERS_TEXT,
  CAREERS_TITLE,
  CONTACT_TITLE,
  EMAIL,
  HERO_HEADLINE,
  HERO_SUBLINE,
  POSITIONING,
  POSITIONING_END,
  REFERENCES_TEXT,
  REFERENCES_TITLE,
  SERVICES,
} from "./homepage-data"
import { HeroScene } from "./scenes"
import { IconLamp, IconNetwork, IconPanel, IconTransformer } from "./icons"
import {
  PillButton,
  PlaceholderImage,
  PrototypeFooter,
  PrototypeHeader,
  SectionLabel,
  SkipLink,
  TextLink,
} from "./components"

const SERVICE_ICONS = [IconLamp, IconNetwork, IconTransformer, IconPanel]

/**
 * Variant A — Éditorial.
 * Full-bleed photographic hero, 12-column split intro, four-column services
 * on ink, split references, compact careers band, orange contact band.
 */
export function VariantA() {
  return (
    <div
      id="top"
      className="min-h-screen bg-[#F7F6F1] text-[#111217] selection:bg-[#E97425] selection:text-[#111217]"
    >
      <SkipLink />
      <PrototypeHeader />

      <main id="main">
        {/* 1 — Hero */}
        <section className="relative isolate min-h-[640px] overflow-hidden bg-[#0E1119] lg:min-h-[760px]">
          <div className="prototype-kenburns absolute inset-0">
            <HeroScene />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,12,17,.88)_0%,rgba(10,12,17,.55)_42%,rgba(10,12,17,.08)_75%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,12,17,.85)_0%,transparent_45%)]" />

          <div className="relative mx-auto flex min-h-[640px] max-w-[1440px] flex-col justify-end px-5 pt-28 pb-14 md:px-10 md:pb-20 lg:min-h-[760px]">
            <div className="prototype-rise flex items-center gap-3 text-[10.5px] font-medium tracking-[0.24em] text-white/60 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E97425]" />
              Électrification & éclairage public — Rabat
            </div>
            <h1 className="prototype-rise mt-6 max-w-[14ch] text-[clamp(42px,6.4vw,92px)] leading-[0.94] font-light tracking-[-0.035em] text-white">
              {HERO_HEADLINE}
            </h1>
            <p className="prototype-rise mt-7 max-w-[46ch] text-[16px] leading-relaxed text-white/68 md:text-[17px]">
              {HERO_SUBLINE}
            </p>
            <div className="prototype-rise mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <PillButton href="#metiers" variant="white">
                Découvrir nos métiers
                <span aria-hidden="true">→</span>
              </PillButton>
              <TextLink href="#contact" tone="ink">
                Parler d’un projet
              </TextLink>
            </div>
          </div>

          <div className="absolute right-6 bottom-6 hidden items-center gap-2 text-[9px] tracking-[0.2em] text-white/35 uppercase md:flex">
            <span className="h-px w-8 bg-white/25" />
            Visuel provisoire
          </div>
        </section>

        {/* Service ticker */}
        <div className="border-b border-[#DEDDD5] bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-2 px-5 py-4 md:px-10">
            {SERVICES.map((service, index) => (
              <div key={service.title} className="flex items-center gap-8">
                {index > 0 && (
                  <span
                    className="hidden h-1 w-1 rounded-full bg-[#C9C7BD] sm:block"
                    aria-hidden="true"
                  />
                )}
                <span className="text-[10.5px] font-medium tracking-[0.18em] text-[#6B6D74] uppercase">
                  {service.short}
                </span>
              </div>
            ))}
            <span className="ml-auto hidden text-[10.5px] tracking-[0.18em] text-[#A8A69C] uppercase lg:block">
              Plus de 10 ans d’expérience
            </span>
          </div>
        </div>

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

        {/* 3 — Nos métiers */}
        <section id="metiers" className="scroll-mt-24 bg-[#101116] text-white">
          <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-24">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <SectionLabel number="02" label="Nos métiers" tone="ink" />
                <h2 className="mt-4 max-w-[16ch] text-[clamp(30px,4vw,54px)] leading-[1.02] font-light tracking-[-0.03em]">
                  Quatre métiers, une même exigence.
                </h2>
              </div>
              <p className="max-w-[34ch] text-[13.5px] leading-relaxed text-white/50 md:text-right">
                De l’étude à la mise en service, nous restons responsables de
                l’ouvrage livré.
              </p>
            </div>

            <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service, index) => {
                const Icon = SERVICE_ICONS[index]
                return (
                  <article
                    key={service.title}
                    className="group border-t border-white/15 pt-6"
                  >
                    <div className="flex items-start justify-between">
                      <Icon className="h-7 w-7 text-[#E97425]" />
                      <span className="text-[10px] tracking-[0.2em] text-white/30">
                        {service.number}
                      </span>
                    </div>
                    <h3 className="mt-8 text-[18px] font-medium tracking-[-0.01em]">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-[13px] leading-relaxed text-white/55">
                      {service.description}
                    </p>
                    <a
                      href={service.href}
                      className="mt-6 inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] text-white/45 uppercase transition-colors group-hover:text-[#E97425]"
                    >
                      En savoir plus <span aria-hidden="true">→</span>
                    </a>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* 4 — Réalisations teaser */}
        <section
          id="realisations"
          className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-20 md:px-10 md:py-28"
        >
          <div className="grid items-center gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <SectionLabel number="03" label="Réalisations" />
              <h2 className="mt-5 text-[clamp(30px,3.6vw,48px)] leading-[1.05] font-light tracking-[-0.03em]">
                {REFERENCES_TITLE}
              </h2>
              <p className="mt-6 max-w-[38ch] text-[14.5px] leading-relaxed text-[#5E6067]">
                {REFERENCES_TEXT}
              </p>
              <div className="mt-8">
                <PillButton href="#contact" variant="outline">
                  Demander les références
                </PillButton>
              </div>
            </div>

            <div className="md:col-span-6 md:col-start-7">
              <div className="border border-[#DEDDD5] bg-white p-8 md:p-10">
                <div className="flex items-baseline justify-between gap-6">
                  <p className="text-[clamp(56px,8vw,110px)] leading-none font-light tracking-[-0.04em] text-[#E97425]">
                    R.
                  </p>
                  <p className="max-w-[20ch] text-right text-[11px] leading-relaxed tracking-[0.08em] text-[#6B6D74] uppercase">
                    Dossiers communiqués après accord des maîtres d’ouvrage
                  </p>
                </div>
                <div className="mt-8 divide-y divide-[#EDECE4] border-t border-[#DEDDD5]">
                  {SERVICES.map((service) => (
                    <div
                      key={service.title}
                      className="flex items-center justify-between gap-4 py-3.5"
                    >
                      <span className="text-[14px] font-medium">
                        {service.short}
                      </span>
                      <span className="text-[11px] tracking-[0.14em] text-[#9A5A15] uppercase">
                        Sur demande
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-[12px] leading-relaxed text-[#6B6D74]">
                  Aucun projet n’est nommé sans l’accord écrit du maître
                  d’ouvrage.
                </p>
              </div>
            </div>
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
              <div className="mt-7">
                <TextLink href="#carrieres">Voir les opportunités</TextLink>
              </div>
            </div>
            <div className="md:col-span-5">
              <PlaceholderImage
                kind="mast"
                ratio="aspect-[4/3]"
                label="visuel provisoire"
              />
            </div>
          </div>
        </section>

        {/* 6 — Contact CTA */}
        <section
          id="contact"
          className="scroll-mt-24 bg-[#E97425] text-[#111217]"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-10 md:py-20">
            <div>
              <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#111217]/70 uppercase">
                05 — Contact
              </p>
              <h2 className="mt-4 max-w-[24ch] text-[clamp(26px,3.4vw,44px)] leading-[1.08] font-light tracking-[-0.03em]">
                {CONTACT_TITLE}
              </h2>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-5 inline-block text-[15px] font-medium underline underline-offset-4"
              >
                {EMAIL}
              </a>
            </div>
            <PillButton
              href="#contact"
              variant="white"
              className="shrink-0 self-start md:self-center"
            >
              Nous contacter
              <span aria-hidden="true">→</span>
            </PillButton>
          </div>
        </section>
      </main>

      <PrototypeFooter />
    </div>
  )
}
