import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { eventRepository } from "@/repositories/eventRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { EvenementForm } from "@/components/admin/EvenementForm";
import { updateEventAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEvenementPage({ params }: Props) {
  const { id } = await params;
  const [item, themes, subThemes, projects, activityFormats, authors, images] = await Promise.all([
    eventRepository.getEventById(id),
    themeRepository.listThemes(true),
    subThemeRepository.listSubThemes(true),
    projectRepository.listProjects(true),
    activityFormatRepository.listFormats(true),
    authorRepository.listAuthors(),
    mediaRepository.list(),
  ]);
  if (!item) notFound();
  const [initialThemeIds, initialSubThemeIds, initialProjectIds, initialFormatIds, initialAnimators] =
    await Promise.all([
      eventRepository.getEventThemeIds(id),
      eventRepository.getEventSubThemeIds(id),
      eventRepository.getEventProjectIds(id),
      activityFormatRepository.getActivityFormatIds(id),
      authorRepository.getEventAnimators(id),
    ]);

  return (
    <section className="admin-panel">
      <Link href="/admin/evenements" className="admin-back">
        ← Retour aux événements
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier l&apos;événement</h1>
          <p>{item.title}</p>
        </div>
        <a
          href={`/evenements/${item.slug}`}
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
      <EvenementForm
        initialData={item}
        action={updateEventAction}
        themes={themes}
        initialThemeIds={initialThemeIds}
        subThemes={subThemes}
        initialSubThemeIds={initialSubThemeIds}
        projects={projects}
        initialProjectIds={initialProjectIds}
        activityFormats={activityFormats}
        initialFormatIds={initialFormatIds}
        authors={authors}
        initialAnimators={initialAnimators}
        images={images.filter((m) => m.type === "image")}
      />
    </section>
  );
}
