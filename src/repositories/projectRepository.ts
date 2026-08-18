import { getSupabaseAdmin } from "@/lib/db";
import type { ContentStatus, ProgressStatus, Project } from "@/types/cms";
import { asBoolean, asNullableString, asString, asStringArray, type DataRow } from "@/utils/row";

function mapProject(row: DataRow): Project {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    category: asNullableString(row.category),
    status: asString(row.status, "draft") as ContentStatus,
    progressStatus: asNullableString(row.progress_status) as ProgressStatus | null,
    priority: asNullableString(row.priority),
    description: asNullableString(row.description),
    body: asNullableString(row.body),
    objectives: asStringArray(row.objectives),
    deliverables: asStringArray(row.deliverables),
    documents: asStringArray(row.documents),
    featured: asBoolean(row.featured),
    seoTitle: asNullableString(row.seo_title),
    seoDescription: asNullableString(row.seo_description),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const projectRepository = {
  async listProjects(includeDrafts = false): Promise<Project[]> {
    const db = getSupabaseAdmin();
    let query = db.from("projects").select("*").order("featured", { ascending: false }).order("title");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapProject);
  },

  async getProjectById(id: string): Promise<Project | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("projects").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapProject(data as DataRow);
  },

  async createProject(input: Record<string, unknown>): Promise<Project> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("projects").insert(input).select().single();
    if (error) throw error;
    return mapProject(data as DataRow);
  },

  async updateProject(id: string, input: Record<string, unknown>): Promise<Project> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("projects")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapProject(data as DataRow);
  },

  async deleteProject(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  async toggleStatus(id: string, currentStatus: string): Promise<void> {
    const next = currentStatus === "published" ? "draft" : "published";
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("projects")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  // ── Projet ↔ Thèmes (many-to-many) ───────────────────────────────────
  async getProjectThemeIds(projectId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("theme_projects").select("theme_id").eq("project_id", projectId);
    return (data ?? []).map((r) => String(r.theme_id));
  },

  async setProjectThemes(projectId: string, themeIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("theme_projects").delete().eq("project_id", projectId);
    if (themeIds.length > 0) {
      const rows = themeIds.map((themeId) => ({ project_id: projectId, theme_id: themeId }));
      const { error } = await db.from("theme_projects").insert(rows);
      if (error) throw error;
    }
  },

  async getProjectsByTheme(themeId: string): Promise<Project[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("theme_projects").select("project_id").eq("theme_id", themeId);
    const ids = (data ?? []).map((r) => String(r.project_id));
    if (ids.length === 0) return [];
    const { data: rows, error } = await db.from("projects").select("*").in("id", ids).eq("status", "published");
    if (error) throw error;
    return (rows ?? []).map(mapProject);
  },

  // ── Projet ↔ Productions (many-to-many) ──────────────────────────────
  async getProjectProductionIds(projectId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("production_projects").select("production_id").eq("project_id", projectId);
    return (data ?? []).map((r) => String(r.production_id));
  },

  async setProjectProductions(projectId: string, productionIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("production_projects").delete().eq("project_id", projectId);
    if (productionIds.length > 0) {
      const rows = productionIds.map((productionId) => ({ project_id: projectId, production_id: productionId }));
      const { error } = await db.from("production_projects").insert(rows);
      if (error) throw error;
    }
  },

  // ── Projet ↔ Activités (many-to-many) ────────────────────────────────
  async getProjectActivityIds(projectId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("project_activities").select("activity_id").eq("project_id", projectId);
    return (data ?? []).map((r) => String(r.activity_id));
  },

  async setProjectActivities(projectId: string, activityIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("project_activities").delete().eq("project_id", projectId);
    if (activityIds.length > 0) {
      const rows = activityIds.map((activityId) => ({ project_id: projectId, activity_id: activityId }));
      const { error } = await db.from("project_activities").insert(rows);
      if (error) throw error;
    }
  },
};
