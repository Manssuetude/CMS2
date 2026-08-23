import Link from "next/link";
import { JournalEntryForm } from "@/components/admin/JournalEntryForm";
import { authorRepository } from "@/repositories/authorRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { createJournalEntryAction } from "../actions";

export default async function NewJournalEntryPage() {
  const [authors, themes, projects, events, productions, media] = await Promise.all([
    authorRepository.listAuthors(),
    themeRepository.listThemes(true),
    projectRepository.listProjects(true),
    eventRepository.listEvents(true),
    productionRepository.listProductions(true),
    mediaRepository.list(),
  ]);
  const images = media.filter((m) => m.type === "image");

  return (
    <section className="admin-panel">
      <Link href="/admin/journal" className="admin-back">
        ← Retour au Journal
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouvelle entrée</h1>
          <p>Créez une entrée de Journal. Elle sera en brouillon jusqu&apos;à publication.</p>
        </div>
      </div>
      <JournalEntryForm
        action={createJournalEntryAction}
        authors={authors}
        themes={themes}
        projects={projects}
        events={events}
        productions={productions}
        images={images}
      />
    </section>
  );
}
