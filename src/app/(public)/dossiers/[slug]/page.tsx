import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DossierDetail } from "@/components/public/DossierDetail";
import { dossierRepository } from "@/repositories/dossierRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { activityRepository } from "@/repositories/activityRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { journalRepository } from "@/repositories/journalRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { resolveDossierItems } from "@/utils/dossierItems";
import { buildDetailMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await dossierRepository.getDossier(slug);
    if (!item) return {};
    return buildDetailMetadata({
      title: item.title,
      description: item.description?.replace(/<[^>]+>/g, "").slice(0, 200),
      path: `/dossiers/${item.slug}`,
      imageUrl: item.imageUrl,
      ogType: "article",
    });
  } catch {
    return {};
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

  const [dossierItems, productions, activities, projects, journalEntries, media] = await Promise.all([
    dossierRepository.getDossierItems(item.id),
    productionRepository.listProductions(),
    activityRepository.listActivities(),
    projectRepository.listProjects(),
    journalRepository.listEntries(),
    mediaRepository.list(),
  ]);

  const resolvedItems = resolveDossierItems(dossierItems, {
    productions,
    activities,
    projects,
    resources: media,
    journalEntries,
  });

  return <DossierDetail item={item} items={resolvedItems} />;
}
