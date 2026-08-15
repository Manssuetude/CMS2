-- Corrige la cardinalité sous-thème ↔ production : une production appartient à
-- UN SEUL sous-thème (comme une catégorie), un sous-thème peut regrouper
-- plusieurs productions. Remplace la relation many-to-many `sub_theme_productions`
-- par une colonne directe `productions.sub_theme_id`.
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

alter table productions add column if not exists sub_theme_id uuid references sub_themes(id) on delete set null;

-- Migre les liens existants : si une production avait plusieurs sous-thèmes (ne
-- devrait pas arriver en pratique), on ne garde que le premier (ordre arbitraire).
update productions p
set sub_theme_id = linked.sub_theme_id
from (
  select distinct on (production_id) production_id, sub_theme_id
  from sub_theme_productions
  order by production_id, sub_theme_id
) linked
where linked.production_id = p.id;

create index if not exists productions_sub_theme_id_idx on productions(sub_theme_id);

drop table if exists sub_theme_productions;
