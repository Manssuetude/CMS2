# Plan de refonte — Site public Manssuétude

> Suivi de l'avancement de la refonte design du site public.
> Branche : `front` · Approche : **design-first** (on refait le visuel, alimenté par le **contenu réel de la base**, avant le rebranchement complet).
> ⚠️ Le code ne reprend qu'**après validation de ce plan**.

---

## Décisions validées (brief)

| Sujet                               | Décision                                                                                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direction visuelle                  | Éditorial sobre & chaleureux **+** finition haut de gamme                                                                                                   |
| Typographie                         | Titres **serif éditoriale** (Newsreader) · corps **sans** (Inter)                                                                                           |
| Couleurs                            | Marque conservée : **orange `#ff4d12`** (accent rare) + **crème** + **encre chaude**. Une seule famille d'accent (orange → terracotta). Pas de laiton/ocre. |
| Thèmes                              | **2 niveaux** : Thème → Séance                                                                                                                              |
| PERCA                               | Fusionné dans **À propos** (section « Notre méthode »). Route `perca` retirée en Phase E.                                                                   |
| Bloc « prochaine séance » (accueil) | Thème + sujet de la séance + un média (image)                                                                                                               |
| Accueil                             | Présenter l'**association d'abord** (demande de René), puis le « sujet du moment »                                                                          |
| Nav                                 | Accueil · Thèmes · Activités · Productions · Projets · À propos + CTA Rejoindre · (Nous soutenir : position à trancher)                                     |
| Contenu                             | On utilise le **vrai contenu de la base** (table `pages` + collections), pas de mock                                                                        |
| Données                             | ⚠️ L'asso **n'a pas** de focus géographique (CEMAC = simple exemple de sujet de séance)                                                                     |

---

## Le plan par phases

### Phase A — Fondations design

- [x] A1. Polices (serif Newsreader + sans Inter) via `next/font`
- [x] A2. Design system : tokens couleur, échelle typo, espacement, rayons, ombres
- [x] A3. Composants de base : boutons, chapô (eyebrow), filets

### Phase B — Structure

- [x] B1. Header refondu (nav 6 liens, responsive + burger mobile)
- [x] B2. Footer refondu

### Phase C — Pages (dans l'ordre convenu)

- [x] C1. Accueil (identité → sujet du moment → activités → méthode → productions → CTA)
- [x] C2. Thèmes (liste + détail, 2 niveaux Thème → Séance)
- [x] C3. Activités (liste + détail)
- [x] C4. Productions (liste + détail)
- [x] C5. Projets (liste + détail)
- [x] C6. À propos (avec section PERCA intégrée)
- [x] C7. Nous soutenir
- [x] C8. Nous rejoindre
- [x] C9. **Formulaire « Nous joindre » (contact)** — design + validation (Zod) + envoi vers l'admin

### Phase D — Responsive & polish

- [x] D1. Vérification mobile / tablette / desktop sur toutes les pages
- [x] D2. Micro-animations retenues (motion sobre, `prefers-reduced-motion`)
- [x] D3. Accessibilité (contrastes, focus, navigation clavier)

### Phase E — Rebranchement & contenu réel

- [ ] E1. Reconnecter le contenu éditable (props ↔ table `pages`)
- [ ] E2. Retirer la route `perca` (fusionnée)
- [ ] E3. **Remplir la base avec le contenu réel** issu des documents de l'asso (dossier `documents-asso/`) — pages, thèmes, séances, activités, productions, projets, PERCA, contact
- [ ] E4. Brancher le **formulaire « Nous joindre »** sur l'admin (réception des messages) + coordonnées réelles
- [ ] E5. Vérification build + gates (typecheck, lint, format)

> **Note contenu :** le remplissage de la base (E3/E4) se fait **à la connexion admin ↔ public**, à partir des documents déposés dans `documents-asso/` (voir la liste exigée dans `documents-asso/README.md`).

> **⚠️ Note images (décision) :** les images sont stockées **en BLOB directement dans la base Supabase** (pas dans Supabase Storage, pas de fichiers dans `public/`). À prendre en compte au rebranchement admin : upload → conversion/stockage en BLOB en DB, et lecture → servir le BLOB (via route API / data-URL) côté public. Les `heroImageUrl` / `focusImageUrl` actuels (fichiers `public/assets/photos/…`) sont **provisoires** pour le design et seront remplacés par les BLOB de la DB.

---

## Tableau de suivi

