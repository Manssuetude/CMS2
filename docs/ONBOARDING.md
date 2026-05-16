# Developer Onboarding — Manssuétude CMS

## 1. Comprendre le projet

Manssuétude est une association et plateforme intellectuelle. Le CMS doit aider l’équipe à publier, organiser, relier et administrer ses contenus : pages publiques, productions, thèmes, projets, activités, ressources, médias et formulaires.

Le produit doit être simple pour une équipe interne de 5 à 8 personnes. L’architecture peut être robuste, mais l’interface ne doit jamais devenir technique ou intimidante.

État actuel :

- existant : Next.js, routes publiques, admin, API routes, Supabase, repositories, services, seed, documentation Phase 0 ;
- existant temporaire : ancien prototype vanilla à la racine ;
- prévu : CRUD admin plus complet, workflows éditoriaux, intégration Google Drive finalisée, composants UI centralisés ;
- à éviter maintenant : développer de nouvelles fonctionnalités avant la fin de la stabilisation Phase 0.

## 2. Ce que nous construisons

Nous construisons un CMS éditorial sur-mesure :

- vitrine publique Manssuétude ;
- plateforme éditoriale ;
- médiathèque ;
- bibliothèque de ressources ;
- espace contributif ;
- administration visuelle ;
- base pour une mémoire collective.

Le CMS est orienté entités :

- thèmes ;
- productions ;
- activités ;
- projets ;
- ressources ;
- médias ;
- pages ;
- formulaires.

## 3. Ce que nous ne construisons pas

Nous ne construisons pas :

- une usine à pages ;
- un WordPress générique ;
- un Notion complet ;
- un ERP ;
- un outil de gestion d’association exhaustif ;
- un système où l’admin peut casser librement les layouts ;
- une application surchargée de paramètres visibles.

Le bon compromis : complexité interne, simplicité externe.

## 4. Stack technique

- Next.js / React / TypeScript ;
- Route Handlers Next.js pour l’API ;
- Supabase / PostgreSQL ;
- Supabase Storage pour les médias ;
- CSS propriétaire dans `src/styles/globals.css` ;
- tokens dans `src/config/designTokens.ts` ;
- Resend prévu pour les emails ;
- Google Drive Picker/OAuth préparé mais encore à finaliser ;
- Vercel comme cible de déploiement.

## 5. Installation

Pré-requis :

- Node.js installé ;
- accès au dépôt ;
- accès aux variables Supabase si le travail touche la base.

Installation :

```bash
npm install
cp .env.example .env.local
```

Ne pas versionner `.env.local`.

## 6. Variables d’environnement

Variables disponibles dans `.env.example` :

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

Minimum pour travailler avec Supabase :

- `NEXT_PUBLIC_SUPABASE_URL` ;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ;
- `SUPABASE_SERVICE_ROLE_KEY`.

Pour créer l’admin initial via seed :

- `ADMIN_INITIAL_EMAIL` ;
- `ADMIN_INITIAL_PASSWORD`.

Google Drive et Resend peuvent rester vides tant que l’intégration complète n’est pas travaillée.

## 7. Lancer le projet

Développement :

```bash
npm run dev
```

Validation TypeScript :

```bash
npm run typecheck
```

Build production :

```bash
npm run build
```

Tests d’architecture :

```bash
npm run test
```

Le site démarre généralement sur `http://localhost:3000`.

## 8. Base de données et Supabase

Les fichiers SQL sont :

- `supabase/schema.sql` : tables principales ;
- `supabase/storage.sql` : buckets médias ;
- `supabase/cms-advanced.sql` : tables avancées CMS.

Ordre recommandé dans Supabase SQL Editor :

1. `supabase/schema.sql`
2. `supabase/storage.sql`
3. `supabase/cms-advanced.sql`

Vérification :

```bash
npm run db:check
```

Règle importante : les requêtes Supabase doivent rester dans `src/repositories` ou dans les helpers d’infrastructure de `src/lib`.

## 9. Seed initial

Le seed importe les données initiales depuis `content.js`.

Commande :

```bash
npm run seed
```

Script concerné :

- `scripts/seed.mjs`.

Le seed peut importer :

- pages ;
- médias ;
- thèmes ;
- productions ;
- activités ;
- projets ;
- ressources ;
- footer ;
- homepage ;
- paramètres ;
- admin initial si les variables admin sont définies.

Important : `content.js` est une source de migration, pas la source durable du front public.

## 10. Architecture

Arborescence principale :

```text
src/
  app/
  components/
  repositories/
  services/
  lib/
  types/
  config/
  constants/
  hooks/
  styles/
  utils/
docs/
scripts/
supabase/
```

Responsabilités :

- `src/app` : routes Next.js, pages, layouts, API routes ;
- `src/components` : composants UI ;
- `src/repositories` : accès données et mapping DB ;
- `src/services` : logique métier ;
- `src/lib` : auth, env, db, validation, erreurs, permissions ;
- `src/types` : types CMS et DB ;
- `src/config` : tokens et configuration non secrète ;
- `src/constants` : constantes métier ;
- `src/hooks` : hooks React réutilisables ;
- `src/utils` : helpers génériques ;
- `docs` : documentation projet.

Flux recommandé :

```text
UI → service → repository → database
API route → validation → service/repository → response
```

## 11. Modules principaux

Pages publiques :

- dossier : `src/app/(public)` ;
- composant de rendu page : `src/components/public/PublicPage.tsx` ;
- pages détail : `src/components/public/DetailPage.tsx`.

Admin :

