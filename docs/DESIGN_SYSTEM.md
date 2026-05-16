# Design System — Manssuétude CMS

## 1. Philosophie visuelle

Manssuétude doit ressembler à une plateforme éditoriale intellectuelle, sérieuse et vivante. Le design doit inspirer confiance sans devenir froid, institutionnel ou trop technique.

Principes directeurs :

- blanc dominant pour la lisibilité ;
- orange Manssuétude comme accent, pas comme remplissage massif ;
- noir premium pour les sections fortes et les moments d’autorité ;
- tons crème pour adoucir les surfaces ;
- beaucoup de respiration ;
- grilles simples mais éditoriales ;
- composants sobres, cohérents et difficiles à casser.

La Phase 0 ne refond pas l’interface. Elle stabilise les règles pour que les prochaines évolutions restent cohérentes.

## 2. Tokens

Les tokens de référence vivent dans `src/config/designTokens.ts`. Les variables CSS opérationnelles vivent dans `src/styles/globals.css`.

Familles de tokens stabilisées :

- `colors` : palette Manssuétude ;
- `typography` : tailles, graisses et hauteurs de ligne ;
- `spacing` : échelle d’espacement ;
- `radius` : arrondis autorisés ;
- `shadows` : niveaux d’élévation ;
- `layout` : largeurs, gutters et tailles structurelles ;
- `breakpoints` : seuils responsive ;
- `zIndex` : couches d’interface.

Le fichier conserve aussi les alias `color` et `shadow` pour éviter de casser d’éventuels imports anciens.

## 3. Couleurs

Palette principale :

- `primary` / orange : action, accent, liens importants, eyebrows ;
- `ink` : texte principal ;
- `premiumBlack` : sections fortes, CTA premium, états sélectionnés ;
- `background` : fond général ;
- `surface` : cartes et panneaux ;
- `cream`, `creamSoft`, `creamTint` : respirations éditoriales ;
- `muted` : textes secondaires ;
- `border`, `borderStrong`, `borderDashed` : séparateurs.

Règles :

- ne pas créer de nouveaux oranges au cas par cas ;
- ne pas utiliser le noir premium sur de grands blocs sans intention éditoriale ;
- garder le contraste lisible sur tous les boutons ;
- les couleurs d’état futures doivent être ajoutées aux tokens avant usage répété.

## 4. Typographie

La typographie actuelle reste volontairement simple : `Inter, Arial, sans-serif`.

Règles :

- H1 : fort, éditorial, utilisé uniquement pour les héros ou titres de page ;
- H2 : titres de sections majeures ;
- H3 : titres de cartes ou sous-sections ;
- body : texte courant lisible ;
- caption : métadonnées, tags, labels ;
- quote : citations éditoriales.

Ne pas multiplier les tailles arbitraires. Si une nouvelle taille devient récurrente, l’ajouter à `designTokens.typography.size`.

## 5. Espacements

Échelle autorisée :

- `xs` : micro-espacement ;
- `sm` : groupes compacts ;
- `md` : espacement standard ;
- `lg` : blocs de composants ;
- `xl` : sections légères ;
- `2xl` : grandes respirations éditoriales.

Règles :

- éviter les marges isolées non justifiées ;
- privilégier `gap` dans les grilles et groupes flex ;
- garder une respiration plus généreuse sur le site public que dans l’admin ;
- ne pas compresser les cartes éditoriales pour gagner artificiellement de la place.

## 6. Radius et ombres

Radius :

- `sm` : éléments très compacts ;
- `md` : cartes, boutons, champs ;
- `lg` : panneaux plus amples ;
- `pill` : badges uniquement ;
- `editorialImage` : grands visuels hero.

Ombres :

- `subtle` : cartes publiques ;
- `subtleSoft` : cartes secondaires ;
- `elevated` : panneaux admin et blocs importants ;
- `modal` : modales.

Les ombres doivent rester discrètes. Manssuétude doit sembler premium, pas “app dashboard brillante”.

## 7. Layout

La largeur maximale publique et admin est `1480px`. Le gutter horizontal est centralisé dans `--page-x`.

Patterns autorisés :

- héros en deux colonnes sur desktop ;
- grilles de cards de 3 à 4 colonnes selon le contenu ;
- une colonne sur mobile ;
- sidebar admin fixe ou sticky sur desktop ;
- panneaux admin en cartes simples.

Les layouts libres et cassables ne sont pas autorisés dans le CMS. Les pages doivent utiliser des sections et variantes verrouillées.

## 8. Composants standards

Button :

- `.button` pour action standard ;
- `.button.primary` pour action principale ;
- future variante recommandée : `.button.premium` pour CTA noir.

Card :

