import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { projectRepository } from "@/repositories/projectRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { ProjetForm } from "@/components/admin/ProjetForm";
import { updateProjectAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjetPage({ params }: Props) {
  const { id } = await params;
  const [item, themes, productions, events] = await Promise.all([
    projectRepository.getProjectById(id),
    themeRepository.listThemes(true),
    productionRepository.listProductions(true),
    eventRepository.listEvents(true),
  ]);
  if (!item) notFound();
  const [initialThemeIds, initialProductionIds, initialEventIds] = await Promise.all([
    projectRepository.getProjectThemeIds(id),
    projectRepository.getProjectProductionIds(id),
    projectRepository.getProjectEventIds(id),
  ]);

  return (
    <section className="admin-panel">
      <Link href="/admin/projets" className="admin-back">
        ← Retour aux projets
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier le projet</h1>
          <p>{item.title}</p>
        </div>
        <a
          href={`/projets/${item.slug}`}
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
      <ProjetForm
        initialData={item}
        action={updateProjectAction}
        themes={themes}
        initialThemeIds={initialThemeIds}
        productions={productions}
        initialProductionIds={initialProductionIds}
        events={events}
        initialEventIds={initialEventIds}
      />
    </section>
  );
}
