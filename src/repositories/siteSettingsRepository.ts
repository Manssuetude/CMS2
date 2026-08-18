import { getSupabaseAdmin } from "@/lib/db";
import type { NavVisibility } from "@/types/cms";
import { asRecord } from "@/utils/row";

export const siteSettingsRepository = {
  async getNavVisibility(): Promise<NavVisibility> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("site_settings").select("nav_visibility").eq("id", "default").single();
    if (error || !data) return {};
    const record = asRecord(data.nav_visibility);
    return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, value !== false]));
  },

  async updateNavVisibility(visibility: NavVisibility): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("site_settings")
      .upsert({ id: "default", nav_visibility: visibility }, { onConflict: "id" });
    if (error) throw error;
  },
};
