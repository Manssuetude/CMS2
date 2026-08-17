# V2 — Plan de travail (checklist par chapitre)

> Traduit chaque écart identifié dans [`V2_ETAT_DES_LIEUX.md`](V2_ETAT_DES_LIEUX.md) en tâche concrète. Les items déjà ✅ dans l'audit ne sont pas repris ici. Rien n'est encore implémenté — ce fichier sert de base de discussion et de suivi (à cocher au fur et à mesure).
>
> Ordre indicatif = priorité du backlog d'origine (P0 → P3), pas forcément l'ordre d'exécution réel — à valider ensemble avant de commencer.

---

## 0. Alertes à trancher avant de coder

- [ ] Nom du "Journal éditorial" : renommer le journal d'audit RBAC existant (`/admin/journal`) en `/admin/historique` (« Historique ») pour libérer "Journal" pour le chapitre 5. Décidé, mais **à refaire** — ce renommage avait été fait une première fois puis perdu avec la suppression de l'ancienne branche `v2`.
- [ ] Modèle relationnel : on repart sur un schéma propre par relation, au moment de construire chacune (même approche que thème↔sous-thème). Décidé, rien à coder ici — s'applique au chapitre 4.
- [ ] Médiathèque réutilisable : `MediaField.tsx`/`/admin/identity` seront reconstruits proprement (pas réparés) au chapitre 2. Décidé.
- [ ] `/admin/backup` à retirer (page vide sans logique). Avait été fait puis perdu avec la suppression de l'ancienne branche `v2` — la page existe encore.

---

## P0 — Socle indispensable

### 1. Productions, articles et contenus

