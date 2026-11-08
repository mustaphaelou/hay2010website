import type { CSSProperties } from "react"

import { EMAIL, LOCATION, NAV, POSITIONING, SERVICES } from "./brand-data"
import {
  IconLampSolid,
  IconNetworkSolid,
  IconPanelSolid,
  IconTransformerSolid,
} from "./icons"

const SERVICE_ICONS = [
  IconLampSolid,
  IconNetworkSolid,
  IconTransformerSolid,
  IconPanelSolid,
]

const INK = "#0A1020"
const COBALT = "#2447E0"
const AMBER = "#FFC24B"
const PAPER = "#F4F6FB"
const MUTED = "#5D667C"

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill={COBALT} />
      <path
        d="M8 7v14M20 7v14M8 14h12"
        stroke={PAPER}
        strokeWidth="2.6"
        fill="none"
      />
      <rect y="23" width="28" height="5" fill={AMBER} />
    </svg>
  )
}

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`flex items-center gap-2.5 ${light ? "text-white" : "text-[#0A1020]"}`}
    >
      <Mark className="h-7 w-7" />
      <span className="text-[20px] font-extrabold tracking-[-0.045em]">
        HAY<span style={{ color: light ? AMBER : COBALT }}>2010</span>
      </span>
    </span>
  )
}

