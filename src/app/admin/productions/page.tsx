import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { contentRepository } from "@/repositories/contentRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteProductionAction, toggleProductionStatusAction } from "./actions";

export default async function AdminProductionsPage() {
  const items = await contentRepository.listProductions(true);

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Productions</h1>
          <p>
            {items.length} production{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/productions/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouvelle production
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucune production pour l&apos;instant</strong>
          <p>Créez votre premier article, note ou rapport.</p>
          <Link href="/admin/productions/new" className="button primary" style={{ marginTop: 8 }}>
            Créer une production
          </Link>
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
                  <form action={toggleProductionStatusAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value={item.status} />
                    <button type="submit" className={`btn-toggle ${item.status}`} title="Changer le statut">
                      {item.status === "published" ? "Publié" : item.status === "archived" ? "Archivé" : "Brouillon"}
                    </button>
                  </form>
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
                  {item.featured ? (
                    <span style={{ color: "var(--orange)", fontWeight: 900, fontSize: 16 }}>★</span>
                  ) : (
                    <span style={{ color: "var(--line-strong)" }}>-</span>
                  )}
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
