# Guide d'onboarding — Manssuétude CMS

> Bienvenue dans le projet. Ce guide te donne tout ce qu'il faut pour comprendre, installer et contribuer au CMS de Manssuétude.

---

## 1. Comprendre le projet

Manssuétude est une association et plateforme intellectuelle. Le CMS aide l'équipe à publier, organiser, relier et administrer ses contenus : pages publiques, productions, thèmes, projets, activités, ressources, médias et formulaires.

Le produit doit être **simple** pour une équipe interne de 5 à 8 personnes. L'architecture peut être robuste, mais l'interface ne doit jamais devenir technique ou intimidante.

**État actuel :**

| Statut                 | Description                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| ✅ Existant            | Next.js, routes publiques, admin, API routes, Supabase, repositories, services, seed, documentation Phase 0  |
| 🗂 Existant temporaire | Ancien prototype vanilla à la racine                                                                         |
| 🔜 Prévu               | CRUD admin plus complet, workflows éditoriaux, intégration Google Drive finalisée, composants UI centralisés |
| ⛔ À éviter maintenant | Développer de nouvelles fonctionnalités avant la fin de la stabilisation Phase 0                             |

---

## 2. Ce que nous construisons

Nous construisons un **CMS éditorial sur-mesure** :

- Vitrine publique Manssuétude
- Plateforme éditoriale
- Médiathèque
- Bibliothèque de ressources
- Espace contributif
- Administration visuelle
- Base pour une mémoire collective

**Le CMS est orienté entités.** Voir [`docs/CMS.md`](CMS.md) pour le détail des entités, statuts et comportements.

---

## 3. Ce que nous ne construisons pas

> Le bon compromis : **complexité interne, simplicité externe.**

Nous ne construisons pas :

- Une usine à pages
- Un WordPress générique
- Un Notion complet
- Un ERP
- Un outil de gestion d'association exhaustif
- Un système où l'admin peut casser librement les layouts
- Une application surchargée de paramètres visibles

---

## 4. Stack technique

| Domaine         | Technologie                                    |
| --------------- | ---------------------------------------------- |
| Framework       | Next.js / React / TypeScript                   |
| API             | Route Handlers Next.js                         |
| Base de données | Supabase / PostgreSQL                          |
| Stockage médias | Supabase Storage                               |
| Styles          | CSS propriétaire dans `src/styles/globals.css` |
| Tokens design   | `src/config/designTokens.ts`                   |
| Emails          | Resend (prévu)                                 |
| Google Drive    | Picker/OAuth préparé, à finaliser              |
| Déploiement     | Vercel                                         |

---

## 5. Installation

**Pré-requis :**

- Node.js installé
- Accès au dépôt
- Accès aux variables Supabase si le travail touche la base

**Installation :**

```bash
npm install
cp .env.example .env.local
```

> Ne pas versionner `.env.local`.

---

## 6. Variables d'environnement

