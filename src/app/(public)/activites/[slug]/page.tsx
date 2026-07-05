import { notFound } from "next/navigation";
import { ActiviteDetail } from "@/components/public/ActiviteDetail";
import { contentRepository } from "@/repositories/contentRepository";

export const revalidate = 60;

export async function generateStaticParams() {
  const items = await contentRepository.listActivities(true);
  return items.map((a) => ({ slug: a.slug }));
}

export default async function ActivitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await contentRepository.listActivities(true);
  const item = items.find((entry) => entry.slug === slug);
  if (!item) notFound();
  return <ActiviteDetail item={item} />;
}
