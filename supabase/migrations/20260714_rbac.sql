-- ============================================================
-- RBAC : rôles personnalisables, permissions, journal d'activité
-- ============================================================

-- 1) Rôles (personnalisables). Le rôle "admin" est tout-puissant et non modifiable.
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,                  -- slug technique, ex: 'production'
  label text not null,                       -- libellé affiché, ex: 'Production'
  is_admin boolean not null default false,   -- rôle tout-puissant (droits figés)
  permissions jsonb not null default '[]',   -- ex: ["themes:view","themes:edit","forms:view"]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Rôles de base
insert into roles (key, label, is_admin) values ('admin', 'Administrateur', true)
  on conflict (key) do nothing;
insert into roles (key, label, is_admin, permissions) values
  ('production', 'Production', false, '[]'),
  ('communication', 'Communication', false, '[]')
  on conflict (key) do nothing;

-- 2) users : référence vers roles.key (source de vérité du rôle)
alter table users add column if not exists role_key text references roles(key) on update cascade;
-- Reprise : les comptes existants sans role_key deviennent 'admin' (seul l'admin existe aujourd'hui)
update users set role_key = 'admin' where role_key is null;

-- 3) Journal d'activité (consultable par les admins uniquement)
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  actor_role text,
  action text not null,          -- 'create' | 'update' | 'delete' | 'publish' | 'login' | 'invite' …
  entity_type text,              -- 'production' | 'theme' | 'user' | 'role' | 'page' …
  entity_id text,
  summary text,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on audit_logs (created_at desc);
