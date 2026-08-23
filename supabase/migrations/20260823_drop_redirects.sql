-- Retrait de la fonctionnalité "redirections 301 administrables" (/admin/redirects).
-- Fonctionnalité jugée inutile en pratique, jamais utilisée (table vide). Supprime
-- ce que crée 20260819_redirects.sql.

drop policy if exists "redirects_public_read" on public.redirects;
drop table if exists public.redirects;
