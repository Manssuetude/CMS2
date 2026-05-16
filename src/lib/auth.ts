import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/cms";
import { getSupabaseAdmin } from "@/lib/db";

export const sessionCookieName = "manssuetude_session";

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
  password_hash?: string | null;
};

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(sessionCookieName)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as AdminSession;
  } catch {
    return null;
  }
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

export function encodeSession(session: AdminSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}
