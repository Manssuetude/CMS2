import { getSupabaseAdmin } from "@/lib/db";
import type { Role } from "@/types/cms";
import { asBoolean, asString, type DataRow } from "@/utils/row";

function mapRole(row: DataRow): Role {
  return {
    id: asString(row.id),
    key: asString(row.key),
    label: asString(row.label),
    isAdmin: asBoolean(row.is_admin),
    permissions: Array.isArray(row.permissions) ? (row.permissions as string[]) : [],
  };
}

export const roleRepository = {
  async list(): Promise<Role[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("roles").select("*").order("is_admin", { ascending: false }).order("label");
    if (error) throw error;
    return (data as DataRow[]).map(mapRole);
  },

  async getByKey(key: string): Promise<Role | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("roles").select("*").eq("key", key).maybeSingle();
    if (error || !data) return null;
    return mapRole(data as DataRow);
  },

  async create(input: { key: string; label: string; permissions?: string[] }): Promise<Role> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("roles")
      .insert({ key: input.key, label: input.label, is_admin: false, permissions: input.permissions ?? [] })
      .select()
      .single();
    if (error) throw error;
    return mapRole(data as DataRow);
  },

  async updatePermissions(key: string, permissions: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("roles")
      .update({ permissions, updated_at: new Date().toISOString() })
      .eq("key", key)
      .eq("is_admin", false); // le rôle admin reste figé
    if (error) throw error;
  },

  async remove(key: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("roles").delete().eq("key", key).eq("is_admin", false);
    if (error) throw error;
  },
};
