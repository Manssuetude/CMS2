import { AdminTable } from "@/components/admin/AdminTable";
import { formRepository } from "@/repositories/formRepository";

export default async function AdminForms() {
  const forms = await formRepository.list();
  return (
    <section className="admin-panel">
      <h1>Formulaires reçus</h1>
      <a className="button primary" href="/api/forms/export">
        Exporter CSV
      </a>
      <AdminTable
        columns={["Type", "Statut", "Date", "Données"]}
        rows={forms.map((f) => [f.formType, f.status, f.receivedAt, JSON.stringify(f.data)])}
      />
    </section>
  );
}
