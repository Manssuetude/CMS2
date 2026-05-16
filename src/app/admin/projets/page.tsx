import { AdminTable } from "@/components/admin/AdminTable";
import { contentRepository } from "@/repositories/contentRepository";

export default async function AdminProjects() {
  const items = await contentRepository.listProjects(true);
  return (
    <section className="admin-panel">
      <h1>Projets</h1>
      <AdminTable
        columns={["Titre", "Catégorie", "Statut", "Priorité"]}
        rows={items.map((i) => [i.title, i.category, i.status, i.priority])}
      />
    </section>
  );
}
