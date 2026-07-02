import { notFound } from "next/navigation";
import { ThemeDetail } from "@/components/public/ThemeDetail";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await contentRepository.getTheme(slug);
  if (!item) notFound();
  const productions = await contentRepository.getProductionsByTheme(item.id);
  return <ThemeDetail item={item} productions={productions} />;
}
