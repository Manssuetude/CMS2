# Responsibility Map — Manssuétude CMS

> Carte des responsabilités par couche. Chaque couche a une mission limitée et précise.

---

## 1. Principe général

Le projet doit rester lisible par plusieurs développeurs. Chaque couche a une responsabilité limitée : l'UI affiche, les services décident, les repositories accèdent aux données, `lib` porte l'infrastructure, `utils` porte les helpers génériques, `types` porte le langage commun du domaine.

> **Règle pratique :** si un fichier devient difficile à expliquer en une phrase, il doit être découpé.

---

## 2. UI Components

**Les composants UI peuvent :**

- Afficher des données déjà préparées
- Gérer un état visuel local
- Déclencher une action utilisateur
- Ouvrir une modale
- Appeler un service client léger pour soumettre un formulaire ou uploader un fichier
- Composer d'autres composants

**Les composants UI ne peuvent pas :**

- Appeler Supabase directement
- Connaître les noms de tables
- Faire du mapping DB
- Porter des règles métier lourdes
- Décider des recommandations, relations, permissions ou statuts éditoriaux
- Contenir des objets de configuration métier volumineux

**Exemples :**

- `src/components/forms/FormModal.tsx` affiche les champs, mais la définition des champs vit dans `src/constants/forms.ts`
- `src/components/media/MediaField.tsx` affiche le champ média, mais l'upload passe par `src/services/mediaClientService.ts`
- `src/components/admin/EditorStudio.tsx` affiche le studio, mais les opérations de blocs passent par `src/services/editorBlockService.ts`

---

## 3. Repositories

**Les repositories peuvent :**

- Lire et écrire en base
- Appeler Supabase
- Mapper les rows DB vers les types CMS
- Créer, lister, mettre à jour et supprimer
- Gérer les requêtes nécessaires à une collection

**Les repositories ne peuvent pas :**

- Importer des composants
- Manipuler du JSX
- Gérer l'UX
- Porter des règles éditoriales complexes
- Décider de l'ordre d'affichage public au-delà d'un tri de requête explicite
- Contenir des textes UI

**Exemples :**

- `src/repositories/mediaRepository.ts` crée et liste les médias
- `src/repositories/formRepository.ts` crée et liste les soumissions de formulaires
- `src/repositories/contentRepository.ts` reste une façade de transition — les repositories dédiés doivent être privilégiés pour les futurs modules

---

## 4. Services

**Les services peuvent :**

- Porter les règles métier
- Orchestrer plusieurs repositories
- Préparer des recommandations
- Gérer le graphe de relations
- Produire des smart defaults
- Analyser des médias
- Contrôler la santé éditoriale
- Centraliser les opérations client qui évitent de mettre du `fetch` directement dans les composants

**Les services ne peuvent pas :**

- Rendre du JSX
- Dépendre des composants UI
- Devenir des fourre-tout techniques
- Contourner les validations API
- Cacher des effets de bord importants

**Exemples :**

- `src/services/editorBlockService.ts` fabrique, déplace, duplique et patche les blocs
- `src/services/formClientService.ts` centralise la soumission client des formulaires
- `src/services/mediaClientService.ts` centralise l'upload client
- `src/services/taxonomyService.ts` porte la logique de tags et suggestions

---

## 5. Lib

`src/lib` contient l'infrastructure technique :

| Fichier | Rôle |
|---|---|
| `auth.ts` | Session et rôles |
| `db.ts` | Client Supabase |
| `env.ts` | Variables d'environnement |
| `errors.ts` | Erreurs API standardisées |
| `logger.ts` | Logs structurés |
| `validation.ts` | Schémas Zod partagés |
| `media.ts` | Interaction technique avec le stockage |
| `google-drive.ts` | Intégration Google Drive |
| `permissions.ts` | Matrice de permission simple |
| `cta.ts` | Résolution technique des CTA |

> `lib` ne doit pas devenir un dossier de logique métier. Si une règle parle du produit Manssuétude ou du comportement éditorial, elle doit aller dans `services`.

---

## 6. Utils

**Différence entre utils et services :**

| Utils | Services |
|---|---|
| Générique, pur, sans signification produit | Connaît une règle métier ou un flux du CMS |

**Exemples d'utils :** `src/utils/slug.ts` · `src/utils/row.ts` · `src/utils/tags.ts`

**À ne pas mettre dans utils :** recommandations de contenus, règles de publication, permissions éditoriales, décisions de layout CMS.

---

## 7. Types

Les types partagés vivent dans `src/types`.

**Règles :**

- Déclarer les types globaux du domaine dans `src/types/cms.ts`
- Déclarer les types DB dans `src/types/database.ts`
- Éviter de dupliquer les unions de statuts dans plusieurs fichiers
- Créer des types locaux uniquement s'ils ne sortent pas du composant/fichier
- Éviter `any`
- Préférer les types existants avant d'en créer un nouveau

> Les constantes fortement liées à un type peuvent vivre dans `src/constants`, par exemple `src/constants/forms.ts`.

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
