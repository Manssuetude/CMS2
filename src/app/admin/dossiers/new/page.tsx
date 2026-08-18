import Link from "next/link";
import { DossierForm } from "@/components/admin/DossierForm";
import { productionRepository } from "@/repositories/productionRepository";
import { activityRepository } from "@/repositories/activityRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { journalRepository } from "@/repositories/journalRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { createDossierAction } from "../actions";

export default async function NewDossierPage() {
  const [productions, activities, projects, journalEntries, media] = await Promise.all([
    productionRepository.listProductions(true),
    activityRepository.listActivities(true),
    projectRepository.listProjects(true),
    journalRepository.listEntries(true),
    mediaRepository.list(),
  ]);
  const images = media.filter((m) => m.type === "image");

  return (
    <section className="admin-panel">
      <Link href="/admin/dossiers" className="admin-back">
        ← Retour aux dossiers
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouveau dossier</h1>
          <p>Regroupez des contenus autour d&apos;un même sujet. Il sera en brouillon jusqu&apos;à publication.</p>
        </div>
      </div>
      <DossierForm
        action={createDossierAction}
        productions={productions}
        activities={activities}
        projects={projects}
        resources={media}
        journalEntries={journalEntries}
        images={images}
      />
    </section>
  );
}
