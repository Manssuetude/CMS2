import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { HomeEditorial } from "@/components/public/HomeEditorial";
import { eventRepository } from "@/repositories/eventRepository";
import { pageRepository } from "@/repositories/pageRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { journalRepository } from "@/repositories/journalRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { pickEventOfTheMoment } from "@/utils/eventOfTheMoment";

export const revalidate = 60;

const HOME_TITLE = "Manssuétude | Think tank jeunesse sur l'Afrique et ses diasporas";
const HOME_DESCRIPTION =
  "Manssuétude, think tank de jeunes engagés sur l'Afrique et ses diasporas : analyses, débats et projets pour penser et transformer durablement le continent.";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await pageRepository.getPage("accueil");
    // Titre complet modifiable depuis /admin/homepage (champ SEO). L'ancien titre
    // générique « Manssuétude - Accueil » est ignoré au profit du titre par défaut.
    const custom = page?.seoTitle?.trim();
    const title = custom && !/accueil$/i.test(custom) ? custom : HOME_TITLE;
    return buildPageMetadata({
      title,
      absoluteTitle: title,
      description: page?.seoDescription?.trim() || HOME_DESCRIPTION,
      path: "/",
      imageUrl: page?.imageUrl,
    });
  } catch {
    return buildPageMetadata({
      title: HOME_TITLE,
      absoluteTitle: HOME_TITLE,
      description: HOME_DESCRIPTION,
      path: "/",
    });
  }
}

export default async function HomePage() {
  try {
    const page = await pageRepository.getPage("accueil");
    const [productions, events, journalEntries] = await Promise.all([
      productionRepository.listProductions(),
      eventRepository.listEvents(),
      journalRepository.listEntries(),
    ]);
    if (!page) notFound();

    // Journal en avant : les entrées marquées "featured", sinon les 3 plus récentes.
    const featuredJournal = journalEntries.filter((e) => e.featured);
    const homeJournalEntries = (featuredJournal.length ? featuredJournal : journalEntries).slice(0, 3);

    // Accueil : uniquement les productions et événements marqués "en vedette"
    // (pas de repli sur les plus récents) — max 3 productions, max 2 événements.
    // Aucune vedette → section masquée.
    const homeProductions = productions.filter((p) => p.featured).slice(0, 3);
    const homeEvents = events.filter((e) => e.featured).slice(0, 2);

    const fallbackEvent = page.featuredEventId ? (events.find((e) => e.id === page.featuredEventId) ?? null) : null;
    const eventOfTheMoment = pickEventOfTheMoment(events, fallbackEvent);

    return (
      <HomeEditorial
        page={page}
        heroImageUrl={page.imageUrl ?? undefined}
        eventOfTheMoment={eventOfTheMoment}
        events={homeEvents}
        productions={homeProductions}
        journalEntries={homeJournalEntries}
      />
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
