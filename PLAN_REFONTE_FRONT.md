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
- [ ] C2. Thèmes (liste + détail, 2 niveaux Thème → Séance)
- [ ] C3. Activités (liste + détail)
- [ ] C4. Productions (liste + détail)
- [ ] C5. Projets (liste + détail)
- [ ] C6. À propos (avec section PERCA intégrée)
- [ ] C7. Nous soutenir
- [ ] C8. Nous rejoindre
- [ ] C9. **Formulaire « Nous joindre » (contact)** — design + validation (Zod) + envoi vers l'admin

### Phase D — Responsive & polish

- [ ] D1. Vérification mobile / tablette / desktop sur toutes les pages
- [ ] D2. Micro-animations retenues (motion sobre, `prefers-reduced-motion`)
- [ ] D3. Accessibilité (contrastes, focus, navigation clavier)

### Phase E — Rebranchement & contenu réel

- [ ] E1. Reconnecter le contenu éditable (props ↔ table `pages`)
- [ ] E2. Retirer la route `perca` (fusionnée)
- [ ] E3. **Remplir la base avec le contenu réel** issu des documents de l'asso (dossier `documents-asso/`) — pages, thèmes, séances, activités, productions, projets, PERCA, contact
- [ ] E4. Brancher le **formulaire « Nous joindre »** sur l'admin (réception des messages) + coordonnées réelles
- [ ] E5. Vérification build + gates (typecheck, lint, format)

> **Note contenu :** le remplissage de la base (E3/E4) se fait **à la connexion admin ↔ public**, à partir des documents déposés dans `documents-asso/` (voir la liste exigée dans `documents-asso/README.md`).

---

## Tableau de suivi

| Point                                    | Statut       | Ce qui a été fait                                                                                                                                                                                                                   | Fichiers touchés                                                                                          |
| ---------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A1. Polices                              | ✅ Fait      | Newsreader (serif) + Inter (sans) via `next/font`, en variables CSS. Fraunces écarté (banni par la skill design).                                                                                                                   | `src/app/layout.tsx`                                                                                      |
| A2. Design system (tokens)               | ✅ Fait      | Tokens couleur (marque orange + terracotta, neutres chauds), échelle typo (clamp), espacement, rayons — scopés `.site-shell`. Ocre supprimé (1 seule famille d'accent).                                                             | `src/styles/editorial.css` (créé)                                                                         |
| A3. Composants de base                   | ✅ Fait      | Boutons primaire/secondaire, chapô terracotta à filet, styles de base typo                                                                                                                                                          | `src/styles/editorial.css`                                                                                |
| B1. Header                               | ✅ Fait      | Header responsive sticky (burger mobile), PERCA retiré, lien actif souligné, « Nous soutenir » + CTA « Rejoindre »                                                                                                                  | `src/components/layout/SiteHeader.tsx`, `src/styles/editorial.css`                                        |
| B2. Footer                               | ✅ Fait      | Colonnes par défaut (Explorer / L'association), grille responsive, barre bas (© + baseline)                                                                                                                                         | `src/components/layout/SiteFooter.tsx`, `src/styles/editorial.css`                                        |
| C1. Accueil                              | ✅ Fait      | Page éditoriale : Hero **identité d'abord** (body scindé), bloc **Sujet du moment** (eyebrow+titre+média), Activités récentes, Productions récentes, **Méthode PERCA**, CTA Rejoindre/Soutenir. Alimenté par la DB. Typecheck vert. | `src/components/public/HomeEditorial.tsx` (créé), `src/app/(public)/page.tsx`, `src/styles/editorial.css` |
| C2. Thèmes                               | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| C3. Activités                            | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| C4. Productions                          | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| C5. Projets                              | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| C6. À propos (+ PERCA)                   | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| C7. Nous soutenir                        | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| C8. Nous rejoindre                       | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| C9. Formulaire « Nous joindre »          | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| D1. Responsive                           | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| D2. Animations                           | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| D3. Accessibilité                        | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| E1. Rebranchement contenu                | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| E2. Retrait route perca                  | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| E3. Remplir la base (docs asso)          | Non commencé | En attente des documents dans `documents-asso/`                                                                                                                                                                                     | `documents-asso/` (créé)                                                                                  |
| E4. Brancher formulaire « Nous joindre » | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |
| E5. Build + gates                        | Non commencé | —                                                                                                                                                                                                                                   | —                                                                                                         |

---

### Note de transparence

Avant ta demande de plan, j'avais déjà **ébauché** les points A1, A2, A3 et B1 (marqués « À valider » ci-dessus). Si tu valides le plan, on les considère comme base de travail ; si tu veux ajuster la direction, on les reprend. Rien d'autre n'a été codé.
