import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { mediaRepository } from "@/repositories/mediaRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { buildPageMetadata } from "@/lib/seo";
import { completeDescription } from "@/utils/seoText";
import { JsonLd } from "@/components/public/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/jsonLd";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const items = await mediaRepository.list(true);
    return items.map((r) => ({ slug: r.id }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const items = await mediaRepository.list(true);
    const item = items.find((entry) => entry.id === slug || entry.filename === slug);
    if (!item) return {};
    return buildPageMetadata({
      title: item.title,
      description: completeDescription(item.description || item.caption, [
        [item.author, item.institution].filter(Boolean).join(", ") || null,
        "Ressource documentaire de la médiathèque Manssuétude, think tank jeunesse sur l'Afrique.",
        "À consulter et à télécharger librement pour nourrir vos travaux.",
      ]),
      path: `/ressources/${item.id}`,
      imageUrl: item.type === "image" ? item.url : item.thumbnailUrl,
    });
  } catch {
    return {};
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ResourceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await mediaRepository.list(true);
  const item = items.find((entry) => entry.id === slug || entry.filename === slug);
  if (!item) notFound();

  const theme = item.themeId ? await themeRepository.getThemeById(item.themeId) : null;
  const reference = [item.author, item.institution, item.publishedDate ? formatDate(item.publishedDate) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="section admin-panel">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Ressources", path: "/ressources" },
          { name: item.title, path: `/ressources/${item.id}` },
        ])}
      />
      <p className="eyebrow">Ressource</p>
      <h1>{item.title}</h1>
      {reference && <p style={{ color: "var(--ed-muted)" }}>{reference}</p>}
      {theme && (
        <p>
          Thème : <Link href={`/themes/${theme.slug}`}>{theme.title}</Link>
        </p>
      )}
      <p>{item.description || item.caption}</p>
      <a className="button primary" href={item.url}>
        Télécharger
      </a>
    </section>
  );
}
