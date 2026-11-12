import type { Announcement } from "@/types/cms";
import { eventRepository } from "@/repositories/eventRepository";
import { journalRepository } from "@/repositories/journalRepository";
import { pageRepository } from "@/repositories/pageRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { pickEventOfTheMoment } from "@/utils/eventOfTheMoment";

// Données de l'accueil (HomeEditorial), partagées entre la page publique et
// l'aperçu d'une annonce (/?apercu-annonce=<id>). Lecture seule.
export async function loadHomePage(announcement: Announcement | null) {
  const page = await pageRepository.getPage("accueil");
  if (!page) return null;
  const [productions, events, journalEntries, keyFigures] = await Promise.all([
    productionRepository.listProductions(),
    eventRepository.listEvents(),
    journalRepository.listEntries(),
    // Chiffres clés : bande sous le hero et carte posée sur la photo de l'annonce.
    announcement ? siteSettingsRepository.getKeyFigures() : Promise.resolve(null),
  ]);

  // Journal en avant : les entrées marquées "featured", sinon les 3 plus récentes.
  const featuredJournal = journalEntries.filter((e) => e.featured);
  const homeJournalEntries = (featuredJournal.length ? featuredJournal : journalEntries).slice(0, 3);

  // Accueil : uniquement les productions et événements marqués "en vedette"
  // (pas de repli sur les plus récents) — max 3 productions, max 2 événements.
  // Aucune vedette → section masquée.
  const homeProductions = productions.filter((p) => p.featured).slice(0, 3);
  const homeEvents = events.filter((e) => e.featured).slice(0, 2);

  const fallbackEvent = page.featuredEventId ? (events.find((e) => e.id === page.featuredEventId) ?? null) : null;

  return {
    page,
    heroImageUrl: page.imageUrl ?? undefined,
    eventOfTheMoment: pickEventOfTheMoment(events, fallbackEvent),
    events: homeEvents,
    productions: homeProductions,
    journalEntries: homeJournalEntries,
    announcement,
    keyFigures,
  };
}
