-- Nouveaux types de formulaires publics : proposition de thème et proposition d'activité.
alter type form_type add value if not exists 'theme';
alter type form_type add value if not exists 'activity';
