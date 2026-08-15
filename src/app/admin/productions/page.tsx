import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { productionRepository } from "@/repositories/productionRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { AdminListHeader } from "@/components/admin/AdminListHeader";
import { StatusFilterTabs } from "@/components/admin/StatusFilterTabs";
import { StatusToggleButton } from "@/components/admin/StatusToggleButton";
import { FeaturedToggleButton } from "@/components/admin/FeaturedToggleButton";
import { buildStatusTabs, countByStatus, resolveActiveStatus, STATUS_LABELS } from "@/utils/adminStatus";
import { deleteProductionAction, toggleProductionStatusAction } from "./actions";

export default async function AdminProductionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await productionRepository.listProductions(true);
  const activeStatus = resolveActiveStatus(status);
  const items = activeStatus ? all.filter((i) => i.status === activeStatus) : all;
  const tabs = buildStatusTabs(countByStatus(all), "f");
  const featuredCount = all.filter((p) => p.featured).length;

  return (
    <section className="admin-panel">
      <AdminListHeader
        title="Productions"
        count={items.length}
        singular="production"
        plural="productions"
        activeStatusLabel={activeStatus ? STATUS_LABELS[activeStatus] : null}
      >
        <Link href="/admin/productions/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouvelle production
        </Link>
      </AdminListHeader>

      <StatusFilterTabs basePath="/admin/productions" activeStatus={activeStatus} tabs={tabs} />

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>
            Aucune production{activeStatus ? ` avec le statut « ${STATUS_LABELS[activeStatus]} »` : " pour l'instant"}
          </strong>
          <p>
            {activeStatus ? (
              <Link href="/admin/productions">Voir toutes les productions</Link>
            ) : (
              "Créez votre premier article, note ou rapport."
            )}
          </p>
          {!activeStatus && (
            <Link href="/admin/productions/new" className="button primary" style={{ marginTop: 8 }}>
              Créer une production
            </Link>
          )}
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Auteur</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Vedette</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">{item.title}</td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.type}</td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.author ?? "-"}</td>
                <td>
                  <StatusToggleButton action={toggleProductionStatusAction} id={item.id} status={item.status} />
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
                    kind="production"
                    count={featuredCount}
                    max={4}
                  />
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/productions/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                    <form action={deleteProductionAction}>
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
