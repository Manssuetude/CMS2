import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { productionRepository } from "@/repositories/productionRepository";
import type { Event, Production } from "@/types/cms";
import { copyTitle, uniqueSlug } from "@/utils/duplicate";
import { slugify } from "@/utils/slug";

// « Dupliquer » (fiches événement et production) : copie en brouillon, titre
// « Copie de … », slug libre, relations recopiées. Un événement copié perd
// ses dates, ses photos et documents de compte-rendu, et sa mise en avant.

export async function duplicateEvent(id: string): Promise<Event | null> {
  const source = await eventRepository.getEventById(id);
  if (!source) return null;
  const [all, themeIds, subThemeIds, projectIds, formatIds, animators] = await Promise.all([
    eventRepository.listEvents(true),
    eventRepository.getEventThemeIds(id),
    eventRepository.getEventSubThemeIds(id),
    eventRepository.getEventProjectIds(id),
    activityFormatRepository.getActivityFormatIds(id),
    authorRepository.getEventAnimators(id),
  ]);
  const title = copyTitle(source.title);
  const copy = await eventRepository.createEvent({
    slug: uniqueSlug(
      slugify(title),
      all.map((e) => e.slug),
    ),
    title,
    format: source.format,
    status: "draft",
    progress_status: null,
    date: null,
    start_time: null,
    end_time: null,
    location: source.location ?? null,
    capacity: source.capacity ?? null,
    eventbrite_url: null,
    registration_status: null,
    description: source.description ?? null,
    body: source.body ?? null,
    speakers: source.speakers,
    poster_id: source.posterId ?? null,
    header_style: source.headerStyle,
    gallery: [],
    documents: [],
    featured: false,
    seo_title: source.seoTitle ?? null,
    seo_description: source.seoDescription ?? null,
  });
  await Promise.all([
    themeIds.length ? eventRepository.setEventThemes(copy.id, themeIds) : null,
    subThemeIds.length ? eventRepository.setEventSubThemes(copy.id, subThemeIds) : null,
    projectIds.length ? eventRepository.setEventProjects(copy.id, projectIds) : null,
    formatIds.length ? activityFormatRepository.setActivityFormats(copy.id, formatIds) : null,
    animators.length ? authorRepository.setEventAnimators(copy.id, animators) : null,
  ]);
  return copy;
}

export async function duplicateProduction(id: string): Promise<Production | null> {
  const source = await productionRepository.getProductionById(id);
  if (!source) return null;
  const [all, subThemeIds, authorIds, resourceIds] = await Promise.all([
    productionRepository.listProductions(true),
    productionRepository.getProductionSubThemeIds(id),
    authorRepository.getProductionAuthorIds(id),
    productionRepository.getProductionResourceIds(id),
  ]);
  const title = copyTitle(source.title);
  const copy = await productionRepository.createProduction({
    slug: uniqueSlug(
      slugify(title),
      all.map((p) => p.slug),
    ),
    title,
    type: source.type,
    status: "draft",
    featured: false,
    description: source.description ?? null,
    body: source.body ?? null,
    body_source_name: source.bodySourceName ?? null,
    body_imported_at: source.bodyImportedAt ?? null,
    content_blocks: source.contentBlocks,
    author: source.author ?? null,
    date: source.date ?? null,
    thumbnail_id: source.thumbnailId ?? null,
    file_id: source.fileId ?? null,
    download_label: source.downloadLabel ?? null,
    video_url: source.videoUrl ?? null,
    reading_time: source.readingTime ?? null,
    pages: source.pages ?? null,
    tags: source.tags,
    seo_title: source.seoTitle ?? null,
    seo_description: source.seoDescription ?? null,
  });
  await Promise.all([
    subThemeIds.length ? productionRepository.setProductionSubThemes(copy.id, subThemeIds) : null,
    authorIds.length ? authorRepository.setProductionAuthors(copy.id, authorIds) : null,
    resourceIds.length ? productionRepository.setProductionResources(copy.id, resourceIds) : null,
  ]);
  return copy;
}
