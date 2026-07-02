import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { contentRepository } from "@/repositories/contentRepository";

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    draft: "badge-draft",
    published: "badge-published",
    archived: "badge-archived",
  };
  const label: Record<string, string> = {
    draft: "Brouillon",
    published: "Publié",
    archived: "Archivé",
  };
  return <span className={`badge-status ${cls[status] ?? "badge-draft"}`}>{label[status] ?? status}</span>;
}

export default async function AdminThemesPage() {
  const items = await contentRepository.listThemes(true);

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Thèmes</h1>
          <p>
            {items.length} thème{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/themes/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouveau thème
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucun thème en base</strong>
          <p>Créez votre premier thème ou initialisez-les via le schéma SQL.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thème</th>
              <th>Statut</th>
              <th>Description</th>
              <th>En avant</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-title">{item.title}</td>
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
                <td style={{ textAlign: "center" }}>
                  {item.featured ? (
                    <span style={{ color: "var(--orange)", fontWeight: 700, fontSize: 16 }}>★</span>
                  ) : (
                    <span style={{ color: "var(--line-strong)" }}>-</span>
                  )}
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/themes/${item.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
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
