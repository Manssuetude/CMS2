import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { contentRepository } from "@/repositories/contentRepository";
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
import { deleteSubThemeAction } from "./actions";

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

export default async function AdminSubThemesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const [all, themes] = await Promise.all([contentRepository.listSubThemes(true), contentRepository.listThemes(true)]);
  const themeTitleById = new Map(themes.map((t) => [t.id, t.title]));
  const activeStatus = resolveActiveStatus(status);
  const items = activeStatus ? all.filter((i) => i.status === activeStatus) : all;
  const tabs = buildStatusTabs(countByStatus(all), "m");

  return (
    <section className="admin-panel">
      <AdminListHeader
        title="Sous-thèmes"
        count={items.length}
        singular="sous-thème"
        plural="sous-thèmes"
        activeStatusLabel={activeStatus ? STATUS_LABELS[activeStatus] : null}
      >
        <Link href="/admin/sousthemes/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouveau sous-thème
        </Link>
      </AdminListHeader>

      <StatusFilterTabs basePath="/admin/sousthemes" activeStatus={activeStatus} tabs={tabs} />

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>
            Aucun sous-thème{activeStatus ? ` avec le statut « ${STATUS_LABELS[activeStatus]} »` : " en base"}
          </strong>
          <p>
            {activeStatus ? (
              <Link href="/admin/sousthemes">Voir tous les sous-thèmes</Link>
            ) : (
              "Créez un sous-thème pour classer vos productions sous un thème."
            )}
          </p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sous-thème</th>
              <th>Thème parent</th>
              <th>Statut</th>
              <th>Description</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">{item.title}</td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{themeTitleById.get(item.themeId) ?? "-"}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td style={{ color: "var(--muted)", fontSize: 13, maxWidth: 320 }}>
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
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/sousthemes/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                    <form action={deleteSubThemeAction}>
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
