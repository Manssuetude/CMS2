import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function SupportPage() {
  const page = await contentRepository.getPage("nous-soutenir");
  if (!page) return <p>Page Nous soutenir à créer.</p>;
  return <PublicPage page={page} heroImageUrl="/assets/photos/hero-nous-soutenir.png" />;
}
