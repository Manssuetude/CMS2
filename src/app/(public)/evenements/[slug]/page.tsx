import type { Metadata } from "next";
import { completeDescription, formatDateFr } from "@/utils/seoText";
import { notFound } from "next/navigation";
import { EvenementDetail } from "@/components/public/EvenementDetail";
import { buildEventPageProps, loadEventMedia, loadEventRelations } from "@/services/eventPageService";
import { eventRepository } from "@/repositories/eventRepository";
import { buildPageMetadata, sectionRobots } from "@/lib/seo";
import { JsonLd } from "@/components/public/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/jsonLd";

export const revalidate = 60;

function eventFacts(date: string | null | undefined, location: string | null | undefined) {
  const when = formatDateFr(date);
  if (!when) return location ? `Événement à ${location}.` : null;
  return `Événement du ${when}${location ? ` à ${location}` : ""}.`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const robots = await sectionRobots("/evenements");
  try {
    const items = await eventRepository.listEvents(true);
    const item = items.find((e) => e.slug === slug);
    if (!item) return { robots };
    // Affiche, sinon première photo réellement existante de la galerie (un id
    // peut pointer vers une ressource supprimée), sinon logo (buildPageMetadata).
    const { poster, gallery } = await loadEventMedia(item.posterId, item.gallery);
    const imageUrl = poster?.url ?? gallery[0]?.url ?? null;
    return buildPageMetadata({
      title: item.seoTitle || item.title,
      description:
        item.seoDescription ||
        completeDescription(item.description, [
          eventFacts(item.date, item.location),
          "Un événement Manssuétude sur l'Afrique et ses diasporas.",
        ]),
      path: `/evenements/${item.slug}`,
      imageUrl,
      robots,
    });
  } catch {
    return { robots };
  }
}

export async function generateStaticParams() {
  try {
    const items = await eventRepository.listEvents(true);
    return items.map((e) => ({ slug: e.slug }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function EvenementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await eventRepository.listEvents(true);
  const item = items.find((entry) => entry.slug === slug);
  if (!item) notFound();
  const props = await buildEventPageProps(item, await loadEventRelations(item.id));
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Événements", path: "/evenements" },
          { name: item.title, path: `/evenements/${item.slug}` },
        ])}
      />
      <EvenementDetail {...props} />
    </>
  );
}
