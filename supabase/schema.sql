-- Manssuétude CMS — schéma PostgreSQL (Supabase), schéma "public" complet.
--
-- Ce fichier est un dump fidèle (pg_dump --schema-only) de la base de production,
-- généré le 2026-08-24. Il remplace l'ancien couple schema.sql + cms-advanced.sql
-- (devenus incohérents avec la base réelle — ex. table `activities` alors que la
-- base réelle a `events` depuis la migration 20260821) et consolide l'historique
-- de supabase/migrations/ (désormais vide : nouvelles migrations à partir d'ici).
--
-- Usage : exécuter tel quel dans l'éditeur SQL Supabase pour reconstruire le
-- schéma depuis zéro sur un nouveau projet. Ne contient aucune donnée (schéma
-- seul) — utiliser `npm run seed` ensuite pour peupler le contenu de départ.
--
-- Note : certaines contraintes/index gardent un nom hérité de l'ancien nom des
-- tables (ex. `activities_pkey` sur `events`, `activity_animators_pkey` sur
-- `event_animators`) — PostgreSQL ne renomme pas les contraintes lors d'un
-- `ALTER TABLE ... RENAME TO`. Cosmétique uniquement, aucun impact fonctionnel.
--
-- La table `public.redirects` est un reliquat de la fonctionnalité "redirections
-- administrables" retirée du produit (jamais utilisée, table vide) — la
-- migration 20260823_drop_redirects.sql qui la supprime n'a pas encore été
-- exécutée manuellement en prod ; c'est pourquoi elle apparaît encore ici.

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: content_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.content_status AS ENUM (
    'draft',
    'published',
    'archived'
);


--
-- Name: form_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.form_status AS ENUM (
    'reçu',
    'en cours',
    'traité',
    'archivé'
);


--
-- Name: form_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.form_type AS ENUM (
    'join',
    'project',
    'content',
    'partner',
    'donation',
    'theme',
    'event',
    'contact',
    'sub_theme',
    'activity',
    'production'
);


--
-- Name: media_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.media_source AS ENUM (
    'upload',
    'google-drive',
    'external-url',
    'youtube',
    'vimeo'
);


--
-- Name: media_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.media_type AS ENUM (
    'image',
    'video',
    'pdf',
    'document',
    'audio',
    'archive'
);


--
-- Name: progress_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.progress_status AS ENUM (
    'idea',
    'preparation',
    'active',
    'completed',
    'paused'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'editor',
    'contributor',
    'viewer'
);


--
-- Name: visibility_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.visibility_status AS ENUM (
    'public',
    'private',
    'draft'
);


--
-- Name: handle_new_auth_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_auth_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')::user_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_formats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_formats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    icon text,
    "position" integer DEFAULT 0 NOT NULL,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    actor_email text,
    actor_role text,
    action text NOT NULL,
    entity_type text,
    entity_id text,
    summary text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: authors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    bio text,
    photo_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: dossier_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dossier_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dossier_id uuid NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT dossier_items_entity_type_check CHECK ((entity_type = ANY (ARRAY['production'::text, 'event'::text, 'project'::text, 'resource'::text, 'journal_entry'::text])))
);


--
-- Name: dossiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dossiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    mode text DEFAULT 'libre'::text NOT NULL,
    image_id uuid,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT dossiers_mode_check CHECK ((mode = ANY (ARRAY['libre'::text, 'guide'::text])))
);


--
-- Name: event_activity_formats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_activity_formats (
    event_id uuid NOT NULL,
    activity_format_id uuid NOT NULL
);


--
-- Name: event_animators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_animators (
    event_id uuid NOT NULL,
    author_id uuid NOT NULL,
    contribution text,
    "position" integer DEFAULT 0 NOT NULL
);


--
-- Name: event_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_resources (
    event_id uuid NOT NULL,
    resource_id uuid NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    format text NOT NULL,
    description text,
    date date,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    progress_status public.progress_status,
    gallery uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    documents uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    body text,
    featured boolean DEFAULT false NOT NULL,
    speakers jsonb DEFAULT '[]'::jsonb NOT NULL,
    start_time text,
    end_time text,
    location text,
    capacity text,
    eventbrite_url text,
    registration_status text,
    seo_title text,
    seo_description text,
    CONSTRAINT events_published_requires_date CHECK (((status <> 'published'::public.content_status) OR (date IS NOT NULL)))
);


