import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjetDetail } from "@/components/public/ProjetDetail";
import { contentRepository } from "@/repositories/contentRepository";
import { buildDetailMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const items = await contentRepository.listProjects(true);
    const item = items.find((p) => p.slug === slug);
    if (!item) return {};
    return buildDetailMetadata({
      title: item.title,
      description: item.description,
      path: `/projets/${item.slug}`,
      ogType: "website",
    });
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  try {
    const items = await contentRepository.listProjects(true);
    return items.map((p) => ({ slug: p.slug }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function ProjetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await contentRepository.listProjects(true);
  const item = items.find((entry) => entry.slug === slug);
  if (!item) notFound();
  return <ProjetDetail item={item} />;
}
