import { requireAdmin } from "@/lib/auth";
import { userRepository } from "@/repositories/userRepository";
import { roleRepository } from "@/repositories/roleRepository";
import { InviteUserForm } from "@/components/admin/InviteUserForm";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { updateUserRoleAction, removeUserAction } from "./actions";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const [users, roles] = await Promise.all([userRepository.list(), roleRepository.list()]);
  const roleLabel = (key: string | null) => roles.find((r) => r.key === key)?.label ?? key ?? "—";

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Utilisateurs</h1>
          <p>Créez les comptes de l&apos;équipe et attribuez leur rôle. Réservé aux administrateurs.</p>
        </div>
      </div>

      <InviteUserForm roles={roles} />

      <div className="admin-form-section">
        <h2 className="admin-form-section-title">Membres ({users.length})</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>E-mail</th>
              <th>Rôle</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="col-title">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {u.name || <em style={{ color: "var(--muted)" }}>Sans nom</em>}
                    {!u.name && <span className="badge-status badge-review">Invité — en attente</span>}
                  </span>
                </td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{u.email}</td>
                <td>
                  {u.id === admin.userId ? (
                    <span className="form-type-pill">{roleLabel(u.roleKey)}</span>
                  ) : (
                    <form action={updateUserRoleAction} style={{ display: "inline-flex", gap: 6 }}>
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="roleKey"
                        defaultValue={u.roleKey ?? ""}
                        className="form-input"
                        style={{ minHeight: 34, width: "auto", fontSize: 13 }}
                      >
                        {roles.map((r) => (
                          <option key={r.key} value={r.key}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="btn-sm">
                        OK
                      </button>
                    </form>
                  )}
                </td>
                <td className="col-actions">
                  {u.id === admin.userId ? (
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>Vous</span>
                  ) : (
                    <form action={removeUserAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <ConfirmDeleteButton />
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
