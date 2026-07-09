"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  FileText,
  FolderKanban,
  Images,
  Inbox,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
} from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "themes", label: "Thèmes", icon: BookOpen },
  { id: "activites", label: "Activités", icon: CalendarDays },
  { id: "productions", label: "Productions", icon: FileText },
  { id: "projets", label: "Projets", icon: FolderKanban },
  { id: "media", label: "Médiathèque", icon: Images },
  { id: "forms", label: "Formulaires", icon: Inbox },
] as const;

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();

  const isActive = (id: string) => {
    if (id === "dashboard") return pathname === "/admin/dashboard" || pathname === "/admin";
    return pathname.startsWith(`/admin/${id}`);
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-logo">M</div>
        <span className="admin-sidebar-brand-name">Manssuetude</span>
      </div>

      <nav className="admin-nav" data-tour="tour-nav">
        {NAV.map(({ id, label, icon: Icon }) => (
          <Link
            key={id}
            href={`/admin/${id}`}
            aria-current={isActive(id) ? "page" : undefined}
            title={collapsed ? label : undefined}
            data-tour={id === "media" ? "tour-media" : undefined}
          >
            <Icon size={16} strokeWidth={1.75} />
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
