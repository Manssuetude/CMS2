"use client";

import { usePathname } from "next/navigation";
import { GlobalSearch } from "./GlobalSearch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ADMIN_NAV_DASHBOARD, ADMIN_NAV_GROUPS } from "@/constants/adminNav";
import { activeNavHref } from "@/utils/adminNav";

// Titre de la barre du haut : libellé de l'entrée de menu active.
const NAV_ITEMS = [ADMIN_NAV_DASHBOARD, ...ADMIN_NAV_GROUPS.flatMap((group) => group.items)];

function getSectionFromPath(pathname: string): string {
  const href = activeNavHref(
    pathname,
    NAV_ITEMS.map((item) => item.href),
  );
  return NAV_ITEMS.find((item) => item.href === href)?.label ?? "Administration";
}

function getPageLabel(pathname: string): string | null {
  if (pathname.endsWith("/new")) return "Nouveau";
  if (pathname.endsWith("/edit")) return "Modifier";
  if (pathname.endsWith("/calendar")) return "Calendrier";
  return null;
}

export function AdminTopbar() {
  const pathname = usePathname();
  const section = getSectionFromPath(pathname);
  const page = getPageLabel(pathname);

  return (
    <div className="admin-topbar">
      <div className="admin-topbar-left">
        <span className="admin-topbar-title">{section}</span>
        {page && (
          <>
            <span className="admin-topbar-sep">/</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{page}</span>
          </>
        )}
      </div>
      <div className="admin-topbar-actions">
        <GlobalSearch />
        <ThemeToggle />
      </div>
    </div>
  );
}
