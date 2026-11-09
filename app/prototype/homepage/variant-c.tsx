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
const SERVICE_SCENES = ["mast", "trench", "panel", "cable"] as const

/**
 * Variant C — Chantier.
 * Mobile-first and image-led: the photograph sits above the headline, the
 * intro is a full-width image band, services are stacked rows with a frame
 * each, and the references panel is centred. No dark hero overlay.
 */
export function VariantC() {
  return (
    <div
      id="top"
      className="min-h-screen bg-[#F7F6F1] text-[#111217] selection:bg-[#E97425] selection:text-[#111217]"
    >
      <SkipLink />
      <PrototypeHeader />

      <main id="main">
        {/* 1 — Hero : image d’abord, texte en dessous */}
        <section>
          <div className="mx-auto max-w-[1440px] px-5 pt-8 md:px-10 md:pt-12">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <PlaceholderImage
                  kind="dusk"
                  ratio="aspect-[4/5] sm:aspect-[16/9]"
                  label="visuel provisoire"
                />
              </div>
              <div className="lg:col-span-5">
                <p className="flex items-center gap-3 text-[10.5px] font-medium tracking-[0.24em] text-[#9A5A15] uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E97425]" />
                  Électrification & éclairage public — Rabat
                </p>
                <h1 className="mt-5 text-[clamp(36px,4.8vw,72px)] leading-[1.02] font-light tracking-[-0.035em]">
                  {HERO_HEADLINE}
                </h1>
                <p className="mt-6 max-w-[46ch] text-[15.5px] leading-relaxed text-[#5E6067]">
                  {HERO_SUBLINE}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <PillButton href="#metiers" variant="primary">
                    Découvrir nos métiers
                    <span aria-hidden="true">→</span>
                  </PillButton>
                  <TextLink href="#contact">Parler d’un projet</TextLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2 — Intro : bande image pleine largeur + texte */}
        <section
          id="entreprise"
          className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-20 md:px-10 md:py-28"
        >
          <SectionLabel number="01" label="Qui sommes-nous" />
          <div className="mt-8">
            <PlaceholderImage
              kind="trench"
              ratio="aspect-[16/9] md:aspect-[21/9]"
              label="visuel provisoire"
            />
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-12">
            <p className="text-[clamp(22px,2.8vw,36px)] leading-[1.26] font-light tracking-[-0.02em] md:col-span-8">
              {POSITIONING}
            </p>
            <div className="md:col-span-4">
              <p className="text-[15px] leading-relaxed text-[#5E6067]">
                {POSITIONING_END}
              </p>
              <div className="mt-7">
                <TextLink href="#entreprise">L’entreprise</TextLink>
              </div>
            </div>
          </div>
        </section>

        {/* 3 — Nos métiers : rangées empilées avec un cadre chacune */}
        <section
          id="metiers"
          className="scroll-mt-24 border-t border-[#DEDDD5] bg-white"
        >
          <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-24">
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

            <div className="mt-12">
              {SERVICES.map((service, index) => {
                const Icon = SERVICE_ICONS[index]
                return (
                  <article
                    key={service.title}
                    className="grid gap-6 border-t border-[#DEDDD5] py-10 md:grid-cols-12 md:items-center md:py-12"
                  >
                    <div className="md:col-span-4 lg:col-span-3">
                      <PlaceholderImage
                        kind={SERVICE_SCENES[index]}
                        ratio="aspect-[4/3]"
                        label="visuel provisoire"
                      />
                    </div>
                    <div className="md:col-span-8 lg:col-span-9">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-[#E97425]" />
                        <span className="text-[10.5px] tracking-[0.2em] text-[#9A5A15]">
                          {service.number}
                        </span>
                      </div>
                      <h3 className="mt-4 text-[22px] font-medium tracking-[-0.01em]">
                        {service.title}
                      </h3>
                      <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-[#5E6067]">
                        {service.description}
                      </p>
                      <a
                        href={service.href}
                        className="mt-5 inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] text-[#111217] uppercase underline-offset-4 hover:underline"
                      >
                        En savoir plus <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* 4 — Réalisations : panneau centré */}
        <section
          id="realisations"
          className="scroll-mt-24 border-t border-[#DEDDD5] bg-[#F7F6F1]"
        >
          <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
            <div className="mx-auto max-w-[720px] border border-[#DEDDD5] bg-white p-8 text-center md:p-12">
              <p className="text-[clamp(72px,10vw,140px)] leading-none font-light tracking-[-0.04em] text-[#E97425]">
                R.
              </p>
              <h2 className="mt-4 text-[clamp(28px,3.6vw,48px)] leading-[1.06] font-light tracking-[-0.03em]">
                {REFERENCES_TITLE}
              </h2>
              <p className="mx-auto mt-5 max-w-[44ch] text-[14.5px] leading-relaxed text-[#5E6067]">
                {REFERENCES_TEXT}
              </p>
              <div className="mt-8">
                <PillButton href="#contact" variant="outline">
                  Demander les références
                </PillButton>
              </div>
              <p className="mt-8 text-[11px] tracking-[0.18em] text-[#6B6D74] uppercase">
                Aucun projet n’est nommé sans l’accord écrit du maître d’ouvrage
              </p>
            </div>
          </div>
        </section>

        {/* 5 — Carrières : bande ink, une seule ligne */}
        <section
          id="carrieres"
          className="scroll-mt-24 bg-[#111217] text-white"
        >
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-8">
                <SectionLabel number="04" label="Carrières" tone="ink" />
                <h2 className="mt-4 text-[clamp(26px,3vw,40px)] leading-[1.08] font-light tracking-[-0.03em]">
                  {CAREERS_TITLE}
                </h2>
                <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-white/60">
                  {CAREERS_TEXT}
                </p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-block text-[15px] font-medium text-white underline underline-offset-4"
                >
                  {EMAIL}
                </a>
                <div className="mt-5">
                  <TextLink href="#carrieres" tone="ink">
                    Voir les opportunités
                  </TextLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 — Contact CTA : papier, centré */}
        <section id="contact" className="scroll-mt-24 bg-[#F7F6F1]">
          <div className="mx-auto max-w-[1440px] px-5 py-20 text-center md:px-10 md:py-28">
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#9A5A15] uppercase">
              05 — Contact
            </p>
            <h2 className="mx-auto mt-5 max-w-[20ch] text-[clamp(30px,4.4vw,60px)] leading-[1.05] font-light tracking-[-0.035em]">
              {CONTACT_TITLE}
            </h2>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-7 inline-block text-[16px] font-medium text-[#111217] underline underline-offset-4"
            >
              {EMAIL}
            </a>
            <div className="mt-9">
              <PillButton href="#contact" variant="primary">
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
