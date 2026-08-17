import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { authorRepository } from "@/repositories/authorRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { AdminListHeader } from "@/components/admin/AdminListHeader";
import { deleteAuthorAction } from "./actions";

export default async function AdminAuthorsPage() {
  const authors = await authorRepository.listAuthors();

  return (
    <section className="admin-panel">
      <AdminListHeader title="Auteurs" count={authors.length} singular="auteur" plural="auteurs">
        <Link href="/admin/auteurs/new" className="button primary">
          <Plus size={15} strokeWidth={2} />
          Nouvel auteur
        </Link>
      </AdminListHeader>

      {authors.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucun auteur en base</strong>
          <p>
            Créez une fiche auteur réutilisable pour la relier à plusieurs productions, au lieu de ressaisir un nom en
            texte libre.
          </p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Bio</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id}>
                <td className="col-title">{author.name}</td>
                <td style={{ color: "var(--muted)", fontSize: 13, maxWidth: 420 }}>
                  {author.bio ? (
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {author.bio}
                    </span>
                  ) : (
                    <em>Aucune bio</em>
                  )}
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link href={`/admin/auteurs/${author.id}/edit`} className="btn-sm">
                      <Pencil size={13} strokeWidth={2} />
                      Modifier
                    </Link>
                    <form action={deleteAuthorAction}>
                      <input type="hidden" name="id" value={author.id} />
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
