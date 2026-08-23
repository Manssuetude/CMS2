import Link from "next/link";
import { ProjetForm } from "@/components/admin/ProjetForm";
import { themeRepository } from "@/repositories/themeRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { createProjectAction } from "../actions";

export default async function NewProjetPage() {
  const [themes, productions, events] = await Promise.all([
    themeRepository.listThemes(true),
    productionRepository.listProductions(true),
    eventRepository.listEvents(true),
  ]);

  return (
    <section className="admin-panel">
      <Link href="/admin/projets" className="admin-back">
        Retour aux projets
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouveau projet</h1>
          <p>Créez un nouveau projet. Il sera en brouillon jusqu&apos;à publication.</p>
        </div>
      </div>
      <ProjetForm action={createProjectAction} themes={themes} productions={productions} events={events} />
    </section>
  );
}
