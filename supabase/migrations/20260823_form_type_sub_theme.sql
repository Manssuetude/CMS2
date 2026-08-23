-- Le formulaire public "proposer un thème" est remplacé par "proposer un
-- sous-thème" (proposé depuis chaque page de thème, rattaché au thème
-- parent). L'ancienne valeur 'theme' de l'enum est conservée (soumissions
-- historiques encore affichées en admin), pas de nouvelle valeur créée
-- pour elle.

alter type form_type add value 'sub_theme';
