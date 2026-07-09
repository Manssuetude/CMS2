-- Migration: auth_cleanup
-- Suppression de la colonne password_hash (obsolete depuis switch vers Supabase Auth)
-- Creation du trigger de synchronisation auth.users -> public.users

-- 1. Supprimer la colonne obsolete
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- 2. Fonction declenchee a chaque creation d'utilisateur dans Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- 3. Trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Backfill : inserer les utilisateurs Supabase Auth existants qui n'ont pas encore de ligne dans public.users
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email),
  COALESCE(raw_user_meta_data->>'role', 'admin')::user_role,
  created_at,
  NOW()
FROM auth.users
ON CONFLICT (id) DO NOTHING;
