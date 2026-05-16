import { notFound } from "next/navigation";
import { DetailPage } from "@/components/public/DetailPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ThemeDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await contentRepository.getTheme(slug);
  if (!item) notFound();
  return <DetailPage item={item} eyebrow="Thème" backTarget="/themes" />;
}
