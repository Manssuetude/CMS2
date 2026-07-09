import { notFound } from "next/navigation";
import { mediaRepository } from "@/repositories/mediaRepository";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const items = await mediaRepository.list();
    return items.map((r) => ({ slug: r.id }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function ResourceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await mediaRepository.list();
  const item = items.find((entry) => entry.id === slug || entry.filename === slug);
  if (!item) notFound();
  return (
    <section className="section admin-panel">
      <p className="eyebrow">Ressource</p>
      <h1>{item.title}</h1>
      <p>{item.description || item.caption}</p>
      <a className="button primary" href={item.url}>
        Télécharger
      </a>
    </section>
  );
}
