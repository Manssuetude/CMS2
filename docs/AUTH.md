# Authentification admin - Manssuetude CMS

> Implementation de la feature #9 : Auth securisee + espace admin (Sprint S1).

---

## 1. Vue d'ensemble

L'espace admin est protege par Supabase Auth avec gestion de session via `@supabase/ssr`. Seuls les utilisateurs crees dans Supabase Auth peuvent se connecter.

**Flux de connexion :**

```
Formulaire /admin/login
  -> Server Action loginAction
  -> supabase.auth.signInWithPassword
  -> cookies de session poses par @supabase/ssr
  -> redirect vers /admin/dashboard
```

**Flux de protection :**

```
Requete sur /admin/*
  -> middleware.ts
  -> supabase.auth.getUser() via cookies
  -> si non authentifie : redirect /admin/login
  -> si authentifie sur /admin/login : redirect /admin/dashboard
```

---

## 2. Fichiers impliques

| Fichier                            | Role                                                      |
| ---------------------------------- | --------------------------------------------------------- |
| `src/middleware.ts`                | Protection de toutes les routes `/admin/*`                |
| `src/lib/supabase/server.ts`       | Client Supabase SSR avec gestion des cookies              |
| `src/lib/auth.ts`                  | `getSession()` et `requireRole()` bases sur Supabase Auth |
| `src/app/admin/login/page.tsx`     | Page de connexion (client component)                      |
| `src/app/admin/login/actions.ts`   | Server Action de connexion                                |
| `src/app/api/auth/logout/route.ts` | Route de deconnexion                                      |
| `src/app/admin/layout.tsx`         | Layout admin avec verification de session                 |

---

## 3. Creer un utilisateur admin

Les utilisateurs admin se creent via le dashboard Supabase (Auth > Users > Add user) ou via l'API Admin avec le service role key.

Exemple via curl :

```bash
curl -X POST "https://{ref}.supabase.co/auth/v1/admin/users" \
  -H "Authorization: Bearer {SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prenom.nom@manssuetude.org",
    "password": "motdepasse-fort",
    "email_confirm": true,
    "user_metadata": { "role": "admin" }
  }'
```

Le champ `user_metadata.role` est lu par `getSession()` pour determiner le role. Valeurs acceptees : `admin`, `editor`, `contributor`, `viewer`.

Si `role` est absent du metadata, le systeme attribue `admin` par defaut (comportement attendu pour les premiers comptes).

---

## 4. Variables d'environnement requises

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # uniquement cote serveur, jamais expose
NEXT_PUBLIC_SITE_URL=        # base URL pour les redirects
```

---

## 5. Session et cookies

`@supabase/ssr` gere automatiquement les cookies de session (`sb-{ref}-auth-token`). Le middleware rafraichit la session sur chaque requete pour eviter les expirations silencieuses.

- Duree de session : 1 heure (defaut Supabase Auth, configurable dans le dashboard)
- Les cookies sont `httpOnly`, `SameSite: Lax`, `Secure` en production

---

## 6. Securite

- Aucun credential n'est stocke en clair dans le code
- Le service role key n'est utilise que cote serveur (variables sans prefix `NEXT_PUBLIC_`)
- Les messages d'erreur ne revelent pas si l'email existe ou non
- La route `/api/auth/logout` invalide la session Supabase Auth cote serveur

---

## 7. Limitations actuelles (scope S1)

- Pas de reset de mot de passe (prevu S2)
- Pas d'invite par email (prevu S2)
- Un seul niveau d'acces pour l'instant : toute personne authentifiee acces a tout l'admin
- La gestion granulaire des roles via `src/lib/permissions.ts` sera activee dans une prochaine iteration

---

[← ARCHITECTURE.md](ARCHITECTURE.md)
