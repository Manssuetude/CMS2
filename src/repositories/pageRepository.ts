import { getSupabaseAdmin } from "@/lib/db";
import type { ContentBlock, ContentStatus, ImpactStat, Page, PercaStep } from "@/types/cms";
import { asNullableString, asRecordArray, asString, asStringArray, type DataRow } from "@/utils/row";
import { parseImageCrop } from "@/utils/imageCrop";
import { normalizeUrl } from "@/repositories/mediaRepository";

function mapSections(value: unknown): ContentBlock[] {
  return Array.isArray(value) ? (value as ContentBlock[]) : [];
}

function mapPercaSteps(value: unknown): PercaStep[] {
  return asRecordArray(value).map((row) => ({
    letter: asString(row.letter),
    word: asString(row.word),
    title: asNullableString(row.title),
    body: asNullableString(row.body),
  }));
}

function mapImpactStats(value: unknown): ImpactStat[] {
  return asRecordArray(value).map((row) => ({ label: asString(row.label), value: asString(row.value) }));
}

function mapPage(row: DataRow): Page {
  const imageResource = (row.image_resource as { url?: string } | null) ?? null;
  const focusImageResource = (row.focus_image_resource as { url?: string } | null) ?? null;
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    eyebrow: asNullableString(row.eyebrow),
    body: asNullableString(row.body),
    imageId: asNullableString(row.image_id),
    imageUrl: normalizeUrl(imageResource?.url),
    imageCrop: parseImageCrop(row.image_crop),
    focusImageUrl: normalizeUrl(focusImageResource?.url),
    focusImageCrop: parseImageCrop(row.focus_image_crop),
    quote: asNullableString(row.quote),
    primaryCtaLabel: asNullableString(row.primary_cta_label),
    primaryCtaTarget: asNullableString(row.primary_cta_target),
    secondaryCtaLabel: asNullableString(row.secondary_cta_label),
    secondaryCtaTarget: asNullableString(row.secondary_cta_target),
    sections: mapSections(row.sections),
    percaSteps: mapPercaSteps(row.perca_steps),
    impactStats: mapImpactStats(row.impact_stats),
    featuredDossierIds: asStringArray(row.featured_dossier_ids),
    seoTitle: asNullableString(row.seo_title),
    seoDescription: asNullableString(row.seo_description),
    seoImageId: asNullableString(row.seo_image_id),
    status: asString(row.status, "draft") as ContentStatus,
    updatedAt: asString(row.updated_at),
  };
}

export const pageRepository = {
  async getPage(slug: string) {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("pages")
      .select("*, image_resource:resources!image_id(url), focus_image_resource:resources!seo_image_id(url)")
      .eq("slug", slug)
      .single();
    if (error) return null;
    return mapPage(data);
  },

  async listPages(includeDrafts = false) {
    const db = getSupabaseAdmin();
    let query = db
      .from("pages")
      .select("*, image_resource:resources!image_id(url), focus_image_resource:resources!seo_image_id(url)")
      .order("slug");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapPage);
  },

  async updatePage(slug: string, fields: Record<string, unknown>) {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("pages")
      .update({ ...fields, status: "published", updated_at: new Date().toISOString() })
      .eq("slug", slug);
    if (error) throw error;
  },

  async upsertPage(payload: Record<string, unknown>) {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("pages").upsert(payload, { onConflict: "slug" }).select().single();
    if (error) throw error;
    return data;
  },

  async updatePageSections(slug: string, sections: unknown[]) {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("pages")
      .update({ sections, status: "published", updated_at: new Date().toISOString() })
      .eq("slug", slug);
    if (error) throw error;
  },
};
