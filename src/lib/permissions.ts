import type { AdminSession } from "@/lib/auth";

// Vérifie qu'une session possède une permission "section:action".
// L'admin (permissions ["*"]) a tous les droits.
export function can(session: AdminSession | null | undefined, permission: string): boolean {
  if (!session) return false;
  if (session.isAdmin || session.permissions.includes("*")) return true;
  return session.permissions.includes(permission);
}

// Un rôle peut-il accéder à une section admin ? (au moins la permission "view")
export function canViewSection(session: AdminSession | null | undefined, section: string): boolean {
  return can(session, `${section}:view`);
}
