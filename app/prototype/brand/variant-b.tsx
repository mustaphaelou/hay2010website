import { EMAIL, LOCATION, NAV, POSITIONING, SERVICES } from "./brand-data"
import { IconLamp, IconNetwork, IconPanel, IconTransformer } from "./icons"

const SERVICE_ICONS = [IconLamp, IconNetwork, IconTransformer, IconPanel]

const PAPER = "#F3F1EB"
const INK = "#17181C"
const COPPER = "#A85F2E"
const COPPER_TEXT = "#8A4A20"
const LINE = "#D5D1C5"
const MUTED = "#6C6A62"

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" fill={COPPER} />
      <path
        d="M8 7v14M20 7v14M8 14h12"
        stroke={PAPER}
        strokeWidth="1.8"
        fill="none"
      />
    </svg>
  )
}

function Wordmark({
  className = "",
  markClass = "",
}: {
  className?: string
  markClass?: string
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Mark className={`h-7 w-7 ${markClass}`} />
      <span className="text-[15px] font-semibold tracking-[0.16em] uppercase">
        HAY2010
      </span>
    </span>
  )
}

function SectionHead({
  index,
  title,
  note,
}: {
  index: string
  title: string
  note?: string
}) {
  return (
    <div
      className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-end"
      style={{ borderColor: LINE }}
    >
      <div className="flex items-baseline gap-4">
        <span
          className="font-mono text-[10px] tracking-[0.1em]"
          style={{ color: COPPER_TEXT }}
        >
          {index}
        </span>
        <h2 className="text-[clamp(24px,3vw,38px)] leading-[1.08] font-medium tracking-[-0.02em]">
          {title}
        </h2>
      </div>
      {note && (
        <p
          className="max-w-[38ch] font-mono text-[10px] leading-relaxed tracking-[0.08em] uppercase"
          style={{ color: MUTED }}
        >
          {note}
        </p>
      )}
    </div>
  )
}

