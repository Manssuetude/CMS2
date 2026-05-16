import { getSupabaseAdmin } from "@/lib/db";
import type {
  Activity,
  ContentBlock,
  ContentStatus,
  Page,
  Production,
  ProgressStatus,
  Project,
  Theme,
} from "@/types/cms";
import { asBoolean, asNullableString, asString, asStringArray, type DataRow } from "@/utils/row";

const statusFilter = { status: "published" };

function mapSections(value: unknown) {
  return Array.isArray(value) ? (value as ContentBlock[]) : [];
}

function mapContentBlocks(value: unknown): ContentBlock[] {
  return Array.isArray(value) ? (value as ContentBlock[]) : [];
}

function mapPage(row: DataRow): Page {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    eyebrow: asNullableString(row.eyebrow),
    body: asNullableString(row.body),
    imageId: asNullableString(row.image_id),
    quote: asNullableString(row.quote),
    primaryCtaLabel: asNullableString(row.primary_cta_label),
    primaryCtaTarget: asNullableString(row.primary_cta_target),
    secondaryCtaLabel: asNullableString(row.secondary_cta_label),
    secondaryCtaTarget: asNullableString(row.secondary_cta_target),
    sections: mapSections(row.sections),
    seoTitle: asNullableString(row.seo_title),
    seoDescription: asNullableString(row.seo_description),
    seoImageId: asNullableString(row.seo_image_id),
    status: asString(row.status, "draft") as ContentStatus,
    updatedAt: asString(row.updated_at),
  };
}

export const contentRepository = {
  async getPage(slug: string) {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("pages").select("*").eq("slug", slug).single();
    if (error) return null;
    return mapPage(data);
  },

  async listPages(includeDrafts = false) {
    const db = getSupabaseAdmin();
    let query = db.from("pages").select("*").order("slug");
    if (!includeDrafts) query = query.eq("status", statusFilter.status);
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapPage);
  },

  async listThemes(includeDrafts = false): Promise<Theme[]> {
    const db = getSupabaseAdmin();
    let query = db.from("themes").select("*").order("featured", { ascending: false }).order("title");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(
      (row): Theme => ({
        id: asString(row.id),
        slug: asString(row.slug),
        title: asString(row.title),
        shortTitle: asNullableString(row.short_title),
        description: asNullableString(row.description),
        longDescription: asNullableString(row.long_description),
        heroImageId: asNullableString(row.hero_image_id),
        thumbnailId: asNullableString(row.thumbnail_id),
        status: asString(row.status, "draft") as ContentStatus,
        progressStatus: asNullableString(row.progress_status) as ProgressStatus | null,
        featured: asBoolean(row.featured),
        tags: asStringArray(row.tags),
        createdAt: asString(row.created_at),
        updatedAt: asString(row.updated_at),
      }),
    );
  },

  async getTheme(slug: string) {
    const themes = await this.listThemes(true);
    return themes.find((theme) => theme.slug === slug) || null;
  },

  async listProductions(includeDrafts = false): Promise<Production[]> {
    const db = getSupabaseAdmin();
    let query = db.from("productions").select("*").order("date", { ascending: false });
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(
      (row): Production => ({
        id: asString(row.id),
        slug: asString(row.slug),
        title: asString(row.title),
        type: asString(row.type),
        description: asNullableString(row.description),
        contentBlocks: mapContentBlocks(row.content_blocks),
        author: asNullableString(row.author),
        date: asNullableString(row.date),
        thumbnailId: asNullableString(row.thumbnail_id),
        fileId: asNullableString(row.file_id),
        readingTime: asNullableString(row.reading_time),
        pages: asNullableString(row.pages),
        tags: asStringArray(row.tags),
        status: asString(row.status, "draft") as ContentStatus,
        featured: asBoolean(row.featured),
        createdAt: asString(row.created_at),
        updatedAt: asString(row.updated_at),
      }),
    );
  },

  async getProduction(slug: string) {
    const items = await this.listProductions(true);
    return items.find((item) => item.slug === slug) || null;
  },

  async listActivities(includeDrafts = false): Promise<Activity[]> {
    const db = getSupabaseAdmin();
    let query = db.from("activities").select("*").order("updated_at", { ascending: false });
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(
      (row): Activity => ({
        id: asString(row.id),
        slug: asString(row.slug),
        title: asString(row.title),
        format: asString(row.format),
        description: asNullableString(row.description),
        date: asNullableString(row.date),
        status: asString(row.status, "draft") as ContentStatus,
        progressStatus: asNullableString(row.progress_status) as ProgressStatus | null,
        gallery: asStringArray(row.gallery),
        documents: asStringArray(row.documents),
        createdAt: asString(row.created_at),
        updatedAt: asString(row.updated_at),
      }),
    );
  },

  async listProjects(includeDrafts = false): Promise<Project[]> {
    const db = getSupabaseAdmin();
    let query = db.from("projects").select("*").order("featured", { ascending: false }).order("title");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(
      (row): Project => ({
        id: asString(row.id),
        slug: asString(row.slug),
        title: asString(row.title),
        category: asNullableString(row.category),
        status: asString(row.status, "draft") as ContentStatus,
        progressStatus: asNullableString(row.progress_status) as ProgressStatus | null,
        priority: asNullableString(row.priority),
        description: asNullableString(row.description),
        objectives: asStringArray(row.objectives),
        deliverables: asStringArray(row.deliverables),
        documents: asStringArray(row.documents),
        featured: asBoolean(row.featured),
        createdAt: asString(row.created_at),
        updatedAt: asString(row.updated_at),
      }),
    );
  },

  async upsertPage(payload: Record<string, unknown>) {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("pages").upsert(payload, { onConflict: "slug" }).select().single();
    if (error) throw error;
    return data;
  },
};
