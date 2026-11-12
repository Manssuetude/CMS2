import { getSupabaseAdmin } from "@/lib/db";
import type { Announcement } from "@/types/cms";
import type { AnnouncementInput } from "@/utils/announcements";
import { parseImageCrop } from "@/utils/imageCrop";
import { asBoolean, asNullablePositiveInt, asNullableString, asString, type DataRow } from "@/utils/row";
import { normalizeUrl } from "@/repositories/mediaRepository";

// Accès données de la table `announcements` (aucune règle métier : la
// sélection de l'annonce en ligne vit dans announcementService).

const SELECT = "*, image_resource:resources!image_id(url,alt,width,height)";

function mapAnnouncement(row: DataRow): Announcement {
  const image =
    (row.image_resource as { url?: string; alt?: string | null; width?: unknown; height?: unknown } | null) ?? null;
  const s = (key: string) => asNullableString(row[key]);
  return {
    id: asString(row.id),
    name: asString(row.name),
    enabled: asBoolean(row.enabled),
    startsAt: s("starts_at"),
    endsAt: s("ends_at"),
    bannerEnabled: asBoolean(row.banner_enabled, true),
    bannerLabel: s("banner_label"),
    bannerText: s("banner_text"),
    bannerLinkLabel: s("banner_link_label"),
    bannerLinkUrl: s("banner_link_url"),
    heroEnabled: asBoolean(row.hero_enabled, true),
    eyebrow: s("eyebrow"),
    title: s("title"),
    titleAccent: s("title_accent"),
    subtitle: s("subtitle"),
    imageId: s("image_id"),
    imageUrl: normalizeUrl(image?.url),
    imageAlt: image?.alt ?? null,
    imageWidth: asNullablePositiveInt(image?.width),
    imageHeight: asNullablePositiveInt(image?.height),
    imageCrop: parseImageCrop(row.image_crop),
    primaryCtaLabel: s("primary_cta_label"),
    primaryCtaUrl: s("primary_cta_url"),
    secondaryCtaLabel: s("secondary_cta_label"),
    secondaryCtaUrl: s("secondary_cta_url"),
    periodLabel: s("period_label"),
    showDeadline: asBoolean(row.show_deadline, true),
    showKeyFigures: asBoolean(row.show_key_figures, true),
    finalEnabled: asBoolean(row.final_enabled, true),
    finalEyebrow: s("final_eyebrow"),
    finalTitle: s("final_title"),
    finalText: s("final_text"),
    finalCtaLabel: s("final_cta_label"),
    finalCtaUrl: s("final_cta_url"),
    headerBadge: s("header_badge"),
    appliesToJoinPage: asBoolean(row.applies_to_join_page),
    seoTitle: s("seo_title"),
    seoDescription: s("seo_description"),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

function toRow(input: AnnouncementInput): Record<string, unknown> {
  return {
    name: input.name,
    enabled: input.enabled,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    banner_enabled: input.bannerEnabled,
    banner_label: input.bannerLabel,
    banner_text: input.bannerText,
    banner_link_label: input.bannerLinkLabel,
    banner_link_url: input.bannerLinkUrl,
    hero_enabled: input.heroEnabled,
    eyebrow: input.eyebrow,
    title: input.title,
    title_accent: input.titleAccent,
    subtitle: input.subtitle,
    image_id: input.imageId,
    image_crop: input.imageCrop,
    primary_cta_label: input.primaryCtaLabel,
    primary_cta_url: input.primaryCtaUrl,
    secondary_cta_label: input.secondaryCtaLabel,
    secondary_cta_url: input.secondaryCtaUrl,
    period_label: input.periodLabel,
    show_deadline: input.showDeadline,
    show_key_figures: input.showKeyFigures,
    final_enabled: input.finalEnabled,
    final_eyebrow: input.finalEyebrow,
    final_title: input.finalTitle,
    final_text: input.finalText,
    final_cta_label: input.finalCtaLabel,
    final_cta_url: input.finalCtaUrl,
    header_badge: input.headerBadge,
    applies_to_join_page: input.appliesToJoinPage,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
  };
}

export const announcementRepository = {
  async list(): Promise<Announcement[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("announcements")
      .select(SELECT)
      .order("starts_at", { ascending: false, nullsFirst: true });
    if (error) throw error;
    return (data as DataRow[]).map(mapAnnouncement);
  },

  // Annonces activées dont la période englobe `nowIso` (candidates « en ligne »).
  async listActiveAt(nowIso: string): Promise<Announcement[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("announcements")
      .select(SELECT)
      .eq("enabled", true)
      .lte("starts_at", nowIso)
      .gt("ends_at", nowIso);
    if (error) throw error;
    return (data as DataRow[]).map(mapAnnouncement);
  },

  async getById(id: string): Promise<Announcement | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("announcements").select(SELECT).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapAnnouncement(data as DataRow) : null;
  },

  async create(input: AnnouncementInput): Promise<Announcement> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("announcements").insert(toRow(input)).select(SELECT).single();
    if (error) throw error;
    return mapAnnouncement(data as DataRow);
  },

  async update(id: string, input: AnnouncementInput): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("announcements")
      .update({ ...toRow(input), updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("announcements").delete().eq("id", id);
    if (error) throw error;
  },
};