- routes : `src/app/admin` ;
- sidebar : `src/components/admin/AdminSidebar.tsx` ;
- tables : `src/components/admin/AdminTable.tsx` ;
- studio éditorial : `src/components/admin/EditorStudio.tsx`.

Médias :

- composants : `src/components/media` ;
- repository : `src/repositories/mediaRepository.ts` ;
- services : `src/services/mediaService.ts`, `src/services/mediaClientService.ts` ;
- stockage : `src/lib/media.ts`.

Formulaires :

- composants : `src/components/forms` ;
- constantes : `src/constants/forms.ts` ;
- repositories : `src/repositories/formRepository.ts`, `src/repositories/formsRepository.ts` ;
- service client : `src/services/formClientService.ts`.

Contenus :

- repositories : `src/repositories/themesRepository.ts`, `productionsRepository.ts`, `projectsRepository.ts`, `activitiesRepository.ts`, `resourcesRepository.ts` ;
- types : `src/types/cms.ts` ;
- relations : `src/services/relationService.ts`, `src/services/graphService.ts`.

Design :

- tokens : `src/config/designTokens.ts` ;
- CSS global : `src/styles/globals.css` ;
- documentation : `docs/DESIGN_SYSTEM.md`.

## 12. Règles de développement

À respecter :

- utiliser `@/` pour les imports internes ;
- garder les composants sans accès direct Supabase ;
- placer la logique métier dans `src/services` ;
- placer les requêtes DB dans `src/repositories` ;
- typer les props et les retours publics ;
- éviter `any` ;
- ne pas dupliquer les types ou mappings ;
- documenter toute exception structurante.

Avant d’ajouter un fichier :

- nouvelle page publique : `src/app/(public)/...` ;
- nouvelle page admin : `src/app/admin/...` ;
- nouveau composant : `src/components/...` selon son rôle ;
- nouveau repository : `src/repositories/...Repository.ts` ;
- nouveau service : `src/services/...Service.ts` ;
- nouveau type global : `src/types/...` ou `src/types/cms.ts` si domaine CMS ;
- nouvelle constante métier : `src/constants/...`.

## 13. Workflow Git

Branches recommandées :

- `main` : version stable ;
- `develop` : intégration ;
- `feature/*` : fonctionnalité ;
- `fix/*` : correction ;
- `chore/*` : maintenance ou documentation.

Préfixes de commits :

- `feat:` ;
- `fix:` ;
- `refactor:` ;
- `docs:` ;
- `test:` ;
- `chore:`.

Une PR doit contenir :

- objectif ;
- fichiers ou modules touchés ;
- validations exécutées ;
- risques ;
- captures si l’UI change ;
- notes DB si un schéma change.

## 14. Checklist avant PR

Minimum :

- `npm run typecheck` ;
- `npm run build`.

Selon le changement :

- `npm run test` si architecture, conventions ou règles critiques ;
- `npm run format:check` si beaucoup de fichiers sont touchés ;
- vérification visuelle locale si UI modifiée ;
- documentation mise à jour si convention, architecture, DB ou workflow changent.

Checklist mentale :

- ai-je respecté la séparation UI / service / repository ?
- ai-je évité les chemins relatifs profonds ?
- ai-je évité `any` ?
- ai-je gardé les fichiers legacy intacts si ce n’était pas le sujet ?
- ai-je documenté la dette restante ?

## 15. Erreurs fréquentes

À éviter :

- appeler Supabase dans un composant ;
- ajouter une route API sans validation ;
- modifier `content.js` comme si c’était encore la source durable du CMS ;
- supprimer `index.html`, `app.js`, `content.js` ou `styles.css` pendant la Phase 0 ;
- créer une variante visuelle hors design system ;
- ajouter une librairie UI lourde sans décision collective ;
- masquer une dette technique au lieu de la documenter ;
- mélanger textes éditoriaux et logique de rendu ;
- créer une page pour chaque micro-section ;
- lancer une fonctionnalité produit pendant une tâche de consolidation.

## 16. Glossaire Manssuétude

Thème :

Grand axe intellectuel ou dossier de réflexion. Un thème peut relier productions, activités, projets et ressources.

Sujet du moment :

Thème ou angle éditorial actuellement mis en avant sur la homepage.

Activité :

Format collectif : séance, débat, atelier, discussion, visite, formation ou rencontre. Une activité peut produire des ressources ou des comptes-rendus.

Production :

Contenu éditorial publié : article, note, synthèse, vidéo, podcast, infographie, compte-rendu, carrousel ou rapport.

Ressource :

Fichier ou contenu réutilisable : PDF, document, image, vidéo, audio, lien externe, kit ou support.

Projet :

Initiative Manssuétude structurée. Un projet peut être interne, éditorial, communautaire ou externe.

Contribution externe :

Proposition envoyée par une personne extérieure ou non-admin : contenu, projet, partenariat, candidature ou soutien.

Formulaire :

Point d’entrée contrôlé via CTA. Les formulaires ne doivent pas s’afficher automatiquement dans les pages.

Homepage Builder :

Interface d’administration permettant de composer la page d’accueil avec des blocs verrouillés.

Admin :

Utilisateur ayant accès à la gestion complète du CMS.

Éditeur :

Utilisateur pouvant gérer les contenus et médias selon les permissions accordées.

Contributeur :

Utilisateur ou personne pouvant proposer un contenu, un projet ou une participation, sans accès complet au CMS.

PERCA :

Méthode Manssuétude : Penser, Exprimer, Relier, Concrétiser, Ancrer. PERCA est un cadre de travail, pas une entité séparée du projet.
