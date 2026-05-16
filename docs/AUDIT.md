# Phase 0 Audit

## High Severity

### API collection routes accepted raw table names too directly

Impact: weak validation and unclear error behavior.

Fix: centralize allowed collections in `src/constants/collections.ts`, validate route params, and standardize API errors through `src/lib/errors.ts`.

### Type leakage through `any`

Impact: repository mapping could silently accept malformed data and weaken strict TypeScript.

Fix: introduce row mapping helpers in `src/utils/row.ts`, remove unused TypeScript seed, and replace several `any` mappers with typed conversion functions.

### Admin prototype logic mixed product decisions with UI

Impact: future contributors would not know which parts are business logic and which parts are presentation.

Fix: create layer documentation, centralize admin navigation, add services for graph/media/health/taxonomy, and document dependency direction.

## Medium Severity

### CSS was monolithic

Impact: visual consistency depends on discipline instead of tokens.

Fix: add design tokens in `src/config/designTokens.ts` and document design-system rules. CSS still needs future splitting by layer.

### Documentation was not enough for onboarding

Impact: new developers would need oral context.

Fix: add `ENGINEERING_GUIDE.md` and docs for architecture, CMS, database, workflows and components.

### Duplicate seed path

Impact: `scripts/seed.ts` was unused and still carried legacy `any` logic.

Fix: remove it. `npm run seed` uses `scripts/seed.mjs`.

## Low Severity

### Inline styling in login page

Impact: small inconsistency in style governance.

Fix: replace inline style with `.login-panel`.

### Git and CI conventions were missing

Impact: collaboration would become inconsistent as the team grows.

Fix: add branch/PR conventions and a CI workflow running typecheck and build.

## Remaining Debt

- Some repository rows still rely on broad generated database records because Supabase generated types are not yet complete.
- ESLint is not fully installed/configured yet; the current hard checks are TypeScript and build.
- CSS should eventually be split into tokens, base, layout, components and utilities.
- Tests are not yet implemented.
- API payload schemas should be expanded per collection, not only at the generic route level.
