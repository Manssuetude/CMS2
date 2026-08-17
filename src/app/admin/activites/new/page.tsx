import Link from "next/link";
import { ActiviteForm } from "@/components/admin/ActiviteForm";
import { themeRepository } from "@/repositories/themeRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { createActivityAction } from "../actions";

export default async function NewActivitePage() {
  const [themes, projects] = await Promise.all([
    themeRepository.listThemes(true),
    projectRepository.listProjects(true),
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
      <ActiviteForm action={createActivityAction} themes={themes} projects={projects} />
    </section>
  );
}
