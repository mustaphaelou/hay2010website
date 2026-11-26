# Remise HAY2010 — dossier de livraison

**Objet :** les documents de la remise du site P1 (ticket #34) : formation, guide de l’éditeur, fiche de
propriété, contenus attendus, et comment vérifier soi-même ce qui est livré.

**Règle de lecture :** le dépôt prouve le **logiciel** ; il ne prouve pas les **personnes**. Une séance
de formation non tenue, une fiche non signée ou une déclaration CNDP non déposée restent **à faire**
même si tous les tests passent. Le tableau §3 sépare les deux.

## 1. Les documents

| Document | Pour qui | Contenu |
|---|---|---|
| [`guide-editeur.md`](guide-editeur.md) | Propriétaire du contenu (compte Éditeur) | Une page : connexion, modifier/publier/dépublier, photos et droits, pages fermées, limites, qui appeler |
| [`formation.md`](formation.md) | Propriétaire + développeur | Plan de la séance de 2 h (agenda, ateliers), check-list d’acceptation, fiche de séance et signature, suivi |
| [`ownership.md`](ownership.md) | Propriétaire + développeur + conseil | **Modèle** de fiche de propriété et d’accès (domaine, DNS, hébergement, sauvegardes, comptes, signature) |
| [`contenu-attendu.md`](contenu-attendu.md) | Propriétaire | Ce qu’il reste à fournir, par palier P1/P2/P3 : preuves, barrières débloquées, où c’est enregistré |
| [`../ops/runbook.md`](../ops/runbook.md) | Opérateur / second opérateur | Exploitation : identité, environnements, variables, déploiement, sauvegardes, restauration, incidents |
| [`../ops/deploy.md`](../ops/deploy.md) | Opérateur | Procédure de déploiement et de retour arrière (CI → GHCR → Coolify) |
| [`../ops/external-steps.md`](../ops/external-steps.md) | Opérateur | Ce qui ne s’exécute pas depuis le dépôt (VPS, DNS, Access, R2) |
| [`../build/cms.md`](../build/cms.md) | Développeur | Back-office : modèle de contenu, rôles, droits des médias, seed, migrations, limites |
| [`../build/p1-audit.md`](../build/p1-audit.md) | Tous | **Rapport d’audit P1** (ticket #33) : parité fixtures/CMS, clavier, motion, breakpoints, budgets, claims. *Attendu en parallèle du #34 : si le fichier n’existe pas encore, l’audit n’est pas livré — ne pas le considérer comme fait.* |

Références de décision utiles : `docs/content/content-model.md` (modèle et rôles),
`docs/company/facts-register.md` (faits publiables et actions propriétaire),
`docs/legal/cndp-filings-launch-compliance.md` (déclarations et jalons de lancement),
`docs/cdc/deviation-register.md` (écarts en attente de sign-off),
`docs/hosting/deployment-decision.md` (hébergement et propriété).

## 2. Comment vérifier la remise (depuis un dépôt propre)

Prérequis : Node 26, npm 11, Docker disponible, un checkout propre du dépôt.

### 2.1 Le gate du dépôt (aucune base de données)

```bash
npm ci
rm -rf .next
npm run typecheck
npm run lint
TEST_HTTP_PORT=3134 npm test        # 6 scénarios, ~7 min (construit et sert l’app)
```

Pour itérer sans reconstruire : `SKIP_BUILD=1 TEST_HTTP_SCENARIO=p1 npm test`.
Vérifications d’exploitation : `npm run check:ops` ; répétition de sauvegarde/restauration :
`npm run rehearse:backup`.

### 2.2 Le site public en local (source de contenu « fixture », sans base)

```bash
rm -rf .next && npm run build
npm run start -- -p 3134            # http://127.0.0.1:3134
```

Contrôles attendus : les pages P1 répondent 200 ; les rubriques fermées répondent 404 ; `/en` répond 404 ;
aucun formulaire, aucune bannière, aucun script d’analyse. C’est le corpus que le gate teste.

### 2.3 Le back-office en local (Payload + Postgres, mode CMS)

```bash
docker run -d --rm --name hay2010-pg-34 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hay2010 -p 5534:5432 postgres:16-alpine
export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5534/hay2010
export PAYLOAD_SECRET=dev-only-not-a-secret
npm run migrate
npm run seed
CONTENT_SOURCE=cms npm run build
CONTENT_SOURCE=cms npm run start -- -p 3134   # admin : http://127.0.0.1:3134/admin
```

- L’admin local est **développement uniquement** : les comptes seed sont
  `developpeur@hay2010.test` (Développeur), `proprietaire@hay2010.test` (Éditeur),
  `contributeur@hay2010.test` (Contributeur), mot de passe `hay2010-dev-only` sauf
  `CMS_SEED_PASSWORD`. **Ce ne sont pas les identifiants de production.**
- Vérifier : le tableau de bord affiche les barrières de publication et les constantes code-owned ;
  une modification de texte publiée apparaît sans reconstruction ; dépublier une page la fait répondre
  404 (le contenu reste dans l’admin) ; publier une page avec une image non « Validés » est refusé.

### 2.4 L’acceptation CMS complète (base jetable, parité incluse)

```bash
npm run test:cms
```

Le script crée une base Postgres jetable (`hay2010-pg-30`, port 5530), applique les migrations depuis
zéro, seed, construit les deux modes (fixture puis CMS), compare la matrice de routes P1, exécute la
suite `tests/cms/**`, puis nettoie. Il ne remplace pas le gate ; les deux sont complémentaires.

### 2.5 Où vit l’admin

| Environnement | URL | Accès |
|---|---|---|
| Production (après lancement) | `https://hay2010.ma/admin` | compte Éditeur / Développeur |
| Staging | `https://staging.hay2010.ma/admin` | Cloudflare Access (e-mails autorisés) puis compte Payload |
| Local | `http://127.0.0.1:3134/admin` | comptes de développement ci-dessus |

Les identifiants de production ne sont **jamais** dans le dépôt : voir `ownership.md` (gestionnaire de
mots de passe, accès délégué) et `docs/ops/runbook.md` §1 et §3.

## 3. Statut de la remise — dépôt vs humain

| Élément | État |
|---|---|
| Site P1, contenu seedé, gates, SEO, sitemap, 404, redirections | **Livré dans le dépôt** (gate HTTP vert) |
| Back-office Payload : rôles, brouillons, publier/dépublier, droits médias, barrières visibles | **Livré dans le dépôt** (vérifié par `npm run test:cms`) |
| Guide de l’éditeur, plan de formation, modèle de propriété, checklist contenu | **Livré dans le dépôt** (ce dossier) |
| Runbook, déploiement, retour arrière, sauvegardes, restauration | **Livré dans le dépôt** (procédures) ; exécution réelle sur le staging/production **à faire** |
| Séance de formation de 2 h **enregistrée** + sign-off du propriétaire | **À faire (humain)** — `formation.md` §6 |
| Fiche de propriété **signée** + transfert/rotation des accès | **À faire (humain/juridique)** — `ownership.md` |
| Déploiement réel sur staging et vérifications externes | **À faire (opérateur)** — `docs/ops/external-steps.md` |
| Déclarations CNDP F-211 / F-113 / F-214 / F-118 | **À faire (propriétaire + conseil)** |
| Contenus et preuves du propriétaire (RC, ONEE, permissions, boîtes mail, offres) | **À faire (propriétaire)** — `contenu-attendu.md` |
| Sign-off du structeur sur le registre des écarts | **À faire** — `docs/cdc/deviation-register.md` |
| Audit P1 (ticket #33) | **Attendu** — `docs/build/p1-audit.md` |

La liste consolidée des actions humaines restantes est aussi tenue dans
[`docs/ops/runbook.md`](../ops/runbook.md) §8 « Reste à faire côté HAY2010 / opérateur ».

## 4. Ordre de lecture conseillé

1. `guide-editeur.md` (le propriétaire) ;
2. `formation.md` (organiser et signer la séance) ;
3. `ownership.md` (faire signer, ranger hors dépôt) ;
4. `contenu-attendu.md` (prioriser les preuves) ;
5. `docs/ops/runbook.md` + `docs/ops/deploy.md` (l’opérateur qui reprend la technique).
