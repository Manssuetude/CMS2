import type { Metadata } from "next";
import { Suspense } from "react";
import { CardGrid } from "@/components/cards/CardGrid";
import { FilterBar } from "@/components/public/FilterBar";
import { mediaRepository } from "@/repositories/mediaRepository";
import { themeRepository } from "@/repositories/themeRepository";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ressources — Manssuétude",
  description: "Documents, rapports, images et vidéos réutilisables, organisés par type et par thème.",
};

const TYPE_LABEL: Record<string, string> = {
  image: "Image",
  video: "Vidéo",
  pdf: "PDF",
  document: "Document",
  audio: "Audio",
  archive: "Archive",
};

function matches(query: string, ...fields: Array<string | null | undefined>) {
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; theme?: string }>;
}) {
  const { q, type, theme } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  let resources: Awaited<ReturnType<typeof mediaRepository.list>> = [];
  let themes: Awaited<ReturnType<typeof themeRepository.listThemes>> = [];
  try {
    [resources, themes] = await Promise.all([mediaRepository.list(true), themeRepository.listThemes()]);
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
  }
  const themeById = new Map(themes.map((t) => [t.id, t]));

  let filtered = resources;
  if (type) filtered = filtered.filter((r) => r.type === type);
  if (theme) filtered = filtered.filter((r) => r.themeId === theme);
  if (query.length >= 2) {
    filtered = filtered.filter((r) =>
      matches(query, r.title, r.description, r.author, r.institution, r.tags.join(" ")),
    );
  }

  const typeOptions = [...new Set(resources.map((r) => r.type))].map((t) => ({
    value: t,
    label: TYPE_LABEL[t] ?? t,
  }));
  const themeOptions = [...new Set(resources.map((r) => r.themeId).filter((id): id is string => Boolean(id)))]
    .map((id) => themeById.get(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((t) => ({ value: t.id, label: t.title }));

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Ressources</p>
          <h1>Bibliothèque de ressources</h1>
          <p>
            Documents, images, rapports, supports, vidéos et ressources réutilisables dans les pages et productions.
          </p>
        </div>
        <div className="hero-image" />
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <form className="search-form" action="/ressources" method="get" role="search">
          {type && <input type="hidden" name="type" value={type} />}
          {theme && <input type="hidden" name="theme" value={theme} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Titre, auteur, institution, tag..."
            aria-label="Rechercher une ressource"
          />
          <button type="submit" className="button primary">
            Rechercher
          </button>
        </form>
        <Suspense>
          {typeOptions.length > 1 && <FilterBar param="type" options={typeOptions} allLabel="Tous les types" />}
          {themeOptions.length > 0 && <FilterBar param="theme" options={themeOptions} allLabel="Tous les thèmes" />}
        </Suspense>
      </section>

      {filtered.length > 0 ? (
        <CardGrid
          title={`${filtered.length} ressource${filtered.length > 1 ? "s" : ""}`}
          items={filtered.map((item) => ({
            title: item.title,
            description: item.description || item.caption,
            href: `/ressources/${item.id}`,
            meta: [TYPE_LABEL[item.type] ?? item.type, item.institution || item.author].filter(Boolean).join(" · "),
            imageUrl: item.type === "image" ? item.url : undefined,
            tags: item.tags,
          }))}
        />
      ) : (
        <section className="section">
          <p style={{ color: "var(--ed-muted)" }}>Aucune ressource ne correspond à ces critères.</p>
        </section>
      )}
    </>
  );
}
