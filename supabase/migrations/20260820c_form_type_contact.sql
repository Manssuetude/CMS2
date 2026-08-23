-- Le formulaire de contact public simulait un envoi sans rien transmettre
-- (TODO du développeur, relevé lors de l'audit de conformité). On le branche
-- sur le circuit standard des formulaires publics (form_submissions), qui a
-- besoin de cette valeur d'enum supplémentaire.
alter type form_type add value if not exists 'contact';
