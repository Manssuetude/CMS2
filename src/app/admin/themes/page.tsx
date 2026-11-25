import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { themeRepository } from "@/repositories/themeRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { ThemeDeleteButton } from "@/components/admin/ThemeDeleteButton";
import { archiveThemeAction, deleteThemeAction, reattachSubThemesAction } from "./actions";
import { AdminListHeader } from "@/components/admin/AdminListHeader";
import { StatusFilterTabs } from "@/components/admin/StatusFilterTabs";
import {
  buildStatusTabs,
  countByStatus,
  resolveActiveStatus,
  STATUS_LABELS,
  type FilterStatus,
} from "@/utils/adminStatus";

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

export default async function AdminThemesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; erreur?: string }>;
}) {
  const { status, erreur } = await searchParams;
  const [all, subThemes, linkCounts] = await Promise.all([
    themeRepository.listThemes(true),
    subThemeRepository.listSubThemes(true),
    themeRepository.listThemeLinkCounts(),
  ]);
  const subThemesOf = (themeId: string) => subThemes.filter((st) => st.themeId === themeId);
  const activeStatus = resolveActiveStatus(status);
  const items = activeStatus ? all.filter((i) => i.status === activeStatus) : all;
  const tabs = buildStatusTabs(countByStatus(all), "m");

  return (
    <section className="admin-panel">
      <AdminListHeader
        title="Thèmes"
        count={items.length}
        singular="thème"
        plural="thèmes"
        activeStatusLabel={activeStatus ? STATUS_LABELS[activeStatus] : null}
      >
        <Link href="/admin/themes/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouveau thème
        </Link>
      </AdminListHeader>

      <StatusFilterTabs basePath="/admin/themes" activeStatus={activeStatus} tabs={tabs} />

      {erreur === "sous-themes" && (
        <p className="form-error" role="alert" style={{ marginBottom: 16 }}>
          Suppression refusée : ce thème contient encore des sous-thèmes. Rattachez-les à un autre thème ou archivez le
          thème.
        </p>
      )}

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
              <th>Sous-thèmes</th>
              <th>Statut</th>
              <th>Description</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">{item.title}</td>
                <td style={{ color: "var(--muted)", fontSize: 13, whiteSpace: "nowrap" }}>
                  {subThemesOf(item.id).length} sous-thème{subThemesOf(item.id).length > 1 ? "s" : ""}
                </td>
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
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/themes/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                    <ThemeDeleteButton
                      theme={{ id: item.id, title: item.title }}
                      subThemeTitles={subThemesOf(item.id).map((st) => st.title)}
                      eventCount={linkCounts[item.id]?.events ?? 0}
                      projectCount={linkCounts[item.id]?.projects ?? 0}
                      otherThemes={all
                        .filter((t) => t.id !== item.id && t.status !== "archived")
                        .map((t) => ({ id: t.id, title: t.title }))}
                      deleteAction={deleteThemeAction}
                      archiveAction={archiveThemeAction}
                      reattachAction={reattachSubThemesAction}
                    />
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
