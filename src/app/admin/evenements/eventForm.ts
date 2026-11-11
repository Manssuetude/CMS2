import { z } from "zod";
import type { EventAnimator } from "@/types/cms";

// Schéma et lecture du formulaire événement — partagés par les actions de
// création/mise à jour (actions.ts) et par l'aperçu (renderEventPreview), pour
// que l'aperçu valide exactement les mêmes données que l'enregistrement.

const speakerSchema = z.object({ name: z.string().min(1), role: z.string().optional() });

export const eventFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  format: z.string().min(1, "Le format est requis."),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  progressStatus: z.string().optional().nullable(),
  date: z.string(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
  eventbriteUrl: z.string().optional().nullable(),
  registrationStatus: z.enum(["a-venir", "ouvertes", "complet", "termine", ""]).optional().nullable(),
  description: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  speakers: z.array(speakerSchema).default([]),
  posterId: z.string().uuid().optional().nullable(),
  headerStyle: z.enum(["classic", "banner"]).default("classic"),
  gallery: z.array(z.string()).default([]),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export function toEventInput(data: EventFormData) {
  return {
    title: data.title,
    format: data.format,
    status: data.status,
    progress_status: data.progressStatus || null,
    date: data.date || null,
    start_time: data.startTime || null,
    end_time: data.endTime || null,
    location: data.location || null,
    capacity: data.capacity || null,
    eventbrite_url: data.eventbriteUrl || null,
    registration_status: data.registrationStatus || null,
    description: data.description || null,
    body: data.body || null,
    speakers: data.speakers,
    poster_id: data.posterId || null,
    header_style: data.headerStyle,
    gallery: data.gallery,
    seo_title: data.seoTitle || null,
    seo_description: data.seoDescription || null,
  };
}

export function parseSpeakers(formData: FormData): { name: string; role?: string }[] {
  const raw = (formData.get("speakers") as string | null) ?? "[]";
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => s && typeof s.name === "string" && s.name.trim()) : [];
  } catch {
    return [];
  }
}

export function parseIdList(formData: FormData, field: string): string[] {
  return ((formData.get(field) as string | null) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseAnimators(formData: FormData): EventAnimator[] {
  const raw = (formData.get("animators") as string | null) ?? "[]";
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((a) => a && typeof a.authorId === "string" && a.authorId.trim())
      .map((a) => ({
        authorId: a.authorId,
        contribution: typeof a.contribution === "string" && a.contribution.trim() ? a.contribution.trim() : null,
      }));
  } catch {
    return [];
  }
}

export type EventFormData = z.infer<typeof eventFormSchema>;

// Objet brut à valider avec eventFormSchema, lu depuis le FormData du formulaire.
export function readEventForm(formData: FormData) {
  return {
    title: formData.get("title"),
    format: formData.get("format"),
    status: formData.get("status") || "draft",
    progressStatus: formData.get("progressStatus") || null,
    date: formData.get("date") || "",
    startTime: formData.get("startTime") || null,
    endTime: formData.get("endTime") || null,
    location: formData.get("location") || null,
    capacity: formData.get("capacity") || null,
    eventbriteUrl: formData.get("eventbriteUrl") || null,
    registrationStatus: (formData.get("registrationStatus") as string | null) || null,
    description: formData.get("description") || null,
    body: formData.get("body") || null,
    speakers: parseSpeakers(formData),
    posterId: (formData.get("posterId") as string | null) || null,
    headerStyle: (formData.get("headerStyle") as string | null) || "classic",
    gallery: parseIdList(formData, "gallery"),
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
  };
}