- `.card` pour cartes publiques ;
- `.admin-card` pour panneaux admin ;
- `.media-card` pour médias ;
- `.cms-preview-block` pour aperçu du studio.

Section :

- `.section` pour blocs publics ;
- `.section-head` pour titre + action ;
- variantes futures : light, cream, dark, editorial.

Hero :

- `.hero`, `.hero-copy`, `.hero-image` ;
- image forte, texte respirant, CTA limités ;
- éviter de surcharger le hero avec trop de métriques.

Badge :

- `.tags span`, `.settings-pill`, `.media-metrics span` ;
- radius pill, fond orange doux, texte orange.

Form field :

- `label`, `input`, `textarea`, `select` ;
- labels visibles ;
- focus visible ;
- pas de champs sans contexte.

Admin table :

- `.admin-table` ;
- données lisibles, actions explicites ;
- pas de densité excessive.

Sidebar :

- `.admin-sidebar` ;
- navigation claire ;
- état actif contrasté.

CTA :

- CTA principal orange ;
- CTA premium noir pour sections fortes ;
- CTA secondaire sobre.

## 9. Variantes autorisées

Variantes à stabiliser progressivement :

Buttons :

- primary ;
- secondary ;
- ghost ;
- premium.

Cards :

- editorial ;
- featured ;
- compact ;
- media.

Sections :

- light ;
- cream ;
- dark ;
- editorial ;
- split.

Hero :

- editorial ;
- immersive ;
- minimal ;
- dark.

Pour l’instant, ces variantes sont documentées comme direction. La migration doit se faire composant par composant, sans refonte brutale.

## 10. Règles responsive

Breakpoints actuels :

- tablette : `960px` ;
- mobile : `680px`.

Règles :

- les grilles passent progressivement de 4 colonnes à 2, puis 1 ;
- les images hero ne doivent pas devenir trop hautes sur mobile ;
- les CTA doivent rester lisibles et empilables ;
- l’admin doit rester utilisable au minimum sur tablette ;
- les modales doivent tenir en hauteur avec scroll interne.

Le responsive doit être systémique. Éviter les corrections isolées page par page.

## 11. Règles admin

L’admin doit être visuel, rassurant et dense seulement quand c’est utile.

Règles :

- sidebar claire ;
- panneaux blancs avec bordures fines ;
- boutons cohérents ;
- formulaires lisibles ;
- tables sobres ;
- médiathèque très visuelle ;
- pas de paramètres techniques visibles sans nécessité.

L’admin ne doit pas ressembler à un outil technique brut. Il doit donner l’impression d’un studio éditorial.

## 12. Règles site public

Le site public doit être éditorial et humain.

Règles :

- héros forts mais pas surchargés ;
- cartes avec images bien cadrées ;
- sections alternant blanc, crème et noir premium ;
- textes hiérarchisés ;
- CTA peu nombreux mais clairs ;
- pas de faux effet SaaS ;
- pas de répétition mécanique de grilles identiques.

Les pages publiques doivent donner envie de découvrir, lire, participer et rejoindre.

## 13. Ce qui est interdit

Interdits design :

- nouvelles couleurs hors tokens sans justification ;
- styles inline permanents ;
- gradients décoratifs génériques ;
- cartes imbriquées dans des cartes ;
- badges utilisés comme boutons ;
- héro trop marketing ;
- pages construites avec quatre grilles identiques à la suite ;
- ombres trop fortes ;
- textes trop petits sur mobile ;
- composants admin qui exposent des chemins techniques comme interface principale.

Interdits techniques :

- dupliquer une variante CSS déjà existante sous un autre nom ;
- ajouter une librairie UI lourde sans décision d’architecture ;
- introduire Tailwind dans ce projet sans migration officielle ;
- mélanger règles métier et styles.

## 14. Dette design restante

Dette identifiée :

- pas encore de composants UI centralisés `Button`, `Card`, `Section`, `Badge` dans `src/components/ui` ;
- beaucoup de styles vivent encore dans un seul fichier global ;
- certaines valeurs CSS restent à migrer progressivement vers variables ;
- les variantes documentées ne sont pas encore toutes matérialisées en composants ;
- l’admin et le public partagent encore des classes génériques comme `.button` ;
- les cards publiques restent assez uniformes ;
- le système de thèmes clair/sombre par section doit être formalisé.

Migration recommandée :

1. créer `src/components/ui/Button.tsx` sans migrer tout le site d’un coup ;
2. créer `Card`, `Section`, `Badge` progressivement ;
3. extraire les styles admin et public en couches lisibles ;
4. remplacer les valeurs magiques restantes par des variables ;
5. documenter chaque nouvelle variante avant usage large.
