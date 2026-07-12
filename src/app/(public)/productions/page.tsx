import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/public/Hero";
import { FilterBar } from "@/components/public/FilterBar";
import { CardGrid } from "@/components/cards/CardGrid";
import { contentRepository } from "@/repositories/contentRepository";

export const revalidate = 60;

const TYPE_LABEL: Record<string, string> = {
  Article: "Article",
  article: "Article",
  "Note & Synthese": "Note & Synthèse",
  note: "Note & Synthèse",
  "Etude & Rapport": "Étude & Rapport",
  rapport: "Étude & Rapport",
  Video: "Vidéo",
  video: "Vidéo",
  Podcast: "Podcast",
  podcast: "Podcast",
  Infographie: "Infographie",
  infographie: "Infographie",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await contentRepository.getPage("productions");
    if (!page) return {};
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function ProductionsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  try {
    const { type } = await searchParams;
    const page = await contentRepository.getPage("productions");
    const all = await contentRepository.listProductions();
    if (!page) notFound();

    const filtered = type ? all.filter((p) => p.type === type) : all;

    const uniqueTypes = [...new Set(all.map((p) => p.type))];
    const typeOptions = uniqueTypes.map((t) => ({ value: t, label: TYPE_LABEL[t] ?? t }));

    return (
      <>
        <Hero
          eyebrow={page.eyebrow}
          title={page.title}
          body={page.body}
          imageUrl={page.imageUrl ?? "/assets/photos/hero-productions.png"}
          quote={page.quote}
          primaryLabel={page.primaryCtaLabel}
          primaryTarget={page.primaryCtaTarget}
          secondaryLabel={page.secondaryCtaLabel}
          secondaryTarget={page.secondaryCtaTarget}
        />
        <Suspense>
          <FilterBar param="type" options={typeOptions} allLabel="Tous les types" />
        </Suspense>
        <CardGrid
          title={type ? (TYPE_LABEL[type] ?? type) : "Toutes les productions"}
          items={filtered.map((item) => ({
            title: item.title,
            description: item.description,
            href: `/productions/${item.slug}`,
            meta: TYPE_LABEL[item.type] ?? item.type,
            tags: item.tags,
          }))}
        />
      </>
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    return <p>Page Productions à créer.</p>;
  }
}
