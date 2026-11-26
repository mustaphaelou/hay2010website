# Formation de l’éditeur — séance de deux heures

**Statut : à réaliser.** Ce document est le **plan** et le **dossier de preuve** de la séance. La
séance elle-même, son **enregistrement** et la **signature** du propriétaire sont des actions
humaines : elles ne sont pas livrées par le dépôt et ne doivent pas être annoncées comme faites tant
que la fiche de séance (§6) n’est pas remplie et signée.

**Public :** le propriétaire du contenu (compte « Éditeur ») et, si besoin, la personne qui le
remplacera. **Animateur :** le développeur. **Durée :** 2 h, pause de 10 min incluse.
**Support :** `guide-editeur.md` (une page, à imprimer et à remettre), `contenu-attendu.md`,
`docs/ops/runbook.md` pour les incidents.

## 1. Prérequis (à vérifier avant la séance)

- [ ] Un environnement de **staging réel** est déployé et accessible (`https://staging.hay2010.ma`,
      protégé par Cloudflare Access) — action opérateur, voir `docs/ops/external-steps.md`.
- [ ] Le **compte éditeur du propriétaire** existe dans cet environnement (créé par le développeur)
      et son mot de passe a été remis en main propre. Le compte est de rôle **Éditeur**.
- [ ] Le contenu de démonstration ou le contenu réel approuvé est en place (`npm run seed` sur une base
      de staging dédiée, ou saisie manuelle).
- [ ] Les outils de démonstration sont prêts : le site public, l’admin, une page dont on peut modifier
      le texte, et la liste des deux médias de test (un « En attente », un « Validés »).
- [ ] L’enregistrement est **autorisé par écrit** par le propriétaire (consentement) ; le fichier est
      stocké hors du dépôt (voir §7).
- [ ] Le propriétaire a reçu le `guide-editeur.md` imprimé.

## 2. Objectifs de la séance

À la fin, le propriétaire doit savoir, **sans aide** :

1. se connecter et changer son mot de passe ;
2. lire le tableau de bord et comprendre ce qui est fermé et pourquoi ;
3. modifier le texte d’une page, l’enregistrer en brouillon, le publier et le vérifier sur le site ;
4. dépublier puis remettre en ligne, sans jamais supprimer ;
5. appliquer la règle des droits sur les photos (permission avant publication) ;
6. retrouver dans `contenu-attendu.md` ce qu’il doit encore fournir, et qui appeler.

## 3. Déroulé (120 minutes)

| Temps | Séquence | Contenu | Format |
|---|---|---|---|
| 0–10 | Accueil et cadrage | Objectifs, ce que le site fait et ne fait pas, rappel « on ne supprime jamais », consentement d’enregistrement | Échange |
| 10–25 | Le site public | Parcours visiteur : Accueil, À propos, trois domaines, Réalisations, Contact ; pages fermées et 404 ; où le contenu saisi apparaît | Démo |
| 25–40 | Le back-office | Connexion, tableau de bord, trois blocs en lecture seule, menus Contenu / Contenu (fermé) / Médias / Administration ; changer le mot de passe | Démo guidée |
| 40–60 | Atelier 1 — modifier un texte | Ouvrir une page, modifier une accroche, **Enregistrer le brouillon** ; constater que le site public n’a pas changé | Pratique guidée |
| 60–75 | Atelier 2 — publier / dépublier | **Publier les modifications**, vérifier sur le site ; menu ⋯ → **Annuler la publication**, vérifier le 404 ; republier | Pratique guidée |
| 75–85 | Pause | — | — |
| 85–100 | Atelier 3 — photos et contenu fermé | Règle des droits : montrer un média « En attente » et un « Validés » ; expliquer le refus de publication ; parcourir les barrières du tableau de bord et `contenu-attendu.md` | Démo + échange |
| 100–112 | Atelier 4 — **sign-off sans aide** | Le propriétaire réalise **une modification réelle** de son choix **et** un cycle **publier → dépublier → republier** sans assistance, guide papier uniquement. L’animateur observe et coche la §5 | Pratique autonome |
| 112–120 | Clôture | Récapitulatif des cinq réflexes, qui appeler et comment, remise des documents, signature de la §6, arrêt de l’enregistrement | Échange |

## 4. Ateliers détaillés

### Atelier 1 — une modification réelle, en brouillon (20 min)

1. Se connecter à l’admin de staging.
2. **Contenu → Accueil** (ou une autre page convenue).
3. Modifier une phrase courte (par exemple l’**Accroche**), sans toucher aux champs marqués code-owned.
4. Cliquer **Enregistrer le brouillon**.
5. Ouvrir la page publique : **rien n’a changé** — c’est le comportement attendu d’un brouillon.
6. Revenir à l’admin : le document est bien enregistré.

### Atelier 2 — publier, dépublier, republier (15 min)

