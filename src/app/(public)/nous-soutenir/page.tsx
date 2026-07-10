import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function SupportPage() {
  try {
    const page = await contentRepository.getPage("nous-soutenir");
    if (!page) notFound();
    return <PublicPage page={page} heroImageUrl="/assets/photos/hero-nous-soutenir.png" />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page Nous soutenir à créer.</p>;
  }
}
