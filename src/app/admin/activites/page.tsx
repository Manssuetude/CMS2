import Link from "next/link";
import { Pencil, Plus, CalendarDays } from "lucide-react";
import { contentRepository } from "@/repositories/contentRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { AdminListHeader } from "@/components/admin/AdminListHeader";
import { ProgressTag } from "@/components/admin/ProgressTag";
import { StatusFilterTabs } from "@/components/admin/StatusFilterTabs";
import { StatusToggleButton } from "@/components/admin/StatusToggleButton";
import { FeaturedToggleButton } from "@/components/admin/FeaturedToggleButton";
import { buildStatusTabs, countByStatus, resolveActiveStatus, STATUS_LABELS } from "@/utils/adminStatus";
import { deleteActivityAction, toggleActivityStatusAction } from "./actions";

export default async function AdminActivitesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await contentRepository.listActivities(true);
  const activeStatus = resolveActiveStatus(status);
  const items = activeStatus ? all.filter((i) => i.status === activeStatus) : all;
  const tabs = buildStatusTabs(countByStatus(all), "f");
  const featuredCount = all.filter((a) => a.featured).length;

  return (
    <section className="admin-panel">
      <AdminListHeader
        title="Activités"
        count={items.length}
        singular="activité"
        plural="activités"
        activeStatusLabel={activeStatus ? STATUS_LABELS[activeStatus] : null}
      >
        <Link href="/admin/activites/calendar" className="button">
          <CalendarDays size={15} strokeWidth={1.75} />
          Calendrier
        </Link>
        <Link href="/admin/activites/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouvelle activité
        </Link>
      </AdminListHeader>

      <StatusFilterTabs basePath="/admin/activites" activeStatus={activeStatus} tabs={tabs} />

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>
            Aucune activité{activeStatus ? ` avec le statut « ${STATUS_LABELS[activeStatus]} »` : " pour l'instant"}
          </strong>
          <p>
            {activeStatus ? (
              <Link href="/admin/activites">Voir toutes les activités</Link>
            ) : (
              "Créez votre première activité pour alimenter le site."
            )}
          </p>
          {!activeStatus && (
            <Link href="/admin/activites/new" className="button primary" style={{ marginTop: 8 }}>
              Créer une activité
            </Link>
          )}
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
              <th>Vedette</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">{item.title}</td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.format}</td>
                <td>
                  <StatusToggleButton action={toggleActivityStatusAction} id={item.id} status={item.status} />
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
                <td style={{ textAlign: "center" }}>
                  <FeaturedToggleButton
                    id={item.id}
                    featured={item.featured}
                    kind="activity"
                    count={featuredCount}
                    max={3}
                  />
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
