import { redirect } from "next/navigation";
import type { UserRole } from "@/types/cms";
import { getSupabaseAdmin } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
  role: UserRole;
};

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
};

export async function getSession(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) return null;

  const role = (user.user_metadata?.role as UserRole | undefined) ?? "admin";

  return {
    userId: user.id,
    email: user.email,
    role,
  };
}

export async function requireRole(allowed: UserRole[] = ["admin", "editor"]) {
  const session = await getSession();
  if (!session || !allowed.includes(session.role)) redirect("/admin/login");
  return session;
}

export async function resolveUserByEmail(email: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("users").select("*").eq("email", email).single();
  if (error) return null;
  return data as AuthUser;
}