--
-- Name: form_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_type public.form_type NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    attachments uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    status public.form_status DEFAULT 'reçu'::public.form_status NOT NULL,
    notes text,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text,
    body text,
    thumbnail_id uuid,
    category text,
    author_id uuid,
    date date,
    theme_id uuid,
    project_id uuid,
    event_id uuid,
    production_id uuid,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    eyebrow text,
    body text,
    image_id uuid,
    quote text,
    primary_cta_label text,
    primary_cta_target text,
    secondary_cta_label text,
    secondary_cta_target text,
    sections jsonb DEFAULT '[]'::jsonb NOT NULL,
    seo_title text,
    seo_description text,
    seo_image_id uuid,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_crop jsonb,
    focus_image_crop jsonb,
    perca_steps jsonb DEFAULT '[]'::jsonb NOT NULL,
    impact_stats jsonb DEFAULT '[]'::jsonb NOT NULL,
    featured_dossier_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    featured_event_id uuid
);


--
-- Name: production_authors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_authors (
    production_id uuid NOT NULL,
    author_id uuid NOT NULL
);


--
-- Name: production_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_events (
    production_id uuid NOT NULL,
    event_id uuid NOT NULL
);


--
-- Name: production_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_projects (
    production_id uuid NOT NULL,
    project_id uuid NOT NULL
);


--
-- Name: production_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_resources (
    production_id uuid NOT NULL,
    resource_id uuid NOT NULL
);


--
-- Name: productions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    description text,
    content_blocks jsonb DEFAULT '[]'::jsonb NOT NULL,
    author text,
    date date,
    thumbnail_id uuid,
    file_id uuid,
    reading_time text,
    pages text,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    body text,
    download_label text,
    video_url text,
    seo_title text,
    seo_description text
);


--
-- Name: project_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_events (
    project_id uuid NOT NULL,
    event_id uuid NOT NULL
);


--
-- Name: project_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_resources (
    project_id uuid NOT NULL,
    resource_id uuid NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    category text,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    progress_status public.progress_status,
    priority text,
    description text,
    objectives text[] DEFAULT '{}'::text[] NOT NULL,
    deliverables text[] DEFAULT '{}'::text[] NOT NULL,
    documents uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    body text,
    seo_title text,
    seo_description text
);


--
-- Name: redirects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.redirects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_path text NOT NULL,
    to_path text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    filename text NOT NULL,
    source public.media_source DEFAULT 'upload'::public.media_source NOT NULL,
    type public.media_type NOT NULL,
    mime_type text NOT NULL,
    url text NOT NULL,
    preview_url text,
    thumbnail_url text,
    size text,
    alt text,
    caption text,
    description text,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    visibility public.visibility_status DEFAULT 'public'::public.visibility_status NOT NULL,
    uploaded_by uuid,
    drive_file_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    author text,
    institution text,
    published_date date,
    theme_id uuid
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    label text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id text DEFAULT 'default'::text NOT NULL,
    logo_id uuid,
    favicon_id uuid,
    primary_color text DEFAULT '#ff4d12'::text NOT NULL,
    secondary_color text DEFAULT '#0d0d0f'::text NOT NULL,
    fallback_image_id uuid,
    tagline text,
    footer_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    homepage_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    nav_visibility jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: sub_theme_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sub_theme_events (
    sub_theme_id uuid NOT NULL,
    event_id uuid NOT NULL
);


--
-- Name: sub_theme_productions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sub_theme_productions (
    sub_theme_id uuid NOT NULL,
    production_id uuid NOT NULL
);


--
-- Name: sub_themes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sub_themes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    theme_id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    long_description text,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    date date
);


--
-- Name: theme_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.theme_events (
    theme_id uuid NOT NULL,
    event_id uuid NOT NULL
);


--
-- Name: theme_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.theme_projects (
    theme_id uuid NOT NULL,
    project_id uuid NOT NULL
);


--
-- Name: themes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.themes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    short_title text,
    description text,
    long_description text,
    hero_image_id uuid,
    thumbnail_id uuid,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    progress_status public.progress_status,
    featured boolean DEFAULT false NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    seo_title text,
    seo_description text
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    name text,
    role public.user_role DEFAULT 'viewer'::public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    role_key text
);


--
-- Name: events activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: events activities_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT activities_slug_key UNIQUE (slug);


--
-- Name: event_activity_formats activity_activity_formats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_activity_formats
    ADD CONSTRAINT activity_activity_formats_pkey PRIMARY KEY (event_id, activity_format_id);


