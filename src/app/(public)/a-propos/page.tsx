import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function AboutPage() {
  const page = await contentRepository.getPage("a-propos");
  if (!page) return <p>Page À propos à créer.</p>;
  return <PublicPage page={page} heroImageUrl="/assets/photos/hero-a-propos.png" />;
}
