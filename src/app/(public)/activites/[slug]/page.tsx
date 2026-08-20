import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActiviteDetail } from "@/components/public/ActiviteDetail";
import { activityRepository } from "@/repositories/activityRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { buildDetailMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const items = await activityRepository.listActivities(true);
    const item = items.find((a) => a.slug === slug);
    if (!item) return {};
    const imageUrl = await mediaRepository.getResourceUrl(item.gallery[0]);
    return buildDetailMetadata({
      title: item.seoTitle || item.title,
      description: item.seoDescription || item.description,
      path: `/activites/${item.slug}`,
      imageUrl,
      ogType: "article",
    });
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  try {
    const items = await activityRepository.listActivities(true);
    return items.map((a) => ({ slug: a.slug }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function ActivitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await activityRepository.listActivities(true);
  const item = items.find((entry) => entry.slug === slug);
  if (!item) notFound();
  const [formatIds, allFormats, animatorLinks, authors, galleryUrls] = await Promise.all([
    activityFormatRepository.getActivityFormatIds(item.id),
    activityFormatRepository.listFormats(),
    authorRepository.getActivityAnimators(item.id),
    authorRepository.listAuthors(),
    Promise.all(item.gallery.map((id) => mediaRepository.getResourceUrl(id))),
  ]);
  const formats = allFormats.filter((f) => formatIds.includes(f.id));
  const authorsById = new Map(authors.map((a) => [a.id, a]));
  const animators = animatorLinks.flatMap((link) => {
    const author = authorsById.get(link.authorId);
    return author ? [{ author, contribution: link.contribution }] : [];
  });
  const gallery = galleryUrls.filter((url): url is string => Boolean(url));
  return (
    <ActiviteDetail item={item} formats={formats} allFormats={allFormats} animators={animators} gallery={gallery} />
  );
}
