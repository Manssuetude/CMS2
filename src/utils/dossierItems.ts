import type { Activity, DossierItem, JournalEntry, Media, Production, Project } from "@/types/cms";

export type ResolvedDossierItem = {
  entityType: DossierItem["entityType"];
  entityId: string;
  title: string;
  description?: string | null;
  href: string;
  imageUrl?: string | null;
};

export type DossierItemSource = {
  productions: Production[];
  activities: Activity[];
  projects: Project[];
  resources: Media[];
  journalEntries: JournalEntry[];
};

// Résout les entrées polymorphes d'un dossier (entity_type + entity_id) en
// contenus affichables, dans l'ordre stocké. Les entrées dont la cible a été
// supprimée depuis sont silencieusement ignorées plutôt que de casser la page.
export function resolveDossierItems(items: DossierItem[], source: DossierItemSource): ResolvedDossierItem[] {
  const productionById = new Map(source.productions.map((p) => [p.id, p]));
  const activityById = new Map(source.activities.map((a) => [a.id, a]));
  const projectById = new Map(source.projects.map((p) => [p.id, p]));
  const resourceById = new Map(source.resources.map((r) => [r.id, r]));
  const journalById = new Map(source.journalEntries.map((e) => [e.id, e]));

  const resolved: ResolvedDossierItem[] = [];
  for (const item of items.slice().sort((a, b) => a.position - b.position)) {
    if (item.entityType === "production") {
      const p = productionById.get(item.entityId);
      if (p)
        resolved.push({
          entityType: "production",
          entityId: p.id,
          title: p.title,
          description: p.description,
          href: `/productions/${p.slug}`,
        });
    } else if (item.entityType === "activity") {
      const a = activityById.get(item.entityId);
      if (a)
        resolved.push({
          entityType: "activity",
          entityId: a.id,
          title: a.title,
          description: a.description,
          href: `/activites/${a.slug}`,
        });
    } else if (item.entityType === "project") {
      const p = projectById.get(item.entityId);
      if (p)
        resolved.push({
          entityType: "project",
          entityId: p.id,
          title: p.title,
          description: p.description,
          href: `/projets/${p.slug}`,
        });
    } else if (item.entityType === "resource") {
      const r = resourceById.get(item.entityId);
      if (r)
        resolved.push({
          entityType: "resource",
          entityId: r.id,
          title: r.title,
          description: r.description,
          href: `/ressources/${r.id}`,
          imageUrl: r.thumbnailUrl ?? r.previewUrl,
        });
    } else if (item.entityType === "journal_entry") {
      const e = journalById.get(item.entityId);
      if (e)
        resolved.push({
          entityType: "journal_entry",
          entityId: e.id,
          title: e.title,
          description: e.excerpt,
          href: `/journal/${e.slug}`,
        });
    }
  }
  return resolved;
}
