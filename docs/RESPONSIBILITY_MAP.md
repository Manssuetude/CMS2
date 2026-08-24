# Responsibility Map — Manssuétude CMS

> Carte des responsabilités par couche. Chaque couche a une mission limitée et précise.

---

## 1. Principe général

Le projet doit rester lisible par plusieurs développeurs. Chaque couche a une responsabilité limitée : l'UI affiche, les services décident, les repositories accèdent aux données, `lib` porte l'infrastructure, `utils` porte les helpers génériques, `types` porte le langage commun du domaine.

> **Règle pratique :** si un fichier devient difficile à expliquer en une phrase, il doit être découpé.

---

## 2. Responsabilités des couches

Les règles et interdictions pour composants UI, repositories et services sont centralisées dans [`ARCHITECTURE.md`](ARCHITECTURE.md#3-responsabilité-des-dossiers).

---

## 5. Lib

Voir [`ARCHITECTURE.md`](ARCHITECTURE.md#srclib) pour le contenu et les règles de `src/lib`.

---

## 6. Utils

Voir [`ARCHITECTURE.md`](ARCHITECTURE.md#srcutils) pour la définition et les exemples de `src/utils`.

---

## 7. Types

Voir [`ARCHITECTURE.md`](ARCHITECTURE.md#srctypes) pour les règles de `src/types`.

---

## 8. Cas concrets du projet

### Themes / SubThemes

- **UI :** pages dans `src/app/(public)/themes`, admin dans `src/app/admin/themes` et `src/app/admin/sousthemes`
- **Repository :** `src/repositories/themeRepository.ts`, `src/repositories/subThemeRepository.ts`
- **Types :** `Theme`, `SubTheme` dans `src/types/cms.ts`
- **Services :** logique de relations/recommandations directement dans `themeRepository.ts`/`subThemeRepository.ts` (pas de service dédié aujourd'hui)

### Events (évènements datés)

- **UI :** `src/app/(public)/evenements`, admin dans `src/app/admin/evenements`
- **Repository :** `src/repositories/eventRepository.ts`
- **Types :** `Event` dans `src/types/cms.ts`
- **Services :** à créer seulement si des règles d'évènement apparaissent

Distinct du catalogue de formats d'animation (« Activités » côté produit — Fishbowl, débat, atelier…) : UI `src/app/(public)/activites`, admin `src/app/admin/formatsactivites`, repository `src/repositories/activityFormatRepository.ts`.

### Productions

- **UI :** `src/app/(public)/productions`, cards dans `src/components/cards`
- **Repository :** `src/repositories/productionRepository.ts`
- **Types :** `Production` et `ContentBlock` dans `src/types/cms.ts`
- **Services :** recommandations, SEO et relations

### Resources / Media

- **UI :** `src/app/(public)/ressources`, admin dans `src/components/media`
- **Repository :** `src/repositories/mediaRepository.ts`
- **Infrastructure storage :** `src/lib/media.ts`
- **Client action :** `src/services/mediaClientService.ts`
- **Types :** `Resource`/`Media` dans `src/types/cms.ts`

### Projects

- **UI :** `src/app/(public)/projets`, admin dans `src/app/admin/projets`
- **Repository :** `src/repositories/projectRepository.ts`
- **Types :** `Project` dans `src/types/cms.ts`
- **Services :** relations, recommandations, smart defaults

### Dossiers / Journal

- **UI :** `src/app/(public)/dossiers`, `src/app/(public)/journal`, admin dans `src/app/admin/dossiers`, `src/app/admin/journal`
- **Repository :** `src/repositories/dossierRepository.ts`, `src/repositories/journalRepository.ts`
- **Types :** `Dossier`, `DossierItem`, `JournalEntry` dans `src/types/cms.ts`
- **Helpers :** résolution des entrées de dossier dans `src/utils/dossierItems.ts`

À ne pas confondre avec le journal d'audit RBAC : `src/app/admin/historique`, `src/repositories/auditRepository.ts`.

### Forms

- **UI :** `src/components/forms`
- **Config champs :** `src/constants/forms.ts`
- **Client action :** `src/services/formClientService.ts`
- **Repositories :** `src/repositories/formRepository.ts` (config admin), `src/repositories/formSubmissionRepository.ts` (soumissions)
- **API :** `src/app/api/forms/route.ts`

### Homepage

- **UI admin :** `src/app/admin/homepage`
- **Config :** `pages.slug='accueil'` (contenu), `site_settings.homepage_config`

---

## 9. Dette connue

- `src/repositories/pageRepository.ts` reste une façade assez large (pages + résolution d'images) — les repositories dédiés (ci-dessus) sont la norme pour toute nouvelle entité
- `src/components/media/ImportWizard.tsx` contient encore du texte explicatif et des flux à finaliser
- Les types Supabase dans `src/types/database.ts` restent génériques
