# Fiche de propriété et de remise des accès — MODÈLE

> **Statut : modèle non signé.** Ce document n’a **aucune valeur** tant qu’il n’a pas été complété,
> vérifié et signé par les deux parties. Il est le gabarit de la confirmation écrite demandée par le
> ticket #34 : le domaine, le DNS, l’hébergement, les sauvegardes et les comptes d’administration
> doivent être au nom de **SOCIETE HAY 2010**, le développeur ne détenant qu’un accès **délégué**.
>
> **La confirmation réelle est une action humaine et juridique** : elle n’est pas faite par le dépôt.
> Tant qu’elle n’est pas signée, la remise n’est pas complète. Le document complété contient des
> données personnelles et des identifiants d’accès : **ne le committez pas** ; conservez-le hors du
> dépôt, avec les preuves en annexe.

## 1. Parties

| Partie | Identité | Représentée par |
|---|---|---|
| **Propriétaire** | **SOCIETE HAY 2010**, SARL au capital de 15 000 000 MAD, RC 87305 (Tribunal de commerce de Rabat), ICE 001459327000056, siège : Local N° 21, Hay El Manzeh, Hay El-Riad, Rabat — Maroc | Le gérant ou une personne dûment mandatée (joindre le mandat / la preuve de pouvoirs) |
| **Développeur** | `[●]` (nom, dénomination ou statut, adresse, e-mail) | `[●]` |

**Objet :** attester que l’ensemble des actifs numériques du site `https://hay2010.ma` appartient à
SOCIETE HAY 2010, que le développeur n’en détient que l’accès délégué nécessaire à la construction et à
la maintenance, et que la société peut récupérer ses actifs et retirer cet accès à tout moment.

## 2. Actifs et titulaire (à compléter et vérifier pièce par pièce)

| # | Actif | Titulaire attendu | Emplacement / fournisseur | Compte (identifiant à confirmer) | Accès du développeur | Preuve à joindre |
|---|---|---|---|---|---|---|
| 1 | **Nom de domaine `hay2010.ma`** (renouvellement, contacts admin/tech) | SOCIETE HAY 2010 | Registraire **NINDO HOST** (compte HAY2010) | `[●]` | Délégué, sans transfert sortant sans accord | Capture du tableau de bord registraire : titulaire, expiration, contacts |
| 2 | **Zone DNS `hay2010.ma`** (enregistrements A/AAAA, MX, SPF, DKIM, autodiscover, media) | SOCIETE HAY 2010 | **Cloudflare** — compte HAY2010, zone `hay2010.ma` | Membre/administrateur : `[●]` | Délégué (membre du compte) | Capture « Members » du compte Cloudflare et de la zone |
| 3 | **Cloudflare Access** (accès au staging) | SOCIETE HAY 2010 | Application Access `staging.hay2010.ma` | Politique : propriétaire + développeur | Délégué | Capture de la politique Access |
| 4 | **Hébergement — VPS** | **Décision en cours : développeur pour la première mise en ligne, avec accord d’hébergement/exploitation écrit ; cible : HAY2010** | Fournisseur `[●]`, pays `[●]` | `[●]` | Administrateur | Contrat ou accord écrit + facture au nom du titulaire |
| 5 | **Coolify** (tableau de bord, application, déploiement, sauvegardes) | SOCIETE HAY 2010 (accès délégué au développeur pendant la construction) | `[●]` (auto-hébergé sur le VPS, non exposé publiquement) | Compte : `[●]` | Administrateur délégué | Capture des comptes et rôles Coolify (sans mot de passe) |
| 6 | **Postgres `hay2010-postgres`** (contenu, comptes admin, versions) | SOCIETE HAY 2010 (données) | Ressource Coolify, réseau interne | Utilisateur `[●]` ; mot de passe dans le gestionnaire de mots de passe | Accès technique | Capture de la ressource + emplacement du secret (jamais le secret) |
| 7 | **R2 `hay2010-media`** (médias publics, versionnés, servis par `media.hay2010.ma`) | SOCIETE HAY 2010 | Cloudflare R2, compte HAY2010 | Jeton `[●]` | Délégué | Capture du bucket + jetons (noms, portées) |
| 8 | **R2 `hay2010-backups`** (sauvegardes privées) | SOCIETE HAY 2010 | Cloudflare R2, compte HAY2010 | Jeton écriture (Coolify) + jeton lecture seule (surveillance CI) `[●]` | Délégué | Capture du bucket + jetons (noms, portées) |
| 9 | **Sauvegardes** — planification et rétention | SOCIETE HAY 2010 (les données) ; exploitation déléguée | Coolify → base `hay2010-postgres` → *Backups* + workflow GitHub `backup.yml` | `[●]` | Administrateur | Capture de la planification, de la rétention et du premier objet dans R2 |
| 10 | **Dépôt GitHub** `mustaphaelou/hay2010website` | **Développeur pour l’instant ; HAY2010 à la remise** | GitHub (dépôt public) | Organisation/compte : `[●]` ; administrateurs : `[●]` | Administrateur | Capture des collaborateurs et des secrets/variables (noms seulement) |
| 11 | **Image GHCR** `ghcr.io/mustaphaelou/hay2010website` | Dépend du compte GitHub ci-dessus | GitHub Packages | Jeton lecture pour le VPS `[●]` | Délégué | Capture du paquet et du jeton en lecture seule |
| 12 | **Messagerie** `@hay2010.ma` (MX, SPF, DKIM, autodiscover, boîtes) | SOCIETE HAY 2010 | Hébergeur mail existant **HeberjaHiz** (`mail.hay2010.ma`, cPanel) — l’hébergement mail ne bouge pas | Compte cPanel : `[●]` | Support technique délégué | Capture des boîtes et des enregistrements DNS mail |
| 13 | **Boîtes mail** : `contact@`, `donnees@`, `recrutement@` (publique après F-113), `no-reply@` (technique, jamais publique) | SOCIETE HAY 2010 | HeberjaHiz | Propriétaire du cPanel : `[●]` | Accès de support | Tests d’envoi/réception joints (`contenu-attendu.md`) |
| 14 | **Comptes Payload `/admin`** | SOCIETE HAY 2010 (comptes de la société) | Base Postgres, admin `https://hay2010.ma/admin` | Voir §3 | Compte « Développeur » délégué | Capture de la liste des comptes (sans mot de passe) |
| 15 | **Gestionnaire de mots de passe** (secrets, codes de récupération, 2FA) | SOCIETE HAY 2010 | `[●]` (nom du coffre, hors dépôt) | Propriétaire : `[●]` ; accès développeur : `[●]` | Délégué | Capture des entrées (noms seulement) |

