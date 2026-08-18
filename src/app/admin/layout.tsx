import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

// Sections de contenu soumises à la permission "<section>:view".
const GATED_SECTIONS = [
  "themes",
  "sousthemes",
  "auteurs",
  "activites",
  "productions",
  "projets",
  "journal",
  "dossiers",
  "media",
  "forms",
  "homepage",
  "perca",
  "history",
  "pages",
  "redirects",
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return <>{children}</>;

  // Enforcement d'accès : un rôle non-admin doit avoir "<section>:view".
  if (!session.isAdmin) {
    const pathname = (await headers()).get("x-pathname") ?? "";
    const section = pathname.split("/")[2] ?? "";
    if (GATED_SECTIONS.includes(section) && !session.permissions.includes(`${section}:view`)) {
      redirect("/admin/dashboard");
    }
  }

  return (
    <AdminShell isAdmin={session.isAdmin} permissions={session.permissions}>
      {children}
    </AdminShell>
  );
}
