# Code Conventions — Manssuétude CMS

## 1. Principes

Le codebase doit rester prévisible pour une petite équipe. Chaque fichier doit avoir une responsabilité claire, un nom lisible et une place évidente dans l’architecture.

Les règles prioritaires sont :

- privilégier la clarté à l’abstraction prématurée ;
- garder l’UI séparée de la logique métier et de l’accès aux données ;
- rendre les imports explicites et stables ;
- typer les contrats de données avant de manipuler les objets ;
- documenter les exceptions plutôt que les laisser devenir des habitudes.

## 2. Naming

Composants React :

- fichiers en `PascalCase.tsx` ;
- composant principal nommé comme le fichier ;
- un composant principal par fichier ;
- sous-composants privés acceptés uniquement s’ils restent courts et locaux.

Services :

- fichiers en `camelCaseService.ts` ;
- export recommandé : un objet `xxxService` quand plusieurs fonctions appartiennent au même domaine ;
- fonctions nommées par action explicite : `createFromDefinition`, `getRelatedItems`, `buildSeoMetadata`.

Repositories :

- fichiers au pluriel + `Repository.ts`, par exemple `themesRepository.ts` ;
- exception temporaire documentée : `formRepository.ts` coexiste avec `formsRepository.ts` pour compatibilité progressive ;
- fonctions orientées accès données : `listThemes`, `getThemeBySlug`, `upsertProduction`.

Types :

- noms en `PascalCase` ;
- types métier dans `src/types` ;
- types locaux autorisés uniquement pour les props privées d’un composant.

## 3. Imports

Les imports internes utilisent l’alias racine `@/`.

Exemple :

```ts
import { mediaService } from "@/services/mediaService";
import type { Media } from "@/types/cms";
```

Règles :

- éviter les chemins profonds comme `../../../services/...` ;
- éviter les dépendances circulaires ;
- un repository ne doit jamais importer depuis `src/components` ;
- un composant ne doit pas importer directement `src/lib/db` ou un client Supabase ;
- les imports `type` doivent être utilisés quand l’import ne sert qu’au typage ;
- les `default exports` sont réservés aux fichiers Next.js qui l’exigent naturellement (`page.tsx`, `layout.tsx`, `next.config.ts`).

## 4. TypeScript

Le projet fonctionne en mode strict. Les types doivent être explicites aux frontières importantes : API, repositories, services, formulaires et composants publics.

Règles :

- pas de `any` non justifié ;
- préférer `unknown` + validation quand la donnée vient de l’extérieur ;
- éviter les objets flous dans les signatures publiques ;
- centraliser les types CMS dans `src/types/cms.ts` et les types DB dans `src/types/database.ts` ;
- remplacer les casts répétés par un mapper ou un type clair.

Les casts `as` restent acceptables lorsqu’ils encadrent une union contrôlée, mais ils doivent rester localisés.

## 5. Components

Les composants sont responsables de l’affichage et des interactions visuelles.

Ils peuvent :

- recevoir des données typées ;
- gérer un état UI local ;
- déclencher une action utilisateur ;
- appeler un service client dédié si une interaction nécessite une requête.

Ils ne doivent pas :

- contenir de logique métier lourde ;
- mapper directement des lignes DB brutes ;
- appeler Supabase directement ;
- embarquer des règles de permission ;
- devenir des fichiers fourre-tout.

Les props doivent être typées. Pour les composants publics réutilisables, préférer une interface ou un type nommé.

## 6. Repositories

Les repositories encapsulent l’accès aux données.

Ils peuvent :

- lire et écrire en base ;
- mapper les lignes DB vers les types domaine ;
- appliquer les filtres de requête ;
- exposer des fonctions CRUD.

Ils ne doivent pas :

- décider de la présentation ;
- importer des composants ;
- gérer des états React ;
- contenir les règles éditoriales complexes ;
- formater des textes pour l’UI.

Flux attendu :

```txt
service → repository → database
```

## 7. Services

Les services portent la logique métier testable.

Ils peuvent :

- orchestrer plusieurs repositories ;
- préparer des recommandations ;
- gérer les relations entre contenus ;
- construire des métadonnées SEO ;
- normaliser les médias ;
- appliquer des règles de workflow.

Ils ne doivent pas :

- rendre du JSX ;
- dépendre d’un composant ;
- manipuler directement le DOM ;
- contenir des secrets d’environnement.

Quand plusieurs fonctions appartiennent au même domaine, exporter un objet service :

```ts
export const editorBlockService = {
  createFromDefinition,
  duplicate,
  move,
  patch,
};
```

## 8. API Routes

Les routes API doivent rester fines.

Structure recommandée :

```txt
route handler → auth/permission → validation → service/repository → réponse standardisée
```

Règles :

- valider les entrées avec `src/lib/validation.ts` ou un schéma dédié ;
- renvoyer des erreurs via `src/lib/errors.ts` ;
- vérifier les permissions via `src/lib/permissions.ts` ;
- éviter les accès DB dispersés dans les handlers ;
- ne pas exposer les détails internes Supabase dans les réponses publiques.

Dette connue : certaines routes génériques de contenu accèdent encore directement à la base. Elles doivent être stabilisées avant les CRUD avancés.

## 9. Styles

Les styles globaux vivent dans `src/styles/globals.css`. Les tokens stables vivent dans `src/config/designTokens.ts`.

Règles :

- utiliser les classes existantes avant d’ajouter de nouveaux patterns ;
- éviter les styles inline sauf cas dynamique simple ;
- préserver la direction visuelle : blanc dominant, orange Manssuétude, noir premium, respiration éditoriale ;
- ne pas créer de variantes visuelles hors design system sans documentation ;
- garder le responsive systémique, pas patché section par section.

## 10. Git & PR

Branches recommandées :

- `main` : version stable ;
- `develop` : intégration ;
- `feature/*` : nouvelles fonctionnalités ;
- `fix/*` : corrections ciblées ;
- `chore/*` : maintenance, docs, configuration.

Chaque PR doit indiquer :

- objectif ;
- fichiers ou modules touchés ;
- validations exécutées ;
- risques ;
- captures si l’UI change.

Avant revue :

- `npm run typecheck` ;
- `npm run build` ;
- `npm run test` si le changement touche l’architecture ;
- `npm run format:check` si la modification est large.

## 11. Exemples corrects

Import interne propre :

```ts
import { themesRepository } from "@/repositories/themesRepository";
import type { Theme } from "@/types/cms";
```

Composant typé :

```tsx
type ThemeCardProps = {
  theme: Theme;
};

export function ThemeCard({ theme }: ThemeCardProps) {
  return <article>{theme.title}</article>;
}
```

Service testable :

```ts
export const seoService = {
  buildPageTitle(title: string) {
    return `${title} — Manssuétude`;
  },
};
```

Repository limité aux données :

```ts
export async function listThemes() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("themes").select("*");
  if (error) throw error;
  return data.map(mapThemeRow);
}
```

## 12. Exemples interdits

Accès DB dans un composant :

```tsx
// Interdit
export function ThemeCard() {
  const supabase = getSupabaseAdmin();
}
```

Import relatif profond :

```ts
// Interdit
import { mediaService } from "../../../services/mediaService";
```

Type flou :

```ts
// Interdit
function saveContent(payload: any) {}
```

Repository qui décide de l’affichage :

```ts
// Interdit
export async function listThemesForCards() {
  return rows.map((row) => `<article>${row.title}</article>`);
}
```

Service qui rend de l’UI :

```tsx
// Interdit
export function renderRecommendationCard() {
  return <article />;
}
```
