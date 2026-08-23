import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/public/Hero";
import { ProposeSection } from "@/components/public/ProposeSection";
import { FilterBar } from "@/components/public/FilterBar";
import { SortToggle } from "@/components/public/SortToggle";
import { CardGrid } from "@/components/cards/CardGrid";
import { pageRepository } from "@/repositories/pageRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

const TYPE_LABEL: Record<string, string> = {
  Article: "Article",
  article: "Article",
  "Note & Synthese": "Note & Synthèse",
  note: "Note & Synthèse",
  "Etude & Rapport": "Étude & Rapport",
  rapport: "Étude & Rapport",
  Video: "Vidéo",
  video: "Vidéo",
  Podcast: "Podcast",
  podcast: "Podcast",
  Infographie: "Infographie",
  infographie: "Infographie",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await pageRepository.getPage("productions");
    if (!page) return {};
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function ProductionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; theme?: string; sort?: string }>;
}) {
  try {
    const { type, theme, sort } = await searchParams;
    const page = await pageRepository.getPage("productions");
    const [productions, themes, subThemes, subThemeLinks] = await Promise.all([
      productionRepository.listProductions(),
      themeRepository.listThemes(),
      subThemeRepository.listSubThemes(),
      productionRepository.getAllProductionSubThemeLinks(),
    ]);
    if (!page) notFound();

    const all = productions.map((p) => ({ ...p, subThemeIds: subThemeLinks[p.id] ?? [] }));

    const subThemeIdsByTheme = new Map<string, Set<string>>();
    for (const st of subThemes) {
      const set = subThemeIdsByTheme.get(st.themeId) ?? new Set<string>();
      set.add(st.id);
      subThemeIdsByTheme.set(st.themeId, set);
    }

    const themeOptions = themes
      .filter((t) => {
        const ids = subThemeIdsByTheme.get(t.id);
        return ids ? all.some((p) => p.subThemeIds?.some((id) => ids.has(id))) : false;
      })
      .map((t) => ({ value: t.slug, label: t.title }));

    let filtered = type ? all.filter((p) => p.type === type) : all;
    if (theme) {
      const themeIds = subThemeIdsByTheme.get(themes.find((t) => t.slug === theme)?.id ?? "") ?? new Set<string>();
      filtered = filtered.filter((p) => p.subThemeIds?.some((id) => themeIds.has(id)));
    }

    const sorted = [...filtered].sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return sort === "asc" ? da - db : db - da;
    });

    const uniqueTypes = [...new Set(all.map((p) => p.type))];
    const typeOptions = uniqueTypes.map((t) => ({ value: t, label: TYPE_LABEL[t] ?? t }));
    const subThemeOptions = subThemes.map((st) => st.title);

    return (
      <>
        <Hero
          eyebrow={page.eyebrow}
          title={page.title}
          body={page.body}
          imageUrl={page.imageUrl ?? undefined}
          imageCrop={page.imageCrop}
          quote={page.quote}
        />
        <Suspense>
          <FilterBar param="type" options={typeOptions} allLabel="Tous les types" />
          {themeOptions.length > 0 && <FilterBar param="theme" options={themeOptions} allLabel="Tous les thèmes" />}
        </Suspense>
        <CardGrid
          title={type ? (TYPE_LABEL[type] ?? type) : "Toutes les productions"}
          headerActions={
            <Suspense>
              <SortToggle />
            </Suspense>
          }
          items={sorted.map((item) => ({
            title: item.title,
            description: item.description,
            href: `/productions/${item.slug}`,
            meta: TYPE_LABEL[item.type] ?? item.type,
            tags: item.tags,
          }))}
        />
        <ProposeSection
          lead="Vous avez un contenu à proposer ?"
          label="Proposer un contenu"
          target="FORM:content"
          selectOptions={{ subTheme: subThemeOptions }}
        />
      </>
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    return <MaintenanceNotice />;
  }
}
