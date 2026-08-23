import { getSupabaseAdmin } from "@/lib/db";
import type { ContentStatus, JournalEntry } from "@/types/cms";
import { asBoolean, asNullableString, asString, type DataRow } from "@/utils/row";

function mapJournalEntry(row: DataRow): JournalEntry {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    excerpt: asNullableString(row.excerpt),
    body: asNullableString(row.body),
    thumbnailId: asNullableString(row.thumbnail_id),
    category: asNullableString(row.category),
    authorId: asNullableString(row.author_id),
    date: asNullableString(row.date),
    themeId: asNullableString(row.theme_id),
    projectId: asNullableString(row.project_id),
    eventId: asNullableString(row.event_id),
    productionId: asNullableString(row.production_id),
    status: asString(row.status, "draft") as ContentStatus,
    featured: asBoolean(row.featured),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const journalRepository = {
  async listEntries(includeDrafts = false): Promise<JournalEntry[]> {
    const db = getSupabaseAdmin();
    let query = db.from("journal_entries").select("*").order("date", { ascending: false });
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapJournalEntry);
  },

  async listEntriesByProject(projectId: string): Promise<JournalEntry[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("journal_entries")
      .select("*")
      .eq("project_id", projectId)
      .eq("status", "published")
      .order("date", { ascending: false });
    if (error) throw error;
    return data.map(mapJournalEntry);
  },

  async getEntry(slug: string): Promise<JournalEntry | null> {
    const entries = await journalRepository.listEntries(true);
    return entries.find((e) => e.slug === slug) ?? null;
  },

  async getEntryById(id: string): Promise<JournalEntry | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("journal_entries").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapJournalEntry(data as DataRow);
  },

  async createEntry(input: Record<string, unknown>): Promise<JournalEntry> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("journal_entries").insert(input).select().single();
    if (error) throw error;
    return mapJournalEntry(data as DataRow);
  },

  async updateEntry(id: string, input: Record<string, unknown>): Promise<JournalEntry> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("journal_entries")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapJournalEntry(data as DataRow);
  },

  async deleteEntry(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("journal_entries").delete().eq("id", id);
    if (error) throw error;
  },

  async toggleStatus(id: string, currentStatus: string): Promise<void> {
    const next = currentStatus === "published" ? "draft" : "published";
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("journal_entries")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};
