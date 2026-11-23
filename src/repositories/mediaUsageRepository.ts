import { getSupabaseAdmin } from "@/lib/db";

// Lecture des références aux médias dans les autres tables (médiathèque,
// « Utilisé dans »). Colonnes d'identifiants seulement : aucun texte long.

type Row = Record<string, unknown>;

async function rows(table: string, columns: string): Promise<Row[]> {
  const { data, error } = await getSupabaseAdmin().from(table).select(columns);
  if (error) throw error;
  return (data ?? []) as unknown as Row[];
}

export const mediaUsageRepository = {
  async listReferences() {
    const [
      announcements,
      events,
      eventResources,
      authors,
      dossiers,
      journal,
      pages,
      productions,
      productionResources,
      projects,
      projectResources,
      themes,
      settings,
    ] = await Promise.all([
      rows("announcements", "id, name, image_id"),
      rows("events", "id, title, poster_id, gallery, documents"),
      rows("event_resources", "event_id, resource_id"),
      rows("authors", "id, name, photo_id"),
      rows("dossiers", "id, title, image_id"),
      rows("journal_entries", "id, title, thumbnail_id"),
      rows("pages", "slug, title, image_id, seo_image_id, content"),
      rows("productions", "id, title, file_id, thumbnail_id"),
      rows("production_resources", "production_id, resource_id"),
      rows("projects", "id, title, documents"),
      rows("project_resources", "project_id, resource_id"),
      rows("themes", "id, title, hero_image_id, thumbnail_id"),
      rows("site_settings", "*"),
    ]);
    return {
      announcements,
      events,
      eventResources,
      authors,
      dossiers,
      journal,
      pages,
      productions,
      productionResources,
      projects,
      projectResources,
      themes,
      settings,
    };
  },
};
