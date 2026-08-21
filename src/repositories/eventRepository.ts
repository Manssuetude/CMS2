import { getSupabaseAdmin } from "@/lib/db";
import type { Event, ContentStatus, ProgressStatus, RegistrationStatus, Speaker } from "@/types/cms";
import { asBoolean, asNullableString, asRecordArray, asString, asStringArray, type DataRow } from "@/utils/row";

function mapSpeaker(row: Record<string, unknown>): Speaker {
  return { name: asString(row.name), role: asNullableString(row.role) ?? undefined };
}

function mapEvent(row: DataRow): Event {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    format: asString(row.format),
    description: asNullableString(row.description),
    body: asNullableString(row.body),
    date: asNullableString(row.date),
    startTime: asNullableString(row.start_time),
    endTime: asNullableString(row.end_time),
    location: asNullableString(row.location),
    capacity: asNullableString(row.capacity),
    eventbriteUrl: asNullableString(row.eventbrite_url),
    registrationStatus: asNullableString(row.registration_status) as RegistrationStatus | null,
    status: asString(row.status, "draft") as ContentStatus,
    progressStatus: asNullableString(row.progress_status) as ProgressStatus | null,
    gallery: asStringArray(row.gallery),
    documents: asStringArray(row.documents),
    speakers: asRecordArray(row.speakers).map(mapSpeaker),
    featured: asBoolean(row.featured),
    seoTitle: asNullableString(row.seo_title),
    seoDescription: asNullableString(row.seo_description),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const eventRepository = {
  async listEvents(includeDrafts = false): Promise<Event[]> {
    const db = getSupabaseAdmin();
    let query = db.from("events").select("*").order("updated_at", { ascending: false });
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapEvent);
  },

  async getEventById(id: string): Promise<Event | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("events").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapEvent(data as DataRow);
  },

  async createEvent(input: Record<string, unknown>): Promise<Event> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("events").insert(input).select().single();
    if (error) throw error;
    return mapEvent(data as DataRow);
  },

  async updateEvent(id: string, input: Record<string, unknown>): Promise<Event> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("events")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapEvent(data as DataRow);
  },

  async deleteEvent(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("events").delete().eq("id", id);
    if (error) throw error;
  },

  async toggleStatus(id: string, currentStatus: string): Promise<void> {
    const next = currentStatus === "published" ? "draft" : "published";
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("events")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  // ── Événement ↔ Thèmes (many-to-many) ────────────────────────────────
  async getEventThemeIds(eventId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("theme_events").select("theme_id").eq("event_id", eventId);
    return (data ?? []).map((r) => String(r.theme_id));
  },

  async setEventThemes(eventId: string, themeIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("theme_events").delete().eq("event_id", eventId);
    if (themeIds.length > 0) {
      const rows = themeIds.map((themeId) => ({ event_id: eventId, theme_id: themeId }));
      const { error } = await db.from("theme_events").insert(rows);
      if (error) throw error;
    }
  },

  async getEventsByTheme(themeId: string): Promise<Event[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("theme_events").select("event_id").eq("theme_id", themeId);
    const ids = (data ?? []).map((r) => String(r.event_id));
    if (ids.length === 0) return [];
    const { data: rows, error } = await db
      .from("events")
      .select("*")
      .in("id", ids)
      .eq("status", "published")
      .order("date", { ascending: false });
    if (error) throw error;
    return (rows ?? []).map(mapEvent);
  },

  // ── Événement ↔ Sous-thèmes (many-to-many) ───────────────────────────
  async getEventSubThemeIds(eventId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("sub_theme_events").select("sub_theme_id").eq("event_id", eventId);
    return (data ?? []).map((r) => String(r.sub_theme_id));
  },

  async setEventSubThemes(eventId: string, subThemeIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("sub_theme_events").delete().eq("event_id", eventId);
    if (subThemeIds.length > 0) {
      const rows = subThemeIds.map((subThemeId) => ({ event_id: eventId, sub_theme_id: subThemeId }));
      const { error } = await db.from("sub_theme_events").insert(rows);
      if (error) throw error;
    }
  },

  // ── Événement ↔ Projets (many-to-many) ───────────────────────────────
  async getEventProjectIds(eventId: string): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("project_events").select("project_id").eq("event_id", eventId);
    return (data ?? []).map((r) => String(r.project_id));
  },

  async setEventProjects(eventId: string, projectIds: string[]): Promise<void> {
    const db = getSupabaseAdmin();
    await db.from("project_events").delete().eq("event_id", eventId);
    if (projectIds.length > 0) {
      const rows = projectIds.map((projectId) => ({ event_id: eventId, project_id: projectId }));
      const { error } = await db.from("project_events").insert(rows);
      if (error) throw error;
    }
  },

  async getEventsByProject(projectId: string): Promise<Event[]> {
    const db = getSupabaseAdmin();
    const { data } = await db.from("project_events").select("event_id").eq("project_id", projectId);
    const ids = (data ?? []).map((r) => String(r.event_id));
    if (ids.length === 0) return [];
    const { data: rows, error } = await db
      .from("events")
      .select("*")
      .in("id", ids)
      .eq("status", "published")
      .order("date", { ascending: false });
    if (error) throw error;
    return (rows ?? []).map(mapEvent);
  },
};
