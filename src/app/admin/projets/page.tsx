import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { contentRepository } from "@/repositories/contentRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteProjectAction, toggleProjectStatusAction } from "./actions";

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

export default async function AdminProjetsPage() {
  const items = await contentRepository.listProjects(true);

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Projets</h1>
          <p>
            {items.length} projet{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/projets/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouveau projet
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucun projet pour l&apos;instant</strong>
          <p>Créez votre premier projet pour le faire apparaître sur le site.</p>
          <Link href="/admin/projets/new" className="button primary" style={{ marginTop: 8 }}>
            Créer un projet
          </Link>
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
