import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ActivitesPage() {
  try {
    const page = await contentRepository.getPage("activites");
    const activities = await contentRepository.listActivities();
    if (!page) return <p>Page Activités à créer.</p>;
    return <PublicPage page={page} heroImageUrl="/assets/photos/hero-activites.png" activities={activities} />;
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page Activités à créer.</p>;
  }
}
