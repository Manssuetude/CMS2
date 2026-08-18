import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { CardGrid } from "@/components/cards/CardGrid";
import { productionRepository } from "@/repositories/productionRepository";
import { themeRepository } from "@/repositories/themeRepository";

export default async function NotFound() {
  let recommendations: { title: string; description?: string | null; href: string; meta?: string | null }[] = [];
  try {
    const [productions, themes] = await Promise.all([
      productionRepository.listProductions(),
      themeRepository.listThemes(),
    ]);
    const featuredProductions = productions.filter((p) => p.featured).slice(0, 3);
    const prodPicks = (featuredProductions.length ? featuredProductions : productions.slice(0, 3)).map((p) => ({
      title: p.title,
      description: p.description,
      href: `/productions/${p.slug}`,
      meta: "Production",
    }));
    const themePicks = themes.slice(0, 2).map((t) => ({
      title: t.title,
      description: t.description,
      href: `/themes/${t.slug}`,
      meta: "Thème",
    }));
    recommendations = [...prodPicks, ...themePicks];
  } catch {
    // DB indisponible : la page 404 reste utile même sans recommandations.
  }

  return (
    <div className="site-shell">
      <main className="page-main">
        <MaintenanceNotice
          eyebrow="Page introuvable"
          title="Cette page n'est pas disponible."
          body="La page que vous cherchez n'existe pas ou est encore en préparation. Revenez à l'accueil pour continuer à explorer Manssuétude."
        />

        <section className="section" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <form className="search-form" action="/recherche" method="get" role="search">
            <input type="search" name="q" placeholder="Thème, production, activité, projet…" aria-label="Rechercher" />
            <button type="submit" className="button primary">
              Rechercher
            </button>
          </form>
        </section>

        {recommendations.length > 0 && <CardGrid title="À explorer" items={recommendations} />}
      </main>
    </div>
  );
}
