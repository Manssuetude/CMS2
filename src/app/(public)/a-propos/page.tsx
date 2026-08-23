import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutEditorial } from "@/components/public/AboutEditorial";
import { pageRepository } from "@/repositories/pageRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await pageRepository.getPage("a-propos");
    if (!page) return {};
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function AboutPage() {
  try {
    const [page, percaPage] = await Promise.all([pageRepository.getPage("a-propos"), pageRepository.getPage("perca")]);
    if (!page) notFound();
    // "Voir notre impact" n'a pas de contenu réel derrière (pointait vers une
    // page de maintenance vide, repérable en un clic) — bouton retiré plutôt
    // que de promettre un contenu qui n'existe pas.
    const aboutPage =
      (page.secondaryCtaLabel ?? "").trim().toLowerCase() === "voir notre impact"
        ? { ...page, secondaryCtaLabel: null, secondaryCtaTarget: null }
        : page;
    return <AboutEditorial page={aboutPage} percaPage={percaPage} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
