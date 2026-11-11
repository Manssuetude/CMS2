import type { Metadata } from "next";
import { completeDescription } from "@/utils/seoText";
import { notFound } from "next/navigation";
import { DossierDetail } from "@/components/public/DossierDetail";
import { dossierRepository } from "@/repositories/dossierRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { journalRepository } from "@/repositories/journalRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { resolveDossierItems } from "@/utils/dossierItems";
import { buildPageMetadata, sectionRobots } from "@/lib/seo";
import { JsonLd } from "@/components/public/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/jsonLd";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const robots = await sectionRobots("/dossiers");
  try {
    const item = await dossierRepository.getDossier(slug);
    if (!item) return { robots };
    return buildPageMetadata({
      title: item.title,
      description: completeDescription(item.description, [
        "Un dossier Manssuétude : productions, événements et ressources réunis autour d'un même sujet.",
      ]),
      path: `/dossiers/${item.slug}`,
      imageUrl: item.imageUrl,
      robots,
    });
  } catch {
    return { robots };
  }
}

export async function generateStaticParams() {
  try {
    const items = await dossierRepository.listDossiers();
    return items.map((d) => ({ slug: d.slug }));
  } catch {
    return [];
  }
}

export default async function DossierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await dossierRepository.getDossier(slug);
  if (!item) notFound();

  const [dossierItems, productions, events, projects, journalEntries, media] = await Promise.all([
    dossierRepository.getDossierItems(item.id),
    productionRepository.listProductions(),
    eventRepository.listEvents(),
    projectRepository.listProjects(),
    journalRepository.listEntries(),
    mediaRepository.list(true),
  ]);

  const resolvedItems = resolveDossierItems(dossierItems, {
    productions,
    events,
    projects,
    resources: media,
    journalEntries,
  });

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Dossiers", path: "/dossiers" },
          { name: item.title, path: `/dossiers/${item.slug}` },
        ])}
      />
      <DossierDetail item={item} items={resolvedItems} />
    </>
  );
}
