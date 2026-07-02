import Link from "next/link";
import { Pencil, Plus, CalendarDays } from "lucide-react";
import { contentRepository } from "@/repositories/contentRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteActivityAction, toggleActivityStatusAction } from "./actions";

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

export default async function AdminActivitesPage() {
  const items = await contentRepository.listActivities(true);

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Activités</h1>
          <p>
            {items.length} activité{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/admin/activites/calendar" className="button">
            <CalendarDays size={15} strokeWidth={1.75} />
            Calendrier
          </Link>
          <Link href="/admin/activites/new" className="button primary">
            <Plus size={15} strokeWidth={2} />
            Nouvelle activité
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucune activité pour l&apos;instant</strong>
          <p>Créez votre première activité pour alimenter le site.</p>
          <Link href="/admin/activites/new" className="button primary" style={{ marginTop: 8 }}>
            Créer une activité
          </Link>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Format</th>
              <th>Statut</th>
              <th>Avancement</th>
              <th>Date</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">{item.title}</td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.format}</td>
                <td>
                  <form action={toggleActivityStatusAction} style={{ display: "inline" }}>
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
                <td style={{ color: "var(--muted)", fontSize: 13 }}>
                  {item.date
                    ? new Date(item.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/activites/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                    <form action={deleteActivityAction}>
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
