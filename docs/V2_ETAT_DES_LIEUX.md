# V2 — État des lieux par rapport à la liste de courses fonctionnelle

> Audit du code existant (branche `v2`, basée sur `main`) au regard du backlog fonctionnel « V2 du site Manssuétude ». Chaque ligne reprend un item du document d'origine avec son statut réel dans le code, les fichiers à l'appui, et — quand c'est utile — l'écart précis entre "ce qui existe" et "ce qui est demandé".
>
> **Légende** : ✅ fait · 🟡 partiel / existe sous une autre forme · ❌ absent
>
> Ceci est un document de travail pour discussion, pas un plan d'exécution. Rien n'a été implémenté à partir de cet audit — voir `MEMORY`/conversation pour la suite.

---

## Résumé chiffré

| Priorité    | ✅ Fait | 🟡 Partiel | ❌ Absent | Total items audités |
| ----------- | ------- | ---------- | --------- | ------------------- |
| P0          | 4       | 12         | 5         | 21                  |
| P1          | 0       | 6          | 12        | 18                  |
| P2          | 0       | 3          | 10        | 13                  |
| P3          | 0       | 0          | 4         | 4                   |
| Transversal | 3       | 5          | 12        | 20                  |

**Lecture rapide** : le socle éditorial (contenus, relations thème/sous-thème/production, admin, sécurité RBAC) est solide. Quasiment tout ce qui touche à la **participation** (Journal, inscriptions événements, newsletter, dons, candidatures avec suivi) et à la **profondeur éditoriale** (dossiers, parcours, bibliothèque de ressources structurée) reste à construire. Plusieurs tables SQL existent déjà pour des relations qui ne sont **jamais utilisées par le code** (voir § Alertes).

---

## ⚠️ Alertes à traiter avant tout développement V2

> **Mise à jour 2026-08-24** : les 4 alertes ci-dessous, telles que constatées le 17/08, sont **toutes résolues** depuis. Conservées à titre historique (le reste du document — priorisation, items non traités — reste pertinent).
>
> 1. Résolu — `/admin/journal` renommé `/admin/historique` (audit RBAC), le nom « Journal » est réservé au Journal éditorial public, désormais implémenté (table `journal_entries`, page `/journal`).
> 2. Résolu — `theme_projects`/`production_projects` sont utilisées (migration `20260818_relational_architecture.sql`). `theme_activities`/`production_activities`/`activity_resources` ont été renommées `theme_events`/`production_events`/`event_resources` (migration `20260821_rename_activity_to_event.sql`) et sont actives. `cms-advanced.sql` (contenant `entity_relations`/`cms_collections`, jamais concrétisées en base) a été supprimé — voir `docs/DATABASE.md`.
> 3. Résolu — `MediaField.tsx` et `/admin/identity` ont été supprimés.
> 4. Résolu — `/admin/backup` a été supprimé.

