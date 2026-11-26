/**
 * Admin dashboard panels (#30) — two read-only blocks above Payload's default
 * dashboard:
 *
 * 1. **Barrières de publication** — every page, domain and family the code keeps
 *    closed, with the reason and a plain statement that the admin cannot open
 *    it. The gate registry is code-owned (`lib/payload/content-map.ts`), so no
 *    CMS record can change what this panel says. This is the ticket #30
 *    acceptance criterion "gated pages are listed for the owner with the reason
 *    for their gate".
 *
 * 2. **Constantes code-owned** — the identity block, approved claims, navigation
 *    labels and SEO defaults the owner may copy but must ask the developer to
 *    change. None of them is a Payload field, which is what makes them
 *    untouchable from the admin (content model §3).
 *
 * The component is a server component wired through
 * `admin.components.beforeDashboard`; it imports only literal modules (no
 * database, no content seam), so it renders identically before and after any
 * content change. Regenerate the import map after touching it:
 * `npm run generate:importmap`.
 */
import { APPROVED_CLAIMS } from "@/lib/site/claims"
import { COMPANY } from "@/lib/site/company"
import { NOT_FOUND_TITLE, SITE_URL } from "@/lib/site/site"
import {
  CODE_GATE_NOTES,
  DOMAIN_GATES,
  DOMAIN_KEYS,
  GATED_RUBRIQUES,
  RUBRIQUE_LABELS,
  RUBRIQUE_TIERS,
} from "@/lib/payload/content-map"

const panelStyle: React.CSSProperties = {
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "4px",
  marginBottom: "24px",
  padding: "20px 24px",
  background: "var(--theme-elevation-0)",
}

const headingStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  margin: "0 0 4px",
}

const introStyle: React.CSSProperties = {
  fontSize: "13px",
  margin: "0 0 16px",
  opacity: 0.8,
}

const tableStyle: React.CSSProperties = {
  borderCollapse: "collapse",
  fontSize: "13px",
  width: "100%",
}

const cellStyle: React.CSSProperties = {
  borderTop: "1px solid var(--theme-elevation-100)",
  padding: "8px 10px 8px 0",
  textAlign: "left",
  verticalAlign: "top",
}

const mutedStyle: React.CSSProperties = { opacity: 0.75 }

