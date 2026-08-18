import { redirectRepository } from "@/repositories/redirectRepository";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { RedirectForm } from "@/components/admin/RedirectForm";
import { createRedirectAction, deleteRedirectAction } from "./actions";

export default async function AdminRedirectsPage() {
  const redirects = await redirectRepository.listRedirects();

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Redirections</h1>
          <p>
            Redirige une ancienne URL vers une nouvelle. Utile après le renommage ou la suppression d&apos;une page —
            évite les liens cassés (301 côté navigateur/moteurs de recherche).
          </p>
        </div>
      </div>

      <div className="admin-form-section" style={{ marginBottom: 24 }}>
        <RedirectForm action={createRedirectAction} />
      </div>

      {redirects.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucune redirection configurée</strong>
          <p>Ajoutez-en une ci-dessus si nécessaire.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Chemin source</th>
              <th>Chemin cible</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {redirects.map((r) => (
              <tr key={r.id}>
                <td className="col-title">
                  <code>{r.fromPath}</code>
                </td>
                <td>
                  <code>{r.toPath}</code>
                </td>
                <td className="col-actions">
                  <form action={deleteRedirectAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmDeleteButton />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
