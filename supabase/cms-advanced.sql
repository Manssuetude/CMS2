create type if not exists relation_kind as enum ('related', 'contains', 'supports', 'references', 'produced-from', 'recommended', 'featured');
create type if not exists entity_type as enum ('theme', 'production', 'activity', 'project', 'resource', 'season', 'member', 'media', 'page', 'cta', 'collection');
create type if not exists taxonomy_kind as enum ('tag', 'type', 'format', 'usage', 'level', 'visibility');

alter type content_status add value if not exists 'review';
alter type content_status add value if not exists 'validated';

create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  status content_status not null default 'draft',
  featured boolean not null default false,
  tags text[] not null default '{}',
  starts_at date,
  ends_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  role text,
  commissions text[] not null default '{}',
  visibility text not null default 'members',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists entity_relations (
  id uuid primary key default gen_random_uuid(),
  from_type entity_type not null,
  from_id uuid not null,
  to_type entity_type not null,
  to_id uuid not null,
  kind relation_kind not null default 'related',
  weight integer not null default 50,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique(from_type, from_id, to_type, to_id, kind)
);

create table if not exists taxonomy (
  id uuid primary key default gen_random_uuid(),
  kind taxonomy_kind not null,
  label text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  unique(kind, slug)
);

create table if not exists ctas (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  target text not null,
  variant text not null default 'primary',
  visibility text not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_collections (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  entity_type entity_type not null,
  filters jsonb not null default '{}',
  layout text not null default 'grid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_versions (
  id uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  entity_id uuid not null,
  version integer not null,
  snapshot jsonb not null,
  author_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(entity_type, entity_id, version)
);

create table if not exists internal_comments (
  id uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  entity_id uuid not null,
  author_id uuid references users(id) on delete set null,
  body text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  id uuid primary key default gen_random_uuid(),
  role user_role not null,
  permission text not null,
  created_at timestamptz not null default now(),
  unique(role, permission)
);

create table if not exists cms_health_checks (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  severity text not null default 'medium',
  query_hint text,
  enabled boolean not null default true
);

create index if not exists entity_relations_from_idx on entity_relations(from_type, from_id);
create index if not exists entity_relations_to_idx on entity_relations(to_type, to_id);
create index if not exists taxonomy_kind_idx on taxonomy(kind);
create index if not exists content_versions_entity_idx on content_versions(entity_type, entity_id);
