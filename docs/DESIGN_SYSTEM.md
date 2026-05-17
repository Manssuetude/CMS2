# Design System — Manssuétude CMS

> Tokens, règles visuelles, composants standards et dette design.

---

## 1. Philosophie visuelle

Manssuétude doit ressembler à une plateforme éditoriale intellectuelle, sérieuse et vivante. Le design doit inspirer confiance sans devenir froid, institutionnel ou trop technique.

**Principes directeurs :**

- Blanc dominant pour la lisibilité
- Orange Manssuétude comme accent, pas comme remplissage massif
- Noir premium pour les sections fortes et les moments d'autorité
- Tons crème pour adoucir les surfaces
- Beaucoup de respiration
- Grilles simples mais éditoriales
- Composants sobres, cohérents et difficiles à casser

> La Phase 0 ne refond pas l'interface. Elle stabilise les règles pour que les prochaines évolutions restent cohérentes.

---

## 2. Tokens

Les tokens de référence vivent dans `src/config/designTokens.ts`. Les variables CSS opérationnelles vivent dans `src/styles/globals.css`.

**Familles de tokens stabilisées :**

| Famille | Contenu |
|---|---|
| `colors` | Palette Manssuétude |
| `typography` | Tailles, graisses et hauteurs de ligne |
| `spacing` | Échelle d'espacement |
| `radius` | Arrondis autorisés |
| `shadows` | Niveaux d'élévation |
| `layout` | Largeurs, gutters et tailles structurelles |
| `breakpoints` | Seuils responsive |
| `zIndex` | Couches d'interface |

Le fichier conserve aussi les alias `color` et `shadow` pour éviter de casser d'éventuels imports anciens.

---

## 3. Couleurs

**Palette principale :**

| Token | Usage |
|---|---|
| `primary` / orange | Action, accent, liens importants, eyebrows |
| `ink` | Texte principal |
| `premiumBlack` | Sections fortes, CTA premium, états sélectionnés |
| `background` | Fond général |
| `surface` | Cartes et panneaux |
| `cream`, `creamSoft`, `creamTint` | Respirations éditoriales |
| `muted` | Textes secondaires |
| `border`, `borderStrong`, `borderDashed` | Séparateurs |

**Règles :**

- Ne pas créer de nouveaux oranges au cas par cas
- Ne pas utiliser le noir premium sur de grands blocs sans intention éditoriale
- Garder le contraste lisible sur tous les boutons
- Les couleurs d'état futures doivent être ajoutées aux tokens avant usage répété

---

## 4. Typographie

La typographie actuelle reste volontairement simple : `Inter, Arial, sans-serif`.

**Hiérarchie :**

| Niveau | Usage |
|---|---|
| H1 | Fort, éditorial — héros ou titres de page uniquement |
| H2 | Titres de sections majeures |
| H3 | Titres de cartes ou sous-sections |
| body | Texte courant lisible |
| caption | Métadonnées, tags, labels |
| quote | Citations éditoriales |

> Ne pas multiplier les tailles arbitraires. Si une nouvelle taille devient récurrente, l'ajouter à `designTokens.typography.size`.

---

## 5. Espacements

**Échelle autorisée :**

| Token | Usage |
|---|---|
| `xs` | Micro-espacement |
| `sm` | Groupes compacts |
| `md` | Espacement standard |
| `lg` | Blocs de composants |
| `xl` | Sections légères |
| `2xl` | Grandes respirations éditoriales |

**Règles :**

- Éviter les marges isolées non justifiées
- Privilégier `gap` dans les grilles et groupes flex
- Garder une respiration plus généreuse sur le site public que dans l'admin
- Ne pas compresser les cartes éditoriales pour gagner artificiellement de la place

---

## 6. Radius et ombres

**Radius :**

| Token | Usage |
|---|---|
| `sm` | Éléments très compacts |
| `md` | Cartes, boutons, champs |
| `lg` | Panneaux plus amples |
| `pill` | Badges uniquement |
| `editorialImage` | Grands visuels hero |

**Ombres :**

| Token | Usage |
|---|---|
| `subtle` | Cartes publiques |
| `subtleSoft` | Cartes secondaires |
| `elevated` | Panneaux admin et blocs importants |
| `modal` | Modales |

> Les ombres doivent rester discrètes. Manssuétude doit sembler premium, pas "app dashboard brillante".

---

## 7. Layout

La largeur maximale publique et admin est `1480px`. Le gutter horizontal est centralisé dans `--page-x`.

**Patterns autorisés :**

- Héros en deux colonnes sur desktop
- Grilles de cards de 3 à 4 colonnes selon le contenu
- Une colonne sur mobile
- Sidebar admin fixe ou sticky sur desktop
- Panneaux admin en cartes simples

