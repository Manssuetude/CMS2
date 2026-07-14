import { requireAdmin } from "@/lib/auth";
import { roleRepository } from "@/repositories/roleRepository";
import { permissionCatalog, ACTION_LABELS, permKey } from "@/constants/permissions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { createRoleAction, updateRolePermissionsAction, deleteRoleAction } from "./actions";

export default async function AdminRolesPage() {
  await requireAdmin();
  const roles = await roleRepository.list();

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

      {/* Créer un rôle */}
      <div className="admin-form-section">
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

      {/* Matrice par rôle */}
      {roles.map((role) => (
        <div className="admin-form-section" key={role.key}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h2 className="admin-form-section-title" style={{ margin: 0 }}>
              {role.label}
              {role.isAdmin && (
                <span className="form-type-pill" style={{ marginLeft: 10 }}>
                  tous les droits
                </span>
              )}
            </h2>
            {!role.isAdmin && (
              <form action={deleteRoleAction}>
                <input type="hidden" name="roleKey" value={role.key} />
                <ConfirmDeleteButton />
              </form>
            )}
          </div>

          {role.isAdmin ? (
            <p className="admin-form-section-hint">Le rôle administrateur possède tous les droits (non modifiable).</p>
          ) : (
            <form action={updateRolePermissionsAction}>
              <input type="hidden" name="roleKey" value={role.key} />
              <div className="perm-matrix">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Section</th>
                      {(["view", "create", "edit", "delete", "publish"] as const).map((a) => (
                        <th key={a} style={{ textAlign: "center" }}>
                          {ACTION_LABELS[a]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionCatalog.map((section) => (
                      <tr key={section.key}>
                        <td className="col-title">{section.label}</td>
                        {(["view", "create", "edit", "delete", "publish"] as const).map((a) => {
                          const available = section.actions.includes(a);
                          const key = permKey(section.key, a);
                          return (
                            <td key={a} style={{ textAlign: "center" }}>
                              {available ? (
                                <input
                                  type="checkbox"
                                  name="perm"
                                  value={key}
                                  defaultChecked={role.permissions.includes(key)}
                                />
                              ) : (
                                <span style={{ color: "var(--line-strong)" }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button type="submit" className="cta">
                  Enregistrer « {role.label} »
                </button>
              </div>
            </form>
          )}
        </div>
      ))}
    </section>
  );
}