| Point                                    | Statut         | Ce qui a été fait                                                                                                                                                           | Fichiers touchés                                                                       |
| ---------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| A1. Polices                              | ✅ Fait        | Newsreader (serif) + Inter (sans) + Satisfy (initiale « M ») via next/font, en variables CSS. Fraunces écarté (banni skill).                                                | `src/app/layout.tsx`                                                                   |
| A2. Design system                        | ✅ Fait        | Tokens couleur (orange + terracotta, neutres chauds), échelle typo clamp, espacement, rayons — scopés `.site-shell`. Conteneur pleine largeur `min(2000px,94vw)`.           | `src/styles/editorial.css` (créé)                                                      |
| A3. Composants de base                   | ✅ Fait        | Boutons primaire/secondaire (+ hover), chapô terracotta à filet, base typo.                                                                                                 | `src/styles/editorial.css`                                                             |
| B1. Header                               | ✅ Fait        | Header sticky responsive (burger mobile), PERCA retiré, lien actif souligné animé, logo agrandi (54px), « Nous soutenir » + CTA « Rejoindre ».                              | `SiteHeader.tsx`, `editorial.css`                                                      |
| B2. Footer                               | ✅ Fait        | Footer étalé pleine largeur (nom à gauche, liens répartis), © en bas à droite, compact. Correctif clé : annulé le `display:grid` hérité de globals.css.                     | `SiteFooter.tsx`, `editorial.css`                                                      |
| C1. Accueil                              | ✅ Fait        | Page éditoriale : hero identité d'abord (body scindé, initiale M), Sujet du moment, Activités récentes (grille 3 col centrée), Productions (carrousel), méthode PERCA, CTA. | `HomeEditorial.tsx` (créé), `(public)/page.tsx`, `editorial.css`                       |
| C2. Thèmes                               | ✅ Fait (v1)   | Liste + détail éditoriaux (classes partagées `.hero/.card/.section`). Structure Thème→Séance à finaliser quand la donnée séances existera.                                  | `CardGrid.tsx`, `editorial.css`                                                        |
| C3. Activités                            | ✅ Fait (v1)   | Liste + détail éditoriaux.                                                                                                                                                  | `CardGrid.tsx`, `editorial.css`                                                        |
| C4. Productions                          | ✅ Fait (v1)   | Liste + détail éditoriaux ; carrousel swipe + défilement auto sur mobile (accueil).                                                                                         | `ProductionsCarousel.tsx` (créé), `editorial.css`                                      |
| C5. Projets                              | ✅ Fait (v1)   | Liste + détail éditoriaux.                                                                                                                                                  | `CardGrid.tsx`, `editorial.css`                                                        |
| C6. À propos (+ PERCA)                   | ✅ Fait        | Page dédiée : hero + citation + méthode PERCA (Penser · Exprimer · Relier · Concrétiser · Ancrer — vrais mots trouvés en base).                                             | `AboutEditorial.tsx` (créé), `a-propos/page.tsx`, `editorial.css`                      |
| C7. Nous soutenir                        | ✅ v1 (hero)   | Hero éditorial (PublicPage). Sections riches (façons de soutenir, impact) en attente des docs asso.                                                                         | classes partagées                                                                      |
| C8. Nous rejoindre                       | ✅ v1 (hero)   | Hero éditorial. Sections riches (qui/comment rejoindre) en attente des docs asso.                                                                                           | classes partagées                                                                      |
| C9. Formulaire « Nous joindre »          | ✅ Design fait | Page `/contact` + `ContactForm` (validation client, focus a11y) + lien footer. Modales `FormModal` restylées éditorial. Envoi réel vers l'admin = E4.                       | `ContactForm.tsx` (créé), `contact/page.tsx` (créé), `SiteFooter.tsx`, `editorial.css` |
| Cartes (cross-C)                         | ✅ Fait        | Cartes entièrement cliquables, épurées, sans flèche.                                                                                                                        | `CardGrid.tsx`, `editorial.css`                                                        |
| 404. Page en chantier                    | ✅ Fait        | 404 personnalisée : logo centré + illustration SVG (barrière + cône) + message + CTA accueil.                                                                               | `not-found.tsx` (créé), `editorial.css`                                                |
| D1. Responsive                           | ✅ v1          | Burger mobile, grilles qui s'empilent, carrousel productions mobile, contact 1 col, activités 3→1 col.                                                                      | `editorial.css` + composants                                                           |
| D2. Animations                           | ✅ v1          | Survols sobres (boutons, nav soulignée, cartes, zoom images), `prefers-reduced-motion` respecté.                                                                            | `editorial.css`                                                                        |
| D3. Accessibilité                        | ✅ v1          | Focus visibles, `aria-current`/`aria-label`, labels au-dessus des champs, `aria-invalid`.                                                                                   | `editorial.css` + composants                                                           |
| E1. Rebranchement contenu                | Non commencé   | —                                                                                                                                                                           | —                                                                                      |
| E2. Retrait route perca                  | Non commencé   | Contenu déjà déplacé dans À propos ; route `/perca` encore présente.                                                                                                        | —                                                                                      |
| E3. Remplir la base (docs asso)          | Non commencé   | En attente des documents dans `documents-asso/`.                                                                                                                            | `documents-asso/` (créé)                                                               |
| E4. Brancher formulaire « Nous joindre » | Non commencé   | Ajouter type `contact` (enum Postgres) + destinataire + POST réel.                                                                                                          | —                                                                                      |
| E5. Build + gates                        | Non commencé   | —                                                                                                                                                                           | —                                                                                      |

---

### Note de transparence

Avant ta demande de plan, j'avais déjà **ébauché** les points A1, A2, A3 et B1 (marqués « À valider » ci-dessus). Si tu valides le plan, on les considère comme base de travail ; si tu veux ajuster la direction, on les reprend. Rien d'autre n'a été codé.