> Les layouts libres et cassables ne sont pas autorisés dans le CMS. Les pages doivent utiliser des sections et variantes verrouillées.

---

## 8. Composants standards

**Button :**
- `.button` pour action standard
- `.button.primary` pour action principale
- Future variante recommandée : `.button.premium` pour CTA noir

**Card :**
- `.card` pour cartes publiques
- `.admin-card` pour panneaux admin
- `.media-card` pour médias
- `.cms-preview-block` pour aperçu du studio

**Section :**
- `.section` pour blocs publics
- `.section-head` pour titre + action
- Variantes futures : `light`, `cream`, `dark`, `editorial`

**Hero :**
- `.hero`, `.hero-copy`, `.hero-image`
- Image forte, texte respirant, CTA limités
- Éviter de surcharger le hero avec trop de métriques

**Badge :**
- `.tags span`, `.settings-pill`, `.media-metrics span`
- Radius pill, fond orange doux, texte orange

**Form field :**
- `label`, `input`, `textarea`, `select`
- Labels visibles, focus visible, pas de champs sans contexte

**Admin table :**
- `.admin-table`
- Données lisibles, actions explicites, pas de densité excessive

**Sidebar :**
- `.admin-sidebar`
- Navigation claire, état actif contrasté

**CTA :**
- CTA principal orange
- CTA premium noir pour sections fortes
- CTA secondaire sobre

---

## 9. Variantes autorisées

**Buttons :** `primary` · `secondary` · `ghost` · `premium`

**Cards :** `editorial` · `featured` · `compact` · `media`

**Sections :** `light` · `cream` · `dark` · `editorial` · `split`

**Hero :** `editorial` · `immersive` · `minimal` · `dark`

> Pour l'instant, ces variantes sont documentées comme direction. La migration doit se faire composant par composant, sans refonte brutale.

---

## 10. Règles responsive

**Breakpoints actuels :**

| Seuil | Valeur |
|---|---|
| Tablette | `960px` |
| Mobile | `680px` |

**Règles :**

- Les grilles passent progressivement de 4 colonnes à 2, puis 1
- Les images hero ne doivent pas devenir trop hautes sur mobile
- Les CTA doivent rester lisibles et empilables
- L'admin doit rester utilisable au minimum sur tablette
- Les modales doivent tenir en hauteur avec scroll interne

> Le responsive doit être systémique. Éviter les corrections isolées page par page.

---

## 11. Règles admin

L'admin doit être visuel, rassurant et dense seulement quand c'est utile.

- Sidebar claire
- Panneaux blancs avec bordures fines
- Boutons cohérents
- Formulaires lisibles
- Tables sobres
- Médiathèque très visuelle
- Pas de paramètres techniques visibles sans nécessité

> L'admin ne doit pas ressembler à un outil technique brut. Il doit donner l'impression d'un studio éditorial.

---

## 12. Règles site public

Le site public doit être éditorial et humain.

- Héros forts mais pas surchargés
- Cartes avec images bien cadrées
- Sections alternant blanc, crème et noir premium
- Textes hiérarchisés
- CTA peu nombreux mais clairs
- Pas de faux effet SaaS
- Pas de répétition mécanique de grilles identiques

> Les pages publiques doivent donner envie de découvrir, lire, participer et rejoindre.

---

## 13. Ce qui est interdit

**Interdits design :**

- Nouvelles couleurs hors tokens sans justification
- Styles inline permanents
- Gradients décoratifs génériques
- Cartes imbriquées dans des cartes
- Badges utilisés comme boutons
- Héros trop marketing
- Pages construites avec quatre grilles identiques à la suite
- Ombres trop fortes
- Textes trop petits sur mobile
- Composants admin qui exposent des chemins techniques comme interface principale

**Interdits techniques :**

- Dupliquer une variante CSS déjà existante sous un autre nom
- Ajouter une librairie UI lourde sans décision d'architecture
- Introduire Tailwind dans ce projet sans migration officielle
- Mélanger règles métier et styles

---

## 14. Dette design restante

- Pas encore de composants UI centralisés `Button`, `Card`, `Section`, `Badge` dans `src/components/ui`
- Beaucoup de styles vivent encore dans un seul fichier global
- Certaines valeurs CSS restent à migrer progressivement vers variables
- Les variantes documentées ne sont pas encore toutes matérialisées en composants
- L'admin et le public partagent encore des classes génériques comme `.button`
- Les cards publiques restent assez uniformes
- Le système de thèmes clair/sombre par section doit être formalisé

**Migration recommandée :**

1. Créer `src/components/ui/Button.tsx` sans migrer tout le site d'un coup
2. Créer `Card`, `Section`, `Badge` progressivement
3. Extraire les styles admin et public en couches lisibles
4. Remplacer les valeurs magiques restantes par des variables
5. Documenter chaque nouvelle variante avant usage large
