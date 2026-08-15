import { getSupabaseAdmin } from "@/lib/db";
import type { ContentStatus, SubTheme } from "@/types/cms";
import { asNullableString, asString, asStringArray, type DataRow } from "@/utils/row";

function mapSubTheme(row: DataRow): SubTheme {
  return {
    id: asString(row.id),
    themeId: asString(row.theme_id),
    slug: asString(row.slug),
    title: asString(row.title),
    description: asNullableString(row.description),
    longDescription: asNullableString(row.long_description),
    date: asNullableString(row.date),
    status: asString(row.status, "draft") as ContentStatus,
    tags: asStringArray(row.tags),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const subThemeRepository = {
  async listSubThemes(includeDrafts = false): Promise<SubTheme[]> {
    const db = getSupabaseAdmin();
    let query = db.from("sub_themes").select("*").order("title");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapSubTheme);
  },

  async listSubThemesByTheme(themeId: string, includeDrafts = false): Promise<SubTheme[]> {
    const db = getSupabaseAdmin();
    let query = db.from("sub_themes").select("*").eq("theme_id", themeId).order("title");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapSubTheme);
  },

  async getSubTheme(slug: string): Promise<SubTheme | null> {
    const subThemes = await subThemeRepository.listSubThemes(true);
    return subThemes.find((s) => s.slug === slug) ?? null;
  },

  async getSubThemeById(id: string): Promise<SubTheme | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("sub_themes").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapSubTheme(data as DataRow);
  },

  async createSubTheme(input: Record<string, unknown>): Promise<SubTheme> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("sub_themes").insert(input).select().single();
    if (error) throw error;
    return mapSubTheme(data as DataRow);
  },

  async updateSubTheme(id: string, input: Record<string, unknown>): Promise<SubTheme> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("sub_themes")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapSubTheme(data as DataRow);
  },

  async deleteSubTheme(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("sub_themes").delete().eq("id", id);
    if (error) throw error;
  },
};
