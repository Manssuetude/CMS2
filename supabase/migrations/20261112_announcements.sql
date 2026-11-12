-- Annonces mises en avant (recrutement, appel à contributions, lancement…)
-- + contenu structuré de la page /nous-rejoindre.
--
-- À exécuter manuellement dans l'éditeur SQL Supabase. Idempotent (IF NOT EXISTS) :
-- peut être relancé sans erreur. Schéma seul, aucune donnée insérée (la première
-- annonce se saisit depuis /admin/annonces, voir docs/exemple-annonce-recrutement.sql).
--
-- Le site fonctionne AVANT cette migration : sans table `announcements`, aucune
-- annonce n'est en ligne ; sans colonne `pages.content`, /nous-rejoindre affiche
-- ses textes par défaut (src/constants/joinPage.ts).

-- ── 1. Table des annonces ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    -- Bandeau (toutes les pages publiques, au-dessus du header)
    banner_enabled boolean DEFAULT true NOT NULL,
    banner_label text,
    banner_text text,
    banner_link_label text,
    banner_link_url text,
    -- Hero de l'accueil (remplace le hero habituel pendant l'annonce)
    hero_enabled boolean DEFAULT true NOT NULL,
    eyebrow text,
    title text,
    title_accent text,
    subtitle text,
    image_id uuid,
    image_crop jsonb,
    primary_cta_label text,
    primary_cta_url text,
    secondary_cta_label text,
    secondary_cta_url text,
    period_label text,
    show_deadline boolean DEFAULT true NOT NULL,
    -- Bande de chiffres clés sous le hero (site_settings.homepage_config.keyFigures)
    show_key_figures boolean DEFAULT true NOT NULL,
    -- Bloc final de l'accueil (remplace « Rejoindre une communauté… »)
    final_enabled boolean DEFAULT true NOT NULL,
    final_eyebrow text,
    final_title text,
    final_text text,
    final_cta_label text,
    final_cta_url text,
    -- Badge sur le bouton « Rejoindre » du header (vide = pas de badge)
    header_badge text,
    -- /nous-rejoindre reprend étiquette, titre, sous-titre, bouton, clôture et SEO
    applies_to_join_page boolean DEFAULT false NOT NULL,
    seo_title text,
    seo_description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT announcements_pkey PRIMARY KEY (id),
    CONSTRAINT announcements_dates_check CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at),
    CONSTRAINT announcements_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.resources(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS announcements_live_idx ON public.announcements USING btree (enabled, starts_at, ends_at);

-- RLS sur le modèle des autres tables : activée, aucune policy. Seule la clé
-- service_role (côté serveur, repositories) lit et écrit.
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ── 2. Contenu structuré des pages ───────────────────────────────────────────
-- Textes et photos des sections propres à une page (aujourd'hui /nous-rejoindre :
-- point de départ, expérience, cap, profil, étapes, bloc final). Les champs
-- communs restent dans leurs colonnes (eyebrow, title, image_id, CTA, SEO).
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb NOT NULL;
