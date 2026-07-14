import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/db";
import { roleRepository } from "@/repositories/roleRepository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
  roleKey: string;
  roleLabel: string;
  isAdmin: boolean;
  permissions: string[]; // liste de clés "section:action" — ["*"] pour l'admin
};

export async function getSession(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) return null;

  // Source de vérité du rôle : la table `users` (plus de défaut "admin").
  const db = getSupabaseAdmin();
  const { data: urow } = await db.from("users").select("role_key").eq("id", user.id).maybeSingle();
  const roleKey = (urow?.role_key as string | null) ?? null;
  if (!roleKey) return null; // aucun rôle attribué → aucun accès admin

  const role = await roleRepository.getByKey(roleKey);
  const isAdmin = role?.isAdmin ?? false;

  return {
    userId: user.id,
    email: user.email,
    roleKey,
    roleLabel: role?.label ?? roleKey,
    isAdmin,
    permissions: isAdmin ? ["*"] : (role?.permissions ?? []),
  };
}

// Accès à une route/action : admin OU rôle explicitement autorisé.
export async function requireRole(allowed: string[] = ["admin"]) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.isAdmin || allowed.includes(session.roleKey)) return session;
  redirect("/admin/login");
}

// Réservé aux administrateurs (gestion users / rôles / journal).
export async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.isAdmin) redirect("/admin/login");
  return session;
}
