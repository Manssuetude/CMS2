import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { dashboardRepository, type AdminNavCounts } from "@/repositories/dashboardRepository";
// CSS de l'administration : chargé seulement ici, jamais sur le site public.
import "@/styles/admin.css";

export const dynamic = "force-dynamic";

// Sections de contenu soumises à la permission "<section>:view".
const GATED_SECTIONS = [
  "themes",
  "sousthemes",
  "auteurs",
  "evenements",
  "formatsactivites",
  "productions",
  "projets",
  "journal",
  "dossiers",
  "media",
  "forms",
  "annonces",
  "homepage",
  "perca",
  "history",
  "pages",
  "links",
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

  // Compteurs du menu : jamais bloquants (base injoignable → menu sans compteurs).
  let counts: AdminNavCounts = { pendingForms: 0, journalEntries: 1, dossiers: 1 };
  try {
    counts = await dashboardRepository.getNavCounts();
  } catch {
    // menu affiché sans compteurs
  }

  return (
    <AdminShell
      isAdmin={session.isAdmin}
      permissions={session.permissions}
      badges={{ pendingForms: counts.pendingForms }}
      emptySections={{ journal: counts.journalEntries === 0, dossiers: counts.dossiers === 0 }}
    >
      {children}
    </AdminShell>
  );
}
