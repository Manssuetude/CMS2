import { getSupabaseAdmin } from "@/lib/db";
import type { ContentBlock, ContentStatus, Production } from "@/types/cms";
import { asBoolean, asNullableString, asString, asStringArray, type DataRow } from "@/utils/row";

function mapContentBlocks(value: unknown): ContentBlock[] {
  return Array.isArray(value) ? (value as ContentBlock[]) : [];
}

function mapProduction(row: DataRow): Production {
  const blocks = Array.isArray(row.content_blocks) ? (row.content_blocks as Array<{ type: string }>) : [];
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    type: asString(row.type),
    description: asNullableString(row.description),
    body: asNullableString(row.body),
    contentBlocks: mapContentBlocks(blocks),
    author: asNullableString(row.author),
    date: asNullableString(row.date),
    thumbnailId: asNullableString(row.thumbnail_id),
    fileId: asNullableString(row.file_id),
    readingTime: asNullableString(row.reading_time),
    pages: asNullableString(row.pages),
    tags: asStringArray(row.tags),
    status: asString(row.status, "draft") as ContentStatus,
    featured: asBoolean(row.featured),
    subThemeId: asNullableString(row.sub_theme_id),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const productionRepository = {
  async listProductions(includeDrafts = false): Promise<Production[]> {
    const db = getSupabaseAdmin();
    let query = db.from("productions").select("*").order("date", { ascending: false });
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapProduction);
  },

  async getProduction(slug: string): Promise<Production | null> {
    const items = await productionRepository.listProductions(true);
    return items.find((i) => i.slug === slug) ?? null;
  },

  async getProductionById(id: string): Promise<Production | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("productions").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapProduction(data as DataRow);
  },

  async createProduction(input: Record<string, unknown>): Promise<Production> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("productions").insert(input).select().single();
    if (error) throw error;
    return mapProduction(data as DataRow);
  },

  async updateProduction(id: string, input: Record<string, unknown>): Promise<Production> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("productions")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapProduction(data as DataRow);
  },

  async deleteProduction(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("productions").delete().eq("id", id);
    if (error) throw error;
  },

  async toggleStatus(id: string, currentStatus: string): Promise<void> {
    const next = currentStatus === "published" ? "draft" : "published";
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("productions")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  // Une production appartient à un seul sous-thème (colonne sub_theme_id).
  async getProductionsBySubTheme(subThemeId: string): Promise<Production[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("productions")
      .select("*")
      .eq("sub_theme_id", subThemeId)
      .eq("status", "published")
      .order("date", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduction);
  },
};
