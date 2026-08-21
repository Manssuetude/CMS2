import Link from "next/link";
import { EvenementForm } from "@/components/admin/EvenementForm";
import { themeRepository } from "@/repositories/themeRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { createEventAction } from "../actions";

export default async function NewEvenementPage() {
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
      <Link href="/admin/evenements" className="admin-back">
        Retour aux événements
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouvel événement</h1>
          <p>Créez un nouvel événement. Il sera en brouillon jusqu&apos;à publication.</p>
        </div>
      </div>
      <EvenementForm
        action={createEventAction}
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
