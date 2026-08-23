import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { journalRepository } from "@/repositories/journalRepository";
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
import { deleteJournalEntryAction } from "./actions";

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

export default async function AdminJournalListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await journalRepository.listEntries(true);
  const activeStatus = resolveActiveStatus(status);
  const items = activeStatus ? all.filter((i) => i.status === activeStatus) : all;
  const tabs = buildStatusTabs(countByStatus(all), "f");

  return (
    <section className="admin-panel">
      <AdminListHeader
        title="Journal"
        count={items.length}
        singular="entrée"
        plural="entrées"
        activeStatusLabel={activeStatus ? STATUS_LABELS[activeStatus] : null}
      >
        <Link href="/admin/journal/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouvelle entrée
        </Link>
      </AdminListHeader>

      <StatusFilterTabs basePath="/admin/journal" activeStatus={activeStatus} tabs={tabs} />

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>
            Aucune entrée{activeStatus ? ` avec le statut « ${STATUS_LABELS[activeStatus]} »` : " en base"}
          </strong>
          <p>
            {activeStatus ? (
              <Link href="/admin/journal">Voir toutes les entrées</Link>
            ) : (
              "Créez une première entrée de Journal (actualité, coulisses, réflexion...)."
            )}
          </p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Catégorie</th>
              <th>Date</th>
              <th>Statut</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">{item.title}</td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.category ?? "—"}</td>
                <td style={{ color: "var(--muted)", fontSize: 13, whiteSpace: "nowrap" }}>
                  {item.date ? new Date(item.date).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/journal/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                    <form action={deleteJournalEntryAction}>
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
