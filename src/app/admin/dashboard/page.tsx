import { contentRepository } from "@/repositories/contentRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { formRepository } from "@/repositories/formRepository";
import { healthService } from "@/services/healthService";
import { HealthCenter } from "@/components/admin/HealthCenter";

export default async function DashboardPage() {
  const [pages, themes, productions, projects, media, forms] = await Promise.all([
    contentRepository.listPages(true),
    contentRepository.listThemes(true),
    contentRepository.listProductions(true),
    contentRepository.listProjects(true),
    mediaRepository.list(),
    formRepository.list(),
  ]);
  const stats = [
    ["Pages", pages.length],
    ["Thèmes", themes.length],
    ["Productions", productions.length],
    ["Projets", projects.length],
    ["Médias", media.length],
    ["Formulaires", forms.length],
  ];
  const formsToProcess = forms.filter((item) => item.status !== "traité" && item.status !== "archivé").length;
  const healthItems = healthService.summarize({ pages, media, productions, formsCount: formsToProcess });
  return (
    <div>
      <p className="eyebrow">CMS Manssuétude</p>
      <h1>Dashboard éditorial</h1>
      <div className="admin-grid">
        {stats.map(([label, value]) => (
          <article className="admin-card" key={label}>
            <strong>{value}</strong>
            <p>{label}</p>
          </article>
        ))}
      </div>
      <section className="section admin-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Studio</p>
            <h2>Actions rapides</h2>
          </div>
        </div>
        <div className="quick-actions">
          <a className="button primary" href="/admin/homepage">
            Composer la homepage
          </a>
          <a className="button" href="/admin/media">
            Importer un média
          </a>
          <a className="button" href="/admin/forms">
            Voir les formulaires
          </a>
          <a className="button" href="/admin/design-system">
            Voir les blocs
          </a>
        </div>
      </section>
      <HealthCenter items={healthItems} />
    </div>
  );
}
