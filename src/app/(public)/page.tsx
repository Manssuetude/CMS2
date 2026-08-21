import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeEditorial } from "@/components/public/HomeEditorial";
import { eventRepository } from "@/repositories/eventRepository";
import { pageRepository } from "@/repositories/pageRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { journalRepository } from "@/repositories/journalRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { pickEventOfTheMoment } from "@/utils/eventOfTheMoment";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await pageRepository.getPage("accueil");
    return {
      title: { absolute: page?.seoTitle ?? "Manssuétude" },
      description: page?.seoDescription ?? "Un espace de réflexion, de production et d'expérimentation collective.",
      alternates: { canonical: "/" },
    };
  } catch {
    return {};
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
