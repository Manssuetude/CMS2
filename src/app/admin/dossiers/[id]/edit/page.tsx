import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { dossierRepository } from "@/repositories/dossierRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { journalRepository } from "@/repositories/journalRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { DossierForm } from "@/components/admin/DossierForm";
import type { DossierPickableItem } from "@/components/admin/DossierItemPicker";
import { updateDossierAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditDossierPage({ params }: Props) {
  const { id } = await params;
  const [item, items, productions, events, projects, journalEntries, media] = await Promise.all([
    dossierRepository.getDossierById(id),
    dossierRepository.getDossierItems(id),
    productionRepository.listProductions(true),
    eventRepository.listEvents(true),
    projectRepository.listProjects(true),
    journalRepository.listEntries(true),
    mediaRepository.list(),
  ]);
  if (!item) notFound();
  const images = media.filter((m) => m.type === "image");

  const productionById = new Map(productions.map((p) => [p.id, p.title]));
  const eventById = new Map(events.map((e) => [e.id, e.title]));
  const projectById = new Map(projects.map((p) => [p.id, p.title]));
  const resourceById = new Map(media.map((m) => [m.id, m.title]));
  const journalById = new Map(journalEntries.map((e) => [e.id, e.title]));

  const labelFor: Record<string, Map<string, string>> = {
    production: productionById,
    event: eventById,
    project: projectById,
    resource: resourceById,
    journal_entry: journalById,
  };

  const initialItems: DossierPickableItem[] = items.flatMap((dossierItem) => {
    const label = labelFor[dossierItem.entityType]?.get(dossierItem.entityId);
    return label ? [{ entityType: dossierItem.entityType, entityId: dossierItem.entityId, label }] : [];
  });

  return (
    <section className="admin-panel">
      <Link href="/admin/dossiers" className="admin-back">
        ← Retour aux dossiers
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier le dossier</h1>
          <p>{item.title}</p>
        </div>
        <a
          href={`/dossiers/${item.slug}`}
          target="_blank"
          rel="noreferrer"
          className="btn-sm"
          title="Voir la page publique dans un nouvel onglet"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Prévisualiser
          {item.status !== "published" && (
            <span className="badge-status badge-draft" style={{ marginLeft: 4 }}>
              {item.status === "archived" ? "Archivé" : "Brouillon"}
            </span>
          )}
        </a>
      </div>
      <DossierForm
        initialData={item}
        initialItems={initialItems}
        action={updateDossierAction}
        productions={productions}
        events={events}
        projects={projects}
        resources={media}
        journalEntries={journalEntries}
        images={images}
      />
    </section>
  );
}
