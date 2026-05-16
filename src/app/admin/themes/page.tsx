import { AdminTable } from "@/components/admin/AdminTable";
import { contentRepository } from "@/repositories/contentRepository";

export default async function AdminThemes() {
  const items = await contentRepository.listThemes(true);
  return (
    <section className="admin-panel">
      <h1>Thèmes</h1>
      <AdminTable
        columns={["Titre", "Statut", "Tags", "Mis à jour"]}
        rows={items.map((i) => [i.title, i.status, i.tags.join(", "), i.updatedAt])}
      />
    </section>
  );
}
