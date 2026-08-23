import type { Metadata } from "next";
import Link from "next/link";
import { eventRepository } from "@/repositories/eventRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { journalRepository } from "@/repositories/journalRepository";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Recherche",
  description: "Rechercher dans les thèmes, productions, événements et projets de Manssuétude.",
};

type Result = {
  kind: string;
  title: string;
  description?: string | null;
  href: string;
  tags?: string[];
};

function matches(query: string, ...fields: Array<string | null | undefined>) {
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
}

const KIND_LABEL: Record<string, string> = {
  page: "Page",
  theme: "Thème",
  "sub-theme": "Sous-thème",
  production: "Production",
  event: "Événement",
  project: "Projet",
  journal: "Journal",
};

// Pages du site incluses dans la recherche.
const SITE_PAGES: Array<{ title: string; href: string; keywords: string }> = [
  { title: "Accueil", href: "/", keywords: "accueil home manssuétude" },
  { title: "Thèmes", href: "/themes", keywords: "thèmes dossiers sujets" },
  { title: "Événements", href: "/evenements", keywords: "événements ateliers séances débats agenda" },
  { title: "Activités", href: "/activites", keywords: "activités formats techniques animation fishbowl" },
  { title: "Productions", href: "/productions", keywords: "productions articles notes rapports vidéos podcasts" },
  { title: "Projets", href: "/projets", keywords: "projets initiatives" },
  { title: "Ressources", href: "/ressources", keywords: "ressources documents" },
  { title: "À propos", href: "/a-propos", keywords: "à propos mission histoire association" },
  {
    title: "PERCA · Notre méthode",
    href: "/perca",
    keywords: "perca méthode penser exprimer relier concrétiser ancrer",
  },
  { title: "Nous rejoindre", href: "/nous-rejoindre", keywords: "rejoindre adhésion adhérer membre" },
  { title: "Nous soutenir", href: "/nous-soutenir", keywords: "soutenir don donation soutien" },
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  let results: Result[] = [];
  if (query.length >= 2) {
    const pageResults: Result[] = SITE_PAGES.filter((p) => matches(query, p.title, p.keywords)).map((p) => ({
      kind: "page",
      title: p.title,
      href: p.href,
    }));

    try {
      const [themes, subThemes, productions, events, projects, journalEntries] = await Promise.all([
        themeRepository.listThemes(),
        subThemeRepository.listSubThemes(),
        productionRepository.listProductions(),
        eventRepository.listEvents(),
        projectRepository.listProjects(),
        journalRepository.listEntries(),
      ]);
      const themeSlugById = new Map(themes.map((t) => [t.id, t.slug]));

      const themeResults: Result[] = themes
        .filter((t) => matches(query, t.title, t.shortTitle, t.description, t.tags?.join(" ")))
        .map((t) => ({
          kind: "theme",
          title: t.title,
          description: t.description,
          href: `/themes/${t.slug}`,
          tags: t.tags,
        }));

      const subThemeResults: Result[] = subThemes
        .filter((st) => matches(query, st.title, st.description, st.tags?.join(" ")))
        .flatMap((st) => {
          const themeSlug = themeSlugById.get(st.themeId);
          return themeSlug
            ? [
                {
                  kind: "sub-theme",
                  title: st.title,
                  description: st.description,
                  href: `/themes/${themeSlug}/${st.slug}`,
                  tags: st.tags,
                },
              ]
            : [];
        });

      const prodResults: Result[] = productions
        .filter((p) => matches(query, p.title, p.description, p.type, p.author, p.tags?.join(" ")))
        .map((p) => ({
          kind: "production",
          title: p.title,
          description: p.description,
          href: `/productions/${p.slug}`,
          tags: p.tags,
        }));

      const eventResults: Result[] = events
        .filter((e) => matches(query, e.title, e.description, e.format))
        .map((e) => ({ kind: "event", title: e.title, description: e.description, href: `/evenements/${e.slug}` }));

      const projResults: Result[] = projects
        .filter((p) => matches(query, p.title, p.description, p.category))
        .map((p) => ({ kind: "project", title: p.title, description: p.description, href: `/projets/${p.slug}` }));

      const journalResults: Result[] = journalEntries
        .filter((e) => matches(query, e.title, e.excerpt, e.category))
        .map((e) => ({ kind: "journal", title: e.title, description: e.excerpt, href: `/journal/${e.slug}` }));

      results = [
        ...pageResults,
        ...themeResults,
        ...subThemeResults,
        ...prodResults,
        ...eventResults,
        ...projResults,
        ...journalResults,
      ];
    } catch {
      // DB indisponible : on affiche au moins les pages du site qui correspondent.
      results = pageResults;
    }
  }

  return (
    <div className="search-page">
      <header className="search-head">
        <p className="eyebrow">Recherche</p>
        <h1>Explorer Manssuétude</h1>
        <form className="search-form" action="/recherche" method="get" role="search">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Thème, production, événement, projet…"
            aria-label="Rechercher"
            autoFocus
          />
          <button type="submit" className="button primary">
            Rechercher
          </button>
        </form>
      </header>

      {query.length < 2 ? (
        <p className="search-hint">Saisissez au moins 2 caractères pour lancer une recherche.</p>
      ) : results.length === 0 ? (
        <p className="search-hint">
          Aucun résultat pour «&nbsp;<strong>{q}</strong>&nbsp;». Essayez d&apos;autres mots-clés.
        </p>
      ) : (
        <>
          <p className="search-count">
            {results.length} résultat{results.length !== 1 ? "s" : ""} pour «&nbsp;<strong>{q}</strong>&nbsp;»
          </p>
          <ul className="search-results">
            {results.map((r) => (
              <li key={`${r.kind}-${r.href}`}>
                <Link href={r.href}>
                  <span className="search-result-kind">{KIND_LABEL[r.kind] ?? r.kind}</span>
                  <span className="search-result-title">{r.title}</span>
                  {r.description ? <span className="search-result-desc">{r.description}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
