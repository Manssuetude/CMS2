import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function SupportPage() {
  try {
    const page = await contentRepository.getPage("nous-soutenir");
    if (!page) return <p>Page Nous soutenir à créer.</p>;
    return <PublicPage page={page} heroImageUrl="/assets/photos/hero-nous-soutenir.png" />;
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page Nous soutenir à créer.</p>;
  }
}