- [x] Ajouter un filtre par thème/sous-thème, date et tri chronologique sur `/productions` (en plus du filtre type existant).
- [x] Rendre les tags cliquables (page `/tags/[tag]` ou filtre équivalent) sur les fiches et les cartes.
- [x] Étendre le bloc "À lire aussi" à une recommandation par tag commun (pas seulement par sous-thème partagé).
- [x] Calculer le temps de lecture automatiquement à partir de la longueur du corps (au lieu d'un champ saisi à la main).
- [x] Ajouter des boutons de partage natif (LinkedIn, X, WhatsApp, copier le lien) sur les fiches publiques.
- [x] Générer et afficher un sommaire automatique (pas seulement corriger les liens collés) sur les contenus longs.
- [ ] Étudier un mécanisme de notes de bas de page / bibliographie structurée pour les contenus longs.

### 2. Vidéos, audio et médias

- [ ] Construire un vrai formulaire d'ajout vidéo (upload ou URL YouTube/Vimeo) avec miniature, titre, description, durée, intervenants — remplace l'embed brut CKEditor.
- [ ] Décider d'un hébergement vidéo adapté (CDN dédié) plutôt que de servir les fichiers depuis Supabase Storage.
- [ ] Finaliser l'assistant d'import média pour YouTube/Vimeo (actuellement un placeholder non fonctionnel).
- [ ] Construire l'association vidéo ↔ thème/projet/activité/production (dépend du modèle relationnel du chapitre 4).
- [ ] Ajouter une gestion audio/podcast dédiée (lecteur, durée, épisodes) — distincte de la simple catégorie "Podcast" actuelle.
- [ ] Câbler la réutilisation d'un média déjà uploadé (réparer `MediaField.tsx` : boutons "médiathèque"/"Google Drive" actuellement sans action) et l'intégrer aux formulaires (ProductionForm, ActiviteForm...).

### 3. Agenda et événements

- [ ] Construire une vue calendrier publique sur `/activites` (au-delà de la liste filtrable actuelle).
- [ ] Étendre le type `Activity` : horaires précis, adresse/lieu, capacité, intervenants, programme.
- [ ] Ajouter un champ lien EventBrite sur les activités.
- [ ] Ajouter un statut d'inscription (à venir / inscriptions ouvertes / complet / terminé), au-delà du badge à venir/passée calculé côté client.
- [ ] Afficher publiquement la galerie photo (`gallery`) des activités passées (actuellement uploadée mais jamais montrée), + section "compte-rendu" structurée.

### 4. Architecture éditoriale relationnelle

- [ ] Concevoir le modèle relationnel définitif (remplace ou adapte les tables mortes) : thème↔activité, thème↔projet, projet↔production, projet↔activité, projet↔média.
- [ ] Structurer "auteur" en fiche réutilisable (au lieu du champ texte libre actuel), reliable à plusieurs productions.
- [ ] Ajouter la relation production ↔ ressources/références.
- [ ] Ajouter un champ "intervenants" structuré sur les activités.
- [ ] Faire de la page Thème un hub complet (productions/activités/projets liés, pas seulement les sous-thèmes).
- [ ] Faire de la page Projet un hub complet (productions, activités, Journal, équipe, médias liés — actuellement une simple fiche isolée).

---

## P1 — Journal et participation

### 5. Journal de Manssuétude

- [ ] Créer l'entité "entrée de Journal" (titre, date, texte court/long, image/vidéo/audio, auteur facultatif, catégorie).
- [ ] Admin : création/édition d'entrées, association à thème/projet/activité/production, programmation de publication.
- [ ] Public : flux général du Journal, filtres par catégorie/année, mise en avant sélective sur la homepage, partage social.
- [ ] Afficher automatiquement les entrées de Journal liées dans la chronologie d'un projet (dépend du hub Projet ci-dessus).

### 6. Contributions extérieures

- [ ] Envoyer un accusé de réception automatique par email au visiteur (Resend déjà en place, juste pas branché sur ce flux).
- [ ] Étendre le statut générique (reçu/en cours/traité/archivé) vers un vrai workflow éditorial (soumis → en étude → accepté/refusé → en rédaction/révision → publié).

### 7. Newsletter

- [ ] Choisir/valider l'outil d'emailing (Brevo pressenti) avec l'équipe.
- [ ] Ajouter un formulaire d'inscription newsletter (footer, homepage, fin de contenu).
- [ ] Intégrer l'API de l'outil retenu : synchronisation des inscrits, gestion du consentement et de la désinscription.

### 8. Rejoindre / candidater

- [ ] Ajouter les champs manquants au formulaire "join" : compétences, disponibilités, commissions souhaitées.
- [ ] Activer l'upload de CV (le type de champ existe déjà dans le modèle, juste jamais utilisé).
- [ ] Envoyer une confirmation automatique au candidat + page de confirmation expliquant la suite.
- [ ] Construire un suivi de statut de candidature dédié (au-delà du statut générique de soumission).

### 9. Soutenir Manssuétude

- [ ] Choisir/valider un prestataire de paiement en ligne, sous réserve du cadre juridique de l'association.
- [ ] Construire le module de don (montant suggéré + libre, ponctuel et récurrent) avec paiement sécurisé réel.
- [ ] Distinguer soutien association / soutien projet / devenir partenaire.
- [ ] Page de remerciement personnalisée + suivi analytique des conversions.

---

## P2 — Profondeur éditoriale et différenciation

### 10. Dossiers / collections

- [ ] Concevoir l'entité "Dossier" (regroupement hétérogène : productions, vidéos, événements, ressources, Journal) — probablement à repartir de zéro plutôt que réactiver `cms_collections`/`entity_relations`.
- [ ] Page Dossier avec introduction éditoriale + sélection ordonnée de contenus, URL unique partageable.
- [ ] Permettre à un même contenu d'appartenir à plusieurs dossiers.

### 11. Parcours de lecture

- [ ] Concevoir l'entité "Parcours" : séquence ordonnée de contenus hétérogènes (articles, vidéos, activités, ressources externes) avec progression affichée.
- [ ] Admin de création/édition de parcours ; page publique de lecture guidée.

### 12. Bibliothèque de ressources

- [ ] Étendre le modèle `Media`/`Ressource` : auteur/institution, date, source, description, thème associé (au-delà des champs actuels title/description/tags/type).
- [ ] Ajouter recherche et filtres dédiés sur `/ressources` (actuellement une simple grille sans filtre).
- [ ] Décider si l'administration reste dans `/admin/media` ou devient une section "Commission Ressources" séparée.

### 13. Expérience de lecture avancée

- [ ] Barre de progression de lecture sur les contenus longs.
- [ ] Mode impression dédié (feuille de style `@media print`).
- [ ] Aperçu PDF intégré (viewer, pas seulement un lien de téléchargement).
- [ ] Fonction "Citer cette publication" (référence bibliographique générée).
- [ ] Gestion de versions/éditions d'une publication.
- [ ] Fonction de partage d'un extrait ou d'une citation forte.

### 14. PERCA dynamique

- [ ] Rendre chaque étape de la méthode PERCA cliquable, avec un contenu détaillé propre par étape (au lieu du texte statique actuel).
- [ ] Ajouter les champs admin correspondants (actuellement `/admin/perca` ne gère qu'un texte global).

### 15. Mesure d'impact et analytics

- [ ] Compteurs administrables (membres, productions, activités, participants, projets, contributeurs).
- [ ] Suivi des vues et téléchargements par production.
- [ ] Suivi des inscriptions aux événements et des conversions (visiteur → newsletter/événement/candidature/contribution/don).
- [ ] Dashboard analytics interne dans l'admin.

---

## P3 — Évolutions futures (hors périmètre V2, à anticiper dans le modèle de données)

- [ ] Favoris / "à lire plus tard" pour les membres.
- [ ] Historique des contenus consultés.
- [ ] Recommandations selon centres d'intérêt.
- [ ] Suivi d'un thème avec notification de nouveau contenu.

---

## Transversal

### 16. Homepage et mise en avant éditoriale

- [ ] Ajouter des sélections éditoriales nommées ("À découvrir", "En débat", "Pour aller plus loin") en complément du bloc "sujet du moment" déjà administrable.

### 17. SEO, partage et navigation

- [ ] Ajouter des champs meta title/description administrables sur productions, activités, projets et thèmes (actuellement réservés aux pages statiques).
- [ ] Ajouter des données structurées JSON-LD spécifiques par type de contenu (Article, Event, Person) en complément du JSON-LD global existant.
- [ ] Ajouter un mécanisme de redirections 301.
- [ ] Enrichir la page 404 (recherche + recommandations de contenus).

### 18. Socle technique

- [ ] Migrer les images vers `next/image` (la config `remotePatterns` existe déjà, juste inexploitée) — gain de performance rapide.
- [ ] Ajouter un skip-link "aller au contenu" et poursuivre l'audit d'accessibilité (contrastes, ARIA, navigation clavier).
- [ ] Ajouter une bannière de consentement cookies/RGPD.
- [ ] Ajouter une protection anti-spam sur les 7 formulaires publics (captcha ou honeypot).
- [ ] Implémenter réellement l'export/import de sauvegarde (ou retirer la page vide actuelle).
- [ ] Brancher un outil de suivi d'erreurs applicatif (Sentry ou équivalent).
- [ ] Ajouter des en-têtes de sécurité (CSP, X-Frame-Options) dans `next.config.ts`.
- [ ] Ajouter un rate-limiting sur les routes API publiques (formulaires notamment).
- [ ] Conditionner les analytics au consentement cookies une fois la bannière RGPD en place.

---

## Automatisations (dépendent des chapitres ci-dessus)

- [ ] Inscription événement → email de confirmation + ajout base participants.
- [ ] Candidature → accusé de réception + notification équipe.
- [ ] Contribution → accusé de réception + création dans le workflow interne.
- [ ] Newsletter → synchronisation avec l'outil d'emailing.
- [ ] Nouvelle production → alimentation newsletter/réseaux (déclenchement).
- [ ] Événement terminé → bascule automatique vers "activités passées".
- [ ] Publication programmée → mise en ligne automatique (Journal notamment).
- [ ] Nouveau membre → invitation espace membre (le mécanisme d'invitation existe déjà côté équipe interne, à étendre/adapter).
- [ ] Don confirmé → confirmation + enregistrement administratif.
