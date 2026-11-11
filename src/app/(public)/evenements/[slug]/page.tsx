import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EvenementDetail } from "@/components/public/EvenementDetail";
import { eventRepository } from "@/repositories/eventRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { buildDetailMetadata, sectionRobots } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const robots = await sectionRobots("/evenements");
  try {
    const items = await eventRepository.listEvents(true);
    const item = items.find((e) => e.slug === slug);
    if (!item) return { robots };
    // Première photo réellement existante (un id de galerie peut pointer vers
    // une ressource supprimée — l'image de partage restait alors vide).
    const [firstPhoto] = await mediaRepository.getGalleryPhotos(item.gallery);
    const imageUrl = firstPhoto?.url ?? null;
    return buildDetailMetadata({
      title: item.seoTitle || item.title,
      description: item.seoDescription || item.description,
      path: `/evenements/${item.slug}`,
      imageUrl,
      ogType: "article",
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
  const [formatIds, allFormats, animatorLinks, authors, gallery, themeIds, subThemeIds, allThemes, allSubThemes] =
    await Promise.all([
      activityFormatRepository.getActivityFormatIds(item.id),
      activityFormatRepository.listFormats(),
      authorRepository.getEventAnimators(item.id),
      authorRepository.listAuthors(),
      mediaRepository.getGalleryPhotos(item.gallery),
      eventRepository.getEventThemeIds(item.id),
      eventRepository.getEventSubThemeIds(item.id),
      themeRepository.listThemes(),
      subThemeRepository.listSubThemes(),
    ]);
  const formats = allFormats.filter((f) => formatIds.includes(f.id));
  const authorsById = new Map(authors.map((a) => [a.id, a]));
  const animators = animatorLinks.flatMap((link) => {
    const author = authorsById.get(link.authorId);
    return author ? [{ author, contribution: link.contribution }] : [];
  });
  const themes = allThemes.filter((t) => themeIds.includes(t.id));
  const subThemes = allSubThemes.filter((st) => subThemeIds.includes(st.id));
  return (
    <EvenementDetail
      item={item}
      formats={formats}
      allFormats={allFormats}
      animators={animators}
      gallery={gallery}
      themes={themes}
      subThemes={subThemes}
      allThemes={allThemes}
    />
  );
}
