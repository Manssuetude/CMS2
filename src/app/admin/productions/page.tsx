import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { contentRepository } from "@/repositories/contentRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteProductionAction, toggleProductionStatusAction } from "./actions";
import type { Production } from "@/types/cms";

type Status = "draft" | "published" | "archived";

const STATUS_LABELS: Record<Status, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

function countByStatus(items: Production[]) {
  return {
    all: items.length,
    published: items.filter((i) => i.status === "published").length,
    draft: items.filter((i) => i.status === "draft").length,
    archived: items.filter((i) => i.status === "archived").length,
  };
}

export default async function AdminProductionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await contentRepository.listProductions(true);
  const counts = countByStatus(all);

  const activeStatus = (["published", "draft", "archived"] as Status[]).includes(status as Status)
    ? (status as Status)
    : null;

  const items = activeStatus ? all.filter((i) => i.status === activeStatus) : all;

  const tabs = [
    { key: null, label: "Toutes", count: counts.all },
    { key: "published" as Status, label: "Publiées", count: counts.published },
    { key: "draft" as Status, label: "Brouillons", count: counts.draft },
    { key: "archived" as Status, label: "Archivées", count: counts.archived },
  ];

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Productions</h1>
          <p>
            {items.length} production{items.length !== 1 ? "s" : ""}
            {activeStatus ? ` · filtre : ${STATUS_LABELS[activeStatus]}` : ""}
          </p>
        </div>
        <Link href="/admin/productions/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouvelle production
        </Link>
      </div>

      <nav className="admin-filter-tabs" aria-label="Filtrer par statut">
        {tabs.map(({ key, label, count }) => {
          const href = key ? `/admin/productions?status=${key}` : "/admin/productions";
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
          <strong>
            Aucune production{activeStatus ? ` avec le statut « ${STATUS_LABELS[activeStatus]} »` : " pour l'instant"}
          </strong>
          <p>
            {activeStatus ? (
              <Link href="/admin/productions">Voir toutes les productions</Link>
            ) : (
              "Créez votre premier article, note ou rapport."
            )}
          </p>
          {!activeStatus && (
            <Link href="/admin/productions/new" className="button primary" style={{ marginTop: 8 }}>
              Créer une production
            </Link>
          )}
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Auteur</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Vedette</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">{item.title}</td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.type}</td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.author ?? "-"}</td>
                <td>
                  <form action={toggleProductionStatusAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value={item.status} />
                    <button type="submit" className={`btn-toggle ${item.status}`} title="Changer le statut">
                      {item.status === "published" ? "Publié" : item.status === "archived" ? "Archivé" : "Brouillon"}
                    </button>
                  </form>
                </td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>
                  {item.date
                    ? new Date(item.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {item.featured ? (
                    <span style={{ color: "var(--orange)", fontWeight: 900, fontSize: 16 }}>★</span>
                  ) : (
                    <span style={{ color: "var(--line-strong)" }}>-</span>
                  )}
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/productions/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                    <form action={deleteProductionAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmDeleteButton />
                    </form>
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
