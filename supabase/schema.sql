create extension if not exists "pgcrypto";

create type user_role as enum ('admin', 'editor', 'contributor', 'viewer');
create type content_status as enum ('draft', 'published', 'archived');
create type progress_status as enum ('idea', 'preparation', 'active', 'completed', 'paused');
create type media_source as enum ('upload', 'google-drive', 'external-url', 'youtube', 'vimeo');
create type media_type as enum ('image', 'video', 'pdf', 'document', 'audio', 'archive');
create type visibility_status as enum ('public', 'private', 'draft');
create type form_type as enum ('join', 'project', 'content', 'partner', 'donation');
create type form_status as enum ('reçu', 'en cours', 'traité', 'archivé');

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  role user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sync automatique auth.users -> public.users a chaque nouvel utilisateur Supabase Auth
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, role, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'admin')::user_role,
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  filename text not null,
  source media_source not null default 'upload',
  type media_type not null,
  mime_type text not null,
  url text not null,
  preview_url text,
  thumbnail_url text,
  size text,
  alt text,
  caption text,
  description text,
  tags text[] not null default '{}',
  visibility visibility_status not null default 'public',
  uploaded_by uuid references users(id) on delete set null,
  drive_file_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  eyebrow text,
  body text,
  image_id uuid references resources(id) on delete set null,
  quote text,
  primary_cta_label text,
  primary_cta_target text,
  secondary_cta_label text,
  secondary_cta_target text,
  sections jsonb not null default '[]',
  seo_title text,
  seo_description text,
  seo_image_id uuid references resources(id) on delete set null,
  status content_status not null default 'draft',
  updated_at timestamptz not null default now()
);

create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_title text,
  description text,
  long_description text,
  hero_image_id uuid references resources(id) on delete set null,
  thumbnail_id uuid references resources(id) on delete set null,
  status content_status not null default 'draft',
  progress_status progress_status,
  featured boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists productions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  type text not null,
  description text,
  content_blocks jsonb not null default '[]',
  author text,
  date date,
  thumbnail_id uuid references resources(id) on delete set null,
  file_id uuid references resources(id) on delete set null,
  reading_time text,
  pages text,
  tags text[] not null default '{}',
  status content_status not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  format text not null,
  description text,
  date date,
  status content_status not null default 'draft',
  progress_status progress_status,
  gallery uuid[] not null default '{}',
  documents uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text,
  status content_status not null default 'draft',
  progress_status progress_status,
  priority text,
  description text,
  objectives text[] not null default '{}',
  deliverables text[] not null default '{}',
  documents uuid[] not null default '{}',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists theme_productions (theme_id uuid references themes(id) on delete cascade, production_id uuid references productions(id) on delete cascade, primary key (theme_id, production_id));
create table if not exists theme_projects (theme_id uuid references themes(id) on delete cascade, project_id uuid references projects(id) on delete cascade, primary key (theme_id, project_id));
create table if not exists theme_activities (theme_id uuid references themes(id) on delete cascade, activity_id uuid references activities(id) on delete cascade, primary key (theme_id, activity_id));
create table if not exists production_projects (production_id uuid references productions(id) on delete cascade, project_id uuid references projects(id) on delete cascade, primary key (production_id, project_id));
create table if not exists production_activities (production_id uuid references productions(id) on delete cascade, activity_id uuid references activities(id) on delete cascade, primary key (production_id, activity_id));
create table if not exists activity_resources (activity_id uuid references activities(id) on delete cascade, resource_id uuid references resources(id) on delete cascade, primary key (activity_id, resource_id));
create table if not exists project_resources (project_id uuid references projects(id) on delete cascade, resource_id uuid references resources(id) on delete cascade, primary key (project_id, resource_id));

create table if not exists form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type form_type not null,
  data jsonb not null default '{}',
  attachments uuid[] not null default '{}',
  status form_status not null default 'reçu',
  notes text,
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id text primary key default 'default',
  logo_id uuid references resources(id) on delete set null,
  favicon_id uuid references resources(id) on delete set null,
  primary_color text not null default '#ff4d12',
  secondary_color text not null default '#0d0d0f',
  fallback_image_id uuid references resources(id) on delete set null,
  tagline text,
  footer_config jsonb not null default '{}',
  homepage_config jsonb not null default '{}'
);

create index if not exists pages_slug_idx on pages(slug);
create index if not exists themes_slug_idx on themes(slug);
create index if not exists productions_slug_idx on productions(slug);
create index if not exists activities_slug_idx on activities(slug);
create index if not exists projects_slug_idx on projects(slug);
create index if not exists resources_type_idx on resources(type);
create index if not exists form_submissions_status_idx on form_submissions(status);
