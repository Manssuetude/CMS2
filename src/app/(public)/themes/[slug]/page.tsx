import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThemeDetail } from "@/components/public/ThemeDetail";
import { mediaRepository } from "@/repositories/mediaRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { buildDetailMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await themeRepository.getTheme(slug);
    if (!item) return {};
    const imageUrl = await mediaRepository.getResourceUrl(item.heroImageId ?? item.thumbnailId);
    return buildDetailMetadata({
      title: item.seoTitle || item.title,
      description: item.seoDescription || item.longDescription || item.description,
      path: `/themes/${item.slug}`,
      imageUrl,
      ogType: "website",
    });
  } catch {
    return {};
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
    <ThemeDetail item={item} subThemes={subThemes} allSubThemes={allSubThemes} events={events} projects={projects} />
  );
}
