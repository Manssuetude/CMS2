import Link from "next/link";
import type { FilterStatus, StatusTab } from "@/utils/adminStatus";

/** Barre d'onglets de filtre par statut, partagée par toutes les listes admin. */
export function StatusFilterTabs({
  basePath,
  activeStatus,
  tabs,
}: {
  basePath: string;
  activeStatus: FilterStatus | null;
  tabs: StatusTab[];
}) {
  return (
    <nav className="admin-filter-tabs" aria-label="Filtrer par statut">
      {tabs.map(({ key, label, count }) => {
        const href = key ? `${basePath}?status=${key}` : basePath;
        const isActive = activeStatus === key;
        return (
          <Link key={key ?? "all"} href={href} className={`admin-filter-tab${isActive ? " active" : ""}`}>
            {label}
            <span className="tab-count">{count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
