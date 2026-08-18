import { getSupabaseAdmin } from "@/lib/db";
import type { Redirect } from "@/types/cms";
import { asString, type DataRow } from "@/utils/row";

function mapRedirect(row: DataRow): Redirect {
  return {
    id: asString(row.id),
    fromPath: asString(row.from_path),
    toPath: asString(row.to_path),
    createdAt: asString(row.created_at),
  };
}

export const redirectRepository = {
  async listRedirects(): Promise<Redirect[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("redirects").select("*").order("from_path");
    if (error) throw error;
    return data.map(mapRedirect);
  },

  async createRedirect(fromPath: string, toPath: string): Promise<Redirect> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("redirects")
      .insert({ from_path: fromPath, to_path: toPath })
      .select()
      .single();
    if (error) throw error;
    return mapRedirect(data as DataRow);
  },

  async deleteRedirect(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("redirects").delete().eq("id", id);
    if (error) throw error;
  },
};
