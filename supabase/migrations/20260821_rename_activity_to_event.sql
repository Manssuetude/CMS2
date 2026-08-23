-- ============================================================
-- Renommage technique complet : Activité → Événement
-- (table, colonnes, index, enum, contraintes, données de config)
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).
-- ============================================================

-- 1) Table principale
alter table activities rename to events;

-- 2) Tables de liaison (renommage table + colonne activity_id → event_id)
alter table theme_activities rename to theme_events;
alter table theme_events rename column activity_id to event_id;

alter table sub_theme_activities rename to sub_theme_events;
alter table sub_theme_events rename column activity_id to event_id;

alter table project_activities rename to project_events;
alter table project_events rename column activity_id to event_id;

alter table production_activities rename to production_events;
alter table production_events rename column activity_id to event_id;

alter table activity_resources rename to event_resources;
alter table event_resources rename column activity_id to event_id;

-- Répertoire de formats (activity_formats) NON renommé — seule la colonne
-- qui référence l'entité renommée change de nom.
alter table activity_activity_formats rename to event_activity_formats;
alter table event_activity_formats rename column activity_id to event_id;

alter table activity_animators rename to event_animators;
alter table event_animators rename column activity_id to event_id;

-- 3) Colonnes sur d'autres tables référençant l'entité renommée
alter table pages rename column featured_activity_id to featured_event_id;
alter table journal_entries rename column activity_id to event_id;

-- 4) Index (jamais renommés automatiquement par Postgres)
alter index activities_slug_idx rename to events_slug_idx;
alter index project_activities_activity_id_idx rename to project_events_event_id_idx;
alter index activity_animators_activity_id_idx rename to event_animators_event_id_idx;

-- 5) Enum form_type : renomme la valeur (RENAME VALUE conserve les lignes
-- existantes de form_submissions.form_type = 'activity' → 'event' sans UPDATE).
alter type form_type rename value 'activity' to 'event';

-- 6) dossier_items.entity_type — colonne text + check constraint (pas un vrai
-- enum), donc pas de RENAME VALUE possible : swap manuel de la contrainte.
alter table dossier_items drop constraint if exists dossier_items_entity_type_check;
update dossier_items set entity_type = 'event' where entity_type = 'activity';
alter table dossier_items
  add constraint dossier_items_entity_type_check
  check (entity_type in ('production', 'event', 'project', 'resource', 'journal_entry'));

-- 7) Nouvelle page publique /evenements (distincte de /activites, qui reste
-- inchangée et pilote toujours le catalogue de formats). Contenu éditable
-- ensuite via /admin/pages/evenements.
insert into pages (slug, title, eyebrow, body, status)
values (
  'evenements',
  'Événements',
  'Agenda',
  'Nos rendez-vous : débats, ateliers, rencontres — à venir, en cours ou passés.',
  'published'
)
on conflict (slug) do nothing;

-- 8) RBAC : les rôles personnalisés ayant déjà la permission "activites:*"
-- doivent la conserver sous la nouvelle clé "evenements:*" (sinon perte de
-- droits silencieuse pour les rôles non-admin existants). Ne touche pas
-- "formatsactivites:*", qui n'a pas ce préfixe exact.
update roles
set permissions = (
  select coalesce(jsonb_agg(
    case
      when elem #>> '{}' like 'activites:%'
        then to_jsonb(replace(elem #>> '{}', 'activites:', 'evenements:'))
      else elem
    end
  ), '[]'::jsonb)
  from jsonb_array_elements(permissions) as elem
)
where permissions::text like '%activites:%';
