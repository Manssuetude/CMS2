import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
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
import { deleteActivityFormatAction } from "./actions";

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

export default async function AdminActivityFormatsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const all = await activityFormatRepository.listFormats(true);
  const activeStatus = resolveActiveStatus(status);
  const items = activeStatus ? all.filter((i) => i.status === activeStatus) : all;
  const tabs = buildStatusTabs(countByStatus(all), "m");

  return (
    <section className="admin-panel">
      <AdminListHeader
        title="Formats d'activités"
        count={items.length}
        singular="format"
        plural="formats"
        activeStatusLabel={activeStatus ? STATUS_LABELS[activeStatus] : null}
      >
        <Link href="/admin/formatsactivites/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouveau format
        </Link>
      </AdminListHeader>
      <p style={{ marginTop: -8, marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
        Répertoire des techniques d&apos;animation (Fishbowl, Hot Takes, Débat 2v2...), présenté en grille sur{" "}
        <a href="/activites/formats-d-activites" target="_blank" rel="noreferrer" style={{ color: "var(--orange)" }}>
          /activites/formats-d-activites
        </a>
        .
      </p>

      <StatusFilterTabs basePath="/admin/formatsactivites" activeStatus={activeStatus} tabs={tabs} />

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>
            Aucun format{activeStatus ? ` avec le statut « ${STATUS_LABELS[activeStatus]} »` : " en base"}
          </strong>
          <p>
            {activeStatus ? (
              <Link href="/admin/formatsactivites">Voir tous les formats</Link>
            ) : (
              "Créez un premier format d'animation."
            )}
          </p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ordre</th>
              <th>Titre</th>
              <th>Statut</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.position}</td>
                <td className="col-title">{item.title}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/formatsactivites/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                    <form action={deleteActivityFormatAction}>
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
