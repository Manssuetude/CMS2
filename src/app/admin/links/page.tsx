import Link from "next/link";
import { Pencil, Plus, ExternalLink } from "lucide-react";
import { linkRepository } from "@/repositories/linkRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { AdminListHeader } from "@/components/admin/AdminListHeader";
import { resolveLinkIcon } from "@/utils/linkIcons";
import { deleteLinkAction, updateLinkPageDescriptionAction } from "./actions";

const STATUS_BADGE: Record<string, string> = { draft: "badge-draft", published: "badge-published" };
const STATUS_LABEL: Record<string, string> = { draft: "Brouillon", published: "Publié" };

export default async function AdminLinksPage() {
  const items = await linkRepository.listLinks(true);
  const description = await siteSettingsRepository.getLinkPageDescription();

  return (
    <section className="admin-panel">
      <AdminListHeader title="Liens" count={items.length} singular="lien" plural="liens">
        <a href="/link" target="_blank" rel="noreferrer" className="btn-sm">
          <ExternalLink size={13} strokeWidth={2} />
          Voir /link
        </a>
        <Link href="/admin/links/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouveau lien
        </Link>
      </AdminListHeader>
      <p style={{ marginTop: -8, marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
        Page façon « Linktree » (manssuetude.com/link) : liste de liens à partager en bio sur les réseaux sociaux.
      </p>

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucun lien en base</strong>
          <p>Ajoutez un premier lien à partager.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ordre</th>
              <th>Icône</th>
              <th>Libellé</th>
              <th>Statut</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const Icon = resolveLinkIcon(item.icon);
              return (
                <tr key={item.id}>
                  <td style={{ color: "var(--muted)", fontSize: 13 }}>{item.position}</td>
                  <td>
                    <Icon size={16} />
                  </td>
                  <td className="col-title">{item.label}</td>
                  <td>
                    <span className={`badge-status ${STATUS_BADGE[item.status] ?? "badge-draft"}`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="col-actions">
                    <div className="row-actions">
                      <Link href={`/admin/links/${item.id}/edit`} className="btn-sm">
                        <Pencil size={13} strokeWidth={2} />
                        Modifier
                      </Link>
                      <form action={deleteLinkAction}>
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

      <div className="admin-card" style={{ marginTop: 24 }}>
        <div className="form-section">
          <p className="form-section-title">Description de la page /link</p>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: -8, marginBottom: 16 }}>
            Court texte affiché sous le logo, au-dessus de la liste de liens.
          </p>
          <form action={updateLinkPageDescriptionAction}>
            <div className="form-field">
              <label className="field-label" htmlFor="description">
                Description
              </label>
              <textarea id="description" name="description" defaultValue={description} rows={3} />
            </div>
            <button type="submit" className="button" style={{ marginTop: 8 }}>
              Enregistrer
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