1. **Collision de nom "Journal"** — `/admin/journal` existe déjà et désigne le **journal d'audit RBAC** (historique des actions admin, table `audit_logs`, `src/app/admin/journal/`, `src/lib/audit.ts`). Le "Journal éditorial" décrit en §3.1 (entrées courtes publiques, actualités/coulisses) est une **entité complètement différente et inexistante**. Il faudra soit renommer l'existant ("Historique"/"Journal d'audit"), soit choisir un autre nom pour la nouvelle fonctionnalité, pour éviter toute confusion en admin.
2. **Tables de liaison mortes** — `theme_projects`, `theme_activities`, `production_projects`, `production_activities`, `activity_resources`, `project_resources` (`supabase/schema.sql`) existent en base mais **ne sont référencées par aucun repository ni composant** (0 usage confirmé). Idem pour `entity_relations`/`cms_collections` (`supabase/cms-advanced.sql`). L'architecture relationnelle demandée en §2.4 est donc en grande partie **à construire**, pas juste à "activer" — mais une partie du schéma existe déjà, à évaluer au cas par cas (garder/adapter vs. repartir sur un schéma plus simple, sur le modèle de ce qu'on a fait pour thème↔sous-thème).
3. **`MediaField.tsx`** (sélecteur de média réutilisable) a des boutons "Choisir depuis la médiathèque" / "Choisir depuis Google Drive" **sans `onClick`** — composant non fonctionnel, utilisé nulle part sauf `/admin/identity` (page elle-même non câblée). La "réutilisation d'un média déjà ajouté" (§2.2) est à construire.
4. **`/admin/backup`** existe déjà comme page mais est vide (aucune logique d'export/import implémentée) — à ne pas confondre avec "fait".

---

## P0 — Socle indispensable

### 2.1 Productions, articles et contenus

| Item                                                             | Statut | Détail                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recherche globale                                                | 🟡     | `/recherche` couvre bien thèmes/sous-thèmes/productions/activités/projets, mais c'est un filtre en mémoire (`.includes()` sur toutes les entités chargées), pas un moteur d'indexation. Suffisant pour le volume actuel, à revoir si le contenu grossit beaucoup.                                                          |
| Filtres productions (type/thème/date/auteur/projet, tri)         | 🟡     | Seul le filtre **type** existe (`FilterBar`, `productions/page.tsx`). Pas de filtre thème/sous-thème, date, auteur ni projet associé (pas de relation production↔projet de toute façon, voir alerte #2).                                                                                                                   |
| Tags cliquables                                                  | ❌     | Tags affichés en texte simple partout (`CardGrid`, fiches détail) — jamais de lien, pas de page `/tags/[tag]`.                                                                                                                                                                                                             |
| Bloc « À lire aussi »                                            | 🟡     | Existe uniquement via le sous-thème partagé (« Dans le même sous-thème »). Pas de recommandation par tag commun ou par projet.                                                                                                                                                                                             |
| Temps de lecture automatique                                     | ❌     | Champ `readingTime` existe mais est **saisi manuellement** dans l'admin (pas de calcul automatique depuis la longueur du texte).                                                                                                                                                                                           |
| Partage social natif (LinkedIn/X/WhatsApp/copie lien)            | ❌     | Aucun bouton de partage trouvé sur les fiches publiques.                                                                                                                                                                                                                                                                   |
| Téléchargement PDF                                               | ✅     | Fait cette session (upload PDF + bouton de téléchargement avec libellé personnalisable).                                                                                                                                                                                                                                   |
| Métadonnées structurées                                          | 🟡     | Auteur = texte libre (pas de fiche Auteur réutilisable), date/type/temps de lecture/fichier existent. Thème accessible seulement via le sous-thème (indirect).                                                                                                                                                             |
| Sommaire automatique + ancres                                    | 🟡     | Les titres (h2-h4) reçoivent un id d'ancre automatiquement, et les liens de sommaire collés depuis Google Docs/Word sont réécrits pour pointer dessus (fait cette session). Mais il n'y a **pas de sommaire généré et affiché** si l'auteur n'en a pas collé un lui-même (pas de composant "table des matières" autonome). |
| Notes, citations, références, tableaux, graphiques, infographies | 🟡     | Citations (`blockquote`) et tableaux gérés par l'éditeur riche. Pas de notes de bas de page structurées, pas de bibliographie, pas de composant graphique/infographie dédié.                                                                                                                                               |

### 2.2 Vidéos, audio et médias

| Item                                                         | Statut | Détail                                                                                                                                                                                                                                       |
| ------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ajouter une vidéo depuis l'admin                             | 🟡     | Un lien YouTube/Vimeo collé dans le corps (CKEditor, plugin `MediaEmbed`) s'affiche en embed — mais sans métadonnées structurées. Le type `ContentBlock` "video" existe dans le code mais **n'est jamais rendu ni édité nulle part** (mort). |
| Upload vidéo direct / CDN dédié                              | ❌     | Pas d'upload vidéo natif ; tout upload passe par le même pipeline que les autres fichiers (Supabase Storage), pas de CDN vidéo dédié.                                                                                                        |
| Intégration YouTube/Vimeo                                    | 🟡     | Fonctionne en embed brut via CKEditor (pas de formulaire dédié avec miniature/titre/durée/intervenants). L'assistant d'import média a un onglet "YouTube/Vimeo" mais c'est un **placeholder non fonctionnel** (`ImportWizard.tsx`).          |
| Association vidéo ↔ thème/projet/activité/production/Journal | ❌     | Pas de structure vidéo distincte, donc pas d'association possible.                                                                                                                                                                           |
| Lecteur vidéo responsive                                     | 🟡     | Hérité de l'embed CKEditor par défaut, pas de lecteur custom.                                                                                                                                                                                |
| Audio/podcast                                                | ❌     | "Podcast" n'est qu'une catégorie de Production parmi d'autres, pas un lecteur audio dédié.                                                                                                                                                   |
| Médiathèque administrable                                    | ✅     | `/admin/media` fonctionne (upload, liste, types).                                                                                                                                                                                            |
| Réutilisation d'un média déjà uploadé                        | ❌     | Voir alerte #3 — `MediaField.tsx` non câblé, chaque formulaire ré-uploade son propre fichier.                                                                                                                                                |

### 2.3 Agenda et événements

| Item                                                                           | Statut | Détail                                                                                                                                                                                     |
| ------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Agenda public (vue calendrier)                                                 | 🟡     | `ActivityCalendar.tsx` existe mais **réservé à l'admin**. Le site public (`/activites`) n'a qu'une liste filtrable, pas de vue calendrier.                                                 |
| Page événement complète (horaires, adresse, capacité, intervenants, programme) | ❌     | La fiche activité n'a que format/description/date (jour, pas d'heure)/documents. Aucun de ces champs n'existe dans le type `Activity`.                                                     |
| Lien EventBrite                                                                | ❌     | Aucune trace dans le code.                                                                                                                                                                 |
| Statuts (à venir/inscriptions ouvertes/complet/terminé)                        | 🟡     | Seul un badge "à venir/passée" calculé côté client à partir de la date. Pas de statut d'inscription.                                                                                       |
| Après l'événement (photos, replay, compte-rendu, ressources)                   | 🟡     | Le champ `gallery` existe en base mais **n'est jamais affiché publiquement** (utilisé uniquement pour l'image Open Graph). `documents` est affiché mais sans mise en forme "compte-rendu". |

### 2.4 Architecture éditoriale relationnelle

C'est la section la plus structurante du backlog — et celle où l'écart entre "table SQL présente" et "relation réellement exploitée" est le plus important.

| Relation demandée                  | Statut | Détail                                                                                                                                                 |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Thème ↔ sous-thèmes                | ✅     | Fait cette session (`sub_themes`, page thème = liste de sous-thèmes).                                                                                  |
| Thème ↔ productions                | 🟡     | Existe uniquement **indirectement** via thème→sous-thème→production (choix produit cette session : plus de lien direct thème-production).              |
| Thème ↔ activités                  | ❌     | Table `theme_activities` existe, jamais utilisée.                                                                                                      |
| Thème ↔ projets                    | ❌     | Table `theme_projects` existe, jamais utilisée.                                                                                                        |
| Projet ↔ productions               | ❌     | Table `production_projects` existe, jamais utilisée.                                                                                                   |
| Projet ↔ activités                 | ❌     | Table `production_activities` existe, jamais utilisée.                                                                                                 |
| Projet ↔ Journal                   | ❌     | Le Journal éditorial n'existe pas (voir alerte #1).                                                                                                    |
| Projet ↔ médias                    | ❌     | Pas de relation structurée.                                                                                                                            |
| Production ↔ auteur(s)             | 🟡     | `author` est un champ texte libre, pas une fiche Auteur réutilisable/reliable à plusieurs productions.                                                 |
| Production ↔ ressources/références | ❌     | Pas de relation.                                                                                                                                       |
| Activité ↔ intervenants            | ❌     | Aucun champ "intervenants" dans le type `Activity`.                                                                                                    |
| Page Thème = hub                   | 🟡     | Montre les sous-thèmes, mais pas directement projets/activités liés (puisque ces relations n'existent pas).                                            |
| Page Projet = hub                  | ❌     | `ProjetDetail.tsx` affiche uniquement description/objectifs/livrables/documents — aucun contenu lié (productions, activités, Journal, équipe, médias). |

---

## P1 — Journal et participation

### 3.1 Journal de Manssuétude

❌ **Entièrement à construire.** Voir alerte #1 sur la collision de nom. Aucune des sous-fonctionnalités (entrées courtes, catégories, association à thème/projet/activité/production, mise en avant homepage, filtres, programmation) n'existe.

### 3.2 Contributions extérieures

| Item                                                                           | Statut | Détail                                                                                                                                          |
| ------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Formulaire "Proposer une contribution"                                         | 🟡     | Existe (`content`), mais sans pièce jointe (retirée volontairement, cf. CLAUDE.md) et sans certains champs (type précis limité).                |
| Accusé de réception automatique                                                | ❌     | Confirmé : aucun email n'est envoyé à l'auteur de la soumission (Resend n'est utilisé que pour les invitations d'équipe).                       |
| Workflow interne détaillé (soumis→en étude→accepté/refusé→en rédaction→publié) | ❌     | Seul un statut générique à 4 valeurs existe (reçu/en cours/traité/archivé), commun à tous les types de formulaires — pas un pipeline éditorial. |

### 3.3 Newsletter

❌ **Absent.** Aucune intégration à un outil d'emailing marketing (Brevo ou autre), aucun formulaire d'inscription. Un champ `newsletterEnabled` existe dans la config footer mais n'est lu/affiché nulle part (orphelin).

### 3.4 Rejoindre / candidater

| Item                                 | Statut | Détail                                                                                                                                                                                                                     |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formulaire de candidature            | 🟡     | Existe (`join`) avec identité/contact/centres d'intérêt/motivation/consentement RGPD. Pas de champs "compétences", "disponibilités" ni "commissions souhaitées" (ce dernier existe seulement sur le formulaire `project`). |
| Upload CV                            | ❌     | Le type de champ "file" existe dans le modèle de formulaire mais n'est utilisé par aucun des 7 formulaires.                                                                                                                |
| Confirmation automatique au candidat | ❌     | Même constat que pour les contributions — aucun email sortant vers le visiteur.                                                                                                                                            |
| Suivi interne du statut              | 🟡     | Statut générique (reçu/en cours/traité/archivé), pas un workflow de recrutement dédié.                                                                                                                                     |

### 3.5 Soutenir Manssuétude

❌ **Absent en tant que module de paiement.** Le formulaire `don` ne collecte qu'une intention (montant en texte libre, fréquence, message) stockée comme une soumission classique. Aucune intégration de paiement (Stripe ou autre), aucune page de remerciement dédiée, aucun suivi de conversion.

---

## P2 — Profondeur éditoriale et différenciation

| Item                                                                                                                                                      | Statut | Détail                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dossiers/collections                                                                                                                                      | ❌     | `cms_collections`/`entity_relations` existent en base, jamais utilisés (0 référence dans le code applicatif).                                                                                                                                                                              |
| Parcours de lecture                                                                                                                                       | ❌     | Aucune trace.                                                                                                                                                                                                                                                                              |
| Bibliothèque de ressources                                                                                                                                | 🟡     | `/ressources` existe et liste la médiathèque publiquement, mais sans les champs demandés (auteur/institution/source/thème structurés — le modèle `Media` ne les a pas) ni recherche/filtre sur cette page. Administrée via `/admin/media` (pas de section dédiée "Commission Ressources"). |
| Expérience de lecture avancée (barre de progression, impression, aperçu PDF intégré, citer cette publication, bibliographie, versions, partage d'extrait) | ❌     | Aucun de ces éléments n'existe (vérifié point par point : pas de `@media print`, pas de composant progress-bar, pas de viewer PDF intégré).                                                                                                                                                |
| PERCA dynamique                                                                                                                                           | ❌     | Les 5 étapes sont un texte statique codé en dur (`PercaEditorial.tsx`), pas cliquables, pas de contenu détaillé par étape ni de champ admin correspondant.                                                                                                                                 |
| Mesure d'impact et analytics                                                                                                                              | ❌     | Pas de compteurs administrables, pas de suivi de vues/téléchargements, pas de dashboard analytics interne. Seuls `@vercel/analytics`/`@vercel/speed-insights` sont branchés (mesure technique générique, pas métier).                                                                      |

## P3 — Évolutions futures

❌ Aucun des 4 items (favoris, historique de consultation, recommandations personnalisées, notifications de suivi de thème) n'existe — cohérent avec leur priorité basse, rien d'anormal à ce stade.

---

## Éléments transversaux

### 7.1 Homepage et mise en avant éditoriale

✅ **Déjà largement fait**, et bien fait : `/admin/homepage` permet de configurer le bloc "sujet du moment" (thème + image) sans intervention technique, plus la mise en avant par étoile cliquable pour thèmes/productions (max 4)/activités (max 3) — voir `CLAUDE.md`. Pas de sélections éditoriales nommées type "À découvrir"/"En débat" au-delà de ça (🟡 sur ce point précis).

### 7.2 SEO, partage et navigation

| Item                                              | Statut | Détail                                                                                                                                                                                         |
| ------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Meta title/description administrables par contenu | 🟡     | Existe seulement sur les `pages` statiques (accueil, à propos...), **absent** sur productions/activités/projets/thèmes — ces derniers dépendent du calcul automatique (`buildDetailMetadata`). |
| URLs propres et stables                           | ✅     | Confirmé (routage par slug partout).                                                                                                                                                           |
| Open Graph personnalisé                           | ✅     | `buildDetailMetadata` génère OG + Twitter Card par fiche.                                                                                                                                      |
| Données structurées (JSON-LD)                     | 🟡     | Organization + WebSite au niveau global (`layout.tsx`), pas de schéma spécifique par type de contenu (Article/Event/Person).                                                                   |
| Sitemap automatique                               | ✅     | `src/app/sitemap.ts`, couvre toutes les entités publiées.                                                                                                                                      |
| Canonical URLs                                    | ✅     | Gérées par `buildDetailMetadata`.                                                                                                                                                              |
| Redirections 301                                  | ❌     | Aucun mécanisme.                                                                                                                                                                               |
| Page 404 utile (recherche + recommandations)      | 🟡     | Existe mais message simple, sans recherche ni recommandations.                                                                                                                                 |
| Formulaire de contact contextualisé               | 🟡     | Les formulaires existent et sont contextualisés par type (join/project/content/partner/don/theme/activity), mais pas dynamiquement "selon la page d'origine" au sens navigateur.               |

### 7.3 Socle technique

| Item                                         | Statut | Détail                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Responsive mobile/tablette/desktop           | 🟡     | Corrigé pour les pages principales cette session (justification, largeurs, header). Pas d'audit exhaustif de tout le site.                                                                                                                                                                                          |
| Optimisation performance/temps de chargement | 🟡     | ISR (`revalidate = 60`) en place partout. Pas d'audit Lighthouse formalisé.                                                                                                                                                                                                                                         |
| Compression et lazy loading des images       | ❌     | **`next/image` n'est utilisé nulle part** dans le code — uniquement des balises `<img>` brutes. `next.config.ts` a pourtant déjà la config `images.remotePatterns` prête (Supabase/Google Drive/Cloudinary), juste non exploitée. C'est le gain de performance le plus simple et le plus impactant à faible effort. |
| Accessibilité                                | 🟡     | `alt` présent sur la plupart des images clés, `:focus-visible` géré. Pas de lien "aller au contenu" (skip-link). Pas d'audit accessibilité formel (contrastes, ARIA, navigation clavier complète).                                                                                                                  |
| RGPD / cookies                               | ❌     | Aucune bannière de consentement cookies. Les seules mentions "cookie" dans le code concernent la session technique Supabase Auth, sans rapport avec le consentement visiteur.                                                                                                                                       |
| Protection anti-spam des formulaires         | ❌     | Aucun captcha/honeypot sur les 7 formulaires publics.                                                                                                                                                                                                                                                               |
| Sauvegardes                                  | 🟡     | Page admin "Export/Import" existe mais vide (aucune logique). Supabase a ses propres sauvegardes automatiques par défaut (hors code, à confirmer côté configuration du projet).                                                                                                                                     |
| Monitoring des erreurs                       | ❌     | Pas d'outil dédié (Sentry ou équivalent) — seulement les logs Vercel.                                                                                                                                                                                                                                               |
| Sécurisation de l'authentification           | ✅     | Supabase Auth + middleware + RBAC complet (rôles/permissions granulaires, déjà solide).                                                                                                                                                                                                                             |
| Gestion fine des droits d'accès              | ✅     | RBAC déjà en place (`lib/auth.ts`, `lib/permissions.ts`, table `roles`), très complet.                                                                                                                                                                                                                              |
| Analytics conforme au consentement           | ❌     | `@vercel/analytics` tourne sans bannière de consentement associée (cohérent avec l'absence de RGPD/cookies ci-dessus).                                                                                                                                                                                              |
| En-têtes de sécurité (CSP, etc.)             | ❌     | `next.config.ts` ne définit que du `Cache-Control`, aucun `Content-Security-Policy`/`X-Frame-Options`.                                                                                                                                                                                                              |
| Rate-limiting API                            | ❌     | Aucun throttling trouvé sur les routes API (formulaires notamment, ce qui aggrave l'absence d'anti-spam).                                                                                                                                                                                                           |

---

## 8. Automatisations

Toutes les automatisations listées dans le backlog (confirmation inscription événement, accusé de candidature, accusé de contribution, sync newsletter, alimentation newsletter/réseaux depuis une nouvelle production, bascule auto activité passée, publication programmée, invitation espace membre à la création d'un membre, confirmation de don) sont **❌ absentes**, à l'exception de :

- **Invitation espace membre** : ✅ existe déjà (`src/app/admin/users/actions.ts`, emails via Resend) — mais c'est une invitation d'équipe interne, pas le "espace membre" grand public décrit dans le backlog (qui n'existe pas non plus comme concept séparé).

---

## Ce qui est déjà solide (à ne pas refaire)

- Architecture en couches (repository/service/route) propre, un repository par entité.
- RBAC complet et éprouvé (rôles, permissions, audit log).
- Éditeur riche cohérent entre admin et public (WYSIWYG fidèle, corrigé cette session).
- Pipeline de sanitization HTML robuste (`sanitize-html`, sans dépendance fragile).
- SEO de base solide (sitemap, OG, canonical, JSON-LD global).
- Mise en avant homepage déjà administrable sans intervention technique.
- Système thème → sous-thème → production, avec sous-thèmes réutilisables et productions multi-sous-thèmes.

## Chantiers les plus structurants pour la V2 (à discuter)

1. **Modèle relationnel** : décider un schéma cohérent pour projet↔production/activité/média (les tables actuelles sont mortes, autant repartir sur un design propre plutôt que "réactiver" l'existant).
2. **Journal éditorial** : trancher le nom (collision avec le journal d'audit) puis construire l'entité de zéro.
3. **Formulaires → automatisations** : brancher les accusés de réception (Resend est déjà en place, juste pas utilisé pour ça) — gain rapide et attendu.
4. **`next/image`** : bascule à faible risque, gain de performance immédiat.
5. **Paiement (don)** et **newsletter (Brevo)** : choix de prestataires à valider avant tout développement (intégrations tierces).
6. **Anti-spam + RGPD/cookies + headers de sécurité** : à traiter comme un lot "conformité" transverse, pas optionnel comme le note le document d'origine.
