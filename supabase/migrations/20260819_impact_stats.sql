-- Chapitre 15 du plan V2 : Mesure d'impact. Compteurs administrables affichés
-- sur la page d'accueil (ex. "150 membres", "40 productions") — décision
-- validée : pas de compteurs "maison" de vues/téléchargements (on s'appuie
-- sur Vercel Analytics déjà intégré), ces chiffres-ci sont saisis à la main
-- par l'équipe plutôt que calculés automatiquement, comme pour perca_steps.

alter table pages add column if not exists impact_stats jsonb not null default '[]';
