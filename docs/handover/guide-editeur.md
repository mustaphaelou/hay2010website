# Guide de l’éditeur — site HAY2010

**Pour qui :** la personne qui tient le contenu du site (compte « Éditeur »).
**Pour quoi :** corriger un texte, mettre à jour une fiche domaine, publier ou dépublier, sans développeur.
**Version :** remise P1 (ticket #34). À conserver avec la fiche de propriété (`ownership.md`)
et la liste des contenus attendus (`contenu-attendu.md`).

> Règle d’or : **on ne supprime jamais**. On enregistre en brouillon, on publie, et si besoin
> on dépublie. Tout reste réversible.

## 1. Se connecter

1. Ouvrez `https://hay2010.ma/admin` (avant l’ouverture publique : `https://staging.hay2010.ma/admin`,
   protégé par Cloudflare Access — même adresse e-mail, code à usage unique).
2. Identifiant = votre adresse e-mail. Mot de passe : celui remis par le développeur lors de la remise.
3. À la première connexion : menu **Compte** → **Changer le mot de passe**. Vérifiez aussi
   **Paramètres de Payload → Langue = Français**.
4. Mot de passe perdu : il n’y a **pas** de réinitialisation automatique par e-mail à ce jour.
   Demandez au développeur ; il réinitialise le mot de passe depuis **Comptes**.
5. Ne partagez jamais votre compte. Le back-office n’a pas de double authentification : choisissez
   un mot de passe long et unique.

## 2. Le tableau de bord

Après connexion, vous arrivez sur **Tableau de bord**. Les menus sont en haut :

- **Contenu** — les pages : Accueil, À propos, Domaines d’activité (index), Réalisations, Contact,
  Carrières, puis **Domaines d’activité** (les fiches) et **Offres d’emploi**.
- **Contenu (fermé)** — Études de cas, Communiqués, Actualités (fermée) : modèles préparés, mais
  aucune page publique (voir §7).
- **Médias** — les photos et visuels.
- **Administration → Comptes** — les comptes du back-office (gérés par le développeur).

Trois blocs en lecture seule sont affichés au-dessus du tableau de bord : **Barrières de publication**,
**Barrières et interrupteurs associés** et **Constantes code-owned**. Ils expliquent ce qui est fermé et
pourquoi. Rien ne s’ouvre depuis l’admin : ouvrir une barrière est une décision de code, avec une preuve.

## 3. Modifier le texte d’une page

1. **Contenu** → la page voulue (ex. **Accueil**, **À propos**, **Contact**).
2. Modifiez les champs. Ceux marqués d’une étoile `*` sont obligatoires ; les textes gris sous un champ
   expliquent ce qu’il faut y mettre.
3. **Enregistrer le brouillon** : la modification est conservée, mais **invisible** sur le site.
4. **Publier les modifications** : la page passe en ligne en quelques secondes (pas de reconstruction).
5. **Vérifiez toujours sur le vrai site** (`https://hay2010.ma/…`) : un changement n’est fait que
   lorsqu’il s’affiche.

Ne modifiez pas le groupe **Référencement (SEO)** sans consigne du développeur : sa **description**
(120 à 160 caractères) est celle que les moteurs de recherche affichent. Le reste de la page (identité,
chiffres, libellés, boutons) est écrit dans le code.

## 4. Une fiche domaine et ses prestations

1. **Contenu → Domaines d’activité** → cliquez sur une fiche (Éclairage public, Installations
   électriques, Infrastructures et réseaux électriques).
2. Vous pouvez modifier : **Titre (h1)**, **Accroche**, **Présentation et besoins**, **Prestations
   confirmées**, **Méthode, moyens et compétences**, **Bandeau contact**.
3. Règle de fond : uniquement des prestations **réellement réalisées**. Jamais une capacité supposée,
   jamais un agrément non encore publié.
4. **Ne changez jamais « Clé du domaine (route) »** : c’est l’adresse de la page et une décision de code.
5. **Publier les modifications**. Une fiche publiée doit avoir présentation, au moins une prestation,
   une méthode, un titre de bandeau contact et une description SEO : sinon l’enregistrement est refusé.
6. Deux fiches existent mais restent fermées : **Énergies renouvelables et solaire** et **Fourniture
   d’équipements et de matériel**. Vous pouvez les préparer ; les publier ne les ouvre pas (§7).

## 5. Publier, dépublier, ne jamais supprimer

- **Publier** : bouton **Publier les modifications** en haut à droite de la fiche.
- **Dépublier** : menu à trois points (⋯) à côté de **Statut : Publié** → **Annuler la publication**,
  puis **Confirmer**. La fiche repasse en brouillon ; le public reçoit une page 404 tant qu’elle est
  dépubliée. Le contenu n’est pas perdu.
- **Remettre en ligne** : **Publier les modifications** à nouveau.
- **Supprimer** : il n’y a pas de bouton de suppression pour l’éditeur, et c’est voulu. Si un contenu ne
  doit plus être visible, dépubliez-le ; seul le développeur peut supprimer définitivement.

## 6. Les photos : la permission d’abord

1. **Médias** → le bouton de création (**Créer un(e) nouveau ou nouvelle**) → choisissez le fichier
   (JPEG, PNG ou WebP).
2. **Texte alternatif** obligatoire, en français : décrivez l’image (pas de mots-clés). Elle ne partira
   jamais sur le site sans ce texte.
3. Groupe **Droits et autorisations** :
   - **Origine des droits** : propriété de l’entreprise, licence, fournie par le client.
   - **Référence des droits** : facture, licence, autorisation écrite, référence de propriété.
   - **Statut des droits** : **Validés (utilisable)** seulement si l’image est à l’entreprise, **sans
     personne identifiable et sans marque client**. Dans tous les autres cas, laissez **En attente** et
     donnez la référence : le développeur valide après vérification.
4. Un logo ou un site client, une personne identifiable, un portrait, un témoignage : **autorisation
   écrite obligatoire avant toute utilisation**. Pas d’autorisation = pas de publication.
5. Publier une page avec une image **non validée** est refusé par le site : c’est normal. Validez la
   photo ou retirez-la, puis republiez.

## 7. Ce qui est fermé, et pourquoi

Le tableau de bord liste ces barrières en lecture seule. Elles ne s’ouvrent **pas** depuis l’admin :

| Contenu fermé | Pourquoi | Ce qu’il faut pour ouvrir |
|---|---|---|
| **Actualités** (P3) | Rubrique de palier P3 ; aucun communiqué approuvé au lancement | Un communiqué relu par le conseil juridique, puis ouverture par le code |
| **Moyens et compétences** (P2) | Inventaire matériel, photographique et RH manquant | Fournir l’inventaire et les preuves au développeur |
| **Références et partenaires** (P2) | Autorisations clients, partenaires et certifications manquantes | Collecter les autorisations écrites |
| **Énergies renouvelables et solaire** | Périmètre réel non confirmé par écrit | Confirmer le périmètre (écrit) → ouverture par le code |
| **Fourniture d’équipements et de matériel** | Catalogue et autorisations de distribution et de marque manquants | Fournir catalogue + autorisations |
| **Fiches réalisations** (`/realisations/…`) | Trois études de cas nommées et autorisées inexistantes | Trois autorisations clients + preuves |
| **Agréments ONEE** (Entreprise, Réalisations) | Les deux certificats ne sont pas encore versés | Envoyer les deux certificats (EE HTA-BT, HTA-BT3) |
| **`recrutement@hay2010.ma`** | Autorisation CNDP F-113 non obtenue | Obtenir la F-113 → ouverture par le code |
| **Formulaire, carte, téléphone, réseaux sociaux** | Décision de lancement : site sans formulaire, canaux non validés | Décision du propriétaire + preuves (CNDP, facts) |

Publier un brouillon appartenant à une page fermée est **sans effet public** : la barrière reste
prioritaire. Ne perdez pas de temps à chercher comment l’ouvrir dans l’admin.

## 8. Ce que l’éditeur ne peut pas faire

- Supprimer définitivement un contenu publié (unpublier, oui).
- Modifier l’identité légale, les revendications approuvées, la navigation ou les réglages SEO par défaut.
- Modifier les pages légales (mentions légales, politique de confidentialité) : elles sont écrites dans le code.
- Créer une fiche domaine (seul le développeur ajoute ou retire un domaine).
- Gérer les comptes et les rôles.
- Ouvrir une barrière de publication.

## 9. Limites à connaître (sans surprise)

- **Pas de prévisualisation de brouillon** : un brouillon n’est visible que de vous, dans l’admin ;
  il n’existe pas d’aperçu public du brouillon. Pour relire sans publier, utilisez l’environnement de
  test (staging) quand il est disponible, ou publiez puis dépubliez tout de suite si l’enjeu est faible.
- **Dépublier une page du site public la fait répondre 404** : il n’y a pas de page « en travaux ».
  Republier la restaure immédiatement.
- **Interface en français** ; quelques libellés techniques de l’outil (API, Versions, SEO) peuvent rester
  en anglais selon la langue du navigateur. Réglez **Langue = Français** dans **Compte**.
- **Pas de formulaire de contact** (e-mail seulement), **pas de téléphone**, **pas de réseaux sociaux** au
  lancement : ce sont des décisions, pas des oublis.
- **Pas de double authentification** à ce stade : la sécurité repose sur le mot de passe et sur l’accès
  restreint à l’admin.

## 10. Qui appeler

- **Technique** (connexion, admin, image refusée, ouverture d’une barrière, erreur) : le développeur.
  Nom et coordonnées : fiche de propriété signée (`ownership.md`, à conserver hors du dépôt).
- **Contenu, autorisations et légal** (ce que l’entreprise peut publier, autorisation client, CNDP) :
  le propriétaire / le gérant, avec le conseil juridique. Liste : `contenu-attendu.md`.
- **Site indisponible ou incident** : procédure `docs/ops/runbook.md` (contacts d’incident et restauration).

## 11. Les cinq réflexes

1. **Brouillon d’abord**, publication ensuite, vérification sur le site public.
2. **Aucune photo sans permission enregistrée.**
3. **On dépublie, on ne supprime pas.**
4. **On ne touche pas aux champs marqués comme code-owned** (identité, revendications, navigation, SEO).
5. **En cas de doute : dépublier et appeler.**
