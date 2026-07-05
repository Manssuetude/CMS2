import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { contentRepository } from "@/repositories/contentRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteProjectAction, toggleProjectStatusAction } from "./actions";
import type { Project } from "@/types/cms";

type Status = "draft" | "published" | "archived";

const STATUS_LABELS: Record<Status, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

function ProgressTag({ status }: { status: string | null | undefined }) {
  if (!status) return <span style={{ color: "var(--muted)" }}>-</span>;
  const label: Record<string, string> = {
    idea: "Idée",
    preparation: "En prep.",
    active: "En cours",
    completed: "Terminé",
    paused: "En pause",
  };
  return <span className="progress-tag">{label[status] ?? status}</span>;
}

function countByStatus(items: Project[]) {
  return {
    all: items.length,
    published: items.filter((i) => i.status === "published").length,
    draft: items.filter((i) => i.status === "draft").length,
    archived: items.filter((i) => i.status === "archived").length,
  };
}

export default async function AdminProjetsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await contentRepository.listProjects(true);
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
          <h1>Projets</h1>
          <p>
            {items.length} projet{items.length !== 1 ? "s" : ""}
            {activeStatus ? ` · filtre : ${STATUS_LABELS[activeStatus]}` : ""}
          </p>
        </div>
        <Link href="/admin/projets/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouveau projet
        </Link>
      </div>

      <nav className="admin-filter-tabs" aria-label="Filtrer par statut">
        {tabs.map(({ key, label, count }) => {
          const href = key ? `/admin/projets?status=${key}` : "/admin/projets";
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
            Aucun projet{activeStatus ? ` avec le statut « ${STATUS_LABELS[activeStatus]} »` : " pour l'instant"}
          </strong>
          <p>
            {activeStatus ? (
              <Link href="/admin/projets">Voir tous les projets</Link>
            ) : (
              "Créez votre premier projet pour le faire apparaître sur le site."
            )}
          </p>
          {!activeStatus && (
            <Link href="/admin/projets/new" className="button primary" style={{ marginTop: 8 }}>
              Créer un projet
            </Link>
          )}
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Catégorie</th>
              <th>Statut</th>
              <th>Avancement</th>
              <th>Priorité</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">
                  {item.featured && (
                    <span
                      style={{ color: "var(--orange)", fontWeight: 900, marginRight: 6, fontSize: 13 }}
                      title="Mis en avant"
                    >
                      ★
                    </span>
                  )}
                  {item.title}
                </td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.category ?? "-"}</td>
                <td>
                  <form action={toggleProjectStatusAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value={item.status} />
                    <button type="submit" className={`btn-toggle ${item.status}`} title="Changer le statut">
                      {item.status === "published" ? "Publié" : item.status === "archived" ? "Archivé" : "Brouillon"}
                    </button>
                  </form>
                </td>
                <td>
                  <ProgressTag status={item.progressStatus} />
                </td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.priority ?? "-"}</td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/projets/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                    <form action={deleteProjectAction}>
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
