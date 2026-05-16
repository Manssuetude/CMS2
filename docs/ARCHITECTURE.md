# Architecture Manssuétude CMS

## 1. Philosophie générale

Manssuétude CMS est un CMS éditorial sur-mesure pour une petite équipe interne de 5 à 8 personnes. Il doit rester simple à comprendre, difficile à casser et suffisamment structuré pour accueillir deux nouveaux développeurs sans dépendre d’explications orales permanentes.

Le projet ne cherche pas à devenir WordPress, Notion ou un ERP. La bonne architecture est volontairement sobre :

- routes et pages dans Next.js ;
- composants UI isolés ;
- repositories pour l’accès aux données ;
- services pour les décisions métier ;
- `lib` pour les intégrations techniques ;
- types, constantes, config, hooks, styles et utils séparés.

Le principe important : une complexité interne peut exister, mais elle doit rester lisible, documentée et prévisible.

## 2. Architecture cible

Arborescence cible :

```txt
src/
  app/
  components/
    admin/
    blocks/
    cards/
    forms/
    layout/
    media/
    navigation/
    public/
    ui/
  repositories/
  services/
  lib/
  types/
  config/
  constants/
  hooks/
  docs/
  styles/
  utils/
```

État observé après clarification :

- Les dossiers cibles existent.
- `src/hooks` existe avec une note de responsabilité.
- Les composants de layout publics ont été déplacés dans `src/components/layout`.
- Le composant de grille de cartes a été déplacé dans `src/components/cards`.
- Les dossiers `src/entities/*` vides ont été retirés pour éviter une fausse impression d’architecture utilisée. Les entités sont aujourd’hui portées par `src/types`, `src/repositories` et `src/services`.

## 3. Responsabilité des dossiers

### `src/app`

Contient uniquement les routes Next.js :

- pages publiques ;
- pages admin ;
- layouts ;
- route handlers API ;
- middleware proche de Next.js quand nécessaire.

Les pages peuvent orchestrer l’affichage, mais ne doivent pas contenir de logique métier lourde.

### `src/components`

Contient les composants UI.

Règles :

- pas d’accès direct Supabase ;
- pas de logique métier lourde ;
- pas de mapping DB ;
- pas de décisions de publication, permissions, recommandations ou relations ;
- interaction visuelle autorisée ;
- état React local autorisé quand il concerne l’interface.

Sous-dossiers actuels :

- `admin` : composants d’administration.
- `blocks` : blocs CMS verrouillés.
- `cards` : composants de cartes et grilles.
- `forms` : CTA et modales de formulaires.
- `layout` : header, footer, shell public/admin si besoin.
- `media` : composants UI de médiathèque et champs média.
- `navigation` : futur emplacement pour navigation réutilisable.
- `public` : composants publics spécifiques encore actifs.
- `ui` : futur emplacement pour primitives UI génériques.

### `src/repositories`

Contient l’accès aux données uniquement :

- CRUD ;
- requêtes Supabase ;
- mapping DB vers types CMS ;
- suppression, création, mise à jour, listing.

Interdictions :

- pas de composants ;
- pas de CSS ;
- pas de logique de présentation ;
- pas de décisions UX.

### `src/services`

Contient la logique métier :

- relations ;
- graphe éditorial ;
- recommandations ;
- SEO ;
- health checks ;
- smart defaults ;
- taxonomie ;
- orchestration entre repositories.

Un service peut appeler un repository. Un repository ne doit pas appeler un service.

### `src/lib`

Contient les clients techniques et helpers d’infrastructure :

- auth ;
- env ;
- db ;
- permissions ;
- validation ;
- logger ;
- erreurs API ;
- média technique ;
- Google Drive ;
- CTA technique.

`src/lib` ne doit pas devenir un fourre-tout métier.

### `src/types`

Contient les types globaux :

- types CMS ;
- types DB ;
- types entités ;
- statuts ;
- visibilité ;
- médias ;
- formulaires.

Les types partagés entre plusieurs couches doivent vivre ici.

### `src/config`

Contient la configuration stable non secrète :

- design tokens ;
- paramètres globaux non sensibles ;
- config applicative stable.

Les secrets restent dans `.env.local` et ne doivent jamais être committés.

### `src/constants`

Contient les constantes métier ou applicatives :

- collections autorisées ;
- navigation admin ;
- menus ;
- statuts stables ;
- valeurs partagées.

Une constante ne doit pas contenir de logique d’accès données.

### `src/hooks`

Contient les hooks React réutilisables.

Règles :

- hooks UI-oriented ;
- pas d’accès direct Supabase ;
- pas de logique métier critique difficile à tester ;
- si un hook a besoin de décision métier, déléguer à `src/services`.

### `src/docs`

Contient de la documentation proche du code source. À utiliser pour des conventions très liées à `src`.

Documentation projet plus générale :

- `docs/*`
- `README.md`
- `ENGINEERING_GUIDE.md`

### `src/styles`

Contient les styles globaux et couches CSS.

État actuel :

