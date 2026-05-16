import Link from "next/link";
import { adminModules } from "@/constants/adminNavigation";

export function AdminSidebar({ active }: { active?: string }) {
  return (
    <aside className="admin-sidebar">
      {adminModules.map(({ id, label }) => (
        <Link key={id} href={`/admin/${id}`} aria-current={active === id ? "page" : undefined}>
          {label}
        </Link>
      ))}
      <form action="/api/auth/logout" method="post">
        <button type="submit">Déconnexion</button>
      </form>
    </aside>
  );
}