export function VariantB() {
  return (
    <div
      className="min-h-screen text-[#17181C] selection:bg-[#8A4A20] selection:text-[#F3F1EB]"
      style={{ backgroundColor: PAPER, fontFamily: "var(--font-archivo)" }}
    >
      <a
        href="#main-b"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#17181C] focus:px-4 focus:py-2 focus:text-[#F3F1EB]"
      >
        Aller au contenu
      </a>

      {/* Registration strip */}
      <div
        className="border-b font-mono text-[9px] tracking-[0.14em] uppercase"
        style={{ borderColor: LINE, color: MUTED }}
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-5 py-2 md:px-10">
          <span>HAY2010 — Études & travaux d’électrification</span>
          <span className="hidden sm:inline">RC 87305 · Rabat — Maroc</span>
          <span>Dossier 2026 / 01</span>
        </div>
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b bg-[#F3F1EB]/95 backdrop-blur"
        style={{ borderColor: LINE }}
      >
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-5 md:px-10">
          <a href="#top-b" aria-label="HAY2010 — accueil">
            <Wordmark />
          </a>
          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Principale"
          >
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[12px] font-medium transition-colors hover:text-[#8A4A20]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden items-center gap-2 bg-[#17181C] px-5 py-2.5 text-[11px] font-medium tracking-[0.1em] text-[#F3F1EB] uppercase transition-colors hover:bg-[#8A4A20] sm:inline-flex"
            >
              Nous contacter <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              aria-label="Ouvrir le menu"
              className="grid size-9 place-items-center border lg:hidden"
              style={{ borderColor: INK }}
            >
              <span className="flex w-4 flex-col gap-[5px]">
                <span
                  className="h-px w-full"
                  style={{ backgroundColor: INK }}
                />
                <span
                  className="h-px w-full"
                  style={{ backgroundColor: INK }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <main id="main-b">
        {/* Hero */}
        <section
          id="top-b"
          className="relative overflow-hidden border-b"
          style={{
            borderColor: LINE,
            backgroundImage:
              "linear-gradient(to right, rgba(23,24,28,.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,24,28,.045) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        >
          <div className="mx-auto grid max-w-[1440px] lg:grid-cols-12">
            <div
              className="border-b px-5 py-14 md:px-10 lg:col-span-7 lg:border-r lg:border-b-0 lg:py-20"
              style={{ borderColor: LINE }}
            >
              <div
                className="flex items-center gap-3 font-mono text-[10px] tracking-[0.14em] uppercase"
                style={{ color: COPPER_TEXT }}
              >
                <span
                  className="inline-block h-2 w-2"
                  style={{ backgroundColor: COPPER }}
                />
                Études & travaux
                <span className="h-px w-8" style={{ backgroundColor: LINE }} />
                01
              </div>

              <h1 className="mt-8 max-w-[13ch] text-[clamp(46px,7vw,92px)] leading-[0.95] font-medium tracking-[-0.045em]">
                Des réseaux
                <br />
                qui tiennent<span style={{ color: COPPER_TEXT }}>.</span>
              </h1>

              <p
                className="mt-7 max-w-[52ch] text-[15px] leading-[1.7]"
                style={{ color: MUTED }}
              >
                Éclairage public, réseaux HTA/MT et BT, postes de transformation
                et courants forts et faibles. HAY2010 intervient de l’étude à la
                mise en service, à Rabat et au Maroc.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#metiers"
                  className="inline-flex items-center gap-3 bg-[#17181C] px-6 py-3.5 text-[11.5px] font-medium tracking-[0.12em] text-[#F3F1EB] uppercase transition-colors hover:bg-[#8A4A20]"
                >
                  Découvrir nos métiers
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-3 border px-6 py-3.5 text-[11.5px] font-medium tracking-[0.12em] uppercase transition-colors hover:bg-[#17181C] hover:text-[#F3F1EB]"
                  style={{ borderColor: INK, color: INK }}
                >
                  Nous contacter
                </a>
              </div>

              <div
                className="mt-12 grid max-w-lg grid-cols-3 gap-px border font-mono text-[9px] tracking-[0.1em] uppercase"
                style={{
                  borderColor: LINE,
                  backgroundColor: LINE,
                  color: MUTED,
                }}
              >
                {[
                  ["Expérience", "Plus de 10 ans"],
                  ["Base", "Rabat — Maroc"],
                  ["Références", "Sur demande"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#F3F1EB] px-3 py-3">
                    <div className="text-[8px] opacity-70">{label}</div>
                    <div
                      className="mt-1 text-[10px] tracking-normal normal-case"
                      style={{ color: INK }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawing */}
            <div className="relative flex items-center justify-center px-5 py-10 md:px-8 lg:col-span-5 lg:py-14">
              <div className="w-full max-w-[520px]">
                <div
                  className="flex items-center justify-between border border-b-0 px-3 py-2 font-mono text-[8.5px] tracking-[0.12em] uppercase"
                  style={{ borderColor: INK, color: MUTED }}
                >
                  <span>Coupe type — éclairage public</span>
                  <span>HA-2026-01</span>
                </div>
                <Blueprint className="w-full border" />
                <div
                  className="flex items-start justify-between gap-4 border border-t-0 px-3 py-2 font-mono text-[8px] leading-relaxed tracking-[0.08em] uppercase"
                  style={{ borderColor: INK, color: MUTED }}
                >
                  <span>Échelle 1:100 · A3</span>
                  <span className="max-w-[24ch] text-right">
                    Dessin type à adapter par projet — document de marque, non
                    contractuel
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section
          id="entreprise"
          className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24"
        >
          <SectionHead
            index="02"
            title="L’entreprise, en une page."
            note="Positionnement approuvé — plus de 10 ans d’expérience"
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="max-w-[42ch] text-[clamp(21px,2.4vw,30px)] leading-[1.3] font-medium tracking-[-0.02em]">
                {POSITIONING}
              </p>
              <p
                className="mt-6 max-w-[54ch] text-[14px] leading-[1.75]"
                style={{ color: MUTED }}
              >
                Nous travaillons avec les collectivités, les maîtres d’ouvrage
                publics et les entreprises. Chaque intervention est conduite
                comme un dossier technique : un périmètre clair, des choix
                documentés, une réception sans ambiguïté.
              </p>
              <div
                className="mt-8 grid max-w-md grid-cols-2 gap-px border font-mono text-[9px] tracking-[0.1em] uppercase"
                style={{
                  borderColor: LINE,
                  backgroundColor: LINE,
                  color: MUTED,
                }}
              >
                <div className="bg-[#F3F1EB] px-3 py-3">
                  <div className="text-[8px]">Siège</div>
                  <div
                    className="mt-1 text-[10px] leading-relaxed tracking-normal normal-case"
                    style={{ color: INK }}
                  >
                    {LOCATION}
                  </div>
                </div>
                <div className="bg-[#F3F1EB] px-3 py-3">
                  <div className="text-[8px]">Contact</div>
                  <div
                    className="mt-1 text-[10px] tracking-normal break-all normal-case"
                    style={{ color: INK }}
                  >
                    {EMAIL}
                  </div>
                </div>
              </div>
            </div>

            <figure className="lg:col-span-5 lg:col-start-8">
              <div className="border" style={{ borderColor: INK }}>
                <TrenchFigure className="w-full" />
              </div>
              <figcaption
                className="mt-2 flex items-start justify-between gap-4 font-mono text-[8.5px] leading-relaxed tracking-[0.08em] uppercase"
                style={{ color: MUTED }}
              >
                <span>Fig. 02 — Tranchée type, fourreaux et câble</span>
                <span className="text-right">Photo de chantier à sourcer</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Services */}
        <section
          id="metiers"
          className="border-y"
          style={{ borderColor: LINE }}
        >
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
            <SectionHead
              index="03"
              title="Quatre spécialités, un seul interlocuteur."
              note="Périmètre de lancement · quatre métiers"
            />
            <div className="mt-2">
              {SERVICES.map((service, index) => {
                const Icon = SERVICE_ICONS[index]
                return (
                  <a
                    key={service.title}
                    href="#metiers"
                    className="group grid grid-cols-12 items-start gap-x-4 gap-y-3 border-b py-6 transition-colors hover:bg-[#ECE9DF] md:items-center md:py-7"
                    style={{ borderColor: LINE }}
                  >
                    <span
                      className="col-span-2 font-mono text-[10px] tracking-[0.1em] md:col-span-1"
                      style={{ color: COPPER_TEXT }}
                    >
                      {service.number}
                    </span>
                    <span className="col-span-10 md:col-span-4">
                      <span className="flex items-center gap-3 text-[17px] font-medium tracking-[-0.01em] md:text-[20px]">
                        <Icon className="h-6 w-6 shrink-0" />
                        {service.title}
                      </span>
                    </span>
                    <span
                      className="col-span-10 col-start-3 text-[13px] leading-relaxed md:col-span-5 md:col-start-6"
                      style={{ color: MUTED }}
                    >
                      {service.description}
                    </span>
                    <span
                      className="col-span-10 col-start-3 flex items-center justify-between gap-4 font-mono text-[9px] tracking-[0.1em] uppercase md:col-span-2 md:col-start-11 md:justify-end"
                      style={{ color: COPPER_TEXT }}
                    >
                      <span className="md:hidden">Voir la fiche</span>
                      <span
                        className="transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        {/* References */}
        <section
          id="realisations"
          className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24"
        >
          <SectionHead
            index="04"
            title="Références sur demande."
            note="Aucun nom de client publié sans autorisation écrite"
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div
                className="border border-dashed p-6 md:p-10"
                style={{ borderColor: COPPER }}
              >
                <div
                  className="flex items-center justify-between font-mono text-[9px] tracking-[0.12em] uppercase"
                  style={{ color: COPPER_TEXT }}
                >
                  <span>Note de dossier</span>
                  <span>N° 04</span>
                </div>
                <p className="mt-8 max-w-[24ch] text-[clamp(24px,3.2vw,40px)] leading-[1.12] font-medium tracking-[-0.025em]">
                  Nos références sont communiquées sur demande, avec l’accord
                  des maîtres d’ouvrage.
                </p>
                <p
                  className="mt-5 max-w-[52ch] text-[13.5px] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  Le dossier est constitué au cas par cas : périmètre, année,
                  maître d’ouvrage et pièces autorisées. Aucun logo ni nom de
                  client n’est publié sur ce site.
                </p>
                <a
                  href="#contact"
                  className="mt-8 inline-flex items-center gap-3 bg-[#17181C] px-6 py-3.5 text-[11px] font-medium tracking-[0.12em] text-[#F3F1EB] uppercase transition-colors hover:bg-[#8A4A20]"
                >
                  Demander le dossier
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <div className="border" style={{ borderColor: LINE }}>
                <div
                  className="border-b px-3 py-2 font-mono text-[8.5px] tracking-[0.12em] uppercase"
                  style={{ borderColor: LINE, color: MUTED }}
                >
                  Pièces du dossier
                </div>
                {[
                  ["01", "Périmètre & lots"],
                  ["02", "Maître d’ouvrage"],
                  ["03", "Dates & réception"],
                  ["04", "Autorisation de citation"],
                ].map(([n, label]) => (
                  <div
                    key={n}
                    className="flex items-center justify-between border-b px-3 py-3 text-[12px] last:border-0"
                    style={{ borderColor: LINE }}
                  >
                    <span
                      className="font-mono text-[9px]"
                      style={{ color: COPPER_TEXT }}
                    >
                      {n}
                    </span>
                    <span>{label}</span>
                    <span
                      className="font-mono text-[9px]"
                      style={{ color: MUTED }}
                    >
                      □
                    </span>
                  </div>
                ))}
              </div>
              <p
                className="mt-3 font-mono text-[8.5px] leading-relaxed tracking-[0.08em] uppercase"
                style={{ color: MUTED }}
              >
                Jusqu’à autorisation : aucune référence nominative.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-[#17181C] text-[#F3F1EB]">
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.14em] text-[#D8A57B] uppercase">
                  <span className="inline-block h-2 w-2 bg-[#8A4A20]" />
                  Contact — 05
                </div>
                <h2 className="mt-6 max-w-[16ch] text-[clamp(34px,4.6vw,60px)] leading-[1.02] font-medium tracking-[-0.04em]">
                  Un projet à instruire ?
                </h2>
                <p className="mt-5 max-w-[46ch] text-[13.5px] leading-relaxed text-[#F3F1EB]/55">
                  Décrivez le périmètre, la localisation et l’échéance. Nous
                  revenons vers vous avec une première lecture technique.
                </p>
              </div>
              <div className="lg:col-span-4 lg:col-start-9">
                <dl className="border-t border-[#F3F1EB]/20">
                  <div className="border-b border-[#F3F1EB]/20 py-4">
                    <dt className="font-mono text-[8.5px] tracking-[0.14em] text-[#F3F1EB]/40 uppercase">
                      Écrire
                    </dt>
                    <dd className="mt-1.5">
                      <a
                        href={`mailto:${EMAIL}`}
                        className="text-[13.5px] break-all text-[#F3F1EB]/85 underline decoration-[#A85F2E] underline-offset-4 hover:text-white"
                      >
                        {EMAIL}
                      </a>
                    </dd>
                  </div>
                  <div className="border-b border-[#F3F1EB]/20 py-4">
                    <dt className="font-mono text-[8.5px] tracking-[0.14em] text-[#F3F1EB]/40 uppercase">
                      Siège
                    </dt>
                    <dd className="mt-1.5 text-[13px] leading-relaxed text-[#F3F1EB]/85">
                      Local N° 21, Hay El Manzeh,
                      <br />
                      Hay Er-Riad, Rabat — Maroc
                    </dd>
                  </div>
                </dl>
                <a
                  href={`mailto:${EMAIL}`}
                  className="mt-6 inline-flex w-full items-center justify-between bg-[#8A4A20] px-5 py-4 text-[11px] font-medium tracking-[0.12em] text-[#F3F1EB] uppercase transition-colors hover:bg-[#F3F1EB] hover:text-[#17181C]"
                >
                  Écrire à HAY2010
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Specimen */}
        <section className="border-t" style={{ borderColor: LINE }}>
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p
                  className="font-mono text-[9px] tracking-[0.16em] uppercase"
                  style={{ color: COPPER_TEXT }}
                >
                  Annexe — spécimen de marque
                </p>
                <h2 className="mt-2 text-[26px] font-medium tracking-[-0.02em]">
                  Direction B — Le Plan
                </h2>
              </div>
              <p
                className="max-w-[42ch] text-[11.5px] leading-relaxed"
                style={{ color: MUTED }}
              >
                Le site est traité comme une fiche technique : grille visible,
                annotations, typographie de plan. La photo n’est qu’une preuve,
                jamais une décoration.
              </p>
            </div>

            <div
              className="mt-10 grid gap-px border md:grid-cols-12"
              style={{ borderColor: LINE, backgroundColor: LINE }}
            >
              {/* Palette */}
              <div className="bg-[#F3F1EB] p-5 md:col-span-5">
                <p
                  className="font-mono text-[8.5px] tracking-[0.16em] uppercase"
                  style={{ color: MUTED }}
                >
                  Palette
                </p>
                <div
                  className="mt-4 grid grid-cols-5 border"
                  style={{ borderColor: LINE }}
                >
                  {[
                    ["Papier", "#F3F1EB", "text-[#17181C]"],
                    ["Encre", "#17181C", "text-[#F3F1EB]"],
                    ["Cuivre", "#A85F2E", "text-[#F3F1EB]"],
                    ["Ligne", "#D5D1C5", "text-[#17181C]"],
                    ["Gris", "#6C6A62", "text-[#F3F1EB]"],
                  ].map(([name, hex, text]) => (
                    <div key={hex}>
                      <div
                        className={`flex h-20 items-end p-2 ${text}`}
                        style={{ backgroundColor: hex }}
                      >
                        <span className="text-[7.5px] tracking-[0.12em] uppercase opacity-75">
                          {name}
                        </span>
                      </div>
                      <div
                        className="border-t bg-[#F3F1EB] px-1.5 py-1 text-[7.5px] tracking-[0.03em]"
                        style={{ borderColor: LINE, color: MUTED }}
                      >
                        {hex}
                      </div>
                    </div>
                  ))}
                </div>
                <p
                  className="mt-3 text-[11px] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  Papier technique, encre, un seul accent cuivre. Les schémas
                  restent en encre ; le cuivre marque le point d’attention.
                </p>
              </div>

              {/* Type */}
              <div className="bg-[#F3F1EB] p-5 md:col-span-4">
                <p
                  className="font-mono text-[8.5px] tracking-[0.16em] uppercase"
                  style={{ color: MUTED }}
                >
                  Typography — Archivo + JetBrains Mono
                </p>
                <div className="mt-4 border-t" style={{ borderColor: LINE }}>
                  <div
                    className="flex items-baseline justify-between border-b py-3"
                    style={{ borderColor: LINE }}
                  >
                    <span className="text-[34px] leading-none font-medium tracking-[-0.04em]">
                      Aa
                    </span>
                    <span
                      className="font-mono text-[8px]"
                      style={{ color: MUTED }}
                    >
                      ARCHIVO 500
                    </span>
                  </div>
                  <div
                    className="flex items-baseline justify-between border-b py-3"
                    style={{ borderColor: LINE }}
                  >
                    <span className="font-mono text-[11px] tracking-[0.12em] uppercase">
                      PLAN / 01
                    </span>
                    <span
                      className="font-mono text-[8px]"
                      style={{ color: MUTED }}
                    >
                      MONO 400
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between py-3">
                    <span className="text-[13px]" style={{ color: MUTED }}>
                      Corps de texte
                    </span>
                    <span
                      className="font-mono text-[8px]"
                      style={{ color: MUTED }}
                    >
                      ARCHIVO 400
                    </span>
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div className="bg-[#F3F1EB] p-5 md:col-span-3">
                <p
                  className="font-mono text-[8.5px] tracking-[0.16em] uppercase"
                  style={{ color: MUTED }}
                >
                  Logo
                </p>
                <div className="mt-4 space-y-2">
                  <div
                    className="flex h-20 items-center justify-center border bg-[#F3F1EB]"
                    style={{ borderColor: LINE }}
                  >
                    <Wordmark />
                  </div>
                  <div className="flex h-20 items-center justify-center bg-[#17181C] text-[#F3F1EB]">
                    <Wordmark />
                  </div>
                </div>
                <p
                  className="mt-3 text-[11px] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  Le H en négatif sur un carré cuivre : une borne, un repère de
                  plan.
                </p>
              </div>

              {/* Components */}
              <div className="bg-[#F3F1EB] p-5 md:col-span-5">
                <p
                  className="font-mono text-[8.5px] tracking-[0.16em] uppercase"
                  style={{ color: MUTED }}
                >
                  Composants
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="bg-[#17181C] px-4 py-2.5 text-[10px] font-medium tracking-[0.1em] text-[#F3F1EB] uppercase">
                    Bouton principal
                  </span>
                  <span className="border px-4 py-2.5 text-[10px] font-medium tracking-[0.1em] uppercase">
                    Secondaire
                  </span>
                  <span
                    className="font-mono text-[9px] tracking-[0.1em] uppercase"
                    style={{ color: COPPER_TEXT }}
                  >
                    Lien 04 →
                  </span>
                </div>
                <div
                  className="mt-6 flex items-center gap-5 border-t pt-4"
                  style={{ borderColor: LINE }}
                >
                  {SERVICE_ICONS.map((Icon, index) => (
                    <Icon key={index} className="h-6 w-6" />
                  ))}
                  <span
                    className="font-mono text-[8px]"
                    style={{ color: MUTED }}
                  >
                    24 px · trait 1,4
                  </span>
                </div>
              </div>

              {/* Motion / imagery */}
              <div className="bg-[#F3F1EB] p-5 md:col-span-4">
                <p
                  className="font-mono text-[8.5px] tracking-[0.16em] uppercase"
                  style={{ color: MUTED }}
                >
                  Image & mouvement
                </p>
                <div className="mt-4 border p-3" style={{ borderColor: LINE }}>
                  <div
                    className="flex items-center gap-2 font-mono text-[8px] tracking-[0.12em] uppercase"
                    style={{ color: MUTED }}
                  >
                    <span
                      className="h-1.5 w-1.5"
                      style={{ backgroundColor: COPPER }}
                    />
                    Photo = preuve
                  </div>
                  <p
                    className="mt-2 text-[11px] leading-relaxed"
                    style={{ color: MUTED }}
                  >
                    Images de chantier recadrées, légendées et numérotées.
                    Jamais de personne identifiable sans autorisation.
                  </p>
                </div>
                <p
                  className="mt-3 text-[11px] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  Aucun mouvement décoratif. Seul le tracé des schémas peut
                  s’animer une fois, à l’entrée dans le viewport.
                </p>
              </div>

              {/* Prompts */}
              <div className="bg-[#F3F1EB] p-5 md:col-span-3">
                <p
                  className="font-mono text-[8.5px] tracking-[0.16em] uppercase"
                  style={{ color: MUTED }}
                >
                  À trancher
                </p>
                <ul
                  className="mt-4 space-y-2.5 text-[11px] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  <li className="border-t pt-2.5" style={{ borderColor: LINE }}>
                    Le dessin technique est-il tenable sur 6 pages ?
                  </li>
                  <li className="border-t pt-2.5" style={{ borderColor: LINE }}>
                    Le cuivre suffit-il à réchauffer l’ensemble ?
                  </li>
                  <li className="border-t pt-2.5" style={{ borderColor: LINE }}>
                    Archivo est-il assez lisible en corps de texte ?
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: LINE }}>
        <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <Wordmark />
              <p
                className="mt-5 max-w-[38ch] text-[12px] leading-relaxed"
                style={{ color: MUTED }}
              >
                Éclairage public, réseaux HTA/BT, postes de transformation et
                CFO/CFA. {LOCATION}.
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-4 inline-block border-b pb-0.5 text-[12px]"
                style={{ borderColor: COPPER, color: INK }}
              >
                {EMAIL}
              </a>
            </div>
            <div className="md:col-span-3">
              <p
                className="font-mono text-[8.5px] tracking-[0.16em] uppercase"
                style={{ color: MUTED }}
              >
                L’Entreprise
              </p>
              <ul
                className="mt-4 space-y-2 text-[12px]"
                style={{ color: MUTED }}
              >
                <li>
                  <a className="hover:text-[#17181C]" href="#entreprise">
                    L’Entreprise
                  </a>
                </li>
                <li>
                  <a className="hover:text-[#17181C]" href="#realisations">
                    Réalisations
                  </a>
                </li>
                <li>
                  <a className="hover:text-[#17181C]" href="#carrieres">
                    Carrières
                  </a>
                </li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <p
                className="font-mono text-[8.5px] tracking-[0.16em] uppercase"
                style={{ color: MUTED }}
              >
                Nos Métiers
              </p>
              <ul
                className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[12px]"
                style={{ color: MUTED }}
              >
                {SERVICES.map((service) => (
                  <li key={service.title}>
                    <a className="hover:text-[#17181C]" href="#metiers">
                      {service.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className="mt-10 flex flex-col justify-between gap-2 border-t pt-5 font-mono text-[8.5px] tracking-[0.1em] uppercase sm:flex-row"
            style={{ borderColor: LINE, color: MUTED }}
          >
            <p>© 2026 SOCIETE HAY 2010 — Tous droits réservés</p>
            <div className="flex gap-5">
              <a className="hover:text-[#17181C]" href="#">
                Mentions légales
              </a>
              <a className="hover:text-[#17181C]" href="#">
                Confidentialité
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Blueprint({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 560"
      className={className}
      aria-hidden="true"
      style={{ backgroundColor: PAPER }}
    >
      <defs>
        <pattern
          id="b-grid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M20 0H0V20"
            fill="none"
            stroke="#17181C"
            strokeWidth="0.4"
            opacity="0.12"
          />
        </pattern>
        <pattern
          id="b-grid-major"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M100 0H0V100"
            fill="none"
            stroke="#17181C"
            strokeWidth="0.7"
            opacity="0.18"
          />
        </pattern>
      </defs>

      <rect width="520" height="560" fill="url(#b-grid)" />
      <rect width="520" height="560" fill="url(#b-grid-major)" />

      {/* frame + corner ticks */}
      <rect
        x="18"
        y="18"
        width="484"
        height="524"
        fill="none"
        stroke="#17181C"
        strokeWidth="0.8"
      />
      <g stroke="#17181C" strokeWidth="1" fill="none">
        <path d="M18 38V18h20M482 18h20v20M502 482v20h-20M38 502H18v-20" />
      </g>

      {/* title block */}
      <g>
        <rect
          x="330"
          y="462"
          width="172"
          height="76"
          fill="none"
          stroke="#17181C"
          strokeWidth="0.8"
        />
        <line
          x1="330"
          y1="486"
          x2="502"
          y2="486"
          stroke="#17181C"
          strokeWidth="0.5"
        />
        <line
          x1="330"
          y1="510"
          x2="502"
          y2="510"
          stroke="#17181C"
          strokeWidth="0.5"
        />
        <text
          x="338"
          y="478"
          fill="#17181C"
          fontSize="7"
          fontFamily="var(--font-jetbrains)"
          letterSpacing="0.8"
        >
          HAY2010 / ÉTUDES &amp; TRAVAUX
        </text>
        <text
          x="338"
          y="501"
          fill="#6C6A62"
          fontSize="6.5"
          fontFamily="var(--font-jetbrains)"
          letterSpacing="0.8"
        >
          COUPE TYPE — ÉCLAIRAGE PUBLIC
        </text>
        <text
          x="338"
          y="525"
          fill="#6C6A62"
          fontSize="6.5"
          fontFamily="var(--font-jetbrains)"
          letterSpacing="0.8"
        >
          PLAN HA-2026-01 · ÉCH. 1:100
        </text>
        <text
          x="338"
          y="534"
          fill="#6C6A62"
          fontSize="6.5"
          fontFamily="var(--font-jetbrains)"
          letterSpacing="0.8"
        >
          RABAT — MAROC · 2026
        </text>
      </g>

      {/* ground */}
      <line
        x1="48"
        y1="400"
        x2="310"
        y2="400"
        stroke="#17181C"
        strokeWidth="1.4"
      />
      <g stroke="#17181C" strokeWidth="0.6" opacity="0.5">
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={i} x1={54 + i * 20} y1={400} x2={48 + i * 20} y2={414} />
        ))}
      </g>
      <text
        x="48"
        y="430"
        fill="#6C6A62"
        fontSize="6.5"
        fontFamily="var(--font-jetbrains)"
        letterSpacing="0.6"
      >
        TN — TERRAIN NATUREL
      </text>

      {/* road / sidewalk hatch */}
      <path
        d="M310 400h110v-18H310Z"
        fill="none"
        stroke="#17181C"
        strokeWidth="0.8"
      />
      <path
        d="M320 382l-8 18M336 382l-8 18M352 382l-8 18M368 382l-8 18M384 382l-8 18M400 382l-8 18"
        stroke="#17181C"
        strokeWidth="0.4"
        opacity="0.5"
      />

      {/* pole */}
      <rect x="168" y="120" width="6" height="280" fill="#17181C" />
      <path
        d="M174 128h90"
        stroke="#17181C"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect
        x="252"
        y="134"
        width="46"
        height="10"
        fill="none"
        stroke="#17181C"
        strokeWidth="1"
      />
      <circle cx="275" cy="139" r="2.2" fill="#A85F2E" />

      {/* light cone */}
      <path d="M258 148L212 330h126L298 148Z" fill="#A85F2E" opacity="0.06" />
      <path
        d="M258 148L212 330M298 148l40 182"
        stroke="#A85F2E"
        strokeWidth="0.6"
        strokeDasharray="3 4"
        opacity="0.8"
      />

      {/* dimensions */}
      <g stroke="#A85F2E" strokeWidth="0.7" fill="none">
        <path d="M200 120v280M196 120h8M196 400h8" />
        <path d="M200 128h10M200 392h10" opacity="0.6" />
      </g>
      <text
        x="210"
        y="264"
        fill="#A85F2E"
        fontSize="7"
        fontFamily="var(--font-jetbrains)"
        transform="rotate(-90 210 264)"
        letterSpacing="0.5"
      >
        8,00 m
      </text>

      <g stroke="#17181C" strokeWidth="0.6" fill="none">
        <path d="M48 448h262M48 443v10M310 443v10" />
      </g>
      <text
        x="140"
        y="462"
        fill="#17181C"
        fontSize="6.5"
        fontFamily="var(--font-jetbrains)"
        letterSpacing="0.6"
      >
        6,00 m
      </text>

      {/* leaders */}
      <g stroke="#17181C" strokeWidth="0.5" fill="none">
        <path d="M298 139h44v-22" />
        <path d="M174 200h-40v-14" />
        <path d="M275 392v26h58" />
      </g>
      <text
        x="346"
        y="114"
        fill="#17181C"
        fontSize="6.5"
        fontFamily="var(--font-jetbrains)"
        letterSpacing="0.5"
      >
        LUMINAIRE LED
      </text>
      <text
        x="84"
        y="182"
        fill="#17181C"
        fontSize="6.5"
        fontFamily="var(--font-jetbrains)"
        letterSpacing="0.5"
      >
        MÂT GALVANISÉ
      </text>
      <text
        x="340"
        y="421"
        fill="#17181C"
        fontSize="6.5"
        fontFamily="var(--font-jetbrains)"
        letterSpacing="0.5"
      >
        CÂBLE BT 400 V
      </text>

      {/* cable in trench */}
      <path
        d="M174 400v-6c0-10 8-18 18-18h68"
        fill="none"
        stroke="#A85F2E"
        strokeWidth="1.6"
      />
      <circle cx="260" cy="376" r="2" fill="#A85F2E" />

      {/* annotations top */}
      <g
        fontFamily="var(--font-jetbrains)"
        fill="#6C6A62"
        fontSize="6.5"
        letterSpacing="0.6"
      >
        <text x="36" y="50">
          COUPE A–A
        </text>
        <text x="36" y="64">
          ÉCLAIRAGE PUBLIC — VOIRIE
        </text>
        <text x="402" y="50">
          RÉF. 01 / 04
        </text>
        <text x="402" y="64">
          SANS ÉCHELLE HUMAINE
        </text>
      </g>

      {/* north arrow / scale */}
      <g stroke="#17181C" strokeWidth="0.6" fill="none">
        <circle cx="70" cy="110" r="12" />
        <path d="M70 100v20M64 110l6-10 6 10" />
      </g>
      <text
        x="60"
        y="134"
        fill="#6C6A62"
        fontSize="6"
        fontFamily="var(--font-jetbrains)"
      >
        N
      </text>
    </svg>
  )
}

function TrenchFigure({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 420"
      className={className}
      aria-hidden="true"
      style={{ backgroundColor: "#E9E6DC" }}
    >
      <rect width="640" height="420" fill="#E9E6DC" />
      {/* asphalt */}
      <rect y="0" width="640" height="96" fill="#17181C" />
      <g stroke="#F3F1EB" strokeWidth="1" opacity="0.12">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={i} x1={i * 34} y1="0" x2={i * 34 - 40} y2="96" />
        ))}
      </g>
      <text
        x="24"
        y="34"
        fill="#F3F1EB"
        opacity="0.55"
        fontSize="8"
        fontFamily="var(--font-jetbrains)"
        letterSpacing="1"
      >
        CHAUSSÉE
      </text>

      {/* trench */}
      <path d="M0 96h640v40H470V300H170V136H0Z" fill="#CFC9B9" />
      <path
        d="M170 136v164h300V136"
        fill="none"
        stroke="#A85F2E"
        strokeWidth="2"
      />
      <path
        d="M0 136h170M470 136h170"
        stroke="#17181C"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* sand */}
      <rect x="186" y="206" width="268" height="78" fill="#DCD5C3" />
      <g fill="#B9B09A">
        {Array.from({ length: 40 }).map((_, i) => (
          <circle
            key={i}
            cx={196 + ((i * 67) % 248)}
            cy={216 + ((i * 41) % 60)}
            r={i % 3 === 0 ? 2.4 : 1.4}
          />
        ))}
      </g>

      {/* duct + cable */}
      <circle
        cx="290"
        cy="246"
        r="34"
        fill="none"
        stroke="#17181C"
        strokeWidth="1.4"
      />
      <circle
        cx="290"
        cy="246"
        r="26"
        fill="none"
        stroke="#17181C"
        strokeWidth="0.7"
        opacity="0.5"
      />
      <circle cx="290" cy="246" r="11" fill="#A85F2E" />
      <circle cx="290" cy="246" r="4" fill="#E9E6DC" opacity="0.7" />
      <text
        x="340"
        y="242"
        fill="#17181C"
        fontSize="8"
        fontFamily="var(--font-jetbrains)"
        letterSpacing="0.8"
      >
        FOURREAU Ø 160
      </text>
      <text
        x="340"
        y="258"
        fill="#6C6A62"
        fontSize="8"
        fontFamily="var(--font-jetbrains)"
        letterSpacing="0.8"
      >
        CÂBLE BT 400 V
      </text>

      {/* dimension */}
      <g stroke="#A85F2E" strokeWidth="0.8" fill="none">
        <path d="M470 96v204M464 96h12M464 300h12" />
        <path d="M470 128h12M470 276h12" opacity="0.6" />
      </g>
      <text
        x="488"
        y="204"
        fill="#A85F2E"
        fontSize="8"
        fontFamily="var(--font-jetbrains)"
        transform="rotate(90 488 204)"
        letterSpacing="0.8"
      >
        1,20 m
      </text>

      {/* backfill hatch */}
      <g stroke="#17181C" strokeWidth="0.5" opacity="0.35">
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M${186 + i * 30} 300l22 -22`} />
        ))}
      </g>
      <text
        x="24"
        y="352"
        fill="#6C6A62"
        fontSize="8"
        fontFamily="var(--font-jetbrains)"
        letterSpacing="1"
      >
        REMBLAI COMPACTÉ
      </text>
      <path d="M24 340h120" stroke="#6C6A62" strokeWidth="0.6" opacity="0.5" />

      {/* fig label */}
      <g fontFamily="var(--font-jetbrains)" fontSize="7.5" letterSpacing="0.8">
        <text x="24" y="398" fill="#6C6A62">
          FIG. 02 — TRENCHÉE TYPE
        </text>
        <text x="470" y="398" fill="#6C6A62">
          ÉCH. 1:20
        </text>
      </g>
    </svg>
  )
}
