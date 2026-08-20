import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { activityRepository } from "@/repositories/activityRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { ActiviteForm } from "@/components/admin/ActiviteForm";
import { updateActivityAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditActivitePage({ params }: Props) {
  const { id } = await params;
  const [item, themes, subThemes, projects, activityFormats, authors, images] = await Promise.all([
    activityRepository.getActivityById(id),
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
      activityRepository.getActivityThemeIds(id),
      activityRepository.getActivitySubThemeIds(id),
      activityRepository.getActivityProjectIds(id),
      activityFormatRepository.getActivityFormatIds(id),
      authorRepository.getActivityAnimators(id),
    ]);

  return (
    <section className="admin-panel">
      <Link href="/admin/activites" className="admin-back">
        ← Retour aux activités
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier l&apos;activité</h1>
          <p>{item.title}</p>
        </div>
        <a
          href={`/activites/${item.slug}`}
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
      <ActiviteForm
        initialData={item}
        action={updateActivityAction}
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
