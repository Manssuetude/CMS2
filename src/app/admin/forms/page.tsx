import { contentRepository } from "@/repositories/contentRepository";
import { updateFormStatusAction } from "./actions";
import { FormStatusSelect } from "@/components/admin/FormStatusSelect";

const FORM_TYPE_LABEL: Record<string, string> = {
  join: "Adhésion",
  project: "Projet",
  content: "Contenu",
  partner: "Partenariat",
  donation: "Don",
};

function statusClass(status: string) {
  if (status === "reçu") return "badge-recu";
  if (status === "en cours") return "badge-encours";
  if (status === "traité") return "badge-traite";
  if (status === "archivé") return "badge-archive";
  return "badge-recu";
}

export default async function AdminFormsPage() {
  const forms = await contentRepository.listFormSubmissions();

  const pending = forms.filter((f) => f.status === "reçu").length;

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Formulaires reçus</h1>
          <p>
            {forms.length} soumission{forms.length !== 1 ? "s" : ""}
            {pending > 0 && (
              <span
                style={{
                  marginLeft: 10,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--orange-soft)",
                  color: "var(--orange)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {pending} en attente
              </span>
            )}
          </p>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucun formulaire reçu</strong>
          <p>Les soumissions du site apparaîtront ici.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Type</th>
              <th>Données</th>
              <th>Reçu le</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((f) => {
              const d = f.data as Record<string, unknown>;
              return (
                <tr key={f.id}>
                  <td className="col-title" style={{ minWidth: 160 }}>
                    <div>{String(d.name ?? d.nom ?? "-")}</div>
                    {d.email != null && (
                      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 400 }}>{String(d.email)}</div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: "var(--radius-pill)",
                        background: "var(--soft)",
                        border: "1px solid var(--line)",
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {FORM_TYPE_LABEL[f.formType] ?? f.formType}
                    </span>
                  </td>
                  <td style={{ maxWidth: 300 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        lineHeight: 1.5,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {Object.entries(d)
                        .filter(([k]) => !["name", "nom", "email"].includes(k))
                        .slice(0, 3)
                        .map(([k, v]) => `${k}: ${String(v)}`)
                        .join(" · ")}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {new Date(f.receivedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ minWidth: 160, display: "flex", gap: 8, alignItems: "center" }}>
                    <span className={`badge-status ${statusClass(f.status)}`}>{f.status}</span>
                    <FormStatusSelect id={f.id} currentStatus={f.status} action={updateFormStatusAction} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
