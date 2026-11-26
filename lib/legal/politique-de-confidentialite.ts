import { LEGAL_IDENTITY, LAST_REVIEWED } from "./identity"
import {
  CNDP_WEBSITE_LINK,
  CONTACT_EMAIL_LINK,
  DATA_EMAIL_LINK,
  SITE_LINK,
} from "./links"
import type { LegalDocument, LegalParagraph } from "./types"

/** A "Label : value" paragraph from the processing register (§4.3). */
function field(label: string, value: string): LegalParagraph {
  return [{ bold: label }, ` ${value}`]
}

/**
 * Politique de confidentialité — approved copy from
 * docs/legal/analytics-consent-legal-pages.md §4.3 (ticket #28), with the
 * publication rules of that section applied:
 *
 * - launch state only: no form-specific paragraph (#12 activates them), no
 *   analytics-activation paragraph (§4.4 state 2) and no consent-banner line;
 * - empty material is omitted, never printed: no CNDP receipt/authorisation
 *   number, no VPS country, no mail-host line while unconfirmed. Those return
 *   through #14/#16 launch gates, in the same version of this document;
 * - careers uses the mailbox shown on the Carrières page: the recruitment
 *   mailbox stays unpublished until the F-113 authorisation covers it (§6.1);
 * - retention (§5.3) and the rights procedure (§5.4) are the decided periods
 *   and steps, not new wording.
 *
 * Cookies are section 7 of this page, not a separate route (§4.1, §4.4).
 */