1. Sur la même page, cliquer **Publier les modifications**.
2. Attendre quelques secondes, rafraîchir la page publique : la modification s’affiche.
3. Menu ⋯ à côté de **Statut : Publié** → **Annuler la publication** → **Confirmer**.
4. Rafraîchir la page publique : elle répond **404**. Le contenu est conservé dans l’admin.
5. Cliquer **Publier les modifications** : la page revient en ligne.
6. Vérifier que le bouton de suppression n’existe pas : c’est volontaire.

### Atelier 3 — photos et barrières (15 min)

1. **Médias** : montrer les deux fiches de démonstration créées par le seed de staging — une
   **En attente**, une **Validés** (fiches de test, jamais utilisées sur le site public).
2. Expliquer : une photo sans référence de droits, une personne identifiable ou une marque client
   **ne se publie pas** ; l’éditeur ne valide que les images de l’entreprise sans personne ni marque.
3. Montrer qu’une page publiée avec une image non validée est refusée, et comment retirer l’image.
4. Parcourir le tableau de bord : les barrières et leur raison. Publier le brouillon d’une page fermée
   ne l’ouvre pas.
5. Ouvrir `contenu-attendu.md` : chaque ligne indique la preuve attendue, la barrière débloquée et où
   c’est enregistré.

### Atelier 4 — sign-off sans aide (12 min)

Le propriétaire, seul, avec le guide papier :

- [ ] modifie **un contenu réel** de son choix (texte de page ou prestation d’un domaine) ;
- [ ] l’enregistre en brouillon, le publie, et vérifie le résultat sur le site public ;
- [ ] dépublie, vérifie le 404, republie et vérifie le retour en ligne ;
- [ ] explique à haute voix la règle des photos et trois barrières du tableau de bord.

L’animateur n’intervient pas, sauf blocage technique (connexion, panne). Un blocage de compréhension
se note et se retravaille en fin de séance.

## 5. Check-list d’acceptation de la séance

Cocher chaque point ; la séance est validée quand tout est coché et signé en §6.

- [ ] Le propriétaire s’est connecté seul et a changé son mot de passe.
- [ ] Il a lu le tableau de bord et cité au moins trois barrières avec leur raison.
- [ ] Il a modifié un contenu réel et l’a enregistré en brouillon.
- [ ] Il a publié, vérifié sur le site public, dépublié, vérifié le 404, republié.
- [ ] Il n’a utilisé aucune suppression et sait pourquoi.
- [ ] Il a expliqué la règle des droits sur les photos (permission avant publication).
- [ ] Il sait où trouver `contenu-attendu.md` et `guide-editeur.md`.
- [ ] Il sait qui appeler (technique / contenu / incident) et où sont les contacts.
- [ ] L’enregistrement de la séance a été arrêté et rangé hors du dépôt (si enregistrement).
- [ ] Les documents lui ont été remis (guide imprimé, fiche de propriété à signer, checklist contenu).

## 6. Fiche de séance (à remplir et signer — preuve de remise)

| Champ | Valeur |
|---|---|
| Date et heure (fuseau) | `[●]` |
| Lieu / visioconférence | `[●]` |
| Environnement utilisé (URL staging) | `[●]` |
| Animateur (développeur) | `[●]` |
| Participant(s) côté HAY2010 | `[●]` |
| Enregistrement réalisé ? (oui/non, consentement signé, emplacement hors dépôt) | `[●]` |
| Atelier 4 réalisé sans aide ? (oui/non, observations) | `[●]` |
| Points à retravailler | `[●]` |

**Signatures**

| Rôle | Nom | Signature | Date |
|---|---|---|---|
| Propriétaire (HAY2010) | `[●]` | | `[●]` |
| Développeur (animateur) | `[●]` | | `[●]` |

## 7. Enregistrement et conservation

- L’enregistrement est **facultatif** mais demandé par le ticket ; il suppose le consentement écrit du
  propriétaire (image et voix, usage interne de formation).
- Il est stocké **hors du dépôt** (le dépôt est public), par exemple dans l’espace de stockage de
  HAY2010, avec accès limité au propriétaire et au développeur.
- La fiche de séance §6 est conservée avec les autres preuves de remise ; elle peut être copiée dans le
  dossier de propriété (`ownership.md`) sans y mettre de données personnelles inutiles.

## 8. Suivi après la séance

- **J+7 :** le propriétaire réalise une petite modification réelle seul ; le développeur répond aux
  questions par écrit. Si un doute subsiste, refaire l’atelier 2.
- **J+30 :** revue de la `contenu-attendu.md` : quelles preuves ont été fournies, quelles barrières
  peuvent être ouvertes (par le code) et dans quel ordre.
- **Chaque trimestre** (rythme de revue du modèle de contenu) : vérifier services, pages légales, canaux
  de contact, offres d’emploi, droits des médias et liens morts ; mettre à jour la checklist.
- Si le propriétaire change de personne : refaire les ateliers 1, 2 et 4 avec la nouvelle personne,
  remplir une nouvelle fiche de séance.
