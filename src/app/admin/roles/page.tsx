import Link from "next/link";
import { Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { roleRepository } from "@/repositories/roleRepository";
import { allPermissionKeys } from "@/constants/permissions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { createRoleAction, deleteRoleAction } from "./actions";

export default async function AdminRolesPage() {
  await requireAdmin();
  const roles = await roleRepository.list();
  const totalPermissions = allPermissionKeys().length;

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Rôles &amp; permissions</h1>
          <p>
            Créez des rôles et définissez, pour chacun, les sections et actions autorisées. Réservé aux administrateurs.
          </p>
        </div>
      </div>

      <div className="admin-form-section" style={{ marginBottom: 24 }}>
        <h2 className="admin-form-section-title">Nouveau rôle</h2>
        <form action={createRoleAction} className="form-row" style={{ alignItems: "end" }}>
          <div className="form-field">
            <label className="form-label">Nom du rôle</label>
            <input name="label" className="form-input" placeholder="ex. Rédaction" required />
          </div>
          <div className="form-field">
            <button type="submit" className="cta">
              Créer
            </button>
          </div>
        </form>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Rôle</th>
            <th>Permissions</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.key}>
              <td className="col-title">
                {role.label}
                {role.isAdmin && (
                  <span className="form-type-pill" style={{ marginLeft: 10 }}>
                    tous les droits
                  </span>
                )}
              </td>
              <td style={{ color: "var(--muted)", fontSize: 13 }}>
                {role.isAdmin ? "Toutes" : `${role.permissions.length} / ${totalPermissions}`}
              </td>
              <td className="col-actions">
                <div className="row-actions">
                  {!role.isAdmin && (
                    <>
                      <Link href={`/admin/roles/${role.key}/edit`} className="btn-sm">
                        <Pencil size={13} strokeWidth={2} />
                        Modifier
                      </Link>
                      <form action={deleteRoleAction}>
                        <input type="hidden" name="roleKey" value={role.key} />
                        <ConfirmDeleteButton />
                      </form>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
