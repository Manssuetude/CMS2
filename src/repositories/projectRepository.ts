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
};
