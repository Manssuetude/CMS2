import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { journalRepository } from "@/repositories/journalRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { activityRepository } from "@/repositories/activityRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { JournalEntryForm } from "@/components/admin/JournalEntryForm";
import { updateJournalEntryAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditJournalEntryPage({ params }: Props) {
  const { id } = await params;
  const [item, authors, themes, projects, activities, productions, media] = await Promise.all([
    journalRepository.getEntryById(id),
    authorRepository.listAuthors(),
    themeRepository.listThemes(true),
    projectRepository.listProjects(true),
    activityRepository.listActivities(true),
    productionRepository.listProductions(true),
    mediaRepository.list(),
  ]);
  if (!item) notFound();
  const images = media.filter((m) => m.type === "image");

  return (
    <section className="admin-panel">
      <Link href="/admin/journal" className="admin-back">
        ← Retour au Journal
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier l&apos;entrée</h1>
          <p>{item.title}</p>
        </div>
        <a
          href={`/journal/${item.slug}`}
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
      <JournalEntryForm
        initialData={item}
        action={updateJournalEntryAction}
        authors={authors}
        themes={themes}
        projects={projects}
        activities={activities}
        productions={productions}
        images={images}
      />
    </section>
  );
}
