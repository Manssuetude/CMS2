import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ProductionsPage() {
  const page = await contentRepository.getPage("productions");
  const productions = await contentRepository.listProductions();
  if (!page) return <p>Page Productions à créer.</p>;
  return <PublicPage page={page} heroImageUrl="/assets/photos/hero-productions.png" productions={productions} />;
}
