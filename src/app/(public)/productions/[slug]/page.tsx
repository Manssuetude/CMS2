import { notFound } from "next/navigation";
import { DetailPage } from "@/components/public/DetailPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ProductionDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await contentRepository.getProduction(slug);
  if (!item) notFound();
  return <DetailPage item={item} eyebrow="Production" backTarget="/productions" />;
}
