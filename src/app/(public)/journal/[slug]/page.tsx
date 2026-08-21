import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { journalRepository } from "@/repositories/journalRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { buildDetailMetadata } from "@/lib/seo";
import { JournalEntryDetail } from "@/components/public/JournalEntryDetail";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await journalRepository.getEntry(slug);
    if (!item) return {};
    const imageUrl = await mediaRepository.getResourceUrl(item.thumbnailId);
    return buildDetailMetadata({
      title: item.title,
      description: item.excerpt,
      path: `/journal/${item.slug}`,
      imageUrl,
      ogType: "article",
    });
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  try {
    const items = await journalRepository.listEntries(true);
    return items.map((e) => ({ slug: e.slug }));
  } catch {
    return [];
  }
}

export default async function JournalEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await journalRepository.getEntry(slug);
  if (!item) notFound();

  const [author, imageUrl, project, event] = await Promise.all([
    item.authorId ? authorRepository.getAuthorById(item.authorId) : null,
    mediaRepository.getResourceUrl(item.thumbnailId),
    item.projectId ? projectRepository.getProjectById(item.projectId) : null,
    item.eventId ? eventRepository.getEventById(item.eventId) : null,
  ]);

  return <JournalEntryDetail item={item} author={author} imageUrl={imageUrl} project={project} event={event} />;
}
