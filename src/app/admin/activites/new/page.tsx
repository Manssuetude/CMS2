import Link from "next/link";
import { ActiviteForm } from "@/components/admin/ActiviteForm";
import { themeRepository } from "@/repositories/themeRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { createActivityAction } from "../actions";

export default async function NewActivitePage() {
  const [themes, subThemes, projects, activityFormats, authors, images] = await Promise.all([
    themeRepository.listThemes(true),
    subThemeRepository.listSubThemes(true),
    projectRepository.listProjects(true),
    activityFormatRepository.listFormats(true),
    authorRepository.listAuthors(),
    mediaRepository.list(),
  ]);

  return (
    <section className="admin-panel">
      <Link href="/admin/activites" className="admin-back">
        Retour aux activités
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouvelle activité</h1>
          <p>Créez une nouvelle activité. Elle sera en brouillon jusqu&apos;à publication.</p>
        </div>
      </div>
      <ActiviteForm
        action={createActivityAction}
        themes={themes}
        subThemes={subThemes}
        projects={projects}
        activityFormats={activityFormats}
        authors={authors}
        images={images.filter((m) => m.type === "image")}
      />
    </section>
  );
}
