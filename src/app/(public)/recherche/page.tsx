import type { Metadata } from "next";
import Link from "next/link";
import { contentRepository } from "@/repositories/contentRepository";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Recherche",
  description: "Rechercher dans les thèmes, productions, activités et projets de Manssuétude.",
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
  production: "Production",
  activity: "Activité",
  project: "Projet",
};

// Pages du site incluses dans la recherche.
const SITE_PAGES: Array<{ title: string; href: string; keywords: string }> = [
  { title: "Accueil", href: "/", keywords: "accueil home manssuétude" },
  { title: "Thèmes", href: "/themes", keywords: "thèmes dossiers sujets" },
  { title: "Activités", href: "/activites", keywords: "activités ateliers séances débats" },
  { title: "Productions", href: "/productions", keywords: "productions articles notes rapports vidéos podcasts" },
  { title: "Projets", href: "/projets", keywords: "projets initiatives" },
  { title: "Ressources", href: "/ressources", keywords: "ressources documents" },
  { title: "À propos", href: "/a-propos", keywords: "à propos mission histoire association" },
  {
    title: "PERCA — Notre méthode",
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
      const [themes, productions, activities, projects] = await Promise.all([
        contentRepository.listThemes(),
        contentRepository.listProductions(),
        contentRepository.listActivities(),
        contentRepository.listProjects(),
      ]);

      const themeResults: Result[] = themes
        .filter((t) => matches(query, t.title, t.shortTitle, t.description, t.tags?.join(" ")))
        .map((t) => ({
          kind: "theme",
          title: t.title,
          description: t.description,
          href: `/themes/${t.slug}`,
          tags: t.tags,
        }));

      const prodResults: Result[] = productions
        .filter((p) => matches(query, p.title, p.description, p.type, p.author, p.tags?.join(" ")))
        .map((p) => ({
          kind: "production",
          title: p.title,
          description: p.description,
          href: `/productions/${p.slug}`,
          tags: p.tags,
        }));

      const actResults: Result[] = activities
        .filter((a) => matches(query, a.title, a.description, a.format))
        .map((a) => ({ kind: "activity", title: a.title, description: a.description, href: `/activites/${a.slug}` }));

      const projResults: Result[] = projects
        .filter((p) => matches(query, p.title, p.description, p.category))
        .map((p) => ({ kind: "project", title: p.title, description: p.description, href: `/projets/${p.slug}` }));

      results = [...pageResults, ...themeResults, ...prodResults, ...actResults, ...projResults];
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
            placeholder="Thème, production, activité, projet…"
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
