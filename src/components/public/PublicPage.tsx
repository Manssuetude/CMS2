import { Hero } from "@/components/public/Hero";
import { CardGrid } from "@/components/cards/CardGrid";
import type { Page, Production, Theme, Project, Event } from "@/types/cms";

export function PublicPage({
  page,
  heroImageUrl,
  productions = [],
  themes = [],
  projects = [],
  events = [],
}: {
  page: Page;
  heroImageUrl?: string | null;
  productions?: Production[];
  themes?: Theme[];
  projects?: Project[];
  events?: Event[];
}) {
  return (
    <>
      <Hero
        eyebrow={page.eyebrow}
        title={page.title}
        body={page.body}
        imageUrl={heroImageUrl}
        imageCrop={page.imageCrop}
        quote={page.quote}
        primaryLabel={page.primaryCtaLabel}
        primaryTarget={page.primaryCtaTarget}
        secondaryLabel={page.secondaryCtaLabel}
        secondaryTarget={page.secondaryCtaTarget}
      />
      {themes.length ? (
        <CardGrid
          title="Thèmes"
          items={themes.map((item) => ({
            title: item.title,
            description: item.description,
            href: `/themes/${item.slug}`,
            tags: item.tags,
          }))}
        />
      ) : null}
      {productions.length ? (
        <CardGrid
          title="Productions récentes"
          items={productions.map((item) => ({
            title: item.title,
            description: item.description,
            href: `/productions/${item.slug}`,
            meta: item.type,
            tags: item.tags,
          }))}
        />
      ) : null}
      {projects.length ? (
        <CardGrid
          title="Projets"
          items={projects.map((item) => ({
            title: item.title,
            description: item.description,
            href: `/projets/${item.slug}`,
            meta: item.category || item.priority,
          }))}
        />
      ) : null}
      {events.length ? (
        <CardGrid
          title="Événements"
          items={events.map((item) => ({
            title: item.title,
            description: item.description,
            href: `/evenements/${item.slug}`,
            meta: item.format,
          }))}
        />
      ) : null}
    </>
  );
}
