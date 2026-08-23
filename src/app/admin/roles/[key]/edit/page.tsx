import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { roleRepository } from "@/repositories/roleRepository";
import { permissionCatalog, ACTION_LABELS, permKey } from "@/constants/permissions";
import { updateRolePermissionsAction } from "../../actions";

const ACTIONS = ["view", "create", "edit", "delete", "publish"] as const;

interface Props {
  params: Promise<{ key: string }>;
}

export default async function EditRolePage({ params }: Props) {
  await requireAdmin();
  const { key } = await params;
  const role = await roleRepository.getByKey(key);
  if (!role || role.isAdmin) notFound();

  return (
    <section className="admin-panel">
      <Link href="/admin/roles" className="admin-back">
        ← Retour aux rôles
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Permissions : {role.label}</h1>
          <p>Cochez les actions autorisées pour ce rôle, section par section.</p>
        </div>
      </div>

      <form action={updateRolePermissionsAction}>
        <input type="hidden" name="roleKey" value={role.key} />
        <div className="perm-matrix">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Section</th>
                {ACTIONS.map((a) => (
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
                  {ACTIONS.map((a) => {
                    const available = section.actions.includes(a);
                    const permissionKey = permKey(section.key, a);
                    return (
                      <td key={a} style={{ textAlign: "center" }}>
                        {available ? (
                          <input
                            type="checkbox"
                            name="perm"
                            value={permissionKey}
                            defaultChecked={role.permissions.includes(permissionKey)}
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
        <div className="form-actions">
          <Link href="/admin/roles" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary">
            Enregistrer « {role.label} »
          </button>
        </div>
      </form>
    </section>
  );
}
