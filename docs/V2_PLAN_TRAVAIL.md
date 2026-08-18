# V2 — Plan de travail (checklist par chapitre)

> Traduit chaque écart identifié dans [`V2_ETAT_DES_LIEUX.md`](V2_ETAT_DES_LIEUX.md) en tâche concrète. Les items déjà ✅ dans l'audit ne sont pas repris ici. Rien n'est encore implémenté — ce fichier sert de base de discussion et de suivi (à cocher au fur et à mesure).
>
> Ordre indicatif = priorité du backlog d'origine (P0 → P3), pas forcément l'ordre d'exécution réel — à valider ensemble avant de commencer.

---

## 0. Alertes à trancher avant de coder

- [x] Nom du "Journal éditorial" : le journal d'audit RBAC est renommé `/admin/historique` (« Historique »). "Journal" est libéré pour le chapitre 5, où il désigne maintenant le vrai Journal éditorial public.
- [x] Modèle relationnel : reparti sur un schéma propre par relation au moment de construire chacune (chapitre 4) — tables de liaison mortes réactivées où pertinent, nouvelles tables sinon.
- [x] Médiathèque réutilisable : `MediaField.tsx` retiré (code mort, plus aucun usage) plutôt que reconstruit — la réutilisation passe par `ImageCropField`, les sélecteurs auteur/ressources et `CheckboxMultiSelect` (chapitre 2).
- [x] `/admin/backup` retirée (page vide sans logique).

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

