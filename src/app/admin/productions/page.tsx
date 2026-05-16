import { AdminTable } from "@/components/admin/AdminTable";
import { contentRepository } from "@/repositories/contentRepository";

export default async function AdminProductions() {
  const items = await contentRepository.listProductions(true);
  return (
    <section className="admin-panel">
      <h1>Productions</h1>
      <AdminTable
        columns={["Titre", "Type", "Statut", "Date"]}
        rows={items.map((i) => [i.title, i.type, i.status, i.date])}
      />
    </section>
  );
}
