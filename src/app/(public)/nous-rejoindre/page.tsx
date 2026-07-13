import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function JoinPage() {
  try {
    const page = await contentRepository.getPage("nous-rejoindre");
    if (!page) notFound();
    // Masque le CTA secondaire "Participer à une activité" sur cette page.
    const pageWithoutSecondaryCta = { ...page, secondaryCtaLabel: null, secondaryCtaTarget: null };
    return <PublicPage page={pageWithoutSecondaryCta} heroImageUrl="/assets/photos/hero-nous-rejoindre.png" />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page Rejoindre à créer.</p>;
  }
}
