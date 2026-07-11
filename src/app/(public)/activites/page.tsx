import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ActivitesPage() {
  try {
    const page = await contentRepository.getPage("activites");
    const activities = await contentRepository.listActivities();
    if (!page) notFound();
    return <PublicPage page={page} heroImageUrl="/assets/photos/hero-activites.png" activities={activities} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page Activités à créer.</p>;
  }
}
