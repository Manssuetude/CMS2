import Link from "next/link";
import { Download } from "lucide-react";
import { formSubmissionRepository } from "@/repositories/formSubmissionRepository";
import { updateFormStatusAction, deleteFormSubmissionAction } from "./actions";
import { FormSubmissionRow } from "@/components/admin/FormSubmissionRow";

const TYPE_TABS: Array<{ value: string; label: string }> = [
  { value: "", label: "Tous" },
  { value: "join", label: "Adhésion" },
  { value: "theme", label: "Thème" },
  { value: "event", label: "Événement" },
  { value: "project", label: "Projet" },
  { value: "content", label: "Contenu" },
  { value: "partner", label: "Partenariat" },
  { value: "donation", label: "Don" },
  { value: "contact", label: "Contact" },
];

const TABLE_COLUMNS = 4;

export default async function AdminFormsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const activeType = TYPE_TABS.some((t) => t.value === type && t.value !== "") ? type : "";

  const all = await formSubmissionRepository.listFormSubmissions();
  const forms = activeType ? all.filter((f) => f.formType === activeType) : all;
  const pending = forms.filter((f) => f.status === "reçu").length;

  const exportHref = activeType ? `/api/forms/export?type=${activeType}` : "/api/forms/export";

  return (
    <section className="admin-panel">
      <div
        className="admin-page-header"
        style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}
      >
        <div>
          <h1>Formulaires reçus</h1>
          <p>
            {forms.length} soumission{forms.length !== 1 ? "s" : ""}
            {pending > 0 && <span className="forms-pending-badge">{pending} en attente</span>}
          </p>
        </div>
        <a className="button" href={exportHref} download>
          <Download size={15} strokeWidth={1.75} />
          Exporter CSV
        </a>
      </div>

      {/* Filtres par type */}
      <div className="filter-bar" style={{ justifyContent: "flex-start" }}>
        {TYPE_TABS.map((t) => {
          const count = t.value ? all.filter((f) => f.formType === t.value).length : all.length;
          const href = t.value ? `/admin/forms?type=${t.value}` : "/admin/forms";
          return (
            <Link
              key={t.value || "all"}
              href={href}
              className={`filter-chip${activeType === t.value ? " active" : ""}`}
            >
              {t.label}
              <span style={{ marginLeft: 6, opacity: 0.7 }}>{count}</span>
            </Link>
          );
        })}
      </div>

      {forms.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucun formulaire{activeType ? " de ce type" : " reçu"}</strong>
          <p>
            {activeType ? (
              <Link href="/admin/forms">Voir tous les formulaires</Link>
            ) : (
              "Les soumissions du site apparaîtront ici."
            )}
          </p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Type</th>
              <th>Reçu le</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((f) => (
              <FormSubmissionRow
                key={f.id}
                submission={f}
                action={updateFormStatusAction}
                deleteAction={deleteFormSubmissionAction}
                columns={TABLE_COLUMNS}
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
