# Guide de l’éditeur — site HAY2010

**Pour qui :** la personne qui tient le contenu (compte « Éditeur »). **Pour quoi :** corriger un texte,
mettre à jour une fiche domaine, publier ou dépublier — sans développeur. **Version :** remise P1
(ticket #34). À conserver avec la fiche de propriété (`ownership.md`) et la liste des contenus attendus
(`contenu-attendu.md`).

> **Règle d’or : on ne supprime jamais.** On enregistre en brouillon, on publie, et si besoin on
> dépublie. Tout reste réversible.

## 1. Se connecter

1. Ouvrez `https://hay2010.ma/admin` (avant l’ouverture publique, et une fois le staging déployé :
   `https://staging.hay2010.ma/admin`, protégé par Cloudflare Access).
2. Identifiant = votre adresse e-mail. Mot de passe : celui remis par le développeur.
3. Première connexion : menu **Compte** → **Changer le mot de passe**, et vérifiez
   **Paramètres de Payload → Langue = Français**.
4. Mot de passe perdu : pas de réinitialisation automatique par e-mail à ce jour ; demandez au
   développeur, qui le réinitialise dans **Comptes**.
5. Ne partagez pas votre compte : le back-office n’a pas de double authentification.

## 2. Le tableau de bord

Les menus sont en haut : **Contenu** (les pages et les fiches), **Contenu (fermé)** (modèles sans page
publique), **Médias**, **Administration → Comptes**. Au-dessus du tableau de bord, trois blocs en
lecture seule — **Barrières de publication**, **Barrières et interrupteurs associés**, **Constantes
code-owned** — expliquent ce qui est fermé et pourquoi. Rien ne s’ouvre depuis l’admin.

## 3. Modifier le texte d’une page

1. **Contenu** → la page voulue (Accueil, À propos, Domaines d’activité (index), Réalisations, Contact,
   Carrières).
2. Modifiez les champs ; `*` = obligatoire, le texte gris sous un champ explique quoi y mettre.
3. **Enregistrer le brouillon** : conservé, invisible sur le site.
4. **Publier les modifications** : en ligne en quelques secondes (pas de reconstruction).
5. Vérifiez toujours sur le vrai site : un changement n’est fait que lorsqu’il s’affiche.

Ne modifiez pas le groupe **Référencement (SEO)** sans consigne : sa **description** (120–160
caractères) est celle qu’affichent les moteurs de recherche. Le reste (identité, chiffres, libellés,
boutons) est écrit dans le code.

## 4. Une fiche domaine et ses prestations

1. **Contenu → Domaines d’activité** → cliquez sur une fiche (Éclairage public, Installations
   électriques, Infrastructures et réseaux électriques).
2. Champs modifiables : **Titre (h1)**, **Accroche**, **Présentation et besoins**, **Prestations
   confirmées**, **Méthode, moyens et compétences**, **Bandeau contact**.
3. Uniquement des prestations **réellement réalisées** : jamais une capacité supposée, jamais un
   agrément non publié.
4. **Ne changez jamais « Clé du domaine (route) »** : c’est l’adresse de la page, une décision de code.
5. **Publier les modifications**. Une fiche publiée doit avoir présentation, au moins une prestation,
   une méthode, un titre de bandeau contact et une description SEO, sinon l’enregistrement est refusé.
6. Deux fiches existent mais restent fermées : **Énergies renouvelables et solaire** et **Fourniture
   d’équipements et de matériel**. Vous pouvez les préparer ; les publier ne les ouvre pas (voir §7).

## 5. Publier, dépublier, ne jamais supprimer

- **Publier** : bouton **Publier les modifications** en haut à droite.
- **Dépublier** : menu à trois points (⋯) à côté de **Statut : Publié** → **Annuler la publication**,
  puis **Confirmer**. La fiche repasse en brouillon ; le public reçoit une 404, le contenu est conservé.
- **Remettre en ligne** : **Publier les modifications** à nouveau.
- **Supprimer** : aucun bouton de suppression pour l’éditeur, et c’est voulu. Si un contenu ne doit plus
  être visible, dépubliez-le ; seul le développeur peut supprimer définitivement.

## 6. Les photos : la permission d’abord

1. **Médias** → bouton de création → choisissez le fichier (JPEG, PNG ou WebP).
2. **Texte alternatif** obligatoire, en français : décrivez l’image (pas de mots-clés). Sans lui, elle
   ne part jamais sur le site.
3. **Droits et autorisations** : **Origine des droits** (entreprise, licence, fournie par le client),
   **Référence des droits** (facture, licence, autorisation, propriété), **Statut des droits**.
4. **Validés (utilisable)** uniquement si l’image est à l’entreprise, **sans personne identifiable et
   sans marque client**. Sinon laissez **En attente** avec la référence : le développeur valide.
5. Logo ou site client, personne identifiable, portrait, témoignage : **autorisation écrite
   obligatoire avant toute utilisation**. Pas d’autorisation = pas de publication.
6. Publier une page avec une image non validée est **refusé** par le site : validez la photo ou
   retirez-la, puis republiez.

## 7. Pages fermées, et ce que l’éditeur ne peut pas faire

Le tableau de bord liste en lecture seule les contenus fermés et leur raison. Ils ne s’ouvrent **pas**
depuis l’admin, et publier un brouillon d’une page fermée est **sans effet public** :

- **Actualités** (P3) : attend un communiqué relu par le conseil juridique.
- **Moyens et compétences** et **Références et partenaires** (P2) : inventaire, photos et autorisations manquants.
- **Énergies renouvelables et solaire**, **Fourniture d’équipements** : périmètre ou catalogue et
  autorisations manquants.
- **Fiches réalisations** : attend trois études de cas nommées et autorisées.
- **Agréments ONEE** : attendent les deux certificats (EE HTA-BT, HTA-BT3).
- **`recrutement@hay2010.ma`**, **formulaire**, **carte**, **téléphone**, **réseaux sociaux** : décisions
  et preuves (CNDP, registre des faits) non réunies.

Ouvrir une barrière est une décision de **code**, avec une preuve. L’éditeur ne peut pas non plus :
supprimer un contenu publié, modifier l’identité légale, les revendications approuvées, la navigation ou
les réglages SEO par défaut, modifier les pages légales, créer une fiche domaine, gérer les comptes.

## 8. Limites à connaître (sans surprise)

- **Pas de prévisualisation de brouillon** : un brouillon n’est visible que dans l’admin ; il n’existe
  pas d’aperçu public. Pour relire sans publier, utilisez le staging quand il est disponible.
- **Dépublier une page du site la fait répondre 404** : il n’y a pas de page « en travaux ». Republier
  la restaure immédiatement.
- **Interface en français** ; quelques libellés techniques (API, Versions, SEO) peuvent rester en
  anglais selon la langue du navigateur. Réglez **Langue = Français** dans **Compte**.
- **Pas de formulaire de contact**, **pas de téléphone**, **pas de réseaux sociaux** au lancement : ce
  sont des décisions, pas des oublis.
- **Pas de double authentification** à ce stade : la sécurité repose sur un mot de passe long et unique.

## 9. Qui appeler, et les cinq réflexes

- **Technique** (connexion, admin, image refusée, ouverture d’une barrière, erreur) : le développeur —
  nom et coordonnées dans la fiche de propriété signée (`ownership.md`, à conserver hors du dépôt).
- **Contenu, autorisations, légal** (ce que l’entreprise peut publier, autorisation client, CNDP) : le
  propriétaire / le gérant, avec le conseil juridique — liste `contenu-attendu.md`.
- **Site indisponible ou incident** : procédure `docs/ops/runbook.md`.

**Les cinq réflexes :** 1) brouillon d’abord, publier ensuite, vérifier sur le site public ; 2) aucune
photo sans permission enregistrée ; 3) on dépublie, on ne supprime pas ; 4) on ne touche pas aux champs
code-owned (identité, revendications, navigation, SEO) ; 5) en cas de doute : dépublier et appeler.
