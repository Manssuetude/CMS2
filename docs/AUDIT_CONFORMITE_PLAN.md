# Plan de travail — mise en conformité

> Traduit chaque problème identifié dans [`AUDIT_CONFORMITE.md`](AUDIT_CONFORMITE.md) en tâche concrète. Rien n'est encore implémenté — ce fichier sert de suivi (à cocher au fur et à mesure). Ordre = priorité de l'audit, à valider avant de commencer.

---

## 0. Informations à obtenir avant de coder

Ces éléments ne peuvent pas être décidés depuis le code — il faut les obtenir avant de rédiger les pages légales.

- [x] Siège social : 26 rue Henri Barbusse, 95100 Argenteuil (fourni le 2026-08-20).
- [ ] Nom du représentant légal / directeur de publication — toujours manquant.
- [ ] Confirmer s'il existe un prestataire de paiement réel pour les dons (Stripe, HelloAsso…) — sur ce dépôt ou sur le sous-domaine membre (`membre.manssuetude.com`, hors dépôt). Détermine si des CGV sont nécessaires.
- [ ] Droit à l'image : les photos/vidéos utilisées disposent-elles d'autorisations documentées (notamment pour d'éventuels mineurs) ?
- [ ] Durée de conservation souhaitée pour les soumissions de formulaire (candidatures, dons, propositions) — nécessaire pour rédiger la politique de confidentialité et calibrer la purge automatique (tâche 8).
- [ ] Le sous-domaine membre (`membre.manssuetude.com`) est hors de ce dépôt — à auditer séparément si des données personnelles par utilisateur y sont gérées (espace membre, export/suppression de compte).

---

## Phase 1 — Immédiat (critique)

### 1. Page Mentions légales — 🚧 partiellement bloqué

- [x] Créer `/mentions-legales`.
- [x] Contenu : dénomination, forme juridique, numéro RNA, siège social (`HEADQUARTERS_ADDRESS`, `src/constants/site.ts`), contact. Hébergeur (Vercel Inc. + Supabase Inc.) présent sans adresse précise (non confirmée).
- [x] Ajouter un lien vers cette page dans `SiteFooter.tsx`.
- [ ] Directeur de publication — toujours manquant. Notice « à compléter » retirée de la page à la demande de l'utilisateur (2026-08-20) ; l'absence n'est plus signalée publiquement, mais reste à corriger.

### 2. Page Politique de confidentialité ✅

- [x] Créer `/politique-de-confidentialite`.
- [x] Documenter, pour chaque traitement identifié dans l'audit (formulaires publics, newsletter, cookies analytics, comptes admin) : finalité, base légale, durée de conservation, destinataires/sous-traitants (Resend, Brevo, Supabase, Vercel).
- [x] Section droits des personnes (accès, rectification, effacement, opposition, portabilité) + procédure pour les exercer + mention du droit de réclamation CNIL.
- [x] Ajouter un lien depuis `SiteFooter.tsx` et depuis chaque formulaire (`FormModal.tsx`, `NewsletterForm.tsx`, `ContactForm.tsx`).
- ⚠️ **Deux points rédigés en langage volontairement général, à préciser avec vous** : la durée de conservation exacte (aucun chiffre fourni — voir tâche 0) et la confirmation de la région d'hébergement de chaque sous-traitant (transferts hors UE). Le texte actuel ne ment pas mais reste prudent tant que ces informations ne sont pas confirmées.

### 3. Corriger le formulaire de contact (ne transmet rien actuellement) ✅

- [x] `src/components/public/ContactForm.tsx` : remplacé la simulation d'envoi par un vrai appel à `/api/forms` (`formClientService.submit`), avec état d'envoi/erreur. Accessibilité corrigée au passage (`required`/`aria-describedby` manquants, relevés par l'audit).
- [x] `contact` ajouté à l'enum `form_type` (migration `20260820c_form_type_contact.sql`, appliquée), à `FormType`, `formTypeSchema`, `PublicFormType`/`formDefinitions`, labels admin (`FormSubmissionRow.tsx`, `/admin/forms` onglets), accusé de réception (`SUBMISSION_LABELS`).
- [x] Vérifié en conditions réelles : soumission de test envoyée via l'API, retrouvée dans `form_submissions` avec le bon `form_type`, puis nettoyée. L'accusé de réception par email n'a pas été vérifié en réception réelle (dépend de la configuration Resend), mais suit le même mécanisme que les autres formulaires déjà en production.

---

## Phase 2 — Cette semaine (haute priorité)

### 4. Étendre la protection XSS ✅

- [x] `src/utils/sanitizeHtml.ts` : remplacer `FORBIDDEN_ATTRS` (liste figée de 4 attributs) par un filtrage de tout attribut commençant par `on` (regex), en conservant le test existant qui vérifie le retrait de `onerror`/`onclick`. `formaction` ajouté aussi.
- [x] Vérifier que `tests/sanitizeHtml.test.ts` (ou équivalent) couvre le nouveau comportement (`onmouseover`, `onfocus`, `formaction`…).

### 5. Texte de consentement RGPD sur tous les formulaires ✅

- [x] `src/constants/forms.ts` : ajouter le texte explicatif de consentement (même structure que le formulaire `join`) sur `project`, `content`, `partner`, `don`, `theme`, `activity`.
- [ ] Une fois la page Politique de confidentialité créée (tâche 2), faire pointer chaque texte de consentement vers elle (le hint actuel est du texte brut, pas de lien cliquable dans la bulle — à revoir si on veut un vrai lien).

### 6. Accessibilité — association label/input sur les formulaires admin ✅

- [x] Reprendre le pattern déjà correct de `NewThemeForm.tsx`/`SubThemeForm.tsx` (chaque `<label htmlFor>` lié à un `<input id>`) et l'appliquer à :
  - [x] `ActiviteForm.tsx`
  - [x] `ActivityFormatForm.tsx`
  - [x] `AuthorForm.tsx`
  - [x] `DossierForm.tsx`
  - [x] `InviteUserForm.tsx`
  - [x] `MediaEditForm.tsx`
  - [x] `RedirectForm.tsx`
  - [x] `ProductionForm.tsx`, `ProjetForm.tsx`, `JournalEntryForm.tsx`, `ThemeForm.tsx` (association partielle constatée — compléter les champs manquants)

### 7. Focus clavier visible sur la recherche du header ✅

- [x] `src/styles/editorial/search.css` (`.header-search`) : ajouté un `box-shadow` de focus sur le conteneur pilule au `:focus-within` (l'input interne n'a pas de bordure propre).
- [x] Indicateurs de focus faibles renforcés : `.newsletter-form-row:focus-within` (ring ajouté), `.settings-field input/textarea/select:focus` (ring ajouté). `.hint-tip:focus-visible` laissé tel quel (sévérité "faible" dans l'audit, la bulle qui apparaît au focus est déjà un signal visuel fort).

---

## Phase 3 — Ensuite (moyenne priorité)

### 8. Droit à l'effacement — suppression des soumissions de formulaire — 🚧 partiellement bloqué

- [x] `src/repositories/formSubmissionRepository.ts` : méthode `deleteFormSubmission`.
- [x] `src/app/admin/forms/actions.ts` (`deleteFormSubmissionAction`, journalisée via `logAction`) + UI (`/admin/forms`) : bouton « Supprimer » (`ConfirmDeleteButton`) dans le détail déplié de chaque soumission. Vérifié : suppression réelle en base testée (insertion/suppression d'une soumission de test, nettoyée).
- [ ] Selon la durée de conservation obtenue (tâche 0, toujours en attente), envisager une purge automatique (tâche planifiée ou vérification à l'ouverture de la liste).

### 9. Durcir la session admin

- [ ] `src/lib/supabase/server.ts` : surcharger les options de cookie (`httpOnly: true`, `secure: true` en production).
- [ ] Vérifier que le comportement de connexion/déconnexion admin n'est pas cassé après ce changement (test manuel du flux login → navigation admin → logout).

### 10. Rate limiting / anti-brute-force

- [ ] Ajouter une limitation de tentatives sur `loginAction` / `/api/auth/login` (ex. compteur par IP ou par email, avec délai progressif).
- [ ] Étendre la même protection aux routes `/api/forms` et `/api/newsletter` (au-delà du honeypot déjà en place).
- [ ] Évaluer si une solution externe (Upstash Ratelimit ou équivalent compatible Vercel) est nécessaire, ou si une implémentation simple en base suffit à ce stade.

### 11. Visibilité du bucket de médias

- [ ] Statuer avec l'équipe sur le niveau de sensibilité réel des médias marqués « brouillon » (`supabase/storage.sql`, bucket `manssuetude-media` actuellement `public: true`).
- [ ] Si nécessaire : évaluer le passage à un bucket privé avec URLs signées pour les fichiers non publiés — impact à mesurer sur `src/lib/media.ts` et tous les usages de `getResourceUrl`/`getPublicUrl`.

### 12. Validation des fichiers uploadés ✅

- [x] `src/utils/uploadValidation.ts` (nouveau, appelé depuis `uploadToStorage`) : whitelist d'extensions, cohérence extension/MIME déclaré, taille max 50 Mo — testé (6 tests unitaires).

### 13. Content-Security-Policy

- [ ] Rédiger une CSP de base (`next.config.ts`) en environnement de preview d'abord.
- [ ] Tester spécifiquement : CKEditor (édition riche admin), embeds YouTube/Vimeo (`youtube-nocookie.com`, `player.vimeo.com`), Vercel Analytics/Speed Insights, Google Fonts (self-hosted, ne devrait rien nécessiter).
- [ ] Activer en production une fois validée sans régression.

### 14. Page Politique cookies dédiée

- [ ] Créer une page détaillant l'inventaire des cookies/traceurs (reprendre le tableau de la section F de l'audit), liée depuis le bandeau de consentement (`CookieConsentBanner.tsx`) et le footer.
- [ ] Mentionner explicitement Vercel Speed Insights (actuellement gaté par le consentement mais non nommé dans le texte du bandeau).

---

## Non retenu pour l'instant

- **CGU/CGV** : en attente de confirmation sur l'existence d'un espace membre/paiement dans ce dépôt (tâche 0).
- **MFA sur les comptes admin** : mentionné dans l'audit sécurité, pas intégré à ce plan — à ajouter si l'équipe le juge nécessaire vu la taille de l'organisation.
- **Sous-titres/transcription des vidéos** : dépend entièrement de YouTube/Vimeo, aucune action possible côté CMS sans changer l'hébergement vidéo (écarté précédemment dans `V2_PLAN_TRAVAIL.md`, chapitre 2).
