import { getSupabaseAdmin } from "@/lib/db";
import type { Activity, ContentStatus, ProgressStatus, Speaker } from "@/types/cms";
import { asBoolean, asNullableString, asRecordArray, asString, asStringArray, type DataRow } from "@/utils/row";

function mapSpeaker(row: Record<string, unknown>): Speaker {
  return { name: asString(row.name), role: asNullableString(row.role) ?? undefined };
}

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
    speakers: asRecordArray(row.speakers).map(mapSpeaker),
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

  // ── Activité ↔ Thèmes (many-to-many) ─────────────────────────────────
  async getActivityThemeIds(activityId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("theme_activities").select("theme_id").eq("activity_id", activityId);
    return (data ?? []).map((r) => String(r.theme_id));
  },

  async setActivityThemes(activityId: string, themeIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("theme_activities").delete().eq("activity_id", activityId);
    if (themeIds.length > 0) {
      const rows = themeIds.map((themeId) => ({ activity_id: activityId, theme_id: themeId }));
      const { error } = await db.from("theme_activities").insert(rows);
      if (error) throw error;
    }
  },

  async getActivitiesByTheme(themeId: string): Promise<Activity[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("theme_activities").select("activity_id").eq("theme_id", themeId);
    const ids = (data ?? []).map((r) => String(r.activity_id));
    if (ids.length === 0) return [];
    const { data: rows, error } = await db
      .from("activities")
      .select("*")
      .in("id", ids)
      .eq("status", "published")
      .order("date", { ascending: false });
    if (error) throw error;
    return (rows ?? []).map(mapActivity);
  },

  // ── Activité ↔ Projets (many-to-many) ────────────────────────────────
  async getActivityProjectIds(activityId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("project_activities").select("project_id").eq("activity_id", activityId);
    return (data ?? []).map((r) => String(r.project_id));
  },

  async setActivityProjects(activityId: string, projectIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("project_activities").delete().eq("activity_id", activityId);
    if (projectIds.length > 0) {
      const rows = projectIds.map((projectId) => ({ activity_id: activityId, project_id: projectId }));
      const { error } = await db.from("project_activities").insert(rows);
      if (error) throw error;
    }
  },

  async getActivitiesByProject(projectId: string): Promise<Activity[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("project_activities").select("activity_id").eq("project_id", projectId);
    const ids = (data ?? []).map((r) => String(r.activity_id));
    if (ids.length === 0) return [];
    const { data: rows, error } = await db
      .from("activities")
      .select("*")
      .in("id", ids)
      .eq("status", "published")
      .order("date", { ascending: false });
    if (error) throw error;
    return (rows ?? []).map(mapActivity);
  },
};
