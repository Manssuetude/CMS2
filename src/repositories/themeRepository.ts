import { getSupabaseAdmin } from "@/lib/db";
import type { ContentStatus, ProgressStatus, Theme } from "@/types/cms";
import { selectableThemes, type SelectableThemes } from "@/utils/themePicker";
import { asBoolean, asNullableString, asString, asStringArray, type DataRow } from "@/utils/row";

function mapTheme(row: DataRow): Theme {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    shortTitle: asNullableString(row.short_title),
    description: asNullableString(row.description),
    longDescription: asNullableString(row.long_description),
    heroImageId: asNullableString(row.hero_image_id),
    thumbnailId: asNullableString(row.thumbnail_id),
    status: asString(row.status, "draft") as ContentStatus,
    progressStatus: asNullableString(row.progress_status) as ProgressStatus | null,
    featured: asBoolean(row.featured),
    tags: asStringArray(row.tags),
    seoTitle: asNullableString(row.seo_title),
    seoDescription: asNullableString(row.seo_description),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const themeRepository = {
  async listThemes(includeDrafts = false): Promise<Theme[]> {
    const db = getSupabaseAdmin();
    let query = db.from("themes").select("*").order("featured", { ascending: false }).order("title");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapTheme);
  },

  /**
   * Thèmes proposés dans les sélecteurs de l'admin : sans les thèmes archivés,
   * sauf ceux de `attachedIds` (déjà rattachés au contenu édité).
   */
  async listSelectableThemes(attachedIds: string[] = []): Promise<SelectableThemes> {
    return selectableThemes(await themeRepository.listThemes(true), attachedIds);
  },

  async getTheme(slug: string): Promise<Theme | null> {
    const themes = await themeRepository.listThemes(true);
    return themes.find((t) => t.slug === slug) ?? null;
  },

  async getThemeById(id: string): Promise<Theme | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("themes").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapTheme(data as DataRow);
  },

  async createTheme(input: Record<string, unknown>): Promise<Theme> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("themes").insert(input).select().single();
    if (error) throw error;
    return mapTheme(data as DataRow);
  },

  async updateTheme(id: string, input: Record<string, unknown>): Promise<Theme> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("themes")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapTheme(data as DataRow);
  },

  async deleteTheme(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("themes").delete().eq("id", id);
    if (error) throw error;
  },

  /** Nombre d'événements et de projets reliés à chaque thème. */
  async listThemeLinkCounts(): Promise<Record<string, { events: number; projects: number }>> {
    const db = getSupabaseAdmin();
    const [events, projects] = await Promise.all([
      db.from("theme_events").select("theme_id"),
      db.from("theme_projects").select("theme_id"),
    ]);
    if (events.error) throw events.error;
    if (projects.error) throw projects.error;
    const counts: Record<string, { events: number; projects: number }> = {};
    for (const row of events.data ?? []) (counts[String(row.theme_id)] ??= { events: 0, projects: 0 }).events += 1;
    for (const row of projects.data ?? []) (counts[String(row.theme_id)] ??= { events: 0, projects: 0 }).projects += 1;
    return counts;
  },
};