- [x] Construire un vrai formulaire d'ajout vidéo (URL YouTube/Vimeo) avec miniature (thumbnail existant), titre, description, durée, auteurs/intervenants (fiches auteur du chapitre 4) — remplace l'embed brut CKEditor. Champ `videoUrl` dédié sur les productions de type Video, rendu en lecteur intégré responsive (16:9) sur la fiche publique.
- [ ] Décider d'un hébergement vidéo adapté (CDN dédié) — écarté volontairement : on reste sur des embeds YouTube/Vimeo, pas de nouveau prestataire.
- [x] Finaliser l'assistant d'import média pour YouTube/Vimeo — formulaire fonctionnel + récupération automatique titre/miniature via oEmbed public (YouTube/Vimeo, sans clé API), vérifié contre l'API réelle.
- [x] Construire l'association vidéo ↔ thème/projet/production — une vidéo est une production (type Video), donc héritée du modèle relationnel du chapitre 4 (production↔projet, thème indirect via sous-thème). Vidéo↔activité non modélisée (pas demandé par le chapitre 4).
- [x] Ajouter une gestion audio/podcast dédiée (lecteur natif `<audio>`, durée) — même champ `videoUrl` réutilisé (fichier direct ou lien). "Épisodes" (regroupement d'une série) non construit — chaque épisode reste une production Podcast individuelle pour l'instant.
- [x] Câbler la réutilisation d'un média déjà uploadé — résolu autrement que prévu : `MediaField.tsx` était cassé et **plus utilisé nulle part** (page `/admin/identity` orpheline supprimée), donc retiré comme code mort plutôt que réparé. La réutilisation existe déjà via `ImageCropField` (images hero), le sélecteur photo des auteurs, et `CheckboxMultiSelect` (ressources/auteurs/thèmes/projets/activités) sur les formulaires de contenu.

### 3. Agenda et événements

- [x] Construire une vue calendrier publique sur `/activites` (bascule Liste/Calendrier, en plus de la liste filtrable existante). Grille mensuelle responsive (colonne unique sous 640px), logique de grille extraite en utilitaire pur partagé avec le calendrier admin (`calendarGrid.ts`, testé).
- [x] Étendre le type `Activity` : horaires précis (début/fin), adresse/lieu, capacité, intervenants (chapitre 4). Programme = corps riche existant (CKEditor), pas de champ dédié séparé.
- [x] Ajouter un champ lien EventBrite sur les activités — bouton d'inscription dédié sur la fiche publique s'il est renseigné.
- [x] Ajouter un statut d'inscription (à venir / inscriptions ouvertes / complet / terminé) — saisie manuelle admin, sinon déduit automatiquement de la date (`resolveRegistrationStatus`, testé).
- [x] Afficher publiquement la galerie photo (`gallery`) des activités passées (actuellement uploadée mais jamais montrée), + section "compte-rendu" structurée — grille photo affichée sous "Compte-rendu en images" pour les activités passées uniquement.

### 4. Architecture éditoriale relationnelle

- [x] Concevoir le modèle relationnel définitif : thème↔activité, thème↔projet, projet↔production, projet↔activité réactivés (tables mortes, maintenant utilisées) — sauf projet↔média, non fait (`documents` couvre déjà l'essentiel du besoin).
- [x] Structurer "auteur" en fiche réutilisable (au lieu du champ texte libre actuel), reliable à plusieurs productions — admin `/admin/auteurs` (CRUD complet) + sélecteur dans les productions + affichage public.
- [x] Ajouter la relation production ↔ ressources/références.
- [x] Ajouter un champ "intervenants" structuré sur les activités (nom + rôle, admin + affichage public).
- [x] Faire de la page Thème un hub complet (sous-thèmes + activités + projets liés).
- [ ] Faire de la page Projet un hub complet — productions et activités liées affichées ; **Journal** (n'existe pas encore, chapitre 5) et équipe/médias liés (projet↔média non fait) restent à construire.

---

## P1 — Journal et participation

### 5. Journal de Manssuétude

- [x] Créer l'entité "entrée de Journal" (titre, date, texte court/long, image, auteur facultatif — fiche réutilisable du chapitre 4 —, catégorie). Vidéo/audio non intégrés directement sur une entrée (le corps riche permet un embed collé, comme pour les productions avant le chapitre 2 — pas de champ dédié).
- [x] Admin `/admin/journal` : création/édition d'entrées, association à thème/projet/activité/production (FK simple, une par entrée). **Programmation de publication non faite** — statut brouillon/publié/archivé classique uniquement, pas de date de mise en ligne automatique.
- [x] Public `/journal` : flux général, filtres par catégorie/année, mise en avant sélective sur la homepage (entrées `featured`, repli sur les 3 plus récentes), partage social (réutilise `ShareButtons` du chapitre 1).
- [x] Affichage automatique des entrées de Journal liées dans la chronologie d'un projet — section "Le Journal de ce projet" sur `/projets/[slug]`.

### 6. Contributions extérieures

- [x] Envoyer un accusé de réception automatique par email au visiteur — branché sur les 7 formulaires publics (un message adapté par type), best-effort (n'échoue jamais la soumission si l'email ne part pas), vérifié en local (log gracieux sans clé Resend, comme le flux d'invitation existant).
- [ ] Étendre le statut générique (reçu/en cours/traité/archivé) vers un vrai workflow éditorial (soumis → en étude → accepté/refusé → en rédaction/révision → publié) — non fait : le statut est une colonne partagée par les 7 types de formulaires, un workflow spécifique aux contributions demanderait de la sortir de ce système commun. À concevoir avec l'équipe plutôt qu'à improviser cette nuit.

### 7. Newsletter

- [x] Choisir/valider l'outil d'emailing — Brevo confirmé, clé API fournie et testée en conditions réelles.
- [x] Ajouter un formulaire d'inscription newsletter (footer sur toutes les pages, homepage). Pas de bloc "fin de contenu" dédié — le footer couvre déjà cette position sur les fiches production/journal/activité.
- [x] Intégrer l'API Brevo : synchronisation des inscrits (création/mise à jour de contact, appel REST direct plutôt que le SDK complet `@getbrevo/brevo` — trop large pour un seul endpoint), consentement RGPD explicite (case à cocher obligatoire, même sur la variante compacte du footer). Désinscription gérée nativement par Brevo (lien automatique dans leurs emails) — rien à construire côté application.

### 8. Rejoindre / candidater

- [x] Ajouter les champs manquants au formulaire "join" : compétences, disponibilités, commission souhaitée.
- [ ] **⚠️ Conflit détecté, non fait délibérément** : "Activer l'upload de CV" contredit une décision déjà prise et testée sur ce projet — `CLAUDE.md` documente "Plus de pièce jointe" pour les formulaires publics, et `tests/forms.test.ts` a un test dédié (« pas de champ de type file (pièce jointe retirée) ») qui casserait si on l'ajoutait. Le point du backlog d'origine ("le type de champ existe déjà, juste jamais utilisé") est donc obsolète — le champ file a été retiré intentionnellement depuis. **À trancher avec l'équipe avant d'y toucher.**
- [x] Envoyer une confirmation automatique au candidat (chapitre 6, déjà branché sur les 7 formulaires) + message de confirmation détaillé expliquant la suite (délai de réponse, prochaine étape) spécifique à la candidature, affiché dans la modale après envoi.
- [ ] Construire un suivi de statut de candidature dédié — non fait, même raison que le workflow du chapitre 6 (statut partagé entre les 7 types de formulaires).

### 9. Soutenir Manssuétude

- [ ] Choisir/valider un prestataire de paiement en ligne, sous réserve du cadre juridique de l'association.
- [ ] Construire le module de don (montant suggéré + libre, ponctuel et récurrent) avec paiement sécurisé réel.
- [ ] Distinguer soutien association / soutien projet / devenir partenaire.
- [ ] Page de remerciement personnalisée + suivi analytique des conversions.

---

## P2 — Profondeur éditoriale et différenciation

### 10. Dossiers / collections — fusionné avec le chapitre 11

- [x] Concevoir l'entité "Dossier" (regroupement hétérogène : productions, activités, projets, ressources, Journal). **Décision validée** : entité neuve (`dossiers` + `dossier_items` polymorphe), pas de réactivation de `cms_collections`/`entity_relations` (schéma legacy, enum `entity_type` déjà obsolète face aux entités actuelles).
- [x] Page Dossier avec introduction éditoriale (riche) + sélection ordonnée de contenus, URL unique partageable (`/dossiers/[slug]`).
- [x] Permettre à un même contenu d'appartenir à plusieurs dossiers (table de liaison `dossier_items`, pas de contrainte d'unicité côté contenu).

### 11. Parcours de lecture — fusionné avec le chapitre 10

- [x] **Décision validée** : pas de seconde entité "Parcours" — un Dossier a un mode `guide` (parcours séquentiel numéroté, avec filet de connexion visuel) ou `libre` (grille), pour éviter deux systèmes quasi identiques.
- [x] Admin de création/édition (`/admin/dossiers`, sélecteur de contenus par type + réordonnancement manuel) ; page publique de lecture guidée (rendu numéroté en mode guidé).

### 12. Bibliothèque de ressources

- [x] Étendre le modèle `Media`/`Ressource` : auteur, institution, date de publication, thème associé (colonnes `author`/`institution`/`published_date`/`theme_id` sur `resources`). Édition via `/admin/media/[id]/edit` (nouveau, la médiathèque n'avait qu'un renommage rapide auparavant).
- [x] Ajouter recherche et filtres dédiés sur `/ressources` (texte + type + thème). **Bonus corrigé au passage** : `/ressources` et `/ressources/[slug]` affichaient tous les médias sans filtrer sur `visibility="public"` (brouillons/privés visibles publiquement) — `mediaRepository.list()` accepte maintenant un paramètre `onlyPublic`.
- [x] **Décision validée** : l'administration reste dans `/admin/media`, pas de section "Commission Ressources" séparée (pas de nouvelle permission RBAC à créer).

### 13. Expérience de lecture avancée

- [x] Barre de progression de lecture sur les contenus longs (`ReadingProgressBar`, productions et Journal).
- [x] Mode impression dédié (`@media print` — masque header/footer/CTA/sommaire, garde le texte).
- [x] Aperçu PDF intégré (`<iframe>` natif du navigateur, pas de nouvelle dépendance — sur les productions avec fichier PDF).
- [x] Fonction "Citer cette publication" (`CiteButton`, référence courte générée + copie).
- [x] Fonction de partage d'un extrait ou d'une citation forte (`QuoteShareBar`, barre flottante à la sélection de texte).

~~Gestion de versions/éditions d'une publication.~~ **Retiré du plan** (décision validée) : trop lourd pour la valeur apportée à ce stade.

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

- [ ] Migrer les images vers `next/image` (la config `remotePatterns` existe déjà, juste inexploitée) — gain de performance rapide. **Reporté** : migration transversale à risque (recadrage non destructif `cropToImageStyle` à revalider sur chaque emplacement), pas de déploiement live cette nuit pour vérifier visuellement chaque page — à faire de jour avec vérification visuelle.
- [x] Ajouter un skip-link "aller au contenu" et poursuivre l'audit d'accessibilité (contrastes, ARIA, navigation clavier). Skip-link fonctionnel (`(public)/layout.tsx`, CSS dédiée), vérifié en HTML rendu.
- [x] Ajouter une bannière de consentement cookies/RGPD. `CookieConsentBanner` (localStorage, opt-in), stylée indépendamment de `.button` (qui était taillée pour les CTA de hero et déformait le bandeau).
- [x] Ajouter une protection anti-spam sur les 7 formulaires publics (captcha ou honeypot). Honeypot simple (`src/lib/honeypot.ts`) sur `FormModal` et `NewsletterForm`, vérifié côté serveur.
- [x] Implémenter réellement l'export/import de sauvegarde (ou retirer la page vide actuelle). Page vide déjà retirée lors du nettoyage précédent.
- [ ] Brancher un outil de suivi d'erreurs applicatif (Sentry ou équivalent). **Reporté** : pas de compte Sentry disponible cette nuit.
- [x] Ajouter des en-têtes de sécurité (CSP, X-Frame-Options) dans `next.config.ts`. X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy ajoutés. **CSP volontairement omise** : trop risqué de la configurer à l'aveugle sans déploiement live pour vérifier qu'elle ne casse pas CKEditor/embeds vidéo/Analytics.
- [ ] Ajouter un rate-limiting sur les routes API publiques (formulaires notamment).
- [x] Conditionner les analytics au consentement cookies une fois la bannière RGPD en place. `ConsentGate` masque `<Analytics/>`/`<SpeedInsights/>` tant que le consentement n'est pas explicitement accepté.

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
