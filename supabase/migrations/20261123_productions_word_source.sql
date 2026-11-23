-- Productions : texte lu sur le site importé depuis un Word (.docx).
-- On garde le nom du fichier importé et la date de l'import, affichés dans
-- l'onglet « Fichiers de l'article » de la fiche production.
-- Le .docx lui-même n'est pas conservé (supprimé après conversion).

alter table public.productions
  add column if not exists body_source_name text,
  add column if not exists body_imported_at timestamp with time zone;

comment on column public.productions.body_source_name is 'Nom du fichier Word (.docx) dont provient body';
comment on column public.productions.body_imported_at is 'Date du dernier import du Word dans body';
