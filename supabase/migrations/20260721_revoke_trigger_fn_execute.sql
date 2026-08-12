-- Retire l'endpoint RPC public de la fonction trigger handle_new_auth_user().
--
-- Contexte : le linter Supabase signale que public.handle_new_auth_user()
-- (SECURITY DEFINER) est appelable par les rôles anon et authenticated via
-- /rest/v1/rpc/handle_new_auth_user.
--
-- Cette fonction est UNIQUEMENT un trigger (after insert on auth.users) qui
-- copie le nouvel utilisateur dans public.users. Elle ne doit jamais être
-- appelée directement. Révoquer EXECUTE supprime l'endpoint RPC sans casser le
-- trigger (les triggers ne dépendent pas du droit EXECUTE du rôle appelant).
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
