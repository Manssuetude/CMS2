# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Manssuétude CMS is a custom editorial Content Management System built with Next.js 15, React 19, TypeScript (strict), and Supabase/PostgreSQL. It serves a small internal team (~5–8 people) for a French intellectual association. Deployed on Vercel. The project is currently in **Phase 0** (architecture stabilization, no new product features).

## Commands

```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run typecheck     # TypeScript strict check (primary correctness gate)
npm run lint          # ESLint (aliased to typecheck in some envs)
npm run format:check  # Prettier validation
npm run test          # Node unit tests (tests/**/*.test.mjs)
npm run seed          # Seed DB from legacy content.js → Supabase
npm run db:check      # Verify Supabase connection
```

CI runs: `install → typecheck → lint → format:check → test → build`

## Architecture

The codebase enforces a strict layered architecture — dependency direction is always downward:

```
API Route / Page
  → Validation (lib/validation.ts, Zod)
  → Auth Check (lib/auth.ts, lib/permissions.ts)
  → Service (src/services/)          ← business logic, relations, SEO
      → Repository (src/repositories/) ← data access only, Supabase queries
          → Supabase (lib/db.ts)
```

**Components** (`src/components/`) have zero direct Supabase access and minimal logic. They receive data via props or hooks (`src/hooks/`).

**Repositories** are pure data access — no business decisions. One repository per entity.

**Services** own business logic: relational consistency, recommendations, SEO metadata. Services may call repositories; repositories must not call services.

**API routes** live in `src/app/api/` as Next.js Route Handlers. Each route validates input, checks auth, delegates to service/repository, and returns a standardized response via `lib/errors.ts`.

## Key Conventions

- **TypeScript strict mode** — no `any` without explicit justification; ESLint will reject it.
- **Prettier** — 120-char line width, trailing commas, double quotes. Run `format:check` before committing.
- **Path alias** — `@/*` maps to `src/*` (configured in tsconfig.json).
- **Test format** — tests are `.test.mjs` files under `tests/`, run with Node's built-in test runner.
- **CSS** — custom CSS in `src/styles/globals.css`, no Tailwind.
- **No circular dependencies** — components may only import from `types/`, `constants/`, `utils/`, and `hooks/`.

## Environment Variables

Copy `.env.example` to `.env.local`. Required vars:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_API_KEY`
- `RESEND_API_KEY`
- `ADMIN_INITIAL_EMAIL`, `ADMIN_INITIAL_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`

## Database

SQL schema files are in `supabase/`: `schema.sql` (core tables), `cms-advanced.sql`, `storage.sql`. Main entities: Users, Pages, Themes, Productions, Activities, Projects, Resources, Forms, FormSubmissions, SiteSettings, Media.

## Patterns établis

**ISR (revalidation)** — toutes les pages publiques ont `export const revalidate = 60`. Ne pas supprimer. Les éditions admin se propagent au front en <60s sans redéploiement.

**Images des pages** — `contentRepository.getPage(slug)` joint la table `resources` via `image_id` et renvoie `page.imageUrl` (URL absolue normalisée). Les pages publiques utilisent `page.imageUrl ?? "/assets/photos/hero-xxx.png"` comme fallback. Ne jamais hardcoder d'URL statique sans ce fallback.

**Formulaires publics** — les CTA avec target `FORM:join|project|content|partner|don` ouvrent `FormModal`. Les soumissions sont stockées en DB (`form_submissions`) et visibles dans `/admin/forms` avec gestion du statut (reçu → en cours → traité → archivé).

**Admin — sections clés**

- `/admin/homepage` : éditer texte, CTAs, photo hero et SEO de la page d'accueil
- `/admin/pages` : changer la photo hero de toutes les pages statiques
- `/admin/forms` : lire et traiter les soumissions de formulaires

**contentRepository — méthodes utiles**

- `getPage(slug)` — retourne page + `imageUrl` résolue (jointure resources)
- `updatePage(slug, fields)` — met à jour n'importe quel champ de la table `pages`
- `updatePageSections(slug, blocks)` — met à jour uniquement les blocs de contenu

## Documentation

Detailed guides live in `docs/`:

- `ARCHITECTURE.md` — folder responsibilities and dependency rules
- `CODE_CONVENTIONS.md` — naming, import order, style rules
- `DESIGN_SYSTEM.md` — CSS/visual language guidelines
- `RESPONSIBILITY_MAP.md` — which layer owns which concern
- `DATABASE.md` — table schemas
- `WORKFLOWS.md` — Git branching and PR requirements
- `QUALITY_GATES.md` — definition of done
- `ENGINEERING_GUIDE.md` — high-level principles and anti-patterns

## Action Log

After completing any significant action or group of actions, append an entry to `HISTORY.md` (project root, git-ignored). Each entry must include:

- The date (`YYYY-MM-DD`)
- A short summary of what was done and why
- The list of files created, modified, or deleted

Only log meaningful changes: new features, architectural decisions, refactors, configuration changes, schema updates. Skip trivial edits (typo fixes, minor reformatting).

## Git Commits

Never include `Co-Authored-By` or any Claude attribution in commit messages. Commits must only show the human author.

## Legacy Files

`index.html`, `app.js`, `content.js`, and `styles.css` at the root are the original vanilla prototype. They are preserved intentionally as reference and seed-data source. Do not delete or refactor them.