--
-- Name: event_animators activity_animators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_animators
    ADD CONSTRAINT activity_animators_pkey PRIMARY KEY (event_id, author_id);


--
-- Name: activity_formats activity_formats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_formats
    ADD CONSTRAINT activity_formats_pkey PRIMARY KEY (id);


--
-- Name: activity_formats activity_formats_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_formats
    ADD CONSTRAINT activity_formats_slug_key UNIQUE (slug);


--
-- Name: event_resources activity_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_resources
    ADD CONSTRAINT activity_resources_pkey PRIMARY KEY (event_id, resource_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- Name: dossier_items dossier_items_dossier_id_entity_type_entity_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossier_items
    ADD CONSTRAINT dossier_items_dossier_id_entity_type_entity_id_key UNIQUE (dossier_id, entity_type, entity_id);


--
-- Name: dossier_items dossier_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossier_items
    ADD CONSTRAINT dossier_items_pkey PRIMARY KEY (id);


--
-- Name: dossiers dossiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT dossiers_pkey PRIMARY KEY (id);


--
-- Name: dossiers dossiers_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT dossiers_slug_key UNIQUE (slug);


--
-- Name: form_submissions form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_slug_key UNIQUE (slug);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: pages pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_slug_key UNIQUE (slug);


--
-- Name: production_events production_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_events
    ADD CONSTRAINT production_activities_pkey PRIMARY KEY (production_id, event_id);


--
-- Name: production_authors production_authors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_authors
    ADD CONSTRAINT production_authors_pkey PRIMARY KEY (production_id, author_id);


--
-- Name: production_projects production_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_projects
    ADD CONSTRAINT production_projects_pkey PRIMARY KEY (production_id, project_id);


--
-- Name: production_resources production_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_resources
    ADD CONSTRAINT production_resources_pkey PRIMARY KEY (production_id, resource_id);


--
-- Name: productions productions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productions
    ADD CONSTRAINT productions_pkey PRIMARY KEY (id);


--
-- Name: productions productions_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productions
    ADD CONSTRAINT productions_slug_key UNIQUE (slug);


--
-- Name: project_events project_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_events
    ADD CONSTRAINT project_activities_pkey PRIMARY KEY (project_id, event_id);


--
-- Name: project_resources project_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resources
    ADD CONSTRAINT project_resources_pkey PRIMARY KEY (project_id, resource_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: projects projects_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_slug_key UNIQUE (slug);


--
-- Name: redirects redirects_from_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT redirects_from_path_key UNIQUE (from_path);


--
-- Name: redirects redirects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT redirects_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: roles roles_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_key_key UNIQUE (key);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: sub_theme_events sub_theme_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_theme_events
    ADD CONSTRAINT sub_theme_activities_pkey PRIMARY KEY (sub_theme_id, event_id);


--
-- Name: sub_theme_productions sub_theme_productions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_theme_productions
    ADD CONSTRAINT sub_theme_productions_pkey PRIMARY KEY (sub_theme_id, production_id);


--
-- Name: sub_themes sub_themes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_themes
    ADD CONSTRAINT sub_themes_pkey PRIMARY KEY (id);


--
-- Name: sub_themes sub_themes_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_themes
    ADD CONSTRAINT sub_themes_slug_key UNIQUE (slug);


--
-- Name: theme_events theme_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.theme_events
    ADD CONSTRAINT theme_activities_pkey PRIMARY KEY (theme_id, event_id);


--
-- Name: theme_projects theme_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.theme_projects
    ADD CONSTRAINT theme_projects_pkey PRIMARY KEY (theme_id, project_id);


--
-- Name: themes themes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_pkey PRIMARY KEY (id);


--
-- Name: themes themes_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_slug_key UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: activity_formats_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_formats_position_idx ON public.activity_formats USING btree ("position");


--
-- Name: audit_logs_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_idx ON public.audit_logs USING btree (created_at DESC);


--
-- Name: dossier_items_dossier_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dossier_items_dossier_id_idx ON public.dossier_items USING btree (dossier_id, "position");


--
-- Name: dossiers_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dossiers_slug_idx ON public.dossiers USING btree (slug);


--
-- Name: event_animators_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_animators_event_id_idx ON public.event_animators USING btree (event_id, "position");


--
-- Name: events_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_slug_idx ON public.events USING btree (slug);


--
-- Name: form_submissions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX form_submissions_status_idx ON public.form_submissions USING btree (status);


--
-- Name: journal_entries_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journal_entries_category_idx ON public.journal_entries USING btree (category);


--
-- Name: journal_entries_project_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journal_entries_project_id_idx ON public.journal_entries USING btree (project_id);


--
-- Name: journal_entries_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journal_entries_slug_idx ON public.journal_entries USING btree (slug);


--
-- Name: pages_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_slug_idx ON public.pages USING btree (slug);


--
-- Name: production_authors_author_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX production_authors_author_id_idx ON public.production_authors USING btree (author_id);


--
-- Name: production_resources_resource_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX production_resources_resource_id_idx ON public.production_resources USING btree (resource_id);


--
-- Name: productions_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX productions_slug_idx ON public.productions USING btree (slug);


--
-- Name: project_events_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_events_event_id_idx ON public.project_events USING btree (event_id);


--
-- Name: projects_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_slug_idx ON public.projects USING btree (slug);


--
-- Name: redirects_from_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX redirects_from_path_idx ON public.redirects USING btree (from_path);


--
-- Name: resources_theme_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX resources_theme_id_idx ON public.resources USING btree (theme_id);


--
-- Name: resources_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX resources_type_idx ON public.resources USING btree (type);


--
-- Name: sub_themes_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sub_themes_slug_idx ON public.sub_themes USING btree (slug);


--
-- Name: sub_themes_theme_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sub_themes_theme_id_idx ON public.sub_themes USING btree (theme_id);


--
-- Name: themes_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX themes_slug_idx ON public.themes USING btree (slug);


--
-- Name: event_activity_formats activity_activity_formats_activity_format_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_activity_formats
    ADD CONSTRAINT activity_activity_formats_activity_format_id_fkey FOREIGN KEY (activity_format_id) REFERENCES public.activity_formats(id) ON DELETE CASCADE;


--
-- Name: event_activity_formats activity_activity_formats_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_activity_formats
    ADD CONSTRAINT activity_activity_formats_activity_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_animators activity_animators_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_animators
    ADD CONSTRAINT activity_animators_activity_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_animators activity_animators_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_animators
    ADD CONSTRAINT activity_animators_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE;


--
-- Name: event_resources activity_resources_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_resources
    ADD CONSTRAINT activity_resources_activity_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_resources activity_resources_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_resources
    ADD CONSTRAINT activity_resources_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: authors authors_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: dossier_items dossier_items_dossier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossier_items
    ADD CONSTRAINT dossier_items_dossier_id_fkey FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON DELETE CASCADE;


--
-- Name: dossiers dossiers_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT dossiers_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_activity_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_production_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_production_id_fkey FOREIGN KEY (production_id) REFERENCES public.productions(id) ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id) ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_thumbnail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_thumbnail_id_fkey FOREIGN KEY (thumbnail_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: pages pages_featured_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_featured_activity_id_fkey FOREIGN KEY (featured_event_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: pages pages_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: pages pages_seo_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_seo_image_id_fkey FOREIGN KEY (seo_image_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: production_events production_activities_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_events
    ADD CONSTRAINT production_activities_activity_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: production_events production_activities_production_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_events
    ADD CONSTRAINT production_activities_production_id_fkey FOREIGN KEY (production_id) REFERENCES public.productions(id) ON DELETE CASCADE;


--
-- Name: production_authors production_authors_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_authors
    ADD CONSTRAINT production_authors_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE;


--
-- Name: production_authors production_authors_production_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_authors
    ADD CONSTRAINT production_authors_production_id_fkey FOREIGN KEY (production_id) REFERENCES public.productions(id) ON DELETE CASCADE;


--
-- Name: production_projects production_projects_production_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_projects
    ADD CONSTRAINT production_projects_production_id_fkey FOREIGN KEY (production_id) REFERENCES public.productions(id) ON DELETE CASCADE;


--
-- Name: production_projects production_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_projects
    ADD CONSTRAINT production_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: production_resources production_resources_production_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_resources
    ADD CONSTRAINT production_resources_production_id_fkey FOREIGN KEY (production_id) REFERENCES public.productions(id) ON DELETE CASCADE;


--
-- Name: production_resources production_resources_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_resources
    ADD CONSTRAINT production_resources_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;


--
-- Name: productions productions_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productions
    ADD CONSTRAINT productions_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: productions productions_thumbnail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productions
    ADD CONSTRAINT productions_thumbnail_id_fkey FOREIGN KEY (thumbnail_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: project_events project_activities_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_events
    ADD CONSTRAINT project_activities_activity_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: project_events project_activities_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_events
    ADD CONSTRAINT project_activities_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_resources project_resources_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resources
    ADD CONSTRAINT project_resources_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_resources project_resources_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resources
    ADD CONSTRAINT project_resources_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;


--
-- Name: resources resources_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id) ON DELETE SET NULL;


--
-- Name: resources resources_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: site_settings site_settings_fallback_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_fallback_image_id_fkey FOREIGN KEY (fallback_image_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: site_settings site_settings_favicon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_favicon_id_fkey FOREIGN KEY (favicon_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: site_settings site_settings_logo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_logo_id_fkey FOREIGN KEY (logo_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: sub_theme_events sub_theme_activities_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_theme_events
    ADD CONSTRAINT sub_theme_activities_activity_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: sub_theme_events sub_theme_activities_sub_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_theme_events
    ADD CONSTRAINT sub_theme_activities_sub_theme_id_fkey FOREIGN KEY (sub_theme_id) REFERENCES public.sub_themes(id) ON DELETE CASCADE;


--
-- Name: sub_theme_productions sub_theme_productions_production_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_theme_productions
    ADD CONSTRAINT sub_theme_productions_production_id_fkey FOREIGN KEY (production_id) REFERENCES public.productions(id) ON DELETE CASCADE;


--
-- Name: sub_theme_productions sub_theme_productions_sub_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_theme_productions
    ADD CONSTRAINT sub_theme_productions_sub_theme_id_fkey FOREIGN KEY (sub_theme_id) REFERENCES public.sub_themes(id) ON DELETE CASCADE;


--
-- Name: sub_themes sub_themes_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_themes
    ADD CONSTRAINT sub_themes_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id) ON DELETE CASCADE;


--
-- Name: theme_events theme_activities_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.theme_events
    ADD CONSTRAINT theme_activities_activity_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: theme_events theme_activities_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.theme_events
    ADD CONSTRAINT theme_activities_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id) ON DELETE CASCADE;


--
-- Name: theme_projects theme_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.theme_projects
    ADD CONSTRAINT theme_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: theme_projects theme_projects_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.theme_projects
    ADD CONSTRAINT theme_projects_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id) ON DELETE CASCADE;


--
-- Name: themes themes_hero_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_hero_image_id_fkey FOREIGN KEY (hero_image_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: themes themes_thumbnail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_thumbnail_id_fkey FOREIGN KEY (thumbnail_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: users users_role_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_key_fkey FOREIGN KEY (role_key) REFERENCES public.roles(key) ON UPDATE CASCADE;


--
-- Name: activity_formats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_formats ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: authors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

--
-- Name: dossier_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dossier_items ENABLE ROW LEVEL SECURITY;

--
-- Name: dossiers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;

--
-- Name: event_activity_formats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_activity_formats ENABLE ROW LEVEL SECURITY;

--
-- Name: event_animators; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_animators ENABLE ROW LEVEL SECURITY;

--
-- Name: event_resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_resources ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: form_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: journal_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: pages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

--
-- Name: production_authors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.production_authors ENABLE ROW LEVEL SECURITY;

--
-- Name: production_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.production_events ENABLE ROW LEVEL SECURITY;

--
-- Name: production_projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.production_projects ENABLE ROW LEVEL SECURITY;

--
-- Name: production_resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.production_resources ENABLE ROW LEVEL SECURITY;

--
-- Name: productions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.productions ENABLE ROW LEVEL SECURITY;

--
-- Name: project_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_events ENABLE ROW LEVEL SECURITY;

--
-- Name: project_resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: redirects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

--
-- Name: redirects redirects_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY redirects_public_read ON public.redirects FOR SELECT TO anon USING (true);


--
-- Name: resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: sub_theme_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sub_theme_events ENABLE ROW LEVEL SECURITY;

--
-- Name: sub_theme_productions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sub_theme_productions ENABLE ROW LEVEL SECURITY;

--
-- Name: sub_themes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sub_themes ENABLE ROW LEVEL SECURITY;

--
-- Name: theme_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.theme_events ENABLE ROW LEVEL SECURITY;

--
-- Name: theme_projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.theme_projects ENABLE ROW LEVEL SECURITY;

--
-- Name: themes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


