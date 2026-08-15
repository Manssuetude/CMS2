import { getSupabaseAdmin } from "@/lib/db";
import type { Activity, ContentStatus, ProgressStatus } from "@/types/cms";
import { asBoolean, asNullableString, asString, asStringArray, type DataRow } from "@/utils/row";

function mapActivity(row: DataRow): Activity {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    format: asString(row.format),
    description: asNullableString(row.description),
    body: asNullableString(row.body),
    date: asNullableString(row.date),
    status: asString(row.status, "draft") as ContentStatus,
    progressStatus: asNullableString(row.progress_status) as ProgressStatus | null,
    gallery: asStringArray(row.gallery),
    documents: asStringArray(row.documents),
    featured: asBoolean(row.featured),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const activityRepository = {
  async listActivities(includeDrafts = false): Promise<Activity[]> {
    const db = getSupabaseAdmin();
    let query = db.from("activities").select("*").order("updated_at", { ascending: false });
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapActivity);
  },

  async getActivityById(id: string): Promise<Activity | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("activities").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapActivity(data as DataRow);
  },

  async createActivity(input: Record<string, unknown>): Promise<Activity> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("activities").insert(input).select().single();
    if (error) throw error;
    return mapActivity(data as DataRow);
  },

  async updateActivity(id: string, input: Record<string, unknown>): Promise<Activity> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("activities")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapActivity(data as DataRow);
  },

  async deleteActivity(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("activities").delete().eq("id", id);
    if (error) throw error;
  },

  async toggleStatus(id: string, currentStatus: string): Promise<void> {
    const next = currentStatus === "published" ? "draft" : "published";
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("activities")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};
