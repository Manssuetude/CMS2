import type { Metadata } from "next";
import { completeDescription } from "@/utils/seoText";
import { notFound } from "next/navigation";
import { ProjetDetail } from "@/components/public/ProjetDetail";
import { projectRepository } from "@/repositories/projectRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { journalRepository } from "@/repositories/journalRepository";
import { buildPageMetadata, sectionRobots } from "@/lib/seo";
import { JsonLd } from "@/components/public/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/jsonLd";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const robots = await sectionRobots("/projets");
  try {
    const items = await projectRepository.listProjects(true);
    const item = items.find((p) => p.slug === slug);
    if (!item) return { robots };
    return buildPageMetadata({
      title: item.seoTitle || item.title,
      description:
        item.seoDescription ||
        completeDescription(item.description, [
          "Un projet de Manssuétude, think tank jeunesse sur l'Afrique et ses diasporas.",
        ]),
      path: `/projets/${item.slug}`,
      robots,
    });
  } catch {
    return { robots };
  }
}

export async function generateStaticParams() {
  try {
    const items = await projectRepository.listProjects(true);
    return items.map((p) => ({ slug: p.slug }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function ProjetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await projectRepository.listProjects(true);
  const item = items.find((entry) => entry.slug === slug);
  if (!item) notFound();
  const [productions, events, journalEntries] = await Promise.all([
    productionRepository.getProductionsByProject(item.id),
    eventRepository.getEventsByProject(item.id),
    journalRepository.listEntriesByProject(item.id),
  ]);
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Projets", path: "/projets" },
          { name: item.title, path: `/projets/${item.slug}` },
        ])}
      />
      <ProjetDetail item={item} productions={productions} events={events} journalEntries={journalEntries} />
    </>
  );
}
