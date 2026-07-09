import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function PercaPage() {
  try {
    const page = await contentRepository.getPage("perca");
    if (!page) return <p>Page PERCA à créer.</p>;
    return <PublicPage page={page} heroImageUrl="/assets/photos/hero-perca.png" />;
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page PERCA à créer.</p>;
  }
}