## 3. Comptes à énumérer (liste exacte à compléter)

**Comptes d’administration du site (Payload) :**

| Compte | Rôle | Titulaire | Adresse de connexion | MFA / récupération |
|---|---|---|---|---|
| `[●]` | **Éditeur** (propriétaire) | HAY2010 | `[●]` | Pas de 2FA à ce stade ; mot de passe dans le coffre |
| `[●]` | **Développeur** | Développeur (délégué) | `[●]` | Idem |
| `[●]` | **Contributeur** (optionnel, inutilisé au lancement) | HAY2010 | `[●]` | Idem |

> Le back-office n’a **pas** de double authentification et **pas** de réinitialisation de mot de passe
> par e-mail à ce jour : le mot de passe est donc un actif critique. Une perte de mot de passe se
> règle par le développeur depuis la collection **Comptes** ; le propriétaire peut changer le sien
> lui-même (**Compte** → **Changer le mot de passe**).

**Comptes d’infrastructure (mêmes lignes que le tableau §2) :** registraire NINDO, Cloudflare
(compte + zone + Access + R2), fournisseur VPS, Coolify, hébergeur mail HeberjaHiz, GitHub (dépôt,
Actions, paquets), gestionnaire de mots de passe. Pour chacun : titulaire, identifiant de connexion,
MFA activée ou non, moyen de récupération, où vit le secret.

## 4. Accès délégué du développeur

- Pendant la construction et la première mise en ligne, le développeur détient un accès
  **administrateur délégué** aux actifs listés §2, dans le seul but de construire, déployer, sauvegarder
  et maintenir le site.
- Cet accès ne vaut **pas** transfert de propriété : le titulaire reste SOCIETE HAY 2010 (sauf la ligne
  VPS et le dépôt GitHub, explicitement « en cours » au §2, et pour lesquels un accord écrit est joint).
- À la remise : le propriétaire devient titulaire des comptes, le développeur conserve un accès délégué
  nommé. Les accès non nécessaires sont retirés.
- **Révocation :** le propriétaire peut demander par écrit le retrait de tout accès délégué ; le
  développeur le retire sous 5 jours ouvrés, après remise des exports nécessaires.
- **Rotation à la remise** (à cocher et dater) : jeton API Coolify, jeton lecture GHCR, jetons R2,
  secrets GitHub Actions, liste d’accès Cloudflare, mots de passe des comptes d’administration.

## 5. Sauvegardes et sortie (exit path)

- Sauvegarde quotidienne de la base vers un stockage objet hors VPS ; versionnage des médias ; test de
  restauration enregistré (`docs/ops/runbook.md` §5).
- **Sortie possible sans le développeur** : export du contenu (`pg_dump` / JSON Payload), médias depuis
  R2, zone DNS (export des enregistrements), dépôt GitHub et images d’application. La procédure est
  décrite dans le runbook ; elle doit rester utilisable par un second opérateur seul.
- Les sauvegardes ne contiennent **pas** de données de contact ou de candidature : le site P1 n’en
  collecte pas (pas de formulaire, pas de CV).

## 6. Ce que ce modèle ne prouve pas encore

- Il n’est **pas signé** et peut contenir des lignes « en cours » : la propriété effective n’est
  acquise qu’après vérification des pièces listées §2 et signature §7.
- Il ne prouve pas que les mots de passe ont été changés, ni que la 2FA est active sur les comptes
  d’infrastructure (elle doit l’être avant lancement).
- Il ne remplace pas les contrats fournisseurs (registraire, VPS, mail) ni la politique de
  confidentialité ; il les référence.
- Les noms des contacts d’incident ne sont pas dans le dépôt : ils figurent dans la fiche complétée,
  conservée hors du dépôt, et repris dans `docs/ops/runbook.md` §1 (placeholders à remplir).

## 7. Signature et date

Fait à `[●]`, le `[●]`.

| Partie | Nom, fonction | Signature |
|---|---|---|
| **SOCIETE HAY 2010** (propriétaire) | `[●]` | |
| **Développeur** (accès délégué) | `[●]` | |

**Annexes à joindre :** captures des comptes (titulaire, rôles, MFA), preuve de pouvoirs du signataire
HAY2010, accord d’hébergement/exploitation si le VPS reste chez le développeur, liste de rotation datée,
tests d’envoi/réception des boîtes mail.

> Après signature : remettre une copie au propriétaire, conserver l’original hors du dépôt, et reporter
> les seuls **noms et coordonnées de contact** dans `docs/ops/runbook.md` §1 (jamais les secrets).
