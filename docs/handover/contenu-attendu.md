# Contenu attendu — ce que HAY2010 doit encore fournir

**À quoi sert ce document :** une seule liste, par palier, de tout ce que le propriétaire (ou un tiers
autorisé) doit encore fournir pour compléter le site, avec pour chaque ligne : la **preuve attendue**,
la **barrière** qu’elle débloque, **où la preuve est enregistrée** et le **statut** actuel.

**Règles :**

- Une preuve manquante ne se remplace pas par un texte approximatif : la ligne correspondante reste
  fermée, jamais de contenu inventé, de chiffre non vérifié ou de photo sans droits.
- Les états sont ceux constatés à la remise (26/11/2026). On met à jour le **statut** et la **date**
  au fur et à mesure ; les décisions, elles, restent dans les documents de référence cités.
- Rien de ce qui est listé ici n’est « fait » tant que la preuve n’est pas au dossier et que la
  barrière n’est pas ouverte **par le code** (ouvrir une barrière n’est jamais un clic dans l’admin).

## 1. Lancement P1 — bloquant avant ouverture publique

| Preuve attendue | Page / palier concerné | Barrière actuelle | Où c’est enregistré | Statut |
|---|---|---|---|---|
| **Extrait RC (modèle 7)** ou fiche OMPIC détaillée : confirme l’adresse et le gérant | Mentions légales, Politique de confidentialité, pied de page (P1) | Aucune barrière de code : les pages sont rédigées depuis le registre des faits ; le RC est la preuve légale | `docs/company/facts-register.md` §8 action 1, §11 ; preuve au dossier | `[ ]` En attente |
| **Les deux certificats ONEE** (EE HTA-BT et HTA-BT3) | À propos, Réalisations, fiche Infrastructures et réseaux électriques (P1) | `agrementLive` — formulation approuvée en code, publication bloquée | `docs/company/facts-register.md` §2.2, §8 action 2 ; `lib/site/claims.ts` | `[ ]` Documents promis, non versés |
| **Boîtes `contact@` et `donnees@` créées et testées** (envoi ET réception) | Pied de page, Contact, mentions légales, politique, JSON-LD | Mailboxes non publiées tant que le test n’est pas fait | `docs/company/facts-register.md` §2.3, §8 action 4 ; `docs/legal/cndp-filings-launch-compliance.md` §11 | `[ ]` Boîtes approuvées, non créées/testées |
| **Boîte `no-reply@` créée et testée** (expéditeur technique, jamais publique) | Formulaire futur / mails transactionnels | Aucune publication publique | `docs/company/facts-register.md` §2.3 ; CNDP §11 | `[ ]` À faire |
| **`recrutement@` créée et testée**, publique seulement après F-113 | Carrières (P1, CTA e-mail) | `recrutementMailboxLive` (F-113) + `formLive` | `docs/forms/contact-careers-forms.md` ; CNDP §4.2 | `[ ]` Créée, non publique |
| **Déclaration CNDP F-211** (contact et devis par e-mail) | Contact (e-mail), mentions légales, politique | Contact public : la voie e-mail est couverte par F-211 | `docs/legal/cndp-filings-launch-compliance.md` §2.1, §3, §12 | `[ ]` Non déposée |
| **Autorisation CNDP F-118** (transferts Cloudflare/R2, hébergeur) | Tout le site public | Lancement public bloqué sans F-118 | CNDP §2.1, §3, §12 | `[ ]` Non déposée |
| **F-113** (autorisation RH) — si `/carrieres` invite à envoyer un CV | Carrières, `recrutement@` | `recrutementMailboxLive` | CNDP §4.2, §12 | `[ ]` À faire, prioritaire (autorisation, pas un récépissé) |
| **F-214** (cookies/analytics) — seulement si l’analytics est activé | Aucune page P1 (analytics désactivé au lancement) | `analyticsLive` | CNDP §4.3 | `—` Non applicable au lancement |
| **Relecture conseil juridique** des pages légales et des mentions CNDP | Mentions légales, politique de confidentialité | `legalReviewed` (code) | `docs/legal/analytics-consent-legal-pages.md` ; CNDP §12 | `[ ]` À planifier |
| **Confirmation écrite de propriété du logo** (badge fourni) | En-tête et pied de page de tout le site | `#4` — actif de marque | `docs/company/facts-register.md` §6 ; `docs/brand/brand-direction.md` §2.1 | `[ ]` Gated |
| **Fiche de propriété et d’accès signée** (§ domaine, DNS, hébergement, sauvegardes, comptes) | Tous les actifs numériques | Remise non complète sans elle | `docs/handover/ownership.md` (modèle) | `[ ]` Modèle non signé |
| **Séance de formation de 2 h enregistrée + sign-off** (une modification réelle + un publier/dépublier sans aide) | Outil d’édition du propriétaire | Remise non complète sans elle | `docs/handover/formation.md` §6 | `[ ]` À réaliser |
| **Test de restauration** enregistré avant lancement (base + objet réels) | Sauvegardes | Aucune : exigence d’exploitation | `docs/ops/runbook.md` §5 ; `docs/ops/external-steps.md` §4 | `[ ]` Répétition locale faite, test réel à faire |
| **Déploiement et vérifications sur le staging réel** (image ARM64, Coolify, Access, rollback, health) | Infrastructure | Aucune (hors application) | `docs/ops/external-steps.md` §1–§3 | `[ ]` Non vérifié |
| **Revue du contenu seedé par le propriétaire** (français, faits) | Les six pages P1 | Aucune : le contenu seedé peut être corrigé dans l’admin | `docs/content/content-model.md` §13 ; `docs/build/cms.md` §8 | `[ ]` À faire |
| **Sign-off du structeur sur le registre des écarts** (6 lignes DEV-001 à DEV-006) | Architecture livrée vs cahier des charges | Aucune, mais exigé par le mandat | `docs/cdc/deviation-register.md` | `[ ]` En attente de sign-off |
| **Audit P1 (#33)** : parité fixtures/CMS, clavier, breakpoints, budgets, claims | Tout le site | Aucune | `docs/build/p1-audit.md` (ticket #33, en cours) | `[ ]` Voir le rapport |

### Rappel des 10 actions du registre des faits §8

| # | Action | Renvoi dans ce document |
|---|---|---|
| 1 | Extrait RC / fiche OMPIC | ligne 1 ci-dessus |
| 2 | Deux certificats ONEE | ligne 2 |
| 3 | Téléphone / réseaux sociaux : confirmer ou omettre définitivement | §2 (P2) — omis au lancement |
| 4 | Créer et tester les quatre boîtes, puis déposer les déclarations CNDP | lignes 3–6 et F-211/F-118 |
| 5 | Autorisations écrites clients, logos, photos de personnes, témoignages | §2 (P2) et §3 (P3) |
| 6 | Confirmer « Solaire & ENR » comme activité réelle, avec preuve | §2 (P2) |
| 7 | Confirmer la propriété du logo et fournir les éléments de marque | ligne « logo » ci-dessus |
| 8 | Inventaire des projets (objet, acheteur, lieu, année, montant, réception, contact) | §3 (P3) |
| 9 | Vérifier le renouvellement MHVP après le 03/03/2026 | §2 (P2) |
| 10 | Offres d’emploi en cours (ou confirmer qu’il n’y en a pas) + candidature e-mail | §2 (P2) |

## 2. Palier P2 — à fournir pour ouvrir les pages P2

| Preuve attendue | Page / palier | Barrière actuelle | Où c’est enregistré | Statut |
|---|---|---|---|---|
| **Inventaire matériel** (engins, véhicules, outillage), **photos d’équipes autorisées** et **inventaire RH** | Moyens et compétences (P2) | Rubrique P2 fermée par code ; aucune page CMS | `docs/content/information-architecture.md` ; `lib/payload/content-map.ts` ; `docs/company/facts-register.md` §8 action 5 | `[ ]` Manquant |
| **Autorisations clients et partenaires** (nom, logo, marque) + **justificatifs de certifications** | Références et partenaires (P2) | Rubrique P2 fermée par code | `docs/company/facts-register.md` §6, §8 action 5 ; `docs/content/realisations-strategy.md` | `[ ]` Manquant |
| **Traduction anglaise professionnelle validée** (pas de traduction automatique) | `/en/*` (P2) | Structure `/en` réservée, route 404 tant que P2 n’est pas livré ; décision DEV-002 | `docs/cdc/deviation-register.md` DEV-002 ; `docs/seo/seo-metadata.md` ; validation propriétaire au dossier | `[ ]` Aucune traduction, aucun budget |
| **F-211 obtenue + formulaire de contact/devis** (Server Action + SMTP, sans stockage) | Contact / devis (P2) | `formLive` ; DEV-003 | `docs/forms/contact-careers-forms.md` ; CNDP §4.1 | `[ ]` Non construit |
| **F-214 obtenue** puis activation de Cloudflare Web Analytics | Mesure d’audience (P2) | `analyticsLive` ; DEV (aucune décision contraire) | `docs/legal/analytics-consent-legal-pages.md` §4 ; CNDP §4.3 | `[ ]` Analytics désactivé |
| **Confirmation que l’adresse est un point d’accueil** (carte et horaires) | Contact (P2) | `mapLive` | `docs/company/facts-register.md` §2.3 | `[ ]` Gated |
| **Décision définitive : téléphone et réseaux sociaux** (publiés ou omis pour de bon) | Pied de page, Contact, JSON-LD (P1/P2) | `mapLive` / identité code-owned | `docs/company/facts-register.md` §8 action 3 | `[ ]` Omis provisoirement |
| **Offres d’emploi en cours** (intitulé, contrat, lieu, résumé, description, date de clôture) **ou** confirmation qu’il n’y en a pas ; confirmation du **e-mail only** | Carrières (P1/P2) | Aucune : l’éditeur peut publier/fermer une offre ; `applicationEmail` reste code-owned | `docs/company/facts-register.md` §8 action 10 ; `docs/forms/contact-careers-forms.md` §4.2 | `[ ]` À fournir |
| **Renouvellement MHVP après le 03/03/2026** | Réalisations, qualifications (P1/P2) | Position qualifications code-owned | `docs/company/facts-register.md` §8 action 9 ; `lib/site/claims.ts` | `[ ]` À vérifier |
| **Périmètre écrit « Solaire & ENR »** + preuves | Énergies renouvelables et solaire (P2) | `DOMAIN_GATES` code-owned | `docs/cdc/deviation-register.md` DEV-005 ; `lib/payload/content-map.ts` | `[ ]` Gated |
| **Catalogue et autorisations de distribution / marque** | Fourniture d’équipements et de matériel (P2) | `DOMAIN_GATES` code-owned | DEV-005 | `[ ]` Gated |
| **Photos de chantier autorisées** (dont personnes) | Pages domaines, Réalisations (P2) | Aucune photo au lancement : le site tient sans (repli typographique) ; droits requis avant usage | `docs/content/content-model.md` §7 ; `docs/company/facts-register.md` §6 | `[ ]` Manquant |

## 3. Palier P3 — à fournir pour ouvrir Actualités et les études de cas

| Preuve attendue | Page / palier | Barrière actuelle | Où c’est enregistré | Statut |
|---|---|---|---|---|
| **Premier communiqué** validé par le conseil juridique (`legalReviewed` + référence) | Actualités (P3) | `actualitesLive` ; le CMS modélise les communiqués, la route reste 404 | `docs/content/content-model.md` §9.1 ; `docs/build/cms.md` §4.2 ; CNDP §12 | `[ ]` Aucun communiqué |
| **Politique éditoriale** : six communiqués par an maximum, pas de blog, pas d’auteurs | Actualités (P3) | `actualitesLive` + plafond en code | `docs/content/content-model.md` §9.1 ; `collections/Communiques.ts` | `[ ]` Règle en place, contenu à venir |
| **Trois études de cas nommées et autorisées** (autorisation client + preuve, ou carte anonymisée avec référence de preuve) | Fiches réalisations `/realisations/{slug}` (P3) | `caseStudiesLive` (famille fermée) | `docs/content/realisations-strategy.md` §4 ; `collections/Projects.ts` | `[ ]` Manquant |
| **F-113 obtenue** + document de consentement candidat | Carrières, invitation à envoyer un CV (P3) | `recrutementMailboxLive` ; pas de formulaire ni d’upload construit (#12) | CNDP §4.2, §12 ; `docs/forms/contact-careers-forms.md` | `[ ]` Non déposée |
| **Intégration Odoo** — aucune étude, aucune connexion | — | DEV-004 : hors périmètre | `docs/cdc/deviation-register.md` DEV-004 | `—` Non prévu |
| **Médiathèque** — non modélisée au lancement | Médiathèque (P3) | `mediathequeLive` ; aucun global CMS (décision #30) | `docs/build/cms.md` §13 ; `lib/payload/content-map.ts` | `—` Non construite |

## 4. Traduction : la règle d’approbation

- Le site est **français au lancement** ; l’anglais est P2 (DEV-002) et suppose une **traduction humaine
  professionnelle**, pas une traduction automatique.
- Preuve attendue : la traduction livrée, la **validation écrite du propriétaire** (ou du gérant) et la
  décision de palier. Tant qu’elle n’est pas fournie, `/en` reste un 404.
- L’arabe n’est pas traduit au lancement : seules la structure et les jetons compatibles RTL sont prévus.

## 5. Ce que le dépôt ne peut pas fournir seul

Dernière relecture : ces éléments sont des **actions humaines ou externes**, pas des livrables du
dépôt. Ils restent donc ouverts même si le gate technique passe :

- l’enregistrement de la séance de formation et la signature du propriétaire (`formation.md`) ;
- la fiche de propriété signée et les accès réellement transférés (`ownership.md`) ;
- le déploiement et les vérifications sur le staging réel (`docs/ops/external-steps.md`) ;
- les dépôts CNDP F-211 / F-113 / F-214 / F-118 et les récépissés ;
- les contenus et preuves listés ci-dessus, en particulier les autorisations clients, le RC, les
  certificats ONEE et les boîtes mail ;
- le sign-off du structeur sur `docs/cdc/deviation-register.md` ;
- l’audit P1 du ticket #33 (`docs/build/p1-audit.md`), à lire avant toute ouverture publique.
