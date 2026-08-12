import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/public/Hero";
import { FilterBar } from "@/components/public/FilterBar";
import { CardGrid } from "@/components/cards/CardGrid";
import { ProposeSection } from "@/components/public/ProposeSection";
import { contentRepository } from "@/repositories/contentRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

const FORMAT_LABEL: Record<string, string> = {
  "Debat & Conference": "Débat & Conférence",
  "debat & conference": "Débat & Conférence",
  debat: "Débat & Conférence",
  "Atelier & Seance de travail": "Atelier & Séance de travail",
  atelier: "Atelier & Séance de travail",
  "Formation & Masterclass": "Formation & Masterclass",
  formation: "Formation & Masterclass",
  "Visite & Immersion": "Visite & Immersion",
  visite: "Visite & Immersion",
  "Rencontre & Networking": "Rencontre & Networking",
  rencontre: "Rencontre & Networking",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await contentRepository.getPage("activites");
    if (!page) return {};
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function ActivitesPage({ searchParams }: { searchParams: Promise<{ format?: string }> }) {
  try {
    const { format } = await searchParams;
    const page = await contentRepository.getPage("activites");
    const all = await contentRepository.listActivities();
    if (!page) notFound();

    const filtered = format ? all.filter((a) => a.format === format) : all;

    const uniqueFormats = [...new Set(all.map((a) => a.format))];
    const formatOptions = uniqueFormats.map((f) => ({ value: f, label: FORMAT_LABEL[f] ?? f }));

    return (
      <>
        <Hero
          eyebrow={page.eyebrow}
          title={page.title}
          body={page.body}
          imageUrl={page.imageUrl ?? undefined}
          imageCrop={page.imageCrop}
          quote={page.quote}
        />
        <Suspense>
          <FilterBar param="format" options={formatOptions} allLabel="Tous les formats" />
        </Suspense>
        <CardGrid
          title={format ? (FORMAT_LABEL[format] ?? format) : "Toutes les activités"}
          items={filtered.map((item) => ({
            title: item.title,
            description: item.description,
            href: `/activites/${item.slug}`,
            meta: FORMAT_LABEL[item.format] ?? item.format,
          }))}
        />
        <ProposeSection
          lead="Vous avez une idée d'activité à proposer ?"
          label="Proposer une activité"
          target="FORM:activity"
        />
      </>
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    return <MaintenanceNotice />;
  }
}
