# Audit de conformité — Manssuétude

> RGPD / ePrivacy / sécurité / accessibilité / droit français
>
> Audit basé sur lecture du code source réel du dépôt (aucune modification apportée à cette occasion). Où le code seul ne suffit pas à trancher (droit à l'image, contenu réel du bucket de stockage, sous-domaine membre hors dépôt), c'est signalé explicitement plutôt que deviné.
>
> Date de l'audit : 2026-08-20.

---

## A. Résumé exécutif — les 5 problèmes les plus importants

1. **Aucune page « Mentions légales » ni « Politique de confidentialité » n'existe sur le site.** Recherche exhaustive confirmée : zéro fichier, zéro texte correspondant. Seules des mentions RNA/email éparpillées, ajoutées pour la vérification Google for Nonprofits (SEO), pas pour la conformité LCEN/RGPD.
2. **Aucun mécanisme technique de suppression des données de formulaire.** Le texte de consentement du formulaire d'adhésion promet « vous pouvez demander leur suppression à tout moment » — cette promesse n'est adossée à aucune fonctionnalité (pas de bouton, pas de route DELETE sur `form_submissions`).
3. **Sécurité : pas de CSP, liste noire XSS incomplète (4 attributs bloqués sur toute la surface `on*`), cookie de session `httpOnly: false`, aucun rate limiting/captcha sur le login admin ni les formulaires publics, bucket de médias public exposant aussi les fichiers marqués « brouillon ».**
4. **Accessibilité : la majorité des formulaires admin (Activités, Auteurs, Dossiers, Médias…) n'associent pas `label`/`input` (`htmlFor`/`id` absents)** — non-conformité claire WCAG 1.3.1/4.1.2. Le champ de recherche du header public perd totalement son indicateur de focus visible.
5. **Consentement RGPD non « éclairé » sur 6 des 7 formulaires publics** : seul le formulaire d'adhésion explique à quoi sert la donnée ; les 6 autres (projet, contenu, partenariat, don, thème, activité) n'affichent qu'un libellé nu « Consentement RGPD » sans texte explicatif ni lien vers une politique — qui de toute façon n'existe pas.

**À noter aussi** : le formulaire de contact public (`ContactForm.tsx`) simule un envoi réussi mais ne transmet ni ne stocke rien (`// TODO (E4) : brancher l'envoi réel...`) — le visiteur croit avoir été contacté, ce n'est pas le cas. Bug fonctionnel plus que juridique, mais à corriger en priorité.

---

## B. Tableau de conformité

| Domaine                  | Statut                        | Score | Problèmes principaux                                                                                               |
| ------------------------ | ----------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------ |
| RGPD                     | 🔴 Insuffisant                |  8/25 | Pas de politique de confidentialité, pas de mécanisme de suppression, consentement non éclairé sur 6/7 formulaires |
| Cookies / ePrivacy       | 🟡 Correct                    | 10/15 | Bon opt-in réel (analytics gatées), mais bandeau incomplet et pas de page cookies dédiée                           |
| Sécurité                 | 🟡 Moyen                      | 10/20 | Pas de CSP, XSS liste noire faible, pas de rate limiting/MFA, bucket médias public                                 |
| Mentions légales         | 🔴 Absent                     |  2/10 | Aucune page ; siège, hébergeur, directeur de publication absents                                                   |
| Accessibilité            | 🟡 Moyen                      |  9/15 | Public plutôt bon (landmarks, skip link, alt) ; admin largement non conforme (labels)                              |
| Droit de la consommation | ⚪ Hors champ                 |   5/5 | Pas de vente/paiement intégré détecté dans ce dépôt                                                                |
| DSA                      | ⚪ Hors champ                 |   5/5 | Pas de contenu généré par les utilisateurs, pas de forum/commentaires                                              |
| PI / droit à l'image     | ⚠️ Non vérifiable par le code |   2/5 | **Information nécessaire avant validation** — voir section E                                                       |

**Score global : 51/100 — risques importants.**

---

## C. Problèmes critiques

### [CRITIQUE] Absence totale de mentions légales

**Réglementation concernée :** droit français (LCEN, art. 6-III)
**Problème :** aucune page ne présente l'identité de l'éditeur, son siège, son directeur de publication, ni l'identité de l'hébergeur (Vercel + Supabase). Recherche exhaustive confirmée sans aucun résultat.
**Risque :** toute association exploitant un site web en France doit s'identifier légalement. C'est l'obligation la plus basique du droit du numérique français ; son absence totale est un manquement direct et facilement constatable.
**Élément concerné :** aucune page n'existe — à créer.
**Correction recommandée :** créer une page dédiée listant : dénomination, forme juridique (association loi 1901), numéro RNA (déjà connu : W951008077), siège social, nom du directeur de publication, coordonnées de l'hébergeur (Vercel Inc. + Supabase Inc., adresses), contact.
**Priorité :** Immédiate.

### [CRITIQUE] Absence de politique de confidentialité

**Réglementation concernée :** RGPD art. 13-14
**Problème :** aucune page n'explique qui traite les données, pourquoi, sur quelle base légale, combien de temps, ni comment exercer ses droits.
**Risque :** défaut d'information = manquement direct à une obligation centrale du RGPD, sanctionnable par la CNIL indépendamment de toute violation de données.
**Élément concerné :** aucune page — à créer, avec lien depuis chaque formulaire et le footer.
**Correction recommandée :** rédiger une politique couvrant chaque traitement identifié dans cet audit (formulaires, newsletter, cookies analytics, comptes admin) avec finalité + base légale + durée + destinataire pour chacun.
**Priorité :** Immédiate.

### [HAUTE] Promesse de suppression non tenue techniquement

**Réglementation concernée :** RGPD art. 17 (droit à l'effacement)
**Problème :** le formulaire d'adhésion affiche « vous pouvez demander leur suppression à tout moment », mais `formRepository`/`formSubmissionRepository` n'offrent que `list()`/`create()`/`updateStatus()` — aucune méthode de suppression, aucune route DELETE sur `form_submissions`.
**Risque :** promesse trompeuse envers les personnes concernées ; en cas de demande d'effacement, aucune fonctionnalité ne permet d'y répondre autrement que par intervention manuelle en base.
**Élément concerné :** `src/repositories/formSubmissionRepository.ts`, `src/app/admin/forms/`.
**Correction recommandée :** ajouter une action admin de suppression (et idéalement une purge automatique après une durée définie par la politique de confidentialité).
**Priorité :** Haute.

### [HAUTE] Consentement non éclairé sur 6 formulaires sur 7

**Réglementation concernée :** RGPD (consentement éclairé)
**Problème :** seul le formulaire `join` explique la finalité du traitement ; `project`, `content`, `partner`, `don`, `theme`, `activity` n'affichent qu'un intitulé nu « Consentement RGPD ».
**Risque :** un consentement sans information sur ce à quoi la personne consent n'est pas valablement recueilli au sens RGPD.
**Élément concerné :** `src/constants/forms.ts`.
**Correction recommandée :** répliquer sur les 6 autres formulaires le texte déjà rédigé pour `join`, une fois la politique de confidentialité créée (pour y renvoyer par lien).
**Priorité :** Haute.

### [HAUTE] Sécurité — absence de CSP + liste noire XSS incomplète

**Réglementation concernée :** sécurité des traitements (RGPD art. 32)
**Problème :** pas de Content-Security-Policy (décision assumée dans le code, faute de tests) ; `sanitizeHtml.ts` ne bloque que 4 attributs (`style`, `onerror`, `onload`, `onclick`) — `onmouseover`, `onfocus`, `formaction`, `srcdoc` etc. passent au travers.
**Risque :** un compte éditeur compromis (ou malveillant) peut injecter du contenu riche exécutant du JavaScript, affiché sans filet sur les pages publiques.
**Élément concerné :** `src/utils/sanitizeHtml.ts`, `next.config.ts`.
**Correction recommandée :** étendre la liste noire à tous les attributs `on*` (regex plutôt que liste figée), envisager une CSP testée d'abord en preview.
**Priorité :** Haute.

### [MOYENNE] Cookie de session non `httpOnly`, pas de rate limiting/MFA

**Réglementation concernée :** sécurité des traitements
**Problème :** `@supabase/ssr` est utilisé avec ses valeurs par défaut jamais surchargées (`httpOnly: false`) ; aucun rate limiting ni captcha sur `/admin/login` ni sur les formulaires publics ; pas de MFA.
**Risque :** combiné au point XSS ci-dessus, un vol de session devient possible en JavaScript ; brute-force possible sur le login admin sans limite applicative.
**Élément concerné :** `src/lib/supabase/server.ts`, `src/app/admin/login/actions.ts`, `src/app/api/auth/login/route.ts`.
**Correction recommandée :** surcharger les options de cookie (`httpOnly: true`, `secure: true`), ajouter un rate limiting (ex. Upstash) sur login et formulaires.
**Priorité :** Moyenne.

### [MOYENNE] Bucket de stockage public, y compris les brouillons

**Réglementation concernée :** sécurité des traitements
**Problème :** `supabase/storage.sql` déclare le bucket `manssuetude-media` en `public: true`. Le champ `visibility: "draft"` en base ne protège que l'affichage dans l'UI, pas l'accès direct au fichier par URL.
**Risque :** un fichier marqué brouillon reste téléchargeable par quiconque devine/connaît l'URL — pas de contrôle d'accès réel sur le contenu sensible non publié.
**Élément concerné :** `supabase/storage.sql`, `src/lib/media.ts`.
**Correction recommandée :** évaluer si un bucket privé avec URLs signées est nécessaire pour les médias non publiés (dépend du niveau de sensibilité réel du contenu — à valider avec l'équipe).
**Priorité :** Moyenne.

### [MOYENNE] Accessibilité — formulaires admin non associés

**Réglementation concernée :** accessibilité (WCAG 1.3.1/4.1.2)
**Problème :** dans la majorité des formulaires admin (`ActiviteForm`, `ActivityFormatForm`, `AuthorForm`, `DossierForm`, `InviteUserForm`, `MediaEditForm`, `RedirectForm`), les `<label>` n'ont pas de `htmlFor`, les `<input>` pas d'`id` — association uniquement visuelle. `NewThemeForm`/`SubThemeForm` font ça correctement, prouvant que le pattern correct existe déjà dans le projet.
**Risque :** un lecteur d'écran n'annonce pas le nom du champ à l'utilisateur.
**Élément concerné :** liste ci-dessus dans `src/components/admin/`.
**Correction recommandée :** répliquer le pattern déjà utilisé dans `NewThemeForm.tsx`/`SubThemeForm.tsx` (chaque `label` avec `htmlFor` pointant vers l'`id` du champ) sur les autres formulaires.
**Priorité :** Moyenne.

---

## D. Corrections techniques nécessaires

| #   | Fichier(s)                                                                                            | Ce qu'il faut changer                                                                        |
| --- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | `src/utils/sanitizeHtml.ts`                                                                           | Remplacer la liste figée de 4 attributs par un filtrage de tout attribut commençant par `on` |
| 2   | `src/lib/supabase/server.ts`                                                                          | Surcharger les options de cookie de session (`httpOnly: true`)                               |
| 3   | `src/repositories/formSubmissionRepository.ts` + `src/app/admin/forms/`                               | Ajouter une action de suppression d'une soumission                                           |
| 4   | `src/constants/forms.ts`                                                                              | Ajouter le texte explicatif de consentement sur les 6 formulaires qui n'en ont pas           |
| 5   | `src/components/public/ContactForm.tsx` + `src/app/api/forms/route.ts`                                | Brancher réellement l'envoi (le TODO existant dans le code)                                  |
| 6   | `src/components/admin/{Activite,ActivityFormat,Author,Dossier,InviteUser,MediaEdit,Redirect}Form.tsx` | Ajouter `htmlFor`/`id` sur chaque paire label/input                                          |
| 7   | `src/styles/editorial/search.css` (`.header-search input`)                                            | Retirer le `outline:none` inconditionnel ou fournir une alternative visible                  |
| 8   | `src/lib/media.ts` + route d'upload                                                                   | Ajouter une validation de type MIME et une taille maximale                                   |
| 9   | `next.config.ts`                                                                                      | Étudier une CSP en preview avant activation en production                                    |

Aucune de ces corrections n'a été implémentée à l'occasion de cet audit (demande explicite : lecture seule).

---

## E. Pages juridiques nécessaires

- **Mentions légales** (obligatoire, absente) — voir C.
- **Politique de confidentialité** (obligatoire, absente) — voir C.
- **Politique cookies** dédiée (recommandée — le bandeau existe mais ne renvoie vers aucune page détaillée)
- **CGU** — probablement nécessaire dès qu'il y a un espace membre (hors de ce dépôt, non audité)
- **CGV** — à déterminer : **information nécessaire avant validation** — le formulaire `don` collecte un montant/fréquence mais aucun prestataire de paiement (Stripe/PayPal/HelloAsso...) n'a été trouvé dans ce dépôt. S'il existe un point de paiement réel (peut-être sur le sous-domaine membre, hors dépôt), il faudrait l'auditer séparément.
- **Politique d'accessibilité** — non obligatoire pour une association de cette taille sauf mission de service public, mais bonne pratique.

---

## F. Cookies et services tiers — inventaire

| Élément                           | Finalité                 | Fournisseur                | Consentement requis ?        | Chargé avant consentement ?                     | Données transmises                           |
| --------------------------------- | ------------------------ | -------------------------- | ---------------------------- | ----------------------------------------------- | -------------------------------------------- |
| Vercel Analytics                  | Mesure d'audience        | Vercel                     | Oui                          | Non — bien gaté                                 | Visite, pages vues                           |
| Vercel Speed Insights             | Web vitals               | Vercel                     | Oui                          | Non — bien gaté, mais pas nommé dans le bandeau | Perf navigateur                              |
| Google Fonts (`next/font/google`) | Typographie              | Auto-hébergé au build      | Non                          | —                                               | Aucune (pas d'appel runtime à Google)        |
| Resend                            | Emails transactionnels   | Resend                     | Non (nécessaire au service)  | —                                               | Email du visiteur, serveur-à-serveur         |
| Brevo                             | Newsletter               | Brevo                      | Oui (case dédiée)            | —                                               | Email, serveur-à-serveur, pas stocké en base |
| Supabase                          | Hébergement données/auth | Supabase                   | Non (infrastructure)         | —                                               | Toutes les données de l'app                  |
| Google Drive API                  | Import médias admin      | Google                     | Non (usage admin uniquement) | —                                               | Fichiers importés par l'admin                |
| `next/image` remotePatterns       | Affichage images         | Supabase/Google/Cloudinary | Non déclaré au bandeau       | Requêtes passives au chargement                 | Fuite IP/UA vers ces domaines                |

Bon point à souligner : **aucun tracker non déclaré trouvé** (pas de GA, Meta Pixel, Hotjar, Sentry, reCAPTCHA) — le bandeau correspond globalement à la réalité technique, à l'exception de Speed Insights non nommé.

---

## G. Sécurité — synthèse

**Points forts confirmés** : pas de SQL brut (tout passe par Supabase JS paramétré), whitelist stricte des collections modifiables, secrets jamais exposés côté client, `.env.local` bien ignoré par git et jamais committé, gestion d'erreurs qui masque bien les stack traces au client, honeypot anti-spam en place, endpoint `/api/seed` neutralisé en production, RBAC correctement vérifié sur presque toutes les routes API (seule `admin/search` vérifie l'authentification sans granularité de permission par section).

**Points faibles** : voir section C (CSP, XSS, cookie session, rate limiting, MFA, bucket public). Pas d'IDOR trouvé — il n'existe pas d'espace membre public avec données personnelles par utilisateur dans ce dépôt (le sous-domaine `membre.manssuetude.com` est hors dépôt, non auditable ici).

---

## H. Accessibilité — synthèse

**Points forts** : landmarks corrects, un seul h1 par page, skip link fonctionnel, `lang="fr"`, zoom non bloqué, alt text globalement bien renseigné côté public, composants interactifs custom (bulles de format, PERCA) correctement accessibles au clavier avec `role`/`aria-*`.

**Points faibles** : association label/input défaillante sur la majorité des formulaires admin, focus invisible sur la recherche du header public, quelques indicateurs de focus faibles (changement de couleur seul plutôt qu'un contour net) sur plusieurs champs, aucune transcription/sous-titre géré par le CMS pour les vidéos/podcasts embarqués (dépend entièrement de YouTube/Vimeo).

---

## I. Plan d'action

**À faire immédiatement**

- Créer la page Mentions légales
- Créer la page Politique de confidentialité
- Corriger le formulaire de contact qui ne transmet rien

**À faire cette semaine**

- Étendre la liste noire XSS de `sanitizeHtml.ts`
- Ajouter le texte de consentement sur les 6 formulaires qui n'en ont pas
- Ajouter `htmlFor`/`id` sur les formulaires admin non conformes
- Corriger le focus invisible de la recherche du header

**À faire ensuite**

- Ajouter la suppression des soumissions de formulaire (droit à l'effacement)
- `httpOnly` sur le cookie de session + rate limiting/MFA sur le login
- Revoir la visibilité du bucket de médias pour les brouillons
- Étudier une CSP testée en preview

---

## J. Score final

**Score global : 51/100 — risques importants.**

Le site présente des fondations techniques honnêtes par endroits (consentement cookies réellement opt-in, RBAC globalement bien appliqué, pas d'injection SQL, secrets bien isolés), mais deux manquements structurels majeurs — l'absence totale de mentions légales et de politique de confidentialité — pèsent lourd et sont les priorités absolues avant toute autre correction.

Aucun problème majeur supplémentaire n'a été identifié au-delà de ceux listés ici, sous réserve des informations disponibles dans ce dépôt et de l'évolution de la réglementation. Le sous-domaine membre (`membre.manssuetude.com`) est hors de ce dépôt et n'a pas pu être audité. **La conformité juridique finale doit être validée par un professionnel du droit compétent**, notamment pour la rédaction des mentions légales et de la politique de confidentialité.

**Information nécessaire avant validation :**

- Existe-t-il un prestataire de paiement réel pour les dons (Stripe, HelloAsso, etc.) ? Sur quel système (ce dépôt ou le sous-domaine membre) ?
- Qui est le représentant légal / directeur de publication de l'association, pour les mentions légales ?
- Les photos/vidéos utilisées sur le site disposent-elles d'autorisations de droit à l'image documentées (notamment pour d'éventuels mineurs) ?
