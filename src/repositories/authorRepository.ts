import { getSupabaseAdmin } from "@/lib/db";
import type { Author } from "@/types/cms";
import { asNullableString, asString, type DataRow } from "@/utils/row";

function mapAuthor(row: DataRow): Author {
  return {
    id: asString(row.id),
    name: asString(row.name),
    bio: asNullableString(row.bio),
    photoId: asNullableString(row.photo_id),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const authorRepository = {
  async listAuthors(): Promise<Author[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("authors").select("*").order("name");
    if (error) throw error;
    return data.map(mapAuthor);
  },

  async getAuthorById(id: string): Promise<Author | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("authors").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapAuthor(data as DataRow);
  },

  async createAuthor(input: Record<string, unknown>): Promise<Author> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("authors").insert(input).select().single();
    if (error) throw error;
    return mapAuthor(data as DataRow);
  },

  async updateAuthor(id: string, input: Record<string, unknown>): Promise<Author> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("authors")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapAuthor(data as DataRow);
  },

  async deleteAuthor(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("authors").delete().eq("id", id);
    if (error) throw error;
  },

  // ── Auteur ↔ Productions (many-to-many) ──────────────────────────────
  async getProductionAuthorIds(productionId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("production_authors").select("author_id").eq("production_id", productionId);
    return (data ?? []).map((r) => String(r.author_id));
  },

  async setProductionAuthors(productionId: string, authorIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("production_authors").delete().eq("production_id", productionId);
    if (authorIds.length > 0) {
      const rows = authorIds.map((authorId) => ({ production_id: productionId, author_id: authorId }));
      const { error } = await db.from("production_authors").insert(rows);
      if (error) throw error;
    }
  },

  async getAllProductionAuthorLinks(): Promise<Record<string, string[]>> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("production_authors").select("production_id, author_id");
    if (error) throw error;
    const map: Record<string, string[]> = {};
    for (const row of data ?? []) {
      const productionId = String(row.production_id);
      (map[productionId] ??= []).push(String(row.author_id));
    }
    return map;
  },
};
