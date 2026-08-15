import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { projectRepository } from "@/repositories/projectRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { AdminListHeader } from "@/components/admin/AdminListHeader";
import { ProgressTag } from "@/components/admin/ProgressTag";
import { StatusFilterTabs } from "@/components/admin/StatusFilterTabs";
import { StatusToggleButton } from "@/components/admin/StatusToggleButton";
import { buildStatusTabs, countByStatus, resolveActiveStatus, STATUS_LABELS } from "@/utils/adminStatus";
import { deleteProjectAction, toggleProjectStatusAction } from "./actions";

export default async function AdminProjetsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await projectRepository.listProjects(true);
  const activeStatus = resolveActiveStatus(status);
  const items = activeStatus ? all.filter((i) => i.status === activeStatus) : all;
  const tabs = buildStatusTabs(countByStatus(all), "m");

  return (
    <section className="admin-panel">
      <AdminListHeader
        title="Projets"
        count={items.length}
        singular="projet"
        plural="projets"
        activeStatusLabel={activeStatus ? STATUS_LABELS[activeStatus] : null}
      >
        <Link href="/admin/projets/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouveau projet
        </Link>
      </AdminListHeader>

      <StatusFilterTabs basePath="/admin/projets" activeStatus={activeStatus} tabs={tabs} />

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
                  <StatusToggleButton action={toggleProjectStatusAction} id={item.id} status={item.status} />
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
