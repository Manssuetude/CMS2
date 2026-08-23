import type { Metadata } from "next";
import { CardGrid } from "@/components/cards/CardGrid";
import { productionRepository } from "@/repositories/productionRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

const TYPE_LABEL: Record<string, string> = {
  Article: "Article",
  "Note & Synthese": "Note & Synthèse",
  "Etude & Rapport": "Étude & Rapport",
  Video: "Vidéo",
  Podcast: "Podcast",
  Infographie: "Infographie",
};

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const label = decodeURIComponent(tag);
  return { title: `« ${label} » — Manssuétude`, description: `Contenus tagués « ${label} » sur Manssuétude.` };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const label = decodeURIComponent(tag).toLowerCase();

  try {
    const [productions, themes, subThemes] = await Promise.all([
      productionRepository.listProductions(),
      themeRepository.listThemes(),
      subThemeRepository.listSubThemes(),
    ]);

    const matchingProductions = productions.filter((p) => p.tags.some((t) => t.toLowerCase() === label));
    const matchingThemes = themes.filter((t) => t.tags.some((tg) => tg.toLowerCase() === label));
    const matchingSubThemes = subThemes.filter((st) => st.tags.some((tg) => tg.toLowerCase() === label));
    const themeById = new Map(themes.map((t) => [t.id, t]));

    const total = matchingProductions.length + matchingThemes.length + matchingSubThemes.length;

    return (
      <>
        <section className="hero hero--detail">
          <div className="hero-copy">
            <p className="eyebrow">Tag</p>
            <h1>« {decodeURIComponent(tag)} »</h1>
            <p>
              {total} contenu{total !== 1 ? "s" : ""} tagué{total !== 1 ? "s" : ""} « {decodeURIComponent(tag)} ».
            </p>
          </div>
        </section>

        {matchingThemes.length > 0 && (
          <CardGrid
            title="Thèmes"
            items={matchingThemes.map((t) => ({
              title: t.title,
              description: t.description,
              href: `/themes/${t.slug}`,
              tags: t.tags,
            }))}
          />
        )}

        {matchingSubThemes.length > 0 && (
          <CardGrid
            title="Sous-thèmes"
            items={matchingSubThemes.flatMap((st) => {
              const parent = themeById.get(st.themeId);
              return parent
                ? [
                    {
                      title: st.title,
                      description: st.description,
                      href: `/themes/${parent.slug}/${st.slug}`,
                      tags: st.tags,
                    },
                  ]
                : [];
            })}
          />
        )}

        {matchingProductions.length > 0 && (
          <CardGrid
            title="Productions"
            items={matchingProductions.map((p) => ({
              title: p.title,
              description: p.description,
              href: `/productions/${p.slug}`,
              meta: TYPE_LABEL[p.type] ?? p.type,
              tags: p.tags,
            }))}
          />
        )}

        {total === 0 && (
          <section className="section">
            <p style={{ color: "var(--ed-muted)" }}>
              Aucun contenu tagué « {decodeURIComponent(tag)} » pour l&apos;instant.
            </p>
          </section>
        )}
      </>
    );
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
