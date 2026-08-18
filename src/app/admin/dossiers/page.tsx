import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { dossierRepository } from "@/repositories/dossierRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { AdminListHeader } from "@/components/admin/AdminListHeader";
import { StatusFilterTabs } from "@/components/admin/StatusFilterTabs";
import {
  buildStatusTabs,
  countByStatus,
  resolveActiveStatus,
  STATUS_LABELS,
  type FilterStatus,
} from "@/utils/adminStatus";
import { deleteDossierAction } from "./actions";

const STATUS_BADGE: Record<FilterStatus, string> = {
  draft: "badge-draft",
  published: "badge-published",
  archived: "badge-archived",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status as FilterStatus] ?? "badge-draft";
  const label = STATUS_LABELS[status as FilterStatus] ?? status;
  return <span className={`badge-status ${cls}`}>{label}</span>;
}

const MODE_LABEL: Record<string, string> = { libre: "Libre", guide: "Guidé" };

export default async function AdminDossiersListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await dossierRepository.listDossiers(true);
  const activeStatus = resolveActiveStatus(status);
  const items = activeStatus ? all.filter((i) => i.status === activeStatus) : all;
  const tabs = buildStatusTabs(countByStatus(all), "m");

  return (
    <section className="admin-panel">
      <AdminListHeader
        title="Dossiers"
        count={items.length}
        singular="dossier"
        plural="dossiers"
        activeStatusLabel={activeStatus ? STATUS_LABELS[activeStatus] : null}
      >
        <Link href="/admin/dossiers/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouveau dossier
        </Link>
      </AdminListHeader>

      <StatusFilterTabs basePath="/admin/dossiers" activeStatus={activeStatus} tabs={tabs} />

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>
            Aucun dossier{activeStatus ? ` avec le statut « ${STATUS_LABELS[activeStatus]} »` : " en base"}
          </strong>
          <p>
            {activeStatus ? (
              <Link href="/admin/dossiers">Voir tous les dossiers</Link>
            ) : (
              "Créez un premier dossier pour regrouper des contenus autour d'un même sujet."
            )}
          </p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Mode</th>
              <th>Statut</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">{item.title}</td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{MODE_LABEL[item.mode] ?? item.mode}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/dossiers/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                    <form action={deleteDossierAction}>
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
