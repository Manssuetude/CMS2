import { getSupabaseAdmin } from "@/lib/db";
import type { NavVisibility } from "@/types/cms";
import { asRecord, asString, asNullableString } from "@/utils/row";

export type FormDigestSettings = {
  recipientEmail: string;
  intervalDays: number;
  lastSentAt: string | null;
};

const FORM_DIGEST_DEFAULTS: FormDigestSettings = {
  recipientEmail: "contact@manssuetude.com",
  intervalDays: 3,
  lastSentAt: null,
};

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

  async getFormDigestSettings(): Promise<FormDigestSettings> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("site_settings")
      .select("form_digest_recipient_email, form_digest_interval_days, form_digest_last_sent_at")
      .eq("id", "default")
      .single();
    if (error || !data) return FORM_DIGEST_DEFAULTS;
    return {
      recipientEmail: asString(data.form_digest_recipient_email, FORM_DIGEST_DEFAULTS.recipientEmail),
      intervalDays: Number(data.form_digest_interval_days) || FORM_DIGEST_DEFAULTS.intervalDays,
      lastSentAt: asNullableString(data.form_digest_last_sent_at),
    };
  },

  async updateFormDigestSettings(settings: { recipientEmail: string; intervalDays: number }): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("site_settings").upsert(
      {
        id: "default",
        form_digest_recipient_email: settings.recipientEmail,
        form_digest_interval_days: settings.intervalDays,
      },
      { onConflict: "id" },
    );
    if (error) throw error;
  },

  async markFormDigestSent(sentAt: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("site_settings")
      .upsert({ id: "default", form_digest_last_sent_at: sentAt }, { onConflict: "id" });
    if (error) throw error;
  },

  async getLinkPageDescription(): Promise<string> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("site_settings").select("link_page_description").eq("id", "default").single();
    if (error || !data) return "";
    return asString(data.link_page_description);
  },

  async updateLinkPageDescription(description: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("site_settings")
      .upsert({ id: "default", link_page_description: description }, { onConflict: "id" });
    if (error) throw error;
  },
};
