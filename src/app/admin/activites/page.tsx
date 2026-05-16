import { AdminTable } from "@/components/admin/AdminTable";
import { contentRepository } from "@/repositories/contentRepository";

export default async function AdminActivities() {
  const items = await contentRepository.listActivities(true);
  return (
    <section className="admin-panel">
      <h1>Activités</h1>
      <AdminTable
        columns={["Titre", "Format", "Statut", "Avancement"]}
        rows={items.map((i) => [i.title, i.format, i.status, i.progressStatus])}
      />
    </section>
  );
}
