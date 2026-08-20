import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeEditorial } from "@/components/public/HomeEditorial";
import { activityRepository } from "@/repositories/activityRepository";
import { pageRepository } from "@/repositories/pageRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { journalRepository } from "@/repositories/journalRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { pickActivityOfTheMoment } from "@/utils/activityOfTheMoment";

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
    const [productions, activities, journalEntries] = await Promise.all([
      productionRepository.listProductions(),
      activityRepository.listActivities(),
      journalRepository.listEntries(),
    ]);
    if (!page) notFound();

    // Journal en avant : les entrées marquées "featured", sinon les 3 plus récentes.
    const featuredJournal = journalEntries.filter((e) => e.featured);
    const homeJournalEntries = (featuredJournal.length ? featuredJournal : journalEntries).slice(0, 3);

    // Accueil : uniquement les productions et activités marquées "en vedette"
    // (pas de repli sur les plus récentes) — max 3 productions, max 2 activités.
    // Aucune vedette → section masquée.
    const homeProductions = productions.filter((p) => p.featured).slice(0, 3);
    const homeActivities = activities.filter((a) => a.featured).slice(0, 2);

    const fallbackActivity = page.featuredActivityId
      ? (activities.find((a) => a.id === page.featuredActivityId) ?? null)
      : null;
    const activityOfTheMoment = pickActivityOfTheMoment(activities, fallbackActivity);

    return (
      <HomeEditorial
        page={page}
        heroImageUrl={page.imageUrl ?? undefined}
        activityOfTheMoment={activityOfTheMoment}
        activities={homeActivities}
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