export function VariantC() {
  return (
    <div
      className="min-h-screen bg-[#F4F6FB] text-[#0A1020] selection:bg-[#FFC24B] selection:text-[#0A1020]"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <a
        href="#main-c"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#0A1020] focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#0A1020]/10 bg-[#F4F6FB]/95 backdrop-blur">
        <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between px-5 md:px-10">
          <a href="#top-c" aria-label="HAY2010 — accueil">
            <Wordmark />
          </a>
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Principale"
          >
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[13px] font-medium text-[#0A1020]/70 transition-colors hover:text-[#2447E0]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden rounded-full bg-[#FFC24B] px-5 py-2.5 text-[12.5px] font-semibold text-[#0A1020] transition-colors hover:bg-[#0A1020] hover:text-[#FFC24B] sm:inline-flex"
            >
              Nous contacter
            </a>
            <button
              type="button"
              aria-label="Ouvrir le menu"
              className="grid size-10 place-items-center rounded-full border border-[#0A1020]/15 lg:hidden"
            >
              <span className="flex w-4 flex-col gap-[5px]">
                <span className="h-0.5 w-full bg-[#0A1020]" />
                <span className="h-0.5 w-full bg-[#0A1020]" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <main id="main-c">
        {/* Hero */}
        <section
          id="top-c"
          className="relative overflow-hidden bg-[#0A1020] text-white"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_18%,rgba(36,71,224,.42),transparent_58%)]" />
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pt-16 pb-14 md:px-10 lg:grid-cols-12 lg:items-center lg:gap-6 lg:pt-20 lg:pb-20">
            <div className="relative z-10 lg:col-span-7">
              <div className="flex items-center gap-3 text-[10.5px] font-semibold tracking-[0.22em] text-white/50 uppercase">
                <span className="h-2 w-2 rounded-full bg-[#FFC24B]" />
                Électrification & éclairage public — Rabat
              </div>
              <h1
                className="mt-7 text-[clamp(52px,8.4vw,116px)] leading-[0.86] font-extrabold tracking-[-0.055em]"
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                Le réseau
                <br />
                ne dort
                <br />
                <span style={{ color: AMBER }}>jamais.</span>
              </h1>
              <p className="mt-8 max-w-[48ch] text-[15.5px] leading-relaxed text-white/60 md:text-[16.5px]">
                Éclairage public, réseaux HTA/MT et BT, postes de transformation
                et courants forts et faibles. HAY2010 intervient de l’étude à la
                mise en service, pour les collectivités et les entreprises.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#metiers"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#FFC24B] px-6 py-3.5 text-[13px] font-semibold text-[#0A1020] transition-colors hover:bg-white"
                >
                  Découvrir nos métiers
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/25 px-6 py-3.5 text-[13px] font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Nous contacter
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-2 text-[10px] font-medium tracking-[0.16em] text-white/35 uppercase">
                <span>Plus de 10 ans d’expérience</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>Références sur demande</span>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-[520px]">
                <div className="absolute -inset-3 rounded-[28px] border border-white/10" />
                <NightScene className="w-full rounded-[22px]" />
                <div className="absolute bottom-4 left-4 rounded-full bg-[#0A1020]/70 px-3 py-1.5 text-[8.5px] tracking-[0.18em] text-white/60 uppercase backdrop-blur">
                  Illustration — visuel de démonstration
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="brand-marquee overflow-hidden border-y border-[#0A1020] bg-[#2447E0] py-4">
          <div className="flex w-max animate-[brand-marquee_32s_linear_infinite] items-center">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex items-center"
                aria-hidden={copy === 1}
              >
                {SERVICES.map((service) => (
                  <span
                    key={service.title}
                    className="flex items-center text-[13px] font-semibold tracking-[0.14em] whitespace-nowrap text-white uppercase"
                  >
                    <span className="px-7">{service.short}</span>
                    <span className="text-[#FFC24B]" aria-hidden="true">
                      ✳
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Intro */}
        <section
          id="entreprise"
          className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28"
        >
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <div className="flex items-start gap-2">
                <span
                  className="text-[clamp(96px,12vw,160px)] leading-[0.72] font-extrabold tracking-[-0.07em]"
                  style={{ fontFamily: "var(--font-bricolage)", color: COBALT }}
                >
                  10
                </span>
                <span className="mt-2 max-w-[7ch] text-[12px] leading-tight font-semibold tracking-[0.12em] text-[#0A1020]/55 uppercase">
                  ans d’expérience
                </span>
              </div>
              <div className="mt-8 h-1 w-16 bg-[#FFC24B]" />
              <p className="mt-5 max-w-[30ch] text-[13px] leading-relaxed text-[#5D667C]">
                Une entreprise d’électrification basée à Rabat, au service des
                collectivités et des entreprises.
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <h2
                className="max-w-[20ch] text-[clamp(30px,4vw,52px)] leading-[1.02] font-extrabold tracking-[-0.045em]"
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                Des ouvrages qui restent allumés.
              </h2>
              <p className="mt-6 max-w-[54ch] text-[15px] leading-relaxed text-[#5D667C]">
                {POSITIONING}
              </p>
              <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-[#5D667C]">
                Nous travaillons avec les collectivités, les maîtres d’ouvrage
                publics et les entreprises, avec une même exigence : des réseaux
                fiables, livrés dans les règles de l’art.
              </p>
              <a
                href="#entreprise"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#0A1020] px-5 py-3 text-[12px] font-semibold text-white transition-colors hover:bg-[#2447E0]"
              >
                L’entreprise
                <span
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Services */}
        <section
          id="metiers"
          className="mx-auto max-w-[1440px] px-5 pb-20 md:px-10 md:pb-28"
        >
          <div className="flex flex-col justify-between gap-4 border-t border-[#0A1020]/10 pt-6 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#2447E0] uppercase">
                Nos métiers
              </p>
              <h2
                className="mt-3 text-[clamp(28px,3.6vw,46px)] leading-[1.02] font-extrabold tracking-[-0.045em]"
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                Quatre façons de tenir.
              </h2>
            </div>
            <p className="max-w-[36ch] text-[13px] leading-relaxed text-[#5D667C] md:text-right">
              Un seul interlocuteur, du premier relevé à la réception des
              ouvrages.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {SERVICES.map((service, index) => {
              const Icon = SERVICE_ICONS[index]
              const styles = [
                {
                  bg: INK,
                  fg: "#FFFFFF",
                  sub: "rgba(255,255,255,.55)",
                  icon: AMBER,
                  accent: AMBER,
                },
                {
                  bg: COBALT,
                  fg: "#FFFFFF",
                  sub: "rgba(255,255,255,.6)",
                  icon: AMBER,
                  accent: AMBER,
                },
                {
                  bg: AMBER,
                  fg: INK,
                  sub: "rgba(10,16,32,.6)",
                  icon: INK,
                  accent: INK,
                },
                {
                  bg: PAPER,
                  fg: INK,
                  sub: MUTED,
                  icon: COBALT,
                  accent: COBALT,
                },
              ][index]
              return (
                <a
                  key={service.title}
                  href="#metiers"
                  className={`group relative flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[22px] p-7 transition-transform duration-300 hover:-translate-y-1 md:p-9 ${index === 3 ? "border border-[#0A1020]/10" : ""}`}
                  style={{ backgroundColor: styles.bg, color: styles.fg }}
                >
                  <div className="flex items-start justify-between">
                    <Icon
                      className="h-11 w-11"
                      style={
                        {
                          "--card-bg": styles.bg,
                          color: styles.icon,
                        } as CSSProperties
                      }
                    />
                    <span className="text-[11px] font-semibold tracking-[0.18em] opacity-40">
                      {service.number}
                    </span>
                  </div>
                  <div>
                    <h3
                      className="max-w-[13ch] text-[clamp(22px,2.4vw,30px)] leading-[1.05] font-extrabold tracking-[-0.035em]"
                      style={{ fontFamily: "var(--font-bricolage)" }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="mt-2.5 max-w-[34ch] text-[12.5px] leading-relaxed"
                      style={{ color: styles.sub }}
                    >
                      {service.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-[10px] font-semibold tracking-[0.16em] uppercase opacity-55">
                        Voir le détail
                      </span>
                      <span
                        className="grid size-8 place-items-center rounded-full border text-[13px] transition-transform group-hover:translate-x-0.5"
                        style={{ borderColor: `${styles.fg}33` }}
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        {/* References */}
        <section
          id="realisations"
          className="relative overflow-hidden bg-[#2447E0] text-white"
        >
          <div
            className="pointer-events-none absolute -top-24 -right-20 text-[320px] leading-none font-extrabold tracking-[-0.08em] text-white/[0.05]"
            style={{ fontFamily: "var(--font-bricolage)" }}
            aria-hidden="true"
          >
            R.
          </div>
          <div className="relative mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-24">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-white/50 uppercase">
                  Réalisations
                </p>
                <h2
                  className="mt-5 max-w-[14ch] text-[clamp(36px,5.6vw,76px)] leading-[0.96] font-extrabold tracking-[-0.05em]"
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  Références
                  <br />
                  <span style={{ color: AMBER }}>sur demande.</span>
                </h2>
                <p className="mt-6 max-w-[46ch] text-[14px] leading-relaxed text-white/60">
                  Nos dossiers sont communiqués sur demande, avec l’accord des
                  maîtres d’ouvrage. Aucun nom ni logo de client n’est publié
                  sans autorisation écrite.
                </p>
              </div>
              <div className="lg:col-span-4 lg:justify-self-end">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-3 rounded-full bg-[#FFC24B] px-7 py-4 text-[13px] font-semibold text-[#0A1020] transition-colors hover:bg-white"
                >
                  Demander le dossier
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-[#FFC24B] text-[#0A1020]">
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-[#0A1020]/50 uppercase">
                  Contact
                </p>
                <h2
                  className="mt-4 max-w-[12ch] text-[clamp(38px,5.4vw,72px)] leading-[0.94] font-extrabold tracking-[-0.05em]"
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  On éclaire.
                  <br />
                  On raccorde.
                  <br />
                  On tient.
                </h2>
              </div>
              <div className="lg:col-span-5 lg:justify-self-end">
                <p className="max-w-[34ch] text-[13.5px] leading-relaxed text-[#0A1020]/65">
                  Un projet d’éclairage public ou d’électrification ?
                  Écrivez-nous avec le périmètre, le lieu et l’échéance.
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="mt-5 inline-block border-b border-[#0A1020]/30 pb-1 text-[clamp(16px,1.8vw,21px)] font-semibold break-all transition-colors hover:border-[#0A1020]"
                >
                  {EMAIL}
                </a>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#0A1020] px-6 py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2447E0]"
                  >
                    Nous contacter
                    <span aria-hidden="true">→</span>
                  </a>
                  <span className="text-[11px] font-medium text-[#0A1020]/50">
                    {LOCATION}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specimen */}
        <section className="border-t border-[#0A1020]/10">
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-[#2447E0] uppercase">
                  Spécimen de marque
                </p>
                <h2
                  className="mt-2 text-[28px] font-extrabold tracking-[-0.04em]"
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  Direction C — Réseau
                </h2>
              </div>
              <p className="max-w-[40ch] text-[11.5px] leading-relaxed text-[#5D667C]">
                Un système de blocs et d’aplats : encre, cobalt, ambre. Le
                contraste porte la hiérarchie, pas les effets.
              </p>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-12">
              <div className="rounded-[18px] bg-white p-5 md:col-span-5">
                <p className="text-[8.5px] font-semibold tracking-[0.2em] text-[#5D667C] uppercase">
                  Palette
                </p>
                <div className="mt-4 grid grid-cols-5 gap-1.5">
                  {[
                    ["Encre", "#0A1020", "text-white"],
                    ["Cobalt", "#2447E0", "text-white"],
                    ["Ambre", "#FFC24B", "text-[#0A1020]"],
                    ["Papier", "#F4F6FB", "text-[#0A1020]"],
                    ["Gris", "#5D667C", "text-white"],
                  ].map(([name, hex, text]) => (
                    <div key={hex}>
                      <div
                        className={`flex h-20 items-end rounded-lg p-2 ${text}`}
                        style={{ backgroundColor: hex }}
                      >
                        <span className="text-[7.5px] tracking-[0.1em] uppercase opacity-75">
                          {name}
                        </span>
                      </div>
                      <div className="mt-1 text-center text-[7.5px] text-[#5D667C]">
                        {hex}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[#5D667C]">
                  Deux couleurs d’énergie — le cobalt du réseau, l’ambre de la
                  lumière — sur une encre profonde.
                </p>
              </div>

              <div className="rounded-[18px] bg-white p-5 md:col-span-4">
                <p className="text-[8.5px] font-semibold tracking-[0.2em] text-[#5D667C] uppercase">
                  Typographie — Bricolage Grotesque + Inter
                </p>
                <div className="mt-4 border-t border-[#0A1020]/10">
                  <div className="flex items-baseline justify-between border-b border-[#0A1020]/10 py-3">
                    <span
                      className="text-[34px] leading-none font-extrabold tracking-[-0.05em]"
                      style={{ fontFamily: "var(--font-bricolage)" }}
                    >
                      Aa
                    </span>
                    <span className="text-[8px] tracking-[0.1em] text-[#5D667C] uppercase">
                      Bricolage 800
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-[#0A1020]/10 py-3">
                    <span className="text-[13px] text-[#5D667C]">
                      Corps de texte
                    </span>
                    <span className="text-[8px] tracking-[0.1em] text-[#5D667C] uppercase">
                      Inter 400
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between py-3">
                    <span className="text-[11px] font-semibold tracking-[0.14em] uppercase">
                      Label
                    </span>
                    <span className="text-[8px] tracking-[0.1em] text-[#5D667C] uppercase">
                      Inter 600
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[18px] bg-white p-5 md:col-span-3">
                <p className="text-[8.5px] font-semibold tracking-[0.2em] text-[#5D667C] uppercase">
                  Logo
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex h-20 items-center justify-center rounded-xl bg-[#F4F6FB]">
                    <Wordmark />
                  </div>
                  <div className="flex h-20 items-center justify-center rounded-xl bg-[#0A1020]">
                    <Wordmark light />
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[#5D667C]">
                  Le H dans un badge cobalt, souligné d’ambre — une borne
                  d’identification.
                </p>
              </div>

              <div className="rounded-[18px] bg-white p-5 md:col-span-5">
                <p className="text-[8.5px] font-semibold tracking-[0.2em] text-[#5D667C] uppercase">
                  Composants
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-[#0A1020] px-4 py-2.5 text-[10.5px] font-semibold text-white">
                    Bouton principal
                  </span>
                  <span className="rounded-full bg-[#FFC24B] px-4 py-2.5 text-[10.5px] font-semibold">
                    Accent
                  </span>
                  <span className="rounded-full border border-[#0A1020]/20 px-4 py-2.5 text-[10.5px] font-medium">
                    Secondaire
                  </span>
                </div>
                <div className="mt-6 flex items-center gap-5 border-t border-[#0A1020]/10 pt-4">
                  {SERVICE_ICONS.map((Icon, index) => (
                    <Icon
                      key={index}
                      className="h-7 w-7"
                      style={
                        {
                          color: COBALT,
                          "--card-bg": "#FFFFFF",
                        } as CSSProperties
                      }
                    />
                  ))}
                  <span className="text-[8.5px] tracking-[0.1em] text-[#5D667C] uppercase">
                    Pictos pleins
                  </span>
                </div>
              </div>

              <div className="rounded-[18px] bg-white p-5 md:col-span-4">
                <p className="text-[8.5px] font-semibold tracking-[0.2em] text-[#5D667C] uppercase">
                  Image & mouvement
                </p>
                <div className="mt-4 overflow-hidden rounded-xl">
                  <NightScene className="h-24 w-full" />
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[#5D667C]">
                  Illustration de nuit en aplats, ou photo traitée en duotone
                  cobalt/ambre. Bandeau défilant lent, désactivé si
                  <span className="font-medium text-[#0A1020]">
                    {" "}
                    prefers-reduced-motion
                  </span>
                  .
                </p>
              </div>

              <div className="rounded-[18px] bg-white p-5 md:col-span-3">
                <p className="text-[8.5px] font-semibold tracking-[0.2em] text-[#5D667C] uppercase">
                  À trancher
                </p>
                <ul className="mt-4 space-y-2.5 text-[11px] leading-relaxed text-[#5D667C]">
                  <li className="border-t border-[#0A1020]/10 pt-2.5">
                    Le ton « on » est-il juste pour un maître d’ouvrage public ?
                  </li>
                  <li className="border-t border-[#0A1020]/10 pt-2.5">
                    Le cobalt reste-t-il crédible sur 6 pages ?
                  </li>
                  <li className="border-t border-[#0A1020]/10 pt-2.5">
                    L’ambre porte-t-il assez la marque ?
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A1020] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <Wordmark light />
              <p className="mt-5 max-w-[36ch] text-[12.5px] leading-relaxed text-white/50">
                Éclairage public, réseaux HTA/BT, postes de transformation et
                CFO/CFA. {LOCATION}.
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-5 inline-block border-b border-white/20 pb-1 text-[12.5px] text-white/75 hover:border-[#FFC24B] hover:text-[#FFC24B]"
              >
                {EMAIL}
              </a>
            </div>
            <div className="md:col-span-3">
              <p className="text-[8.5px] font-semibold tracking-[0.2em] text-white/35 uppercase">
                L’Entreprise
              </p>
              <ul className="mt-4 space-y-2.5 text-[12.5px] text-white/60">
                <li>
                  <a className="hover:text-[#FFC24B]" href="#entreprise">
                    L’Entreprise
                  </a>
                </li>
                <li>
                  <a className="hover:text-[#FFC24B]" href="#realisations">
                    Réalisations
                  </a>
                </li>
                <li>
                  <a className="hover:text-[#FFC24B]" href="#carrieres">
                    Carrières
                  </a>
                </li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <p className="text-[8.5px] font-semibold tracking-[0.2em] text-white/35 uppercase">
                Nos Métiers
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12.5px] text-white/60">
                {SERVICES.map((service) => (
                  <li key={service.title}>
                    <a className="hover:text-[#FFC24B]" href="#metiers">
                      {service.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-[10px] text-white/35 sm:flex-row">
            <p>© 2026 SOCIETE HAY 2010 — Tous droits réservés</p>
            <div className="flex gap-5">
              <a className="hover:text-white" href="#">
                Mentions légales
              </a>
              <a className="hover:text-white" href="#">
                Confidentialité
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NightScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 640"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="c-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050A18" />
          <stop offset="0.55" stopColor="#0B1A44" />
          <stop offset="1" stopColor="#152C6B" />
        </linearGradient>
        <radialGradient id="c-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFD98A" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#FFC24B" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFC24B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="c-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFC24B" stopOpacity="0.22" />
          <stop offset="1" stopColor="#FFC24B" stopOpacity="0" />
        </linearGradient>
        <filter id="c-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>

      <rect width="600" height="640" fill="url(#c-sky)" />
      <circle cx="420" cy="250" r="190" fill="url(#c-halo)" opacity="0.85" />
      <circle
        cx="420"
        cy="250"
        r="52"
        fill="#FFD98A"
        opacity="0.65"
        filter="url(#c-blur)"
      />
      <circle cx="420" cy="250" r="26" fill="#FFC24B" />

      {/* buildings */}
      <g fill="#081027">
        <path d="M0 430h70v-96h52v96h58v-150h46v150h54v-64h64v64h70v-120h50v120h136v300H0Z" />
      </g>
      <g fill="#0D1830">
        <path d="M0 470h92v-44h40v44h72v-72h34v72h64v-30h52v30h84v-58h44v58h118v170H0Z" />
      </g>
      <g fill="#FFC24B" opacity="0.5">
        {[
          [24, 380],
          [44, 380],
          [84, 396],
          [150, 372],
          [170, 372],
          [238, 330],
          [258, 330],
          [330, 402],
          [350, 402],
          [418, 300],
          [438, 300],
          [486, 360],
          [506, 360],
          [544, 342],
          [564, 342],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="8" height="10" rx="1" />
        ))}
      </g>

      {/* ground */}
      <rect y="520" width="600" height="120" fill="#050A18" />
      <path d="M0 520h600" stroke="#2447E0" strokeWidth="2" opacity="0.55" />
      <g stroke="#2447E0" strokeWidth="1" opacity="0.3">
        <path d="M300 520L120 640M300 520l180 120M300 520v120" />
      </g>

      {/* poles */}
      <g stroke="#F4F6FB" strokeWidth="4" strokeLinecap="round" opacity="0.9">
        <path d="M120 520V250" />
        <path d="M470 520V300" />
        <path d="M120 258h84" />
        <path d="M470 308h-76" />
      </g>
      <g fill="#FFC24B">
        <rect x="196" y="250" width="26" height="9" rx="2" />
        <rect x="392" y="300" width="22" height="8" rx="2" />
      </g>
      <g fill="url(#c-beam)">
        <path d="M196 260L150 520h120L222 260Z" />
        <path d="M392 310l-38 210h108l-34-210Z" />
      </g>

      {/* cables */}
      <g fill="none" stroke="#F4F6FB" strokeWidth="1.2" opacity="0.4">
        <path d="M120 258Q300 330 470 308" />
        <path d="M120 272Q300 350 470 320" opacity="0.6" />
      </g>

      {/* stars */}
      <g fill="#F4F6FB" opacity="0.5">
        {[
          [60, 80],
          [120, 130],
          [200, 60],
          [260, 110],
          [330, 70],
          [380, 140],
          [500, 90],
          [540, 170],
          [80, 190],
          [220, 180],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} />
        ))}
      </g>
    </svg>
  )
}
