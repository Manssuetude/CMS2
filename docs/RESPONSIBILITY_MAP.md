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

### Themes

- **UI :** pages dans `src/app/(public)/themes`, admin dans `src/app/admin/themes`
- **Repository :** `src/repositories/themesRepository.ts`
- **Types :** `Theme` dans `src/types/cms.ts`
- **Services :** relations, recommandations et taxonomie dans `src/services`

### Activities

- **UI :** `src/app/(public)/activites`, admin dans `src/app/admin/activites`
- **Repository :** `src/repositories/activitiesRepository.ts`
- **Types :** `Activity` dans `src/types/cms.ts`
- **Services :** à créer seulement si des règles d'activité apparaissent

### Productions

- **UI :** `src/app/(public)/productions`, cards dans `src/components/cards`
- **Repository :** `src/repositories/productionsRepository.ts`
- **Types :** `Production` et `ContentBlock` dans `src/types/cms.ts`
- **Services :** recommandations, SEO et relations

### Resources

- **UI :** `src/app/(public)/ressources`, admin dans `src/app/admin/resources`
- **Repository :** `src/repositories/resourcesRepository.ts`
- **Types :** `Media` / resource dans `src/types/cms.ts`
- **Services :** `mediaService`, `relationService`, `taxonomyService`

### Projects

- **UI :** `src/app/(public)/projets`, admin dans `src/app/admin/projets`
- **Repository :** `src/repositories/projectsRepository.ts`
- **Types :** `Project` dans `src/types/cms.ts`
- **Services :** relations, recommandations, smart defaults

### Media

- **UI :** `src/components/media`
- **Repository :** `src/repositories/mediaRepository.ts`
- **Infrastructure storage :** `src/lib/media.ts`
- **Client action :** `src/services/mediaClientService.ts`
- **Helpers génériques :** `src/utils/tags.ts`

### Forms

- **UI :** `src/components/forms`
- **Config champs :** `src/constants/forms.ts`
- **Client action :** `src/services/formClientService.ts`
- **Repository :** `src/repositories/formRepository.ts`
- **API :** `src/app/api/forms/route.ts`

### Homepage

- **UI admin :** `src/components/admin/EditorStudio.tsx`
- **Blocs :** `src/components/blocks`
- **Opérations de blocs :** `src/services/editorBlockService.ts`
- **Config future :** `site_settings.homepage_config`

---

## 9. Refactors appliqués

- Extraction de la configuration des formulaires vers `src/constants/forms.ts`
- Extraction du submit formulaire client vers `src/services/formClientService.ts`
- Extraction de l'upload média client vers `src/services/mediaClientService.ts`
- Extraction des opérations de blocs du studio vers `src/services/editorBlockService.ts`
- Extraction du parsing/dédoublonnage de tags vers `src/utils/tags.ts`
- Mise à jour de `src/components/forms/FormModal.tsx` pour utiliser la configuration stable des champs
- Mise à jour de `src/components/media/MediaField.tsx` pour ne plus faire le `fetch` directement
- Mise à jour de `src/components/admin/EditorStudio.tsx` pour réduire la logique de fabrication/déplacement de blocs
- Mise à jour de `src/repositories/mediaRepository.ts`, `src/app/api/media/route.ts` et `src/services/taxonomyService.ts` pour réutiliser `src/utils/tags.ts`

---

## 10. Dette restante

- `src/components/admin/EditorStudio.tsx` reste un composant assez gros — à découper en panneaux : structure, preview, settings
- `src/repositories/contentRepository.ts` reste une façade large — les repositories dédiés doivent devenir la norme
- `src/components/media/MediaField.tsx` affiche encore des actions non entièrement branchées : médiathèque, Google Drive, suppression persistée
- `src/components/media/ImportWizard.tsx` contient encore du texte explicatif et des flux placeholder
- Les routes API génériques `src/app/api/content/[collection]` devront être remplacées ou complétées par des handlers typés par entité
- `src/lib/cta.ts` contient une logique produit simple — acceptable maintenant, mais pourrait aller dans `src/constants` + service si les CTA deviennent administrables
- Les types Supabase dans `src/types/database.ts` restent génériques
- Pas encore de tests unitaires pour les services extraits
