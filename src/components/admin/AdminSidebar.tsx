"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ListTree,
  CalendarDays,
  FileText,
  FolderKanban,
  Images,
  Inbox,
  Home,
  ImagePlus,
  Clock,
  Users,
  ShieldCheck,
  ScrollText,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
} from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "homepage", label: "Page d'accueil", icon: Home },
  { id: "perca", label: "Page PERCA", icon: Home },
  { id: "history", label: "Page Histoire", icon: Clock },
  { id: "pages", label: "Photos des pages", icon: ImagePlus },
  { id: "themes", label: "Thèmes", icon: BookOpen },
  { id: "sousthemes", label: "Sous-thèmes", icon: ListTree },
  { id: "activites", label: "Activités", icon: CalendarDays },
  { id: "productions", label: "Productions", icon: FileText },
  { id: "projets", label: "Projets", icon: FolderKanban },
  { id: "media", label: "Médiathèque", icon: Images },
  { id: "forms", label: "Formulaires", icon: Inbox },
] as const;

// Sections réservées aux administrateurs.
const ADMIN_NAV = [
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "roles", label: "Rôles", icon: ShieldCheck },
  { id: "journal", label: "Journal", icon: ScrollText },
] as const;

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
  permissions?: string[];
}

export function AdminSidebar({ collapsed, onToggle, isAdmin = false, permissions = [] }: Props) {
  const pathname = usePathname();
  // Masque les sections que le rôle ne peut pas voir (l'admin voit tout).
  const canView = (id: string) => id === "dashboard" || isAdmin || permissions.includes(`${id}:view`);
  const nav = [...NAV.filter((item) => canView(item.id)), ...(isAdmin ? ADMIN_NAV : [])];

  const isActive = (id: string) => {
    if (id === "dashboard") return pathname === "/admin/dashboard" || pathname === "/admin";
    return pathname.startsWith(`/admin/${id}`);
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <img className="admin-sidebar-logo" src="/assets/photos/logo-manssuetude.png?v=3" alt="Manssuétude" />
        <span className="admin-sidebar-brand-name">Manssuétude</span>
      </div>

      <nav className="admin-nav" data-tour="tour-nav">
        {nav.map(({ id, label, icon: Icon }) => (
          <Link
            key={id}
            href={`/admin/${id}`}
            aria-current={isActive(id) ? "page" : undefined}
            title={collapsed ? label : undefined}
            data-tour={id === "media" ? "tour-media" : undefined}
          >
            {id === "perca" ? (
              <span className="admin-nav-glyph" aria-hidden>
                P
              </span>
            ) : (
              <Icon size={16} strokeWidth={1.75} />
            )}
            <span className="admin-nav-label">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="admin-nav-btn" title={collapsed ? "Déconnexion" : undefined}>
            <LogOut size={16} strokeWidth={1.75} />
            <span className="admin-nav-label">Déconnexion</span>
          </button>
        </form>

        <button
          type="button"
          className="admin-nav-btn tour-help-btn"
          title="Aide et guide de démarrage"
          onClick={() => window.dispatchEvent(new CustomEvent("manssuetude:tour:start"))}
        >
          <HelpCircle size={16} strokeWidth={1.75} />
          <span className="admin-nav-label">Aide</span>
        </button>

        <button
          type="button"
          className="admin-sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? "Agrandir" : "Réduire"}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} strokeWidth={1.75} />
          ) : (
            <>
              <PanelLeftClose size={16} strokeWidth={1.75} />
              <span className="admin-nav-label">Réduire</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
