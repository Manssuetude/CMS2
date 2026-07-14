"use client";

import { usePathname } from "next/navigation";
import { GlobalSearch } from "./GlobalSearch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const SECTION_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  themes: "Thèmes",
  activites: "Activités",
  productions: "Productions",
  projets: "Projets",
  media: "Médiathèque",
  forms: "Formulaires reçus",
};

function getSectionFromPath(pathname: string): string {
  const segment = pathname.split("/")[2] ?? "dashboard";
  return SECTION_LABELS[segment] ?? "Admin";
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
