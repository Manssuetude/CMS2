import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ProductionsPage() {
  try {
    const page = await contentRepository.getPage("productions");
    const productions = await contentRepository.listProductions();
    if (!page) notFound();
    return <PublicPage page={page} heroImageUrl="/assets/photos/hero-productions.png" productions={productions} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page Productions à créer.</p>;
  }
}
