import { AdminTable } from "@/components/admin/AdminTable";
import { resourcesRepository } from "@/repositories/resourcesRepository";

export default async function AdminResources() {
  const resources = await resourcesRepository.list();
  return (
    <section className="admin-panel">
      <p className="eyebrow">Corpus intellectuel</p>
      <h1>Resources</h1>
      <p className="muted">
        Les ressources deviennent des entités du graphe : documents, notes, références, vidéos, bibliographies et
        fichiers réutilisables.
      </p>
      <AdminTable
        columns={["Titre", "Type", "Source", "Visibilité"]}
        rows={resources.map((resource) => [resource.title, resource.type, resource.source, resource.visibility])}
      />
    </section>
  );
}
