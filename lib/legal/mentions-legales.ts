import { LEGAL_IDENTITY, LAST_REVIEWED } from "./identity"
import {
  DATA_EMAIL_LINK,
  POLICY_COOKIES_LINK,
  POLICY_LINK,
  POLICY_PATH_LINK,
  SITE_LINK,
} from "./links"
import type { LegalDocument } from "./types"

/**
 * Mentions légales — approved copy from
 * docs/legal/analytics-consent-legal-pages.md §4.2 (ticket #28).
 *
 * The identity block is injected by the renderer from `LEGAL_IDENTITY`, exactly
 * as the decision says. The conditional CNDP sentence of §4.2 is not rendered:
 * no CNDP reference exists yet and a blank or “en cours” filing line is
 * forbidden — it returns when #14 issues a real receipt.
 */
export const MENTIONS_LEGALES: LegalDocument = {
  title: "Mentions légales",
  lastReviewed: LAST_REVIEWED,
  sections: [
    {
      heading: "Éditeur du site",
      blocks: [
        {
          kind: "paragraphs",
          items: [["Le site ", { link: SITE_LINK }, " est édité par :"]],
        },
        { kind: "identity", variant: "editor" },
      ],
    },
    {
      heading: "Propriété intellectuelle",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              "Le site, sa structure, ses textes, ses images, ses logos et ses marques sont la propriété de ",
              { bold: LEGAL_IDENTITY.legalName },
              " ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite et peut constituer une contrefaçon au sens de la loi n° 17-97 relative à la protection de la propriété industrielle.",
            ],
          ],
        },
      ],
    },
    {
      heading: "Données personnelles",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              { bold: LEGAL_IDENTITY.legalName },
              " est responsable du traitement des données personnelles collectées via le site.",
            ],
            [
              "Les données sont traitées pour répondre aux demandes de contact et de devis, gérer les candidatures et assurer la sécurité du site, dans les conditions détaillées dans la ",
              { link: POLICY_LINK },
              ".",
            ],
            [
              "Conformément à la loi n° 09-08, vous disposez d’un droit d’accès, de rectification, d’opposition et de retrait de votre consentement. Pour exercer ces droits : ",
              { link: DATA_EMAIL_LINK },
              ".",
            ],
            [
              "Le détail des traitements, des destinataires, des durées de conservation et des transferts est disponible dans la ",
              { link: POLICY_LINK },
              " : ",
              { link: POLICY_PATH_LINK },
              ".",
            ],
          ],
        },
      ],
    },
    {
      heading: "Cookies",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              "Le site ne dépose aucun cookie de mesure d’audience, de publicité ou de réseaux sociaux. Seuls des cookies strictement nécessaires à la sécurité et au fonctionnement du site peuvent être déposés par Cloudflare. Le détail est disponible dans la ",
              { link: POLICY_LINK },
              ", section ",
              { link: POLICY_COOKIES_LINK },
              ".",
            ],
          ],
        },
      ],
    },
    {
      heading: "Responsabilité",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              { bold: LEGAL_IDENTITY.legalName },
              " s’efforce d’assurer l’exactitude des informations publiées, sans pouvoir garantir qu’elles soient exemptes d’erreurs. Le site peut contenir des liens vers des sites tiers dont le contenu n’engage pas la responsabilité de ",
              LEGAL_IDENTITY.legalName,
              ".",
            ],
          ],
        },
      ],
    },
    {
      heading: "Droit applicable",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              "Le site est soumis au droit marocain. Tout litige relatif à son utilisation relève de la compétence du Tribunal de commerce de Rabat, sous réserve des règles impératives applicables.",
            ],
          ],
        },
      ],
    },
    {
      heading: "Mise à jour",
      blocks: [{ kind: "last-reviewed" }],
    },
  ],
}
