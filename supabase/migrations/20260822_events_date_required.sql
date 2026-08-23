-- La date devient obligatoire pour publier un événement (le formulaire admin
-- l'exige désormais systématiquement). Deux événements existants n'ont pas de
-- date : ils passent en brouillon plutôt que de se voir attribuer une date
-- inventée — un admin devra la renseigner puis republier.
update events set status = 'draft' where date is null and status = 'published';

-- Garde-fou en base : impossible de publier un événement sans date. Les
-- brouillons peuvent rester sans date le temps de compléter la fiche.
alter table events
  add constraint events_published_requires_date check (status <> 'published' or date is not null);