/** A read-only key/value reference list. */
function ReferenceList({ items }: { readonly items: ReadonlyArray<[string, string]> }) {
  return (
    <dl style={{ display: "grid", fontSize: "13px", gap: "6px 16px", gridTemplateColumns: "max-content 1fr", margin: 0 }}>
      {items.map(([term, value]) => (
        <div key={`${term}-${value}`} style={{ display: "contents" }}>
          <dt style={mutedStyle}>{term}</dt>
          <dd style={{ margin: 0 }}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function DashboardPanels() {
  const domainLabel = (slug: string): string =>
    DOMAIN_KEYS.find((domain) => domain.slug === slug)?.label ?? slug
  const gatedDomains = Object.entries(DOMAIN_GATES).filter(([, gate]) => !gate.open)

  return (
    <div>
      <section style={panelStyle} aria-labelledby="hay-gates-title">
        <h2 id="hay-gates-title" style={headingStyle}>
          Barrières de publication (code-owned)
        </h2>
        <p style={introStyle}>
          Ces pages, domaines et familles sont fermés par une décision de code. Ils ne
          s’ouvrent pas depuis l’admin : une fiche publiée reste invisible sur le site
          tant que la barrière n’est pas levée côté code.
        </p>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Page</th>
              <th style={cellStyle}>Palier</th>
              <th style={cellStyle}>Raison de la fermeture</th>
              <th style={cellStyle}>Ouverture</th>
            </tr>
          </thead>
          <tbody>
            {GATED_RUBRIQUES.map((rubrique) => (
              <tr key={rubrique.key}>
                <td style={cellStyle}>{RUBRIQUE_LABELS[rubrique.key]}</td>
                <td style={cellStyle}>{rubrique.tier}</td>
                <td style={cellStyle}>{rubrique.reason}</td>
                <td style={cellStyle}>Code uniquement</td>
              </tr>
            ))}
            {gatedDomains.map(([slug, gate]) => (
              <tr key={slug}>
                <td style={cellStyle}>{domainLabel(slug)}</td>
                <td style={cellStyle}>P1</td>
                <td style={cellStyle}>{gate.reason}</td>
                <td style={cellStyle}>Code uniquement</td>
              </tr>
            ))}
            <tr>
              <td style={cellStyle}>Fiches réalisations (/realisations/&#123;slug&#125;)</td>
              <td style={cellStyle}>P1</td>
              <td style={cellStyle}>
                Famille fermée par la barrière code-owned <code>caseStudiesLive</code> :
                elle ouvre quand trois études de cas nommées et autorisées existent.
              </td>
              <td style={cellStyle}>Code uniquement</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={panelStyle} aria-labelledby="hay-gates-family-title">
        <h2 id="hay-gates-family-title" style={headingStyle}>
          Barrières et interrupteurs associés
        </h2>
        <p style={introStyle}>
          État des décisions de code qui entourent le contenu. Demandez au développeur
          pour toute ouverture : elle s’accompagne toujours d’une preuve (autorisation,
          certificat, relecture).
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Décision</th>
              <th style={cellStyle}>État</th>
              <th style={cellStyle}>Raison</th>
            </tr>
          </thead>
          <tbody>
            {CODE_GATE_NOTES.map((note) => (
              <tr key={note.key}>
                <td style={cellStyle}>
                  {note.label}
                  <div style={mutedStyle}>
                    <code>{note.key}</code>
                  </div>
                </td>
                <td style={cellStyle}>{note.state}</td>
                <td style={cellStyle}>{note.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={panelStyle} aria-labelledby="hay-constants-title">
        <h2 id="hay-constants-title" style={headingStyle}>
          Constantes code-owned (référence en lecture seule)
        </h2>
        <p style={introStyle}>
          Copiez ces valeurs dans le contenu si nécessaire ; ne les modifiez jamais.
          Elles ne sont pas des champs Payload : aucun écran de l’admin ne peut les
          changer (content model §3, registre des faits).
        </p>

        <h3 style={{ ...headingStyle, fontSize: "14px", marginTop: "12px" }}>
          Identité légale
        </h3>
        <ReferenceList
          items={[
            ["Raison sociale", COMPANY.legalName],
            ["Adresse", COMPANY.registeredAddress],
            ["Contact", COMPANY.email],
            ["Expérience", COMPANY.experienceLine],
            ["Direction", COMPANY.gerantLine],
          ]}
        />

        <h3 style={{ ...headingStyle, fontSize: "14px", marginTop: "16px" }}>
          Revendications approuvées (registre des faits §2.2)
        </h3>
        <ul style={{ fontSize: "13px", margin: 0, paddingLeft: "18px" }}>
          {APPROVED_CLAIMS.map((claim) => (
            <li key={claim.key} style={{ marginBottom: "6px" }}>
              <strong>{claim.title}</strong> — {claim.live ? "publiée" : "fermée (preuves manquantes)"}
              <div style={mutedStyle}>{claim.wording}</div>
            </li>
          ))}
        </ul>

        <h3 style={{ ...headingStyle, fontSize: "14px", marginTop: "16px" }}>
          Navigation et paliers
        </h3>
        <ReferenceList
          items={Object.entries(RUBRIQUE_TIERS).map(([key, tier]) => [
            RUBRIQUE_LABELS[key as keyof typeof RUBRIQUE_LABELS],
            `${tier} — libellé et ordre code-owned`,
          ])}
        />

        <h3 style={{ ...headingStyle, fontSize: "14px", marginTop: "16px" }}>
          Valeurs par défaut du référencement
        </h3>
        <ReferenceList
          items={[
            ["Origine canonique", SITE_URL],
            ["Suffixe de marque", "— HAY2010"],
            ["Titre du 404", NOT_FOUND_TITLE],
            ["Modèles SEO", "Code-owned (#32) : jamais un champ du CMS"],
          ]}
        />
      </section>
    </div>
  )
}
