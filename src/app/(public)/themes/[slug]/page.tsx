import type { Metadata } from "next";
import { completeDescription } from "@/utils/seoText";
import { notFound } from "next/navigation";
import { ThemeDetail } from "@/components/public/ThemeDetail";
import { mediaRepository } from "@/repositories/mediaRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { buildPageMetadata, sectionRobots } from "@/lib/seo";
import { JsonLd } from "@/components/public/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/jsonLd";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const robots = await sectionRobots("/themes");
  try {
    const item = await themeRepository.getTheme(slug);
    if (!item) return { robots };
    const imageUrl = await mediaRepository.getResourceUrl(item.heroImageId ?? item.thumbnailId);
    return buildPageMetadata({
      title: item.seoTitle || item.title,
      description:
        item.seoDescription ||
        completeDescription(item.description || item.longDescription, [
          "Un thème de réflexion de Manssuétude : analyses, débats et projets d'une jeunesse engagée sur l'Afrique.",
          "Think tank jeunesse sur l'Afrique et ses diasporas.",
        ]),
      path: `/themes/${item.slug}`,
      imageUrl,
      robots,
    });
  } catch {
    return { robots };
  }
}

export async function generateStaticParams() {
  try {
    const items = await themeRepository.listThemes(true);
    return items.map((t) => ({ slug: t.slug }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await themeRepository.getTheme(slug);
  if (!item) notFound();
  const [subThemes, allSubThemes, events, projects] = await Promise.all([
    subThemeRepository.listSubThemesByTheme(item.id),
    subThemeRepository.listSubThemes(),
    eventRepository.getEventsByTheme(item.id),
    projectRepository.getProjectsByTheme(item.id),
  ]);
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Thèmes", path: "/themes" },
          { name: item.title, path: `/themes/${item.slug}` },
        ])}
      />
      <ThemeDetail item={item} subThemes={subThemes} allSubThemes={allSubThemes} events={events} projects={projects} />
    </>
  );
}
