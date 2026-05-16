import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ActivitesPage() {
  const page = await contentRepository.getPage("activites");
  const activities = await contentRepository.listActivities();
  if (!page) return <p>Page Activités à créer.</p>;
  return <PublicPage page={page} heroImageUrl="/assets/photos/hero-activites.png" activities={activities} />;
}
