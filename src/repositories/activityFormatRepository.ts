import { getSupabaseAdmin } from "@/lib/db";
import type { ActivityFormat, ContentStatus } from "@/types/cms";
import { asNullableString, asString, type DataRow } from "@/utils/row";

function mapActivityFormat(row: DataRow): ActivityFormat {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    description: asNullableString(row.description),
    icon: asNullableString(row.icon),
    position: typeof row.position === "number" ? row.position : Number(row.position ?? 0),
    status: asString(row.status, "draft") as ContentStatus,
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const activityFormatRepository = {
  async listFormats(includeDrafts = false): Promise<ActivityFormat[]> {
    const db = getSupabaseAdmin();
    let query = db.from("activity_formats").select("*").order("position").order("title");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapActivityFormat);
  },

  async getFormatById(id: string): Promise<ActivityFormat | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("activity_formats").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapActivityFormat(data as DataRow);
  },

  async createFormat(input: Record<string, unknown>): Promise<ActivityFormat> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("activity_formats").insert(input).select().single();
    if (error) throw error;
    return mapActivityFormat(data as DataRow);
  },

  async updateFormat(id: string, input: Record<string, unknown>): Promise<ActivityFormat> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("activity_formats")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapActivityFormat(data as DataRow);
  },

  async deleteFormat(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("activity_formats").delete().eq("id", id);
    if (error) throw error;
  },

  // ── Activité ↔ Formats (many-to-many) ──────────────────────────────
  async getActivityFormatIds(activityId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("activity_activity_formats")
      .select("activity_format_id")
      .eq("activity_id", activityId);
    return (data ?? []).map((r) => String(r.activity_format_id));
  },

  async setActivityFormats(activityId: string, formatIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("activity_activity_formats").delete().eq("activity_id", activityId);
    if (formatIds.length > 0) {
      const rows = formatIds.map((formatId) => ({ activity_id: activityId, activity_format_id: formatId }));
      const { error } = await db.from("activity_activity_formats").insert(rows);
      if (error) throw error;
    }
  },

  async getAllActivityFormatLinks(): Promise<Record<string, string[]>> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("activity_activity_formats").select("activity_id, activity_format_id");
    if (error) throw error;
    const map: Record<string, string[]> = {};
    for (const row of data ?? []) {
      const activityId = String(row.activity_id);
      (map[activityId] ??= []).push(String(row.activity_format_id));
    }
    return map;
  },
};
