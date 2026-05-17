# Code Conventions — Manssuétude CMS

> Règles de nommage, imports, TypeScript, composants, services, repositories et styles.

---

## 1. Principes

Le codebase doit rester prévisible pour une petite équipe. Chaque fichier doit avoir une responsabilité claire, un nom lisible et une place évidente dans l'architecture.

**Règles prioritaires :**

- Privilégier la clarté à l'abstraction prématurée
- Garder l'UI séparée de la logique métier et de l'accès aux données
- Rendre les imports explicites et stables
- Typer les contrats de données avant de manipuler les objets
- Documenter les exceptions plutôt que les laisser devenir des habitudes

---

## 2. Naming

**Composants React :**

- Fichiers en `PascalCase.tsx`
- Composant principal nommé comme le fichier
- Un composant principal par fichier
- Sous-composants privés acceptés uniquement s'ils restent courts et locaux

**Services :**

- Fichiers en `camelCaseService.ts`
- Export recommandé : un objet `xxxService` quand plusieurs fonctions appartiennent au même domaine
- Fonctions nommées par action explicite : `createFromDefinition`, `getRelatedItems`, `buildSeoMetadata`

**Repositories :**

- Fichiers au pluriel + `Repository.ts` — ex : `themesRepository.ts`
- Exception temporaire documentée : `formRepository.ts` coexiste avec `formsRepository.ts` pour compatibilité progressive
- Fonctions orientées accès données : `listThemes`, `getThemeBySlug`, `upsertProduction`

**Types :**

- Noms en `PascalCase`
- Types métier dans `src/types`
- Types locaux autorisés uniquement pour les props privées d'un composant

---

## 3. Imports

Les imports internes utilisent l'alias racine `@/` :

```ts
import { mediaService } from "@/services/mediaService";
import type { Media } from "@/types/cms";
```

**Règles :**

- Éviter les chemins profonds comme `../../../services/...`
- Éviter les dépendances circulaires
- Un repository ne doit jamais importer depuis `src/components`
- Un composant ne doit pas importer directement `src/lib/db` ou un client Supabase
- Les imports `type` doivent être utilisés quand l'import ne sert qu'au typage
- Les `default exports` sont réservés aux fichiers Next.js qui l'exigent naturellement (`page.tsx`, `layout.tsx`, `next.config.ts`)

---

## 4. TypeScript

Le projet fonctionne en mode strict. Les types doivent être explicites aux frontières importantes : API, repositories, services, formulaires et composants publics.

**Règles :**

- Pas de `any` non justifié
- Préférer `unknown` + validation quand la donnée vient de l'extérieur
- Éviter les objets flous dans les signatures publiques
- Centraliser les types CMS dans `src/types/cms.ts` et les types DB dans `src/types/database.ts`
- Remplacer les casts répétés par un mapper ou un type clair

> Les casts `as` restent acceptables lorsqu'ils encadrent une union contrôlée, mais ils doivent rester localisés.

---

## 5. Components

Les composants sont responsables de l'affichage et des interactions visuelles.

**Ils peuvent :**

- Recevoir des données typées
- Gérer un état UI local
- Déclencher une action utilisateur
- Appeler un service client dédié si une interaction nécessite une requête

**Ils ne doivent pas :**

- Contenir de logique métier lourde
- Mapper directement des lignes DB brutes
- Appeler Supabase directement
- Embarquer des règles de permission
- Devenir des fichiers fourre-tout

> Les props doivent être typées. Pour les composants publics réutilisables, préférer une interface ou un type nommé.

---

## 6. Repositories

Les repositories encapsulent l'accès aux données.

**Ils peuvent :**

- Lire et écrire en base
- Mapper les lignes DB vers les types domaine
- Appliquer les filtres de requête
- Exposer des fonctions CRUD

**Ils ne doivent pas :**

- Décider de la présentation
- Importer des composants
- Gérer des états React
- Contenir les règles éditoriales complexes
- Formater des textes pour l'UI

