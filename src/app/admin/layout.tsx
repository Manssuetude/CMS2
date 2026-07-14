import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return <>{children}</>;
  return (
    <AdminShell isAdmin={session.isAdmin} permissions={session.permissions}>
      {children}
    </AdminShell>
  );
}
