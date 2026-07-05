import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { contentRepository } from "@/repositories/contentRepository";
import type { Theme } from "@/types/cms";

type Status = "draft" | "published" | "archived";

const STATUS_LABELS: Record<Status, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

const STATUS_BADGE: Record<Status, string> = {
  draft: "badge-draft",
  published: "badge-published",
  archived: "badge-archived",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status as Status] ?? "badge-draft";
  const label = STATUS_LABELS[status as Status] ?? status;
  return <span className={`badge-status ${cls}`}>{label}</span>;
}

function countByStatus(items: Theme[]) {
  return {
    all: items.length,
    published: items.filter((i) => i.status === "published").length,
    draft: items.filter((i) => i.status === "draft").length,
    archived: items.filter((i) => i.status === "archived").length,
  };
}

export default async function AdminThemesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await contentRepository.listThemes(true);
  const counts = countByStatus(all);

  const activeStatus = (["published", "draft", "archived"] as Status[]).includes(status as Status)
    ? (status as Status)
    : null;

  const items = activeStatus ? all.filter((i) => i.status === activeStatus) : all;

  const tabs = [
    { key: null, label: "Tous", count: counts.all },
    { key: "published" as Status, label: "Publiés", count: counts.published },
    { key: "draft" as Status, label: "Brouillons", count: counts.draft },
    { key: "archived" as Status, label: "Archivés", count: counts.archived },
  ];

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Thèmes</h1>
          <p>
            {items.length} thème{items.length !== 1 ? "s" : ""}
            {activeStatus ? ` · filtre : ${STATUS_LABELS[activeStatus]}` : ""}
          </p>
        </div>
        <Link href="/admin/themes/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouveau thème
        </Link>
      </div>

      <nav className="admin-filter-tabs" aria-label="Filtrer par statut">
        {tabs.map(({ key, label, count }) => {
          const href = key ? `/admin/themes?status=${key}` : "/admin/themes";
          const isActive = activeStatus === key;
          return (
            <Link key={key ?? "all"} href={href} className={`admin-filter-tab${isActive ? " active" : ""}`}>
              {label}
              <span className="tab-count">{count}</span>
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucun thème{activeStatus ? ` avec le statut « ${STATUS_LABELS[activeStatus]} »` : " en base"}</strong>
          <p>
            {activeStatus ? (
              <Link href="/admin/themes">Voir tous les thèmes</Link>
            ) : (
              "Créez votre premier thème ou initialisez-les via le schéma SQL."
            )}
          </p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thème</th>
              <th>Statut</th>
              <th>Description</th>
              <th>En avant</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">{item.title}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td style={{ color: "var(--muted)", fontSize: 13, maxWidth: 360 }}>
                  {item.description ? (
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.description}
                    </span>
                  ) : (
                    <em>Aucune description</em>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  {item.featured ? (
                    <span style={{ color: "var(--orange)", fontWeight: 700, fontSize: 16 }}>★</span>
                  ) : (
                    <span style={{ color: "var(--line-strong)" }}>-</span>
                  )}
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/themes/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
