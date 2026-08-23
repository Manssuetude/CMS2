-- Chapitre 17 du plan V2 : meta title/description administrables sur les
-- fiches de contenu (jusqu'ici réservées aux pages statiques). Même
-- convention que `pages` (seo_title/seo_description) — buildDetailMetadata
-- utilise ces champs en priorité, avec repli sur title/description existants.

alter table productions add column if not exists seo_title text;
alter table productions add column if not exists seo_description text;

alter table activities add column if not exists seo_title text;
alter table activities add column if not exists seo_description text;

alter table projects add column if not exists seo_title text;
alter table projects add column if not exists seo_description text;

alter table themes add column if not exists seo_title text;
alter table themes add column if not exists seo_description text;
