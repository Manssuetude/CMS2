# Workflows

## Branches

- `main`: production-ready.
- `develop`: integration branch.
- `feature/*`: new work.
- `fix/*`: bug fixes.

## Pull Requests

Every PR should include:

- purpose;
- affected pages/modules;
- validation steps;
- screenshots for UI changes;
- migration notes when DB changes.

## Commit Convention

Use concise prefixes:

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `test:`
- `chore:`

## Required Checks

- `npm run typecheck`
- `npm run build`
