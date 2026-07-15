import { getSupabaseAdmin } from "@/lib/db";
import type {
  Activity,
  ContentBlock,
  ContentStatus,
  FormStatus,
  FormSubmission,
  Page,
  Production,
  ProgressStatus,
  Project,
  Theme,
} from "@/types/cms";
import { asBoolean, asNullableString, asString, asStringArray, type DataRow } from "@/utils/row";
import { parseImageCrop } from "@/utils/imageCrop";

const statusFilter = { status: "published" };

function mapSections(value: unknown) {
  return Array.isArray(value) ? (value as ContentBlock[]) : [];
}

function mapContentBlocks(value: unknown): ContentBlock[] {
  return Array.isArray(value) ? (value as ContentBlock[]) : [];
}

function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url}`;
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
    seoTitle: asNullableString(row.seo_title),
    seoDescription: asNullableString(row.seo_description),
    seoImageId: asNullableString(row.seo_image_id),
    status: asString(row.status, "draft") as ContentStatus,
    updatedAt: asString(row.updated_at),
  };
}

function mapActivity(row: DataRow): Activity {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    format: asString(row.format),
    description: asNullableString(row.description),
    body: asNullableString(row.body),
    date: asNullableString(row.date),
    status: asString(row.status, "draft") as ContentStatus,
    progressStatus: asNullableString(row.progress_status) as ProgressStatus | null,
    gallery: asStringArray(row.gallery),
    documents: asStringArray(row.documents),
    featured: asBoolean(row.featured),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

function mapProduction(row: DataRow): Production {
  const blocks = Array.isArray(row.content_blocks) ? (row.content_blocks as Array<{ type: string }>) : [];
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    type: asString(row.type),
    description: asNullableString(row.description),
    body: asNullableString(row.body),
    contentBlocks: mapContentBlocks(blocks),
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
  };
}

function mapFormSubmission(row: DataRow): FormSubmission {
  return {
    id: asString(row.id),
    formType: asString(row.form_type) as FormSubmission["formType"],
    data: (row.data ?? {}) as Record<string, unknown>,
    status: asString(row.status, "reçu") as FormStatus,
    notes: asNullableString(row.notes),
    receivedAt: asString(row.received_at),
    updatedAt: asString(row.updated_at),
  };
}

function mapProject(row: DataRow): Project {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    category: asNullableString(row.category),
    status: asString(row.status, "draft") as ContentStatus,
    progressStatus: asNullableString(row.progress_status) as ProgressStatus | null,
    priority: asNullableString(row.priority),
    description: asNullableString(row.description),
    body: asNullableString(row.body),
    objectives: asStringArray(row.objectives),
    deliverables: asStringArray(row.deliverables),
    documents: asStringArray(row.documents),
    featured: asBoolean(row.featured),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

function mapTheme(row: DataRow): Theme {
  return {
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
  };
}

export const contentRepository = {
  // ── Pages ────────────────────────────────────────────────────
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
    if (!includeDrafts) query = query.eq("status", statusFilter.status);
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

  // ── Themes ───────────────────────────────────────────────────
  async listThemes(includeDrafts = false): Promise<Theme[]> {
    const db = getSupabaseAdmin();
    let query = db.from("themes").select("*").order("featured", { ascending: false }).order("title");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapTheme);
  },

  async getTheme(slug: string): Promise<Theme | null> {
    const themes = await this.listThemes(true);
    return themes.find((t) => t.slug === slug) ?? null;
  },

  async getThemeById(id: string): Promise<Theme | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("themes").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapTheme(data as DataRow);
  },

  async createTheme(input: Record<string, unknown>): Promise<Theme> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("themes").insert(input).select().single();
    if (error) throw error;
    return mapTheme(data as DataRow);
  },

  async updateTheme(id: string, input: Record<string, unknown>): Promise<Theme> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("themes")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapTheme(data as DataRow);
  },

  // ── Productions ──────────────────────────────────────────────
  async listProductions(includeDrafts = false): Promise<Production[]> {
    const db = getSupabaseAdmin();
    let query = db.from("productions").select("*").order("date", { ascending: false });
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapProduction);
  },

  async getProduction(slug: string): Promise<Production | null> {
    const items = await this.listProductions(true);
    return items.find((i) => i.slug === slug) ?? null;
  },

  async getProductionById(id: string): Promise<Production | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("productions").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapProduction(data as DataRow);
  },

  async createProduction(input: Record<string, unknown>): Promise<Production> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("productions").insert(input).select().single();
    if (error) throw error;
    return mapProduction(data as DataRow);
  },

  async updateProduction(id: string, input: Record<string, unknown>): Promise<Production> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("productions")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapProduction(data as DataRow);
  },

  async deleteProduction(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("productions").delete().eq("id", id);
    if (error) throw error;
  },

  // ── Activities ───────────────────────────────────────────────
  async listActivities(includeDrafts = false): Promise<Activity[]> {
    const db = getSupabaseAdmin();
    let query = db.from("activities").select("*").order("updated_at", { ascending: false });
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapActivity);
  },

  async getActivityById(id: string): Promise<Activity | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("activities").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapActivity(data as DataRow);
  },

  async createActivity(input: Record<string, unknown>): Promise<Activity> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("activities").insert(input).select().single();
    if (error) throw error;
    return mapActivity(data as DataRow);
  },

  async updateActivity(id: string, input: Record<string, unknown>): Promise<Activity> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("activities")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapActivity(data as DataRow);
  },

  async deleteActivity(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("activities").delete().eq("id", id);
    if (error) throw error;
  },

  // ── Projects ─────────────────────────────────────────────────
  async listProjects(includeDrafts = false): Promise<Project[]> {
    const db = getSupabaseAdmin();
    let query = db.from("projects").select("*").order("featured", { ascending: false }).order("title");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapProject);
  },

  async getProjectById(id: string): Promise<Project | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("projects").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapProject(data as DataRow);
  },

  async createProject(input: Record<string, unknown>): Promise<Project> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("projects").insert(input).select().single();
    if (error) throw error;
    return mapProject(data as DataRow);
  },

  async updateProject(id: string, input: Record<string, unknown>): Promise<Project> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("projects")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapProject(data as DataRow);
  },

  async deleteProject(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  // ── Generic status toggle ────────────────────────────────────
  async toggleStatus(
    table: "activities" | "productions" | "projects" | "themes",
    id: string,
    currentStatus: string,
  ): Promise<void> {
    const next = currentStatus === "published" ? "draft" : "published";
    const db = getSupabaseAdmin();
    const { error } = await db.from(table).update({ status: next, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },

  // ── Production ↔ Theme relations ─────────────────────────────
  async getProductionThemeIds(productionId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("theme_productions").select("theme_id").eq("production_id", productionId);
    return (data ?? []).map((r) => String(r.theme_id));
  },

  async setProductionThemes(productionId: string, themeIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("theme_productions").delete().eq("production_id", productionId);
    if (themeIds.length > 0) {
      const rows = themeIds.map((tid) => ({ production_id: productionId, theme_id: tid }));
      const { error } = await db.from("theme_productions").insert(rows);
      if (error) throw error;
    }
  },

  async getProductionsByTheme(themeId: string): Promise<Production[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("theme_productions").select("production_id").eq("theme_id", themeId);
    const ids = (data ?? []).map((r) => String(r.production_id));
    if (ids.length === 0) return [];
    const { data: rows, error } = await db
      .from("productions")
      .select("*")
      .in("id", ids)
      .eq("status", "published")
      .order("date", { ascending: false });
    if (error) throw error;
    return (rows ?? []).map(mapProduction);
  },

  // ── Dashboard metrics ────────────────────────────────────────
  async getMetrics() {
    const db = getSupabaseAdmin();
    const [acts, prods, projs, forms] = await Promise.all([
      db.from("activities").select("id, title, status, date, updated_at").order("updated_at", { ascending: false }),
      db.from("productions").select("id, title, status, updated_at").order("updated_at", { ascending: false }),
      db.from("projects").select("id, title, status, updated_at").order("updated_at", { ascending: false }),
      db
        .from("form_submissions")
        .select("id, form_type, status, received_at, data")
        .order("received_at", { ascending: false }),
    ]);
    return {
      activities: (acts.data ?? []) as Array<{
        id: string;
        title: string;
        status: string;
        date: string | null;
        updated_at: string;
      }>,
      productions: (prods.data ?? []) as Array<{
        id: string;
        title: string;
        status: string;
        updated_at: string;
      }>,
      projects: (projs.data ?? []) as Array<{
        id: string;
        title: string;
        status: string;
        updated_at: string;
      }>,
      forms: (forms.data ?? []) as Array<{
        id: string;
        form_type: string;
        status: string;
        received_at: string;
        data: Record<string, unknown>;
      }>,
    };
  },

  // ── Form submissions ─────────────────────────────────────────
  async listFormSubmissions(): Promise<FormSubmission[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("form_submissions").select("*").order("received_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapFormSubmission);
  },

  async updateFormStatus(id: string, status: FormStatus): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("form_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};
