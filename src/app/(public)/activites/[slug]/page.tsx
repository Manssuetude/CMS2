import { notFound } from "next/navigation";
import { DetailPage } from "@/components/public/DetailPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ActivityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await contentRepository.listActivities(true);
  const item = items.find((entry) => entry.slug === slug);
  if (!item) notFound();
  return <DetailPage item={item} eyebrow="Activité" backTarget="/activites" />;
}
