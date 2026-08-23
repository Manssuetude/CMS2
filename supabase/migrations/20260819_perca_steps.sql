-- Chapitre 14 du plan V2 : PERCA dynamique. Les 5 lettres/mots de la méthode
-- restent fixes (P/E/R/C/A — Penser/Exprimer/Relier/Concrétiser/Ancrer), mais
-- chaque étape gagne un titre + un contenu détaillé propre, éditable depuis
-- /admin/perca. Stocké en jsonb sur la ligne `pages` (slug="perca"), comme
-- `sections` déjà utilisé pour le contenu flexible d'autres pages.

alter table pages add column if not exists perca_steps jsonb not null default '[]';