- `src/styles/globals.css` reste le fichier principal.

Évolution recommandée :

- découper progressivement en couches : base, layout, public, admin, forms, media ;
- ou décider explicitement d’une migration Tailwind/shadcn.

### `src/utils`

Contient les helpers génériques sans signification produit :

- slug ;
- formatage simple ;
- conversion de row ;
- helpers purs.

Un util ne doit pas connaître Manssuétude, Supabase ou le modèle CMS.

## 4. Règles d’import

- Utiliser `@/` pour les imports depuis `src`.
- Éviter les imports relatifs profonds comme `../../../`.
- Interdire les dépendances circulaires.
- Interdire à `src/repositories` d’importer `src/components`.
- Interdire à `src/components` d’appeler directement Supabase ou `getSupabaseAdmin`.
- Autoriser les composants à importer :
  - types ;
  - constantes ;
  - config ;
  - composants UI ;
  - hooks UI.
- Autoriser les services à importer :
  - repositories ;
  - types ;
  - utils ;
  - constantes.
- Autoriser les repositories à importer :
  - `src/lib/db` ;
  - types ;
  - helpers de mapping ;
  - validations strictement liées aux payloads.

## 5. Flux de données recommandé

Flux côté interface :

```txt
UI component
  → hook UI si nécessaire
  → service métier si décision fonctionnelle
  → repository
  → database / storage
```

Flux côté route handler :

```txt
route handler
  → validation
  → requireRole / permissions
  → service ou repository
  → réponse standardisée
```

Règles :

- Une page Next.js peut charger des données via repository ou service.
- Une API doit valider ses entrées avant mutation.
- Les erreurs API doivent passer par une réponse standardisée.
- Les composants client ne doivent pas connaître les tables Supabase.

## 6. Où créer un nouveau module CMS

### Themes

- Type partagé : `src/types/cms.ts`
- Accès données : `src/repositories/themesRepository.ts`
- Logique métier : `src/services/relationService.ts`, `src/services/recommendationService.ts` ou service dédié si nécessaire.
- UI publique : `src/components/public` ou `src/components/cards` selon le besoin.
- Route publique : `src/app/(public)/themes`
- Admin : `src/app/admin/themes`

### Activities

- Type partagé : `src/types/cms.ts`
- Accès données : `src/repositories/activitiesRepository.ts`
- Logique métier : service dédié seulement si une vraie règle métier apparaît.
- Route publique : `src/app/(public)/activites`
- Admin : `src/app/admin/activites`

### Productions

- Type partagé : `src/types/cms.ts`
- Accès données : `src/repositories/productionsRepository.ts`
- Logique métier : recommandations, lecture, relations et SEO dans `src/services`.
- Route publique : `src/app/(public)/productions`
- Admin : `src/app/admin/productions`

### Resources

- Type partagé : `src/types/cms.ts`
- Accès données : `src/repositories/resourcesRepository.ts` ou `mediaRepository` si le contenu est réellement un média.
- Logique média : `src/services/mediaService.ts` et `src/lib/media.ts`.
- Route publique : `src/app/(public)/ressources`
- Admin : `src/app/admin/resources` ou `src/app/admin/media` selon le cas.

### Projects

- Type partagé : `src/types/cms.ts`
- Accès données : `src/repositories/projectsRepository.ts`
- Logique métier : avancement, relations, recommandations dans `src/services`.
- Route publique : `src/app/(public)/projets`
- Admin : `src/app/admin/projets`

## 7. Anti-patterns interdits

- Logique métier dans les composants.
- Accès DB direct dans l’UI.
- `any` non justifié.
- Duplication de mapping DB dans plusieurs fichiers.
- Routes API sans validation.
- Routes API qui exposent des tables arbitraires.
- Styles inline non nécessaires.
- Composants fourre-tout.
- Repositories qui importent des composants.
- Services qui manipulent du JSX.
- Hooks React qui cachent des règles métier critiques.
- Fichiers de config secrets versionnés.
- Nouveaux chemins relatifs profonds.
- Ajout de nouvelles sous-architectures sans documentation.

## 8. Statut de migration legacy

Les fichiers suivants appartiennent à l’ancien prototype vanilla :

- `index.html`
- `app.js`
- `content.js`
- `styles.css`

Statut actuel :

- Ils sont conservés temporairement.
- Ils servent de référence visuelle et fonctionnelle.
- `content.js` peut encore servir de source de seed.
- Ils ne doivent pas recevoir de nouvelles fonctionnalités produit.

Règles :

- Ne pas supprimer ces fichiers sans étape de migration dédiée.
- Ne pas ajouter de nouvelle logique métier dans `app.js`.
- Ne pas considérer `styles.css` comme le CSS actif du CMS Next.js.
- Toute évolution active doit aller dans `src/`.

Migration recommandée plus tard :

1. Déplacer le prototype vers `legacy/vanilla-prototype`.
2. Déplacer `content.js` vers un dossier de seed explicite.
3. Adapter `scripts/seed.mjs`.
4. Documenter la fin de vie du prototype.
