"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  FileText,
  FolderKanban,
  History,
  Home,
  Images,
  Inbox,
  Info,
  LayoutDashboard,
  Layers,
  Link2,
  ListTree,
  LogOut,
  Megaphone,
  Menu,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  ScrollText,
  Shapes,
  ShieldCheck,
  UserPen,
  UserPlus,
  Users,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_NAV_DASHBOARD, ADMIN_NAV_GROUPS, type AdminNavGroup, type AdminNavItemId } from "@/constants/adminNav";
import { activeNavHref, hiddenEmptySections, visibleNavGroups } from "@/utils/adminNav";

// Icônes : affichées seulement quand le menu est réduit (sinon libellés seuls).
const ICONS: Record<AdminNavItemId, LucideIcon> = {
  dashboard: LayoutDashboard,
  evenements: CalendarDays,
  productions: FileText,
  projets: FolderKanban,
  annonces: Megaphone,
  journal: Newspaper,
  dossiers: Layers,
  themes: BookOpen,
  sousthemes: ListTree,
  formatsactivites: Shapes,
  auteurs: UserPen,
  homepage: Home,
  "a-propos": Info,
  "nous-rejoindre": UserPlus,
  perca: Sprout,
  history: History,
  pages: Menu,
  forms: Inbox,
  media: Images,
  users: Users,
  roles: ShieldCheck,
  links: Link2,
  historique: ScrollText,
};

const GROUPS_STORAGE_KEY = "admin-nav-groups";
const SHOW_EMPTY_STORAGE_KEY = "admin-nav-show-empty";

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // navigation privée : l'état n'est simplement pas mémorisé
  }
}

export type AdminNavBadges = {
  /** Nombre de choses à faire (tableau de bord). */
  todo?: number;
  /** Formulaires reçus non traités. */
  pendingForms?: number;
};

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
  permissions?: string[];
  badges?: AdminNavBadges;
  emptySections?: { journal: boolean; dossiers: boolean };
}

function Badge({ count, label }: { count?: number; label: string }) {
  if (!count) return null;
  return (
    <span className="admin-nav-badge">
      {count > 99 ? "99+" : count}
      <span className="sr-only"> {label}</span>
    </span>
  );
}

export function AdminSidebar({
  collapsed,
  onToggle,
  isAdmin = false,
  permissions = [],
  badges = {},
  emptySections = { journal: false, dossiers: false },
}: Props) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [showEmpty, setShowEmpty] = useState(false);

  // État mémorisé dans le navigateur (lu après le montage : pas de décalage d'hydratation).
  useEffect(() => {
    setOpenGroups(readStorage<Record<string, boolean>>(GROUPS_STORAGE_KEY, {}));
    setShowEmpty(readStorage<boolean>(SHOW_EMPTY_STORAGE_KEY, false));
  }, []);

  const access = useMemo(() => ({ isAdmin, permissions }), [isAdmin, permissions]);
  const groups = visibleNavGroups(ADMIN_NAV_GROUPS, access, emptySections, showEmpty);
  const hiddenLabels = showEmpty ? [] : hiddenEmptySections(ADMIN_NAV_GROUPS, access, emptySections);
  const active = activeNavHref(pathname, [
    ADMIN_NAV_DASHBOARD.href,
    ...groups.flatMap((g) => g.items.map((i) => i.href)),
  ]);

  const isOpen = (group: AdminNavGroup) => {
    // Le groupe de la page courante reste ouvert.
    if (group.items.some((item) => item.href === active)) return true;
    return openGroups[group.id] ?? !group.collapsedByDefault;
  };

  function toggleGroup(group: AdminNavGroup) {
    const next = { ...openGroups, [group.id]: !isOpen(group) };
    setOpenGroups(next);
    writeStorage(GROUPS_STORAGE_KEY, next);
  }

  function revealEmpty() {
    setShowEmpty(true);
    writeStorage(SHOW_EMPTY_STORAGE_KEY, true);
  }

  const DashboardIcon = ICONS.dashboard;

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <img className="admin-sidebar-logo" src="/assets/photos/logo-manssuetude.png?v=4" alt="" />
        <span className="admin-sidebar-brand-name">Manssuétude</span>
      </div>

      <nav className="admin-nav" data-tour="tour-nav" aria-label="Administration">
        <Link
          href={ADMIN_NAV_DASHBOARD.href}
          aria-current={active === ADMIN_NAV_DASHBOARD.href ? "page" : undefined}
          title={collapsed ? ADMIN_NAV_DASHBOARD.label : undefined}
        >
          <DashboardIcon size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="admin-nav-label">{ADMIN_NAV_DASHBOARD.label}</span>
          <Badge count={badges.todo} label="choses à faire" />
        </Link>

        {groups.map((group) => {
          const open = collapsed || isOpen(group);
          const listId = `admin-nav-${group.id}`;
          return (
            <div key={group.id} className="admin-nav-group">
              <button
                type="button"
                className="admin-nav-group-toggle"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => toggleGroup(group)}
              >
                <span>{group.label}</span>
                <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
              </button>
              <ul id={listId} hidden={!open}>
                {group.items.map((item) => {
                  const Icon = ICONS[item.id];
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        aria-current={active === item.href ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        data-tour={item.id === "media" ? "tour-media" : undefined}
                      >
                        <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                        <span className="admin-nav-label">{item.label}</span>
                        {item.id === "forms" && <Badge count={badges.pendingForms} label="non traités" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        {hiddenLabels.length > 0 && (
          <p className="admin-nav-hidden">
            Sections vides masquées : {hiddenLabels.join(", ")}.{" "}
            <button type="button" onClick={revealEmpty}>
              Afficher
            </button>
          </p>
        )}
        <button
          type="button"
          className="admin-nav-btn tour-help-btn"
          title="Aide et guide de démarrage"
          onClick={() => window.dispatchEvent(new CustomEvent("manssuetude:tour:start"))}
        >
          <HelpCircle size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="admin-nav-label">Aide</span>
        </button>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="admin-nav-btn" title={collapsed ? "Déconnexion" : undefined}>
            <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="admin-nav-label">Déconnexion</span>
          </button>
        </form>
        <button
          type="button"
          className="admin-sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose size={16} strokeWidth={1.75} aria-hidden="true" />
              <span className="admin-nav-label">Réduire</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
