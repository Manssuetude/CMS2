import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { auditRepository } from "@/repositories/auditRepository";

const ACTION_LABEL: Record<string, string> = {
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  publish: "Publication",
  invite: "Invitation",
  "role change": "Changement de rôle",
  login: "Connexion",
};

function actionClass(action: string) {
  if (action === "create") return "badge-published";
  if (action === "delete") return "badge-archived";
  if (action === "update" || action === "publish") return "badge-encours";
  return "badge-draft";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminJournalPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  await requireAdmin();
  const { action } = await searchParams;
  const [logs, actions] = await Promise.all([
    auditRepository.list({ action: action || undefined }),
    auditRepository.distinctActions(),
  ]);

  return (
    <section className="admin-panel">
      <div
        className="admin-page-header"
        style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}
      >
        <div>
          <h1>Journal d&apos;activité</h1>
          <p>Historique des actions des membres. Réservé aux administrateurs.</p>
        </div>
        <a
          className="button"
          href={`/api/journal/export${action ? `?action=${encodeURIComponent(action)}` : ""}`}
          download
        >
          Exporter CSV
        </a>
      </div>

      <div className="filter-bar" style={{ justifyContent: "flex-start" }}>
        <Link href="/admin/journal" className={`filter-chip${!action ? " active" : ""}`}>
          Tout
        </Link>
        {actions.map((a) => (
          <Link
            key={a}
            href={`/admin/journal?action=${encodeURIComponent(a)}`}
            className={`filter-chip${action === a ? " active" : ""}`}
          >
            {ACTION_LABEL[a] ?? a}
          </Link>
        ))}
      </div>

      {logs.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucune activité{action ? " de ce type" : ""}</strong>
          <p>Les actions des membres apparaîtront ici.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Membre</th>
              <th>Action</th>
              <th>Détail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ whiteSpace: "nowrap", color: "var(--muted)", fontSize: 13 }}>
                  {formatDate(log.createdAt)}
                </td>
                <td className="col-title">
                  {log.actorEmail ?? "—"}
                  {log.actorRole && (
                    <span className="form-type-pill" style={{ marginLeft: 8 }}>
                      {log.actorRole}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`badge-status ${actionClass(log.action)}`}>
                    {ACTION_LABEL[log.action] ?? log.action}
                  </span>
                </td>
                <td style={{ color: "var(--ink-soft)", fontSize: 14 }}>{log.summary ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
