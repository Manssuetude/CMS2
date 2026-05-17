# Hooks

> Hooks React réutilisables orientés UI. Ce dossier ne contient pas de logique métier.

---

## Règles

- Garder les hooks orientés UI
- Ne **pas** interroger Supabase directement depuis un hook
- Placer les décisions CMS/métier dans `src/services`
- Garder l'accès aux données dans `src/repositories`
