import Link from "next/link";
import { AlertTriangle, Copy, Pencil, Plus } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { announcementRepository } from "@/repositories/announcementRepository";
import { AdminListHeader } from "@/components/admin/AdminListHeader";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { AnnouncementState } from "@/types/cms";
import { announcementState, announcementStatusLabel, findOverlaps } from "@/utils/announcements";
import { deleteAnnouncementAction, duplicateAnnouncementAction } from "./actions";

const STATE_BADGE: Record<AnnouncementState, string> = {
  live: "badge-published",
  scheduled: "badge-review",
  ended: "badge-archived",
  disabled: "badge-draft",
  undated: "badge-draft",
};

export default async function AdminAnnouncementsPage() {
  await requirePermission("annonces:view");
  let items: Awaited<ReturnType<typeof announcementRepository.list>> = [];
  let missingTable = false;
  try {
    items = await announcementRepository.list();
  } catch {
    missingTable = true;
  }
  const now = new Date();

  return (
    <section className="admin-panel">
      <AdminListHeader title="Annonces" count={items.length} singular="annonce" plural="annonces">
        <Link href="/admin/annonces/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouvelle annonce
        </Link>
      </AdminListHeader>
      <p style={{ marginTop: -8, marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
        Annonces mises en avant sur le site pendant une période (recrutement, appel à contributions, lancement…) :
        bandeau sur toutes les pages, hero et bloc final de l&apos;accueil, badge du header, et textes de
        /nous-rejoindre. Elles apparaissent et disparaissent seules à leurs dates (au plus une minute de décalage).
      </p>

      {missingTable ? (
        <div className="admin-empty">
          <strong>Table des annonces introuvable</strong>
          <p>Exécutez la migration supabase/migrations/20261112_announcements.sql dans Supabase.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucune annonce</strong>
          <p>Créez une première annonce (ex. une campagne de recrutement).</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Annonce</th>
              <th>Statut</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const state = announcementState(item, now);
              const overlaps = state === "ended" ? [] : findOverlaps(item, items);
              return (
                <tr key={item.id}>
                  <td className="col-title">
                    {item.name}
                    {overlaps.length ? (
                      <p className="admin-warning">
                        <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />
                        <span>Chevauche : {overlaps.map((o) => `« ${o.name} »`).join(", ")}</span>
                      </p>
                    ) : null}
                  </td>
                  <td>
                    <span className={`badge-status ${STATE_BADGE[state]}`}>{announcementStatusLabel(item, now)}</span>
                  </td>
                  <td className="col-actions">
                    <div className="row-actions">
                      <Link href={`/admin/annonces/${item.id}/edit`} className="btn-sm">
                        <Pencil size={13} strokeWidth={2} />
                        Modifier
                      </Link>
                      <form action={duplicateAnnouncementAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="btn-sm" title="Copie désactivée, dates vidées">
                          <Copy size={13} strokeWidth={2} />
                          Dupliquer
                        </button>
                      </form>
                      <form action={deleteAnnouncementAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <ConfirmDeleteButton />
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