```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_API_KEY=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
ADMIN_INITIAL_EMAIL=
ADMIN_INITIAL_PASSWORD=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Minimum pour travailler avec Supabase :**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Comment obtenir les clés Supabase

1. Se connecter sur [supabase.com/dashboard](https://supabase.com/dashboard). Si tu n'as pas accès au projet, demander une invitation à un membre de l'équipe.
2. Ouvrir le projet **Manssuétude**.
3. Aller dans **Settings** (roue dentée en bas à gauche) → **API**.
4. Récupérer :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` (forme `https://<REF>.supabase.co`)
   - clé **publique** (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - clé **secrète** (`sb_secret_…`) → `SUPABASE_SERVICE_ROLE_KEY`
5. Coller ces valeurs dans `.env.local`, puis redémarrer `npm run dev` (les variables ne sont lues qu'au démarrage).

> ⚠️ La clé secrète contourne toutes les règles RLS : ne jamais l'exposer côté client ni la committer. `.env.local` est déjà dans `.gitignore`.
>
> Astuce : l'URL du projet se déduit de l'adresse du dashboard `https://supabase.com/dashboard/project/<REF>` → `https://<REF>.supabase.co`.

> **Attention aux valeurs vides :** ne pas laisser une variable validée à vide (ex. `ADMIN_INITIAL_EMAIL=`). Le schéma `src/lib/env.ts` exige un e-mail / une URL valide, et une chaîne vide déclenche une `ZodError` au démarrage. Soit on renseigne la valeur, soit on retire complètement la ligne pour qu'elle reste `undefined`.

**Pour créer l'admin initial via seed :**

- `ADMIN_INITIAL_EMAIL`
- `ADMIN_INITIAL_PASSWORD`

Google Drive et Resend peuvent rester vides tant que l'intégration complète n'est pas travaillée.

---

## 7. Lancer le projet

| Commande            | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Développement (localhost:3000) |
| `npm run typecheck` | Validation TypeScript          |
| `npm run build`     | Build production               |
| `npm run test`      | Tests d'architecture           |

---

## 8. Base de données et Supabase

Fichiers SQL, tables et règles d'accès : [`docs/DATABASE.md`](DATABASE.md#fichiers-sql).

**Vérification de la connexion :**

```bash
npm run db:check
```

> **Règle importante :** les requêtes Supabase doivent rester dans `src/repositories` ou dans les helpers d'infrastructure de `src/lib`.

---

## 9. Seed initial

Le seed importe les données initiales depuis `content.js` :

```bash
npm run seed
```

Script concerné : `scripts/seed.mjs`

**Le seed peut importer :** pages, médias, thèmes, productions, activités, projets, ressources, footer, homepage, paramètres, admin initial (si les variables admin sont définies).

> `content.js` est une source de migration, pas la source durable du front public.

---

## 10. Architecture

Voir [`ARCHITECTURE.md`](ARCHITECTURE.md) pour l'arborescence complète, les responsabilités de chaque dossier et les flux de données.

---

## 11. Modules principaux

**Pages publiques**

- Routes : `src/app/(public)`
- Rendu page : `src/components/public/PublicPage.tsx`
- Pages détail : `src/components/public/DetailPage.tsx`

**Admin**

- Routes : `src/app/admin`
- Sidebar : `src/components/admin/AdminSidebar.tsx`
- Tables : `src/components/admin/AdminTable.tsx`
- Studio éditorial : `src/components/admin/EditorStudio.tsx`

**Médias**

- Composants : `src/components/media`
- Repository : `src/repositories/mediaRepository.ts`
- Services : `src/services/mediaService.ts`, `src/services/mediaClientService.ts`
- Stockage : `src/lib/media.ts`

**Formulaires**

- Composants : `src/components/forms`
- Constantes : `src/constants/forms.ts`
- Repositories : `src/repositories/formRepository.ts`, `src/repositories/formsRepository.ts`
- Service client : `src/services/formClientService.ts`

**Contenus**

- Repositories : `themesRepository.ts`, `productionsRepository.ts`, `projectsRepository.ts`, `activitiesRepository.ts`, `resourcesRepository.ts`
- Types : `src/types/cms.ts`
- Relations : `src/services/relationService.ts`, `src/services/graphService.ts`

**Design**

- Tokens : `src/config/designTokens.ts`
- CSS global : `src/styles/globals.css`
- Documentation : [`docs/DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)

---

## 12. Règles de développement

**À respecter :**

- Utiliser `@/` pour les imports internes
- Garder les composants sans accès direct Supabase
- Placer la logique métier dans `src/services`
- Placer les requêtes DB dans `src/repositories`
- Typer les props et les retours publics
- Éviter `any`
- Ne pas dupliquer les types ou mappings
- Documenter toute exception structurante

**Avant d'ajouter un fichier :**

| Type de fichier           | Emplacement                           |
| ------------------------- | ------------------------------------- |
| Nouvelle page publique    | `src/app/(public)/...`                |
| Nouvelle page admin       | `src/app/admin/...`                   |
| Nouveau composant         | `src/components/...` selon son rôle   |
| Nouveau repository        | `src/repositories/...Repository.ts`   |
| Nouveau service           | `src/services/...Service.ts`          |
| Nouveau type global       | `src/types/...` ou `src/types/cms.ts` |
| Nouvelle constante métier | `src/constants/...`                   |

---

## 13. Workflow Git

Voir [`WORKFLOWS.md`](WORKFLOWS.md#branches) pour les branches, conventions de commits et format des PR.

---

## 13.1. Gestion de projet

Le travail de l'équipe est organisé sur **GitHub Projects** :

- **Board kanban** : [CMS2 — Development Board](https://github.com/users/manssuetude-2026/projects/1)
- **Issues** : [manssuetude-2026/CMS2/issues](https://github.com/manssuetude-2026/CMS2/issues)

Chaque tâche passe par une issue GitHub liée à un milestone, un label et une priorité. Voir [`COLLABORATION.md`](COLLABORATION.md) pour le détail complet du workflow.

---

## 14. Checklist avant PR

Voir [`QUALITY_GATES.md`](QUALITY_GATES.md#8-checklist-avant-pull-request) pour les commandes obligatoires et la checklist complète.

---

## 15. Erreurs fréquentes

Voir [`ARCHITECTURE.md`](ARCHITECTURE.md#7-anti-patterns-interdits) pour la liste complète des anti-patterns interdits.

---

## 16. Glossaire Manssuétude

| Terme                    | Définition                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thème**                | Grand axe intellectuel ou dossier de réflexion. Un thème peut relier productions, activités, projets et ressources.                                     |
| **Sujet du moment**      | Thème ou angle éditorial actuellement mis en avant sur la homepage.                                                                                     |
| **Activité**             | Format collectif : séance, débat, atelier, discussion, visite, formation ou rencontre. Une activité peut produire des ressources ou des comptes-rendus. |
| **Production**           | Contenu éditorial publié : article, note, synthèse, vidéo, podcast, infographie, compte-rendu, carrousel ou rapport.                                    |
| **Ressource**            | Fichier ou contenu réutilisable : PDF, document, image, vidéo, audio, lien externe, kit ou support.                                                     |
| **Projet**               | Initiative Manssuétude structurée. Un projet peut être interne, éditorial, communautaire ou externe.                                                    |
| **Contribution externe** | Proposition envoyée par une personne extérieure ou non-admin : contenu, projet, partenariat, candidature ou soutien.                                    |
| **Formulaire**           | Point d'entrée contrôlé via CTA. Les formulaires ne doivent pas s'afficher automatiquement dans les pages.                                              |
| **Homepage Builder**     | Interface d'administration permettant de composer la page d'accueil avec des blocs verrouillés.                                                         |
| **Admin**                | Utilisateur ayant accès à la gestion complète du CMS.                                                                                                   |
| **Éditeur**              | Utilisateur pouvant gérer les contenus et médias selon les permissions accordées.                                                                       |
| **Contributeur**         | Utilisateur ou personne pouvant proposer un contenu, un projet ou une participation, sans accès complet au CMS.                                         |
| **PERCA**                | Méthode Manssuétude : Penser, Exprimer, Relier, Concrétiser, Ancrer. PERCA est un cadre de travail, pas une entité séparée du projet.                   |

---

← [README.md](../README.md) · Suite → [ARCHITECTURE.md](ARCHITECTURE.md)
