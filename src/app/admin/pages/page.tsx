import { AdminTable } from "@/components/admin/AdminTable";
import { contentRepository } from "@/repositories/contentRepository";

export default async function AdminPages() {
  const pages = await contentRepository.listPages(true);
  return (
    <section className="admin-panel">
      <h1>Pages</h1>
      <AdminTable
        columns={["Titre", "Slug", "Statut", "Mis à jour"]}
        rows={pages.map((p) => [p.title, p.slug, p.status, p.updatedAt])}
      />
    </section>
  );
}
