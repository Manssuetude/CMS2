import type { Metadata } from "next";
import { Suspense } from "react";
import { FilterBar } from "@/components/public/FilterBar";
import { CardGrid } from "@/components/cards/CardGrid";
import { journalRepository } from "@/repositories/journalRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Journal — Manssuétude",
  description: "Actualités, coulisses et réflexions de l'association Manssuétude.",
};

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; year?: string }>;
}) {
  const { category, year } = await searchParams;
  try {
    const all = await journalRepository.listEntries();

    let filtered = category ? all.filter((e) => e.category === category) : all;
    filtered = year ? filtered.filter((e) => e.date?.slice(0, 4) === year) : filtered;

    const withImages = await Promise.all(
      filtered.map(async (e) => ({ ...e, imageUrl: await mediaRepository.getResourceUrl(e.thumbnailId) })),
    );

    const categoryOptions = [...new Set(all.map((e) => e.category).filter((c): c is string => Boolean(c)))].map(
      (c) => ({
        value: c,
        label: c,
      }),
    );
    const yearOptions = [...new Set(all.map((e) => e.date?.slice(0, 4)).filter((y): y is string => Boolean(y)))]
      .sort((a, b) => Number(b) - Number(a))
      .map((y) => ({ value: y, label: y }));

    return (
      <>
        <section className="hero hero--detail">
          <div className="hero-copy">
            <p className="eyebrow">Journal</p>
            <h1>Actualités, coulisses et réflexions</h1>
            <p>Le fil de ce qui se passe à Manssuétude — entre les productions et les événements.</p>
          </div>
        </section>

        <Suspense>
          <FilterBar param="category" options={categoryOptions} allLabel="Toutes les catégories" />
          {yearOptions.length > 1 && <FilterBar param="year" options={yearOptions} allLabel="Toutes les années" />}
        </Suspense>

        {withImages.length > 0 ? (
          <CardGrid
            title="Toutes les entrées"
            items={withImages.map((e) => ({
              title: e.title,
              description: e.excerpt,
              href: `/journal/${e.slug}`,
              meta: e.category,
              imageUrl: e.imageUrl,
            }))}
          />
        ) : (
          <section className="section">
            <p style={{ color: "var(--ed-muted)" }}>Aucune entrée de Journal publiée pour l&apos;instant.</p>
          </section>
        )}
      </>
    );
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