export const POLITIQUE_DE_CONFIDENTIALITE: LegalDocument = {
  title: "Politique de confidentialité",
  lastReviewed: LAST_REVIEWED,
  intro: [
    [
      "La présente politique explique quelles données personnelles ",
      LEGAL_IDENTITY.legalName,
      " traite lorsque vous utilisez le site ",
      { link: SITE_LINK },
      ", pourquoi et comment. Elle s’applique aux visiteurs, aux personnes qui nous contactent et aux candidats.",
    ],
  ],
  sections: [
    {
      heading: "Responsable du traitement",
      blocks: [{ kind: "identity", variant: "controller" }],
    },
    {
      heading: "Quelles données, pour quelles finalités et sur quelle base ?",
      blocks: [
        {
          kind: "subsection",
          heading: "Demandes de contact et de devis",
          blocks: [
            {
              kind: "paragraphs",
              items: [
                field(
                  "Données :",
                  "nom, prénom, société, adresse e-mail, numéro de téléphone, objet et message, ainsi que les pièces jointes que vous choisissez d’envoyer."
                ),
                field(
                  "Finalité :",
                  "répondre à votre demande, préparer un devis et assurer le suivi de l’échange."
                ),
                field(
                  "Base légale :",
                  "mesures précontractuelles prises à votre demande (article 4-b de la loi n° 09-08) et, le cas échéant, votre consentement."
                ),
                field(
                  "Conservation :",
                  "12 mois après le dernier échange. Si une relation contractuelle en découle, les données sont conservées pendant la durée de la relation et les délais légaux de conservation comptable applicables."
                ),
                field(
                  "Destinataires :",
                  "les services internes concernés et nos prestataires techniques (hébergement du site et de la messagerie), dans les conditions prévues à la section 3."
                ),
              ],
            },
          ],
        },
        {
          kind: "subsection",
          heading: "Candidatures",
          blocks: [
            {
              kind: "paragraphs",
              items: [
                field(
                  "Données :",
                  "identité, coordonnées, curriculum vitae, lettre de motivation et parcours professionnel."
                ),
                field(
                  "Finalité :",
                  "gérer votre candidature et le processus de recrutement."
                ),
                field(
                  "Base légale :",
                  "mesures précontractuelles prises à votre demande (article 4-b) et votre consentement."
                ),
                field(
                  "Conservation :",
                  "6 mois après la décision, puis suppression. Si vous y consentez séparément, la candidature peut être conservée 12 mois maximum dans notre CVthèque. La suppression peut être demandée à tout moment."
                ),
                field(
                  "Destinataires :",
                  "le service recrutement et nos prestataires techniques. Aucune transmission à un tiers extérieur au recrutement."
                ),
                [
                  "Les candidatures sont adressées à l’adresse indiquée sur la page Carrières. Aucune pièce d’identité, photographie, donnée de santé, situation matrimoniale ou donnée révélant une origine, une religion ou une appartenance syndicale n’est demandée.",
                ],
              ],
            },
          ],
        },
        {
          kind: "subsection",
          heading: "Sécurité et journaux serveur",
          blocks: [
            {
              kind: "paragraphs",
              items: [
                field(
                  "Données :",
                  "adresse IP, horodatage, URL demandée, agent utilisateur, code de réponse et événements de sécurité."
                ),
                field(
                  "Finalité :",
                  "assurer la sécurité et la disponibilité du site, prévenir les abus et diagnostiquer les incidents."
                ),
                field(
                  "Base légale :",
                  "intérêt légitime du responsable du traitement (article 4-e), sans préjudice de vos droits."
                ),
                field("Conservation :", "6 mois."),
                field(
                  "Destinataires :",
                  "Cloudflare (réseau et sécurité) et notre hébergeur. Ces journaux ne sont pas utilisés à des fins de prospection."
                ),
              ],
            },
          ],
        },
        {
          kind: "subsection",
          heading: "Mesure d’audience",
          blocks: [
            {
              kind: "paragraphs",
              items: [
                ["La mesure d’audience est désactivée à la mise en ligne."],
                [
                  "Lorsqu’elle est activée, les données traitées sont : pages vues, route, référent, pays, type d’appareil et de navigateur, et métriques de performance. Aucun cookie n’est déposé, aucun identifiant persistant n’est créé et aucun profil n’est établi.",
                ],
                field(
                  "Finalité :",
                  "comprendre l’usage du site et améliorer son contenu."
                ),
                field(
                  "Base légale :",
                  "intérêt légitime du responsable du traitement (article 4-e)."
                ),
                field("Conservation :", "6 mois maximum."),
                [
                  { bold: "Prestataire :" },
                  " Cloudflare Web Analytics. Aucune publicité, aucun profilage, aucune revente de données.",
                ],
              ],
            },
          ],
        },
        {
          kind: "subsection",
          heading: "Administration du site",
          blocks: [
            {
              kind: "paragraphs",
              items: [
                field(
                  "Données :",
                  "nom du compte, adresse e-mail, journal de connexion et actions d’administration, pour les personnes autorisées."
                ),
                field(
                  "Finalité :",
                  "administrer le site et le système de gestion de contenu, et tracer les accès."
                ),
                field(
                  "Base légale :",
                  "intérêt légitime et exécution de la relation de service."
                ),
                field(
                  "Conservation :",
                  "pendant la durée du compte, puis 6 mois pour les journaux de connexion."
                ),
                field(
                  "Destinataires :",
                  "l’hébergeur et les administrateurs autorisés."
                ),
              ],
            },
          ],
        },
        {
          kind: "subsection",
          heading: "Cookies",
          blocks: [
            {
              kind: "paragraphs",
              items: [
                [
                  "Voir la section ",
                  {
                    link: {
                      label: "Cookies",
                      href: "/politique-de-confidentialite#cookies",
                    },
                  },
                  ".",
                ],
              ],
            },
          ],
        },
      ],
    },
    {
      heading: "Qui reçoit vos données ?",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              "Vos données sont accessibles aux services internes habilités de ",
              LEGAL_IDENTITY.legalName,
              ", dans la limite de leurs attributions.",
            ],
            ["Elles sont également traitées par les sous-traitants techniques suivants :"],
          ],
        },
        {
          kind: "list",
          items: [
            [
              "Cloudflare, Inc. — DNS, CDN, sécurité (dont la protection anti-robot Turnstile) et stockage des médias (R2) — États-Unis ;",
            ],
            [
              "Google — boîte Gmail historique, utilisée uniquement comme secours et pour la récupération de compte — États-Unis, si elle est utilisée.",
            ],
          ],
        },
        {
          kind: "paragraphs",
          items: [
            [
              "Ces prestataires sont liés par des contrats de sous-traitance conformes à l’article 23 de la loi n° 09-08. Aucune donnée n’est vendue, louée ou transmise à des fins publicitaires. Les autorités publiques peuvent en recevoir sur réquisition légale.",
            ],
          ],
        },
      ],
    },
    {
      heading: "Vos données sont-elles transférées hors du Maroc ?",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              "Oui, pour les prestataires indiqués ci-dessus qui sont établis ou traitent des données hors du Maroc, notamment Cloudflare aux États-Unis.",
            ],
          ],
        },
      ],
    },
    {
      heading: "Combien de temps conservons-nous vos données ?",
      blocks: [
        {
          kind: "table",
          caption: "Durées de conservation des données personnelles",
          head: ["Traitement", "Durée"],
          rows: [
            [
              "Demande de contact ou de devis",
              "12 mois après le dernier échange ; durée de la relation contractuelle et délais légaux de conservation comptable si un contrat en découle",
            ],
            [
              "Candidature",
              "6 mois après la décision ; 12 mois maximum dans la CVthèque avec consentement séparé",
            ],
            ["Journaux serveur et sécurité", "6 mois"],
            ["Mesure d’audience", "6 mois maximum"],
            ["Compte d’administration", "Durée du compte ; journaux de connexion 6 mois"],
            ["Comptabilité et contrats", "Durée légale de conservation applicable"],
          ],
        },
        {
          kind: "paragraphs",
          items: [
            [
              "Ces durées sont mises en œuvre par des suppressions effectives, pas seulement par une mention dans la politique.",
            ],
          ],
        },
      ],
    },
    {
      heading: "Quels sont vos droits ?",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            ["Conformément à la loi n° 09-08, vous disposez des droits suivants :"],
          ],
        },
        {
          kind: "list",
          items: [
            ["accès à vos données et aux informations sur leur traitement ;"],
            [
              "rectification des données inexactes ou incomplètes, dans un délai de 10 jours ;",
            ],
            ["effacement et verrouillage dans les cas prévus par la loi ;"],
            [
              "opposition, pour des raisons légitimes, et opposition gratuite à toute prospection ;",
            ],
            [
              "retrait de votre consentement à tout moment, sans affecter la licéité du traitement effectué avant le retrait.",
            ],
          ],
        },
        {
          kind: "paragraphs",
          items: [
            [
              "Pour exercer ces droits, écrivez à ",
              { link: DATA_EMAIL_LINK },
              " en précisant votre demande. Une pièce justificative d’identité peut être demandée en cas de doute raisonnable sur votre identité. La demande est traitée dans les délais légaux, avec un objectif de 10 jours pour les rectifications.",
            ],
            [
              "Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP) — ",
              { link: CNDP_WEBSITE_LINK },
              ".",
            ],
          ],
        },
      ],
    },
    {
      id: "cookies",
      heading: "Cookies",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              "Le site ne dépose aucun cookie de mesure d’audience, de publicité ou de réseaux sociaux.",
            ],
            [
              "Les cookies strictement nécessaires suivants peuvent être déposés par Cloudflare pour la sécurité et le fonctionnement du site :",
            ],
          ],
        },
        {
          kind: "table",
          caption: "Cookies strictement nécessaires",
          head: ["Cookie", "Émetteur", "Finalité", "Durée"],
          rows: [
            [
              "__cf_bm",
              "Cloudflare",
              "Gestion des bots et protection contre le trafic automatisé",
              "30 minutes d’inactivité",
            ],
            [
              "cf_clearance",
              "Cloudflare",
              "Preuve de réussite d’un défi de sécurité",
              "Durée du défi / selon la configuration",
            ],
            [
              "_cfuvid",
              "Cloudflare",
              "Limitation de débit lorsque l’option est activée",
              "Session",
            ],
            [
              "payload-token",
              "HAY2010 (Payload)",
              "Session authentifiée de l’administration",
              "Session",
            ],
          ],
        },
        {
          kind: "paragraphs",
          items: [
            [
              "Ces cookies sont nécessaires au service demandé et ne requièrent pas de consentement. Aucun cookie publicitaire, social ou de mesure d’audience n’est déposé.",
            ],
            [
              "Vous pouvez configurer votre navigateur pour refuser ou supprimer les cookies. Le refus des cookies strictement nécessaires peut affecter la sécurité ou le fonctionnement de certaines pages. Le site ne bloque pas l’accès en l’absence de consentement, puisqu’aucun consentement n’est requis.",
            ],
          ],
        },
      ],
    },
    {
      heading: "Sécurité",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              LEGAL_IDENTITY.legalName,
              " met en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données contre la destruction, la perte, l’altération, la divulgation ou l’accès non autorisé : chiffrement TLS, contrôle des accès, comptes nominatifs, moindre privilège, sauvegardes, journalisation et procédure de traitement des incidents. Les pièces jointes et les CV ne sont pas stockés dans un espace public. Les prestataires sont liés par des obligations de confidentialité et de sécurité.",
            ],
          ],
        },
      ],
    },
    {
      heading: "Modifications",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              "Cette politique peut être mise à jour pour refléter un changement de traitement, de prestataire, de durée de conservation ou de réglementation. La date de dernière mise à jour figure en tête. Les changements substantiels sont signalés sur le site. La version applicable est celle publiée à la date de votre utilisation.",
            ],
          ],
        },
      ],
    },
    {
      heading: "Contact",
      blocks: [
        {
          kind: "paragraphs",
          items: [
            [
              "Pour toute question relative à cette politique : ",
              { link: DATA_EMAIL_LINK },
              ".",
            ],
            [
              "Pour toute question générale : ",
              { link: CONTACT_EMAIL_LINK },
              ".",
            ],
            [
              "Adresse postale : ",
              LEGAL_IDENTITY.registeredAddress,
              ".",
            ],
          ],
        },
      ],
    },
  ],
}
