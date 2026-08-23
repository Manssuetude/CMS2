-- Deux nouveaux types de formulaire public :
-- - 'activity' : proposer une technique/format d'animation pour le répertoire
--   (/activites) — distinct de l'ancienne valeur 'activity' de cet enum,
--   renommée en 'event' le même jour (20260821_rename_activity_to_event.sql) ;
--   celle-ci désignait un événement daté, celle-ci désigne une technique
--   d'animation, deux entités désormais bien séparées (voir CLAUDE.md).
-- - 'production' : proposer une contribution rattachée à une production
--   précise (remplace l'usage générique de 'content' sur les pages production).

alter type form_type add value 'activity';
alter type form_type add value 'production';
