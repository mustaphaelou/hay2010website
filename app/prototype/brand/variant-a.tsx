import Image from "next/image"

import {
  EMAIL,
  LOCATION,
  NAV,
  POSITIONING,
  POSITIONING_END,
  SERVICES,
} from "./brand-data"
import { IconLamp, IconNetwork, IconPanel, IconTransformer } from "./icons"

const SERVICE_ICONS = [IconLamp, IconNetwork, IconTransformer, IconPanel]

export function VariantA() {
  return (
    <div
      className="min-h-screen bg-[#F7F6F1] text-[#111217] selection:bg-[#E97425] selection:text-[#111217]"
      style={{ fontFamily: "var(--font-poppins)" }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-[#111217] focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu
      </a>

      {/* Header — solid white, per page-tree decision #2 */}
      <header className="sticky top-0 z-40 border-b border-[#DEDDD5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-10">
          <a href="#top" className="flex items-center">
            <Image
              src="/brand/hay2010-logo.webp"
              alt="HAY2010"
              width={468}
              height={355}
              priority
              className="h-[52px] w-auto"
            />
          </a>
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Principale"
          >
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[13px] font-medium text-[#3C3E45] transition-colors hover:text-[#111217]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden rounded-full bg-[#111217] px-5 py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#E97425] hover:text-[#111217] sm:inline-flex"
            >
              Nous contacter
            </a>
            <button
              type="button"
              aria-label="Ouvrir le menu"
              className="grid size-10 place-items-center rounded-full border border-[#DEDDD5] lg:hidden"
            >
              <span className="flex w-4 flex-col gap-[5px]">
                <span className="h-px w-full bg-[#111217]" />
                <span className="h-px w-full bg-[#111217]" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section
          id="top"
          className="relative isolate min-h-[640px] overflow-hidden bg-[#0E1119] lg:min-h-[730px]"
        >
          <div className="brand-kenburns absolute inset-0 animate-[brand-kenburns_22s_ease-out_both]">
            <HeroScene />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,12,17,.88)_0%,rgba(10,12,17,.55)_42%,rgba(10,12,17,.08)_75%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,12,17,.85)_0%,transparent_45%)]" />

          <div className="relative mx-auto flex min-h-[640px] max-w-[1440px] flex-col justify-end px-5 pt-28 pb-14 md:px-10 md:pb-20 lg:min-h-[730px]">
            <div className="flex items-center gap-3 text-[10.5px] font-medium tracking-[0.24em] text-white/60 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E97425]" />
              Électrification & éclairage public — Rabat
            </div>
            <h1 className="mt-6 max-w-[14ch] text-[clamp(42px,6.4vw,92px)] leading-[0.94] font-light tracking-[-0.035em] text-white">
              La lumière,
              <br />
              comme infrastructure.
            </h1>
            <p className="mt-7 max-w-[46ch] text-[16px] leading-relaxed text-white/68 md:text-[17px]">
              HAY2010 conçoit et réalise les réseaux d’éclairage public et
              d’électrification des collectivités et des entreprises, au Maroc.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a
                href="#metiers"
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-[13px] font-medium text-[#111217] transition-colors hover:bg-[#E97425]"
              >
                Découvrir nos métiers
                <span aria-hidden="true">→</span>
              </a>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 border-b border-white/25 pb-1 text-[13px] font-medium text-white/85 transition-colors hover:border-white hover:text-white"
              >
                Parler d’un projet
                <span
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>
            </div>
          </div>

          <div className="absolute right-6 bottom-6 hidden items-center gap-2 text-[9px] tracking-[0.2em] text-white/35 uppercase md:flex">
            <span className="h-px w-8 bg-white/25" />
            Visuel de démonstration
          </div>
        </section>

        {/* Service ticker */}
        <div className="border-b border-[#DEDDD5] bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-2 px-5 py-4 md:px-10">
            {SERVICES.map((service, index) => (
              <div key={service.title} className="flex items-center gap-8">
                {index > 0 && (
                  <span
                    className="h-1 w-1 rounded-full bg-[#C9C7BD]"
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

        {/* Intro */}
        <section
          id="entreprise"
          className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28"
        >
          <div className="grid gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-3">
              <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#9A5A15] uppercase">
                01 — Qui sommes-nous
              </p>
              <div className="mt-4 h-px w-10 bg-[#111217]" />
            </div>
            <div className="md:col-span-8 md:col-start-5">
              <p className="text-[clamp(24px,3.2vw,42px)] leading-[1.24] font-light tracking-[-0.02em] text-[#111217]">
                {POSITIONING}
              </p>
              <p className="mt-7 max-w-[58ch] text-[15px] leading-relaxed text-[#5E6067]">
                {POSITIONING_END}
              </p>
              <a
                href="#entreprise"
                className="group mt-8 inline-flex items-center gap-2 border-b border-[#111217]/25 pb-1 text-[13px] font-medium transition-colors hover:border-[#111217]"
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
        <section id="metiers" className="bg-[#101116] text-white">
          <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-24">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#E97425] uppercase">
                  02 — Nos métiers
                </p>
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
                      href="#metiers"
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

        {/* References */}
        <section
          id="realisations"
          className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28"
        >
          <div className="grid items-center gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#9A5A15] uppercase">
                03 — Réalisations
              </p>
              <h2 className="mt-5 text-[clamp(30px,3.6vw,48px)] leading-[1.05] font-light tracking-[-0.03em]">
                Références sur demande.
              </h2>
              <p className="mt-6 max-w-[38ch] text-[14.5px] leading-relaxed text-[#5E6067]">
                Nos dossiers sont communiqués sur demande, avec l’accord des
                maîtres d’ouvrage.
              </p>
              <a
                href="#contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#111217]/20 px-5 py-3 text-[12.5px] font-medium transition-colors hover:border-[#111217] hover:bg-[#111217] hover:text-white"
              >
                Demander les références
                <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <div className="relative aspect-[4/3] overflow-hidden border border-[#DEDDD5] bg-[#EFEEE8]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0,transparent_13px,rgba(17,18,23,.045)_13px,rgba(17,18,23,.045)_14px)]" />
                <div className="absolute inset-5 border border-[#111217]/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                  <span className="text-[10px] tracking-[0.3em] text-[#A8A69C] uppercase">
                    Dossiers projets
                  </span>
                  <span className="max-w-[22ch] text-[clamp(22px,2.4vw,32px)] leading-tight font-light tracking-[-0.02em] text-[#111217]">
                    Un portefeuille à documenter.
                  </span>
                </div>
                <span className="absolute bottom-5 left-5 text-[9px] tracking-[0.2em] text-[#A8A69C] uppercase">
                  Visuels à sourcer
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-[#E97425] text-[#111217]">
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
            <div className="grid gap-10 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#111217]/60 uppercase">
                  04 — Contact
                </p>
                <h2 className="mt-4 max-w-[18ch] text-[clamp(30px,4.4vw,60px)] leading-[1] font-light tracking-[-0.035em]">
                  Un projet d’éclairage ou d’électrification ?
                </h2>
              </div>
              <div className="md:col-span-5 md:justify-self-end">
                <a
                  href={`mailto:${EMAIL}`}
                  className="group inline-flex flex-col gap-1"
                >
                  <span className="text-[10px] tracking-[0.2em] text-[#111217]/55 uppercase">
                    Écrivez-nous
                  </span>
                  <span className="border-b border-[#111217]/30 pb-1 text-[clamp(17px,1.8vw,22px)] font-medium transition-colors group-hover:border-[#111217]">
                    {EMAIL}
                  </span>
                </a>
                <div className="mt-8">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#111217] px-6 py-3.5 text-[13px] font-medium text-white transition-colors hover:bg-white hover:text-[#111217]"
                  >
                    Nous contacter
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specimen */}
        <section className="border-t border-[#DEDDD5] bg-[#EFEEE8]">
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#9A5A15] uppercase">
                  Spécimen de marque
                </p>
                <h2 className="mt-2 text-[26px] font-light tracking-[-0.02em]">
                  Direction A — Lumière
                </h2>
              </div>
              <p className="max-w-[40ch] text-[11.5px] leading-relaxed text-[#8A887E]">
                À juger : la palette, la typographie, les formes et le
                traitement d’image. Le contenu est un support, pas une maquette
                de la page d’accueil.
              </p>
            </div>

            <div className="mt-10 grid gap-10 md:grid-cols-12">
              {/* Palette */}
              <div className="md:col-span-5">
                <p className="text-[9.5px] tracking-[0.22em] text-[#8A887E] uppercase">
                  Palette
                </p>
                <div className="mt-4 grid grid-cols-5 overflow-hidden border border-[#D8D7CF]">
                  {[
                    ["Encre", "#111217", "text-white"],
                    ["Papier", "#F7F6F1", "text-[#111217]"],
                    ["Orange", "#E97425", "text-[#111217]"],
                    ["Cuivre", "#9A5A15", "text-white"],
                    ["Gris", "#5E6067", "text-white"],
                  ].map(([name, hex, text]) => (
                    <div key={hex} className="group">
                      <div
                        className={`flex h-20 items-end p-2 ${text}`}
                        style={{ backgroundColor: hex }}
                      >
                        <span className="text-[8px] tracking-[0.14em] uppercase opacity-70">
                          {name}
                        </span>
                      </div>
                      <div className="border-t border-[#D8D7CF] bg-white px-2 py-1.5 text-[8.5px] tracking-[0.04em] text-[#8A887E]">
                        {hex}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[#8A887E]">
                  Monochrome chaud + un seul accent orange. L’orange ne porte
                  jamais de texte courant.
                </p>
              </div>

              {/* Type */}
              <div className="md:col-span-4">
                <p className="text-[9.5px] tracking-[0.22em] text-[#8A887E] uppercase">
                  Typographie — Poppins
                </p>
                <div className="mt-4 space-y-3 border-t border-[#D8D7CF] pt-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[34px] leading-none font-light tracking-[-0.03em]">
                      Aa
                    </span>
                    <span className="text-[10px] text-[#8A887E]">
                      Display · 300
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-[#D8D7CF] pt-3">
                    <span className="text-[20px] font-semibold tracking-[-0.02em]">
                      Titre
                    </span>
                    <span className="text-[10px] text-[#8A887E]">
                      Titre · 600
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-[#D8D7CF] pt-3">
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">
                      Label
                    </span>
                    <span className="text-[10px] text-[#8A887E]">
                      Label · 600
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-[#D8D7CF] pt-3">
                    <span className="text-[13px] text-[#5E6067]">
                      Corps de texte
                    </span>
                    <span className="text-[10px] text-[#8A887E]">
                      Corps · 400
                    </span>
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div className="md:col-span-3">
                <p className="text-[9.5px] tracking-[0.22em] text-[#8A887E] uppercase">
                  Logo
                </p>
                <div className="mt-4 grid gap-2">
                  <div className="flex h-24 items-center justify-center border border-[#D8D7CF] bg-white">
                    <Image
                      src="/brand/hay2010-logo.webp"
                      alt="HAY2010"
                      width={468}
                      height={355}
                      className="h-14 w-auto"
                    />
                  </div>
                  <div className="flex h-24 items-center justify-center bg-[#111217]">
                    <Image
                      src="/brand/hay2010-logo-white.webp"
                      alt="HAY2010 en blanc"
                      width={468}
                      height={355}
                      className="h-14 w-auto"
                    />
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[#8A887E]">
                  Logo fourni par HAY2010. Le raster 500 px dépanne ; la version
                  vectorielle et la déclinaison une couleur restent à produire.
                </p>
              </div>

              {/* Buttons + icons */}
              <div className="md:col-span-5">
                <p className="text-[9.5px] tracking-[0.22em] text-[#8A887E] uppercase">
                  Composants
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#111217] px-5 py-2.5 text-[12px] font-medium text-white">
                    Bouton principal
                  </span>
                  <span className="rounded-full border border-[#111217]/25 px-5 py-2.5 text-[12px] font-medium">
                    Bouton secondaire
                  </span>
                  <span className="border-b border-[#111217]/30 pb-0.5 text-[12px] font-medium">
                    Lien texte →
                  </span>
                </div>
                <div className="mt-7 flex items-center gap-5 border-t border-[#D8D7CF] pt-5">
                  {SERVICE_ICONS.map((Icon, index) => (
                    <Icon key={index} className="h-7 w-7 text-[#111217]" />
                  ))}
                  <span className="text-[10px] text-[#8A887E]">
                    Icônes 24 px · trait 1,4
                  </span>
                </div>
              </div>

              {/* Imagery + motion */}
              <div className="md:col-span-4">
                <p className="text-[9.5px] tracking-[0.22em] text-[#8A887E] uppercase">
                  Image & mouvement
                </p>
                <div className="mt-4 overflow-hidden border border-[#D8D7CF]">
                  <div className="relative h-20 bg-[linear-gradient(180deg,#1B2030_0%,#6B5140_55%,#C98A4B_78%,#241D19_100%)]">
                    <div className="absolute bottom-0 left-1/2 h-10 w-px bg-white/40" />
                    <div className="absolute bottom-9 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#FFCE8A] shadow-[0_0_18px_6px_rgba(255,180,90,.55)]" />
                  </div>
                  <div className="bg-white px-3 py-2 text-[10px] leading-relaxed text-[#8A887E]">
                    Photo documentaire en clair-obscur chaud ; aucune personne
                    identifiable sans autorisation.
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[#8A887E]">
                  Fondu 700 ms + Ken Burns lent sur le héros. Désactivé si
                  <span className="font-medium text-[#5E6067]">
                    {" "}
                    prefers-reduced-motion
                  </span>
                  .
                </p>
              </div>

              {/* Verdict prompts */}
              <div className="md:col-span-3">
                <p className="text-[9.5px] tracking-[0.22em] text-[#8A887E] uppercase">
                  À trancher
                </p>
                <ul className="mt-4 space-y-2.5 text-[11.5px] leading-relaxed text-[#5E6067]">
                  <li className="border-t border-[#D8D7CF] pt-2.5">
                    L’orange du logo suffit-il comme seul accent ?
                  </li>
                  <li className="border-t border-[#D8D7CF] pt-2.5">
                    Poppins reste-t-il assez distinctif ?
                  </li>
                  <li className="border-t border-[#D8D7CF] pt-2.5">
                    Le héros photo est-il finançable ?
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111217] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="inline-flex bg-[#F7F6F1] p-2">
                <Image
                  src="/brand/hay2010-logo.webp"
                  alt="HAY2010"
                  width={468}
                  height={355}
                  className="h-12 w-auto"
                />
              </span>
              <p className="mt-5 max-w-[36ch] text-[12.5px] leading-relaxed text-white/50">
                Éclairage public, réseaux HTA/BT, postes de transformation et
                CFO/CFA. {LOCATION}.
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-5 inline-block border-b border-white/20 pb-1 text-[12.5px] text-white/75 transition-colors hover:border-white hover:text-white"
              >
                {EMAIL}
              </a>
            </div>
            <div className="md:col-span-3">
              <p className="text-[9.5px] tracking-[0.2em] text-white/35 uppercase">
                L’Entreprise
              </p>
              <ul className="mt-4 space-y-2.5 text-[12.5px] text-white/60">
                <li>
                  <a className="hover:text-white" href="#entreprise">
                    L’Entreprise
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#realisations">
                    Réalisations
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#carrieres">
                    Carrières
                  </a>
                </li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <p className="text-[9.5px] tracking-[0.2em] text-white/35 uppercase">
                Nos Métiers
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12.5px] text-white/60">
                {SERVICES.map((service) => (
                  <li key={service.title}>
                    <a className="hover:text-white" href="#metiers">
                      {service.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-[10.5px] text-white/35 sm:flex-row">
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

function HeroScene() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="a-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0C0F17" />
          <stop offset="0.38" stopColor="#20222E" />
          <stop offset="0.62" stopColor="#4E423D" />
          <stop offset="0.8" stopColor="#9C6F49" />
          <stop offset="0.93" stopColor="#D49A5E" />
          <stop offset="1" stopColor="#6E4E38" />
        </linearGradient>
        <radialGradient id="a-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFE0AE" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#FFB964" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FF9E2C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="a-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A1A1F" />
          <stop offset="1" stopColor="#090A0D" />
        </linearGradient>
        <linearGradient id="a-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD9A0" stopOpacity="0.32" />
          <stop offset="1" stopColor="#FFD9A0" stopOpacity="0" />
        </linearGradient>
        <filter id="a-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id="a-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#a-sky)" />

      {/* setting sun haze */}
      <ellipse
        cx="1120"
        cy="590"
        rx="430"
        ry="180"
        fill="#E8A15C"
        opacity="0.28"
        filter="url(#a-blur)"
      />
      <circle
        cx="1120"
        cy="595"
        r="52"
        fill="#FFD49A"
        opacity="0.5"
        filter="url(#a-blur)"
      />

      {/* distant town */}
      <g fill="#141620" opacity="0.92">
        <path d="M0 596h90v-34h54v34h74v-62h48v62h96v-26h58v26h84v-78h42v78h104v-40h64v40h88v-56h46v56h118v-22h58v22h92v-48h50v48h120v-30h62v30h108v-68h44v68h96v-26h60v26h120v64H0Z" />
      </g>
      <g fill="#1B1D27">
        <path d="M120 596v-48h26v48M420 596v-40h20v40M760 596v-52h24v52M1050 596v-36h18v36M1330 596v-44h22v44" />
      </g>

      {/* ground */}
      <rect y="628" width="1600" height="272" fill="url(#a-road)" />
      <path d="M0 628h1600" stroke="#4A4038" strokeWidth="1.5" opacity="0.6" />
      <g stroke="#3A3A40" strokeWidth="1" opacity="0.5">
        <path d="M0 690h1600" />
        <path d="M0 792h1600" />
      </g>
      <g stroke="#C9A26B" strokeWidth="2" opacity="0.28">
        <path d="M120 860h90" />
        <path d="M330 860h90" />
        <path d="M540 860h90" />
        <path d="M750 860h90" />
        <path d="M960 860h90" />
        <path d="M1170 860h90" />
        <path d="M1380 860h90" />
      </g>

      {/* far pole */}
      <g stroke="#0E1017" strokeWidth="3" opacity="0.85">
        <path d="M470 626V330" />
        <path d="M470 338h54" strokeWidth="2.5" />
      </g>
      <circle cx="524" cy="342" r="3" fill="#FFD49A" opacity="0.85" />

      {/* main pole left */}
      <g stroke="#0B0D13" strokeWidth="7" strokeLinecap="round">
        <path d="M250 660V208" />
        <path d="M250 216c38 0 58 6 96 34" fill="none" strokeWidth="5" />
        <path
          d="M250 216c34 0 62 3 92 22"
          fill="none"
          strokeWidth="2"
          opacity="0.5"
        />
      </g>
      <g>
        <rect
          x="336"
          y="242"
          width="54"
          height="12"
          rx="3"
          fill="#0B0D13"
          transform="rotate(18 336 242)"
        />
        <ellipse cx="392" cy="262" rx="90" ry="52" fill="url(#a-glow)" />
        <path
          d="M352 266L300 520h210L438 266Z"
          fill="url(#a-beam)"
          opacity="0.5"
        />
      </g>

      {/* main pole right */}
      <g stroke="#0A0C12" strokeWidth="6" strokeLinecap="round">
        <path d="M1280 668V250" />
        <path d="M1280 258c-36 0-54 8-88 36" fill="none" strokeWidth="4.5" />
      </g>
      <g>
        <rect
          x="1156"
          y="288"
          width="48"
          height="11"
          rx="3"
          fill="#0A0C12"
          transform="rotate(-18 1156 288)"
        />
        <ellipse
          cx="1152"
          cy="302"
          rx="72"
          ry="44"
          fill="url(#a-glow)"
          opacity="0.9"
        />
      </g>

      {/* cables */}
      <g fill="none" stroke="#0B0D13" strokeWidth="1.8" opacity="0.9">
        <path d="M250 218Q760 300 1280 260" />
        <path d="M250 232Q760 320 1280 276" opacity="0.6" />
        <path d="M470 342Q760 390 1150 330" opacity="0.55" />
      </g>

      {/* foreground bokeh */}
      <circle
        cx="200"
        cy="720"
        r="80"
        fill="#FFB964"
        opacity="0.08"
        filter="url(#a-blur)"
      />
      <circle
        cx="1440"
        cy="700"
        r="110"
        fill="#FFB964"
        opacity="0.06"
        filter="url(#a-blur)"
      />

      {/* grain + vignette */}
      <rect width="1600" height="900" filter="url(#a-grain)" opacity="0.055" />
    </svg>
  )
}
