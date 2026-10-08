import { getSupabaseAdmin } from "@/lib/db";
import type { LinkItem, ContentStatus } from "@/types/cms";
import { asString, type DataRow } from "@/utils/row";

function mapLinkItem(row: DataRow): LinkItem {
  return {
    id: asString(row.id),
    label: asString(row.label),
    url: asString(row.url),
    icon: asString(row.icon, "website"),
    position: typeof row.position === "number" ? row.position : Number(row.position ?? 0),
    status: asString(row.status, "draft") as ContentStatus,
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const linkRepository = {
  async listLinks(includeDrafts = false): Promise<LinkItem[]> {
    const db = getSupabaseAdmin();
    let query = db.from("link_items").select("*").order("position").order("label");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapLinkItem);
  },

  async getLinkById(id: string): Promise<LinkItem | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("link_items").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapLinkItem(data as DataRow);
  },

  async createLink(input: Record<string, unknown>): Promise<LinkItem> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("link_items").insert(input).select().single();
    if (error) throw error;
    return mapLinkItem(data as DataRow);
  },

  async updateLink(id: string, input: Record<string, unknown>): Promise<LinkItem> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("link_items")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapLinkItem(data as DataRow);
  },

  async deleteLink(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("link_items").delete().eq("id", id);
    if (error) throw error;
  },
};