**Flux attendu :**

```
service → repository → database
```

---

## 7. Services

Les services portent la logique métier testable.

**Ils peuvent :**

- Orchestrer plusieurs repositories
- Préparer des recommandations
- Gérer les relations entre contenus
- Construire des métadonnées SEO
- Normaliser les médias
- Appliquer des règles de workflow

**Ils ne doivent pas :**

- Rendre du JSX
- Dépendre d'un composant
- Manipuler directement le DOM
- Contenir des secrets d'environnement

Quand plusieurs fonctions appartiennent au même domaine, exporter un objet service :

```ts
export const editorBlockService = {
  createFromDefinition,
  duplicate,
  move,
  patch,
};
```

---

## 8. API Routes

Les routes API doivent rester fines.

**Structure recommandée :**

```
route handler → auth/permission → validation → service/repository → réponse standardisée
```

**Règles :**

- Valider les entrées avec `src/lib/validation.ts` ou un schéma dédié
- Renvoyer des erreurs via `src/lib/errors.ts`
- Vérifier les permissions via `src/lib/permissions.ts`
- Éviter les accès DB dispersés dans les handlers
- Ne pas exposer les détails internes Supabase dans les réponses publiques

> **Dette connue :** certaines routes génériques de contenu accèdent encore directement à la base. Elles doivent être stabilisées avant les CRUD avancés.

---

## 9. Styles

Les styles globaux vivent dans `src/styles/globals.css`. Les tokens stables vivent dans `src/config/designTokens.ts`.

**Règles :**

- Utiliser les classes existantes avant d'ajouter de nouveaux patterns
- Éviter les styles inline sauf cas dynamique simple
- Préserver la direction visuelle : blanc dominant, orange Manssuétude, noir premium, respiration éditoriale
- Ne pas créer de variantes visuelles hors design system sans documentation
- Garder le responsive systémique, pas patché section par section

---

## 10. Git & PR

**Branches recommandées :**

| Branche     | Usage                            |
| ----------- | -------------------------------- |
| `main`      | Version stable                   |
| `develop`   | Intégration                      |
| `feature/*` | Nouvelles fonctionnalités        |
| `fix/*`     | Corrections ciblées              |
| `chore/*`   | Maintenance, docs, configuration |

**Chaque PR doit indiquer :** objectif, fichiers ou modules touchés, validations exécutées, risques, captures si l'UI change.

**Avant revue :**

```bash
npm run typecheck
npm run build
npm run test        # si le changement touche l'architecture
npm run format:check  # si la modification est large
```

---

## 11. Exemples corrects

**Import interne propre :**

```ts
import { themesRepository } from "@/repositories/themesRepository";
import type { Theme } from "@/types/cms";
```

**Composant typé :**

```tsx
type ThemeCardProps = {
  theme: Theme;
};

export function ThemeCard({ theme }: ThemeCardProps) {
  return <article>{theme.title}</article>;
}
```

**Service testable :**

```ts
export const seoService = {
  buildPageTitle(title: string) {
    return `${title} — Manssuétude`;
  },
};
```

**Repository limité aux données :**

```ts
export async function listThemes() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("themes").select("*");
  if (error) throw error;
  return data.map(mapThemeRow);
}
```

---

## 12. Exemples interdits

**Accès DB dans un composant :**

```tsx
// Interdit
export function ThemeCard() {
  const supabase = getSupabaseAdmin();
}
```

**Import relatif profond :**

```ts
// Interdit
import { mediaService } from "../../../services/mediaService";
```

**Type flou :**

```ts
// Interdit
function saveContent(payload: any) {}
```

**Repository qui décide de l'affichage :**

```ts
// Interdit
export async function listThemesForCards() {
  return rows.map((row) => `<article>${row.title}</article>`);
}
```

**Service qui rend de l'UI :**

```tsx
// Interdit
export function renderRecommendationCard() {
  return <article />;
}
```
