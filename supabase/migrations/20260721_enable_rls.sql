-- Active Row Level Security (RLS) sur toutes les tables du schéma public.
--
-- Contexte : le linter Supabase signale ces tables comme exposées via PostgREST
-- (clé anon publique) sans RLS → lecture/écriture directe possible depuis le
-- navigateur en contournant le backend.
--
-- Dans cette app, TOUT l'accès aux données passe par `getSupabaseAdmin()`
-- (clé service_role, serveur uniquement), qui IGNORE RLS. La clé anon ne sert
-- qu'à Supabase Auth, jamais à lire ces tables. On peut donc activer RLS
-- SANS aucune policy : la clé anon est refusée par défaut, le service_role
-- continue de tout voir. Aucun impact sur l'app.
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

alter table public.users                enable row level security;
alter table public.resources            enable row level security;
alter table public.pages                enable row level security;
alter table public.themes               enable row level security;
alter table public.productions          enable row level security;
alter table public.projects             enable row level security;
alter table public.activities           enable row level security;
alter table public.form_submissions     enable row level security;
alter table public.site_settings        enable row level security;

-- Tables de liaison (many-to-many)
alter table public.theme_productions     enable row level security;
alter table public.theme_projects        enable row level security;
alter table public.theme_activities      enable row level security;
alter table public.production_projects   enable row level security;
alter table public.production_activities enable row level security;
alter table public.activity_resources    enable row level security;
alter table public.project_resources     enable row level security;

-- Tables RBAC / audit (données sensibles, service_role uniquement)
alter table public.roles                 enable row level security;
alter table public.audit_logs            enable row level security;
