# Guide d'onboarding — Manssuétude CMS

> Bienvenue dans le projet. Ce guide te donne tout ce qu'il faut pour comprendre, installer et contribuer au CMS de Manssuétude.

---

## 1. Comprendre le projet

Manssuétude est une association et plateforme intellectuelle. Le CMS aide l'équipe à publier, organiser, relier et administrer ses contenus : pages publiques, productions, thèmes, projets, activités, ressources, médias et formulaires.

Le produit doit être **simple** pour une équipe interne de 5 à 8 personnes. L'architecture peut être robuste, mais l'interface ne doit jamais devenir technique ou intimidante.

**État actuel :**

| Statut | Description |
|---|---|
| ✅ Existant | Next.js, routes publiques, admin, API routes, Supabase, repositories, services, seed, documentation Phase 0 |
| 🗂 Existant temporaire | Ancien prototype vanilla à la racine |
| 🔜 Prévu | CRUD admin plus complet, workflows éditoriaux, intégration Google Drive finalisée, composants UI centralisés |
| ⛔ À éviter maintenant | Développer de nouvelles fonctionnalités avant la fin de la stabilisation Phase 0 |

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

**Le CMS est orienté entités :** thèmes, productions, activités, projets, ressources, médias, pages, formulaires.

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

| Domaine | Technologie |
|---|---|
| Framework | Next.js / React / TypeScript |
| API | Route Handlers Next.js |
| Base de données | Supabase / PostgreSQL |
| Stockage médias | Supabase Storage |
| Styles | CSS propriétaire dans `src/styles/globals.css` |
| Tokens design | `src/config/designTokens.ts` |
| Emails | Resend (prévu) |
| Google Drive | Picker/OAuth préparé, à finaliser |
| Déploiement | Vercel |

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

**Pour créer l'admin initial via seed :**
- `ADMIN_INITIAL_EMAIL`
- `ADMIN_INITIAL_PASSWORD`

Google Drive et Resend peuvent rester vides tant que l'intégration complète n'est pas travaillée.

---

## 7. Lancer le projet

| Commande | Description |
|---|---|
| `npm run dev` | Développement (localhost:3000) |
| `npm run typecheck` | Validation TypeScript |
| `npm run build` | Build production |
| `npm run test` | Tests d'architecture |

---

## 8. Base de données et Supabase

**Fichiers SQL :**

| Fichier | Contenu |
|---|---|
| `supabase/schema.sql` | Tables principales |
| `supabase/storage.sql` | Buckets médias |
| `supabase/cms-advanced.sql` | Tables avancées CMS |

**Ordre recommandé dans Supabase SQL Editor :**

1. `supabase/schema.sql`
2. `supabase/storage.sql`
3. `supabase/cms-advanced.sql`

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

```
src/
  app/           routes Next.js, pages, layouts, API routes
  components/    composants UI
  repositories/  accès données et mapping DB
  services/      logique métier
  lib/           auth, env, db, validation, erreurs, permissions
  types/         types CMS et DB
  config/        tokens et configuration non secrète
  constants/     constantes métier
  hooks/         hooks React réutilisables
  utils/         helpers génériques
docs/            documentation projet
```

**Flux recommandé :**

```
UI → service → repository → database
API route → validation → service/repository → response
```

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

| Type de fichier | Emplacement |
|---|---|
| Nouvelle page publique | `src/app/(public)/...` |
| Nouvelle page admin | `src/app/admin/...` |
| Nouveau composant | `src/components/...` selon son rôle |
| Nouveau repository | `src/repositories/...Repository.ts` |
| Nouveau service | `src/services/...Service.ts` |
| Nouveau type global | `src/types/...` ou `src/types/cms.ts` |
| Nouvelle constante métier | `src/constants/...` |

---

## 13. Workflow Git

**Branches recommandées :**

| Branche | Usage |
|---|---|
| `main` | Version stable |
| `develop` | Intégration |
| `feature/*` | Fonctionnalité |
| `fix/*` | Correction |
| `chore/*` | Maintenance ou documentation |

**Préfixes de commits :** `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

**Une PR doit contenir :**
- Objectif
- Fichiers ou modules touchés
- Validations exécutées
- Risques
- Captures si l'UI change
- Notes DB si un schéma change

---

## 14. Checklist avant PR

**Minimum obligatoire :**

```bash
npm run typecheck
npm run build
```

**Selon le changement :**
- `npm run test` — si architecture, conventions ou règles critiques
- `npm run format:check` — si beaucoup de fichiers sont touchés
- Vérification visuelle locale — si UI modifiée
- Documentation mise à jour — si convention, architecture, DB ou workflow changent

**Checklist mentale :**

- [ ] Ai-je respecté la séparation UI / service / repository ?
- [ ] Ai-je évité les chemins relatifs profonds ?
- [ ] Ai-je évité `any` ?
- [ ] Ai-je gardé les fichiers legacy intacts si ce n'était pas le sujet ?
- [ ] Ai-je documenté la dette restante ?

---

## 15. Erreurs fréquentes

> Ces erreurs ont toutes déjà été commises — évite-les.

- Appeler Supabase dans un composant
- Ajouter une route API sans validation
- Modifier `content.js` comme si c'était encore la source durable du CMS
- Supprimer `index.html`, `app.js`, `content.js` ou `styles.css` pendant la Phase 0
- Créer une variante visuelle hors design system
- Ajouter une librairie UI lourde sans décision collective
- Masquer une dette technique au lieu de la documenter
- Mélanger textes éditoriaux et logique de rendu
- Créer une page pour chaque micro-section
- Lancer une fonctionnalité produit pendant une tâche de consolidation

---

## 16. Glossaire Manssuétude

| Terme | Définition |
|---|---|
| **Thème** | Grand axe intellectuel ou dossier de réflexion. Un thème peut relier productions, activités, projets et ressources. |
| **Sujet du moment** | Thème ou angle éditorial actuellement mis en avant sur la homepage. |
| **Activité** | Format collectif : séance, débat, atelier, discussion, visite, formation ou rencontre. Une activité peut produire des ressources ou des comptes-rendus. |
| **Production** | Contenu éditorial publié : article, note, synthèse, vidéo, podcast, infographie, compte-rendu, carrousel ou rapport. |
| **Ressource** | Fichier ou contenu réutilisable : PDF, document, image, vidéo, audio, lien externe, kit ou support. |
| **Projet** | Initiative Manssuétude structurée. Un projet peut être interne, éditorial, communautaire ou externe. |
| **Contribution externe** | Proposition envoyée par une personne extérieure ou non-admin : contenu, projet, partenariat, candidature ou soutien. |
| **Formulaire** | Point d'entrée contrôlé via CTA. Les formulaires ne doivent pas s'afficher automatiquement dans les pages. |
| **Homepage Builder** | Interface d'administration permettant de composer la page d'accueil avec des blocs verrouillés. |
| **Admin** | Utilisateur ayant accès à la gestion complète du CMS. |
| **Éditeur** | Utilisateur pouvant gérer les contenus et médias selon les permissions accordées. |
| **Contributeur** | Utilisateur ou personne pouvant proposer un contenu, un projet ou une participation, sans accès complet au CMS. |
| **PERCA** | Méthode Manssuétude : Penser, Exprimer, Relier, Concrétiser, Ancrer. PERCA est un cadre de travail, pas une entité séparée du projet. |
