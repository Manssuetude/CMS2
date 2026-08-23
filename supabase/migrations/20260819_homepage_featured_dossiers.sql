-- Chapitre 16 du plan V2 : sélections éditoriales nommées sur la page
-- d'accueil ("À découvrir", "En débat"...), en complément du "sujet du
-- moment" déjà administrable. Réutilise l'entité Dossier (chapitre 10+11)
-- plutôt qu'un second mécanisme de sélection de contenus : le titre du
-- dossier devient le nom de la section, son contenu la sélection.

alter table pages add column if not exists featured_dossier_ids uuid[] not null default '{}';
