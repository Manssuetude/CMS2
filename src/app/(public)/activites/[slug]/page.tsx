import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActiviteDetail } from "@/components/public/ActiviteDetail";
import { contentRepository } from "@/repositories/contentRepository";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const items = await contentRepository.listActivities(true);
    const item = items.find((a) => a.slug === slug);
    if (!item) return {};
    return { title: item.title, description: item.description ?? undefined };
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  try {
    const items = await contentRepository.listActivities(true);
    return items.map((a) => ({ slug: a.slug }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function ActivitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await contentRepository.listActivities(true);
  const item = items.find((entry) => entry.slug === slug);
  if (!item) notFound();
  return <ActiviteDetail item={item} />;
}
