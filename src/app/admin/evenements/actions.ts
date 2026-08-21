"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eventRepository } from "@/repositories/eventRepository";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { logAction } from "@/lib/audit";
import { slugify } from "@/utils/slug";
import type { EventAnimator } from "@/types/cms";

const speakerSchema = z.object({ name: z.string().min(1), role: z.string().optional() });

const schema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  format: z.string().min(1, "Le format est requis."),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  progressStatus: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
  eventbriteUrl: z.string().optional().nullable(),
  registrationStatus: z.enum(["a-venir", "ouvertes", "complet", "termine", ""]).optional().nullable(),
  description: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  speakers: z.array(speakerSchema).default([]),
  gallery: z.array(z.string()).default([]),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

function toInput(data: z.infer<typeof schema>) {
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
    gallery: data.gallery,
    seo_title: data.seoTitle || null,
    seo_description: data.seoDescription || null,
  };
}

function parseSpeakers(formData: FormData): { name: string; role?: string }[] {
  const raw = (formData.get("speakers") as string | null) ?? "[]";
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => s && typeof s.name === "string" && s.name.trim()) : [];
  } catch {
    return [];
  }
}

function parseIdList(formData: FormData, field: string): string[] {
  return ((formData.get(field) as string | null) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseAnimators(formData: FormData): EventAnimator[] {
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

export async function createEventAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    format: formData.get("format"),
    status: formData.get("status") || "draft",
    progressStatus: formData.get("progressStatus") || null,
    date: formData.get("date") || null,
    startTime: formData.get("startTime") || null,
    endTime: formData.get("endTime") || null,
    location: formData.get("location") || null,
    capacity: formData.get("capacity") || null,
    eventbriteUrl: formData.get("eventbriteUrl") || null,
    registrationStatus: (formData.get("registrationStatus") as string | null) || null,
    description: formData.get("description") || null,
    body: formData.get("body") || null,
    speakers: parseSpeakers(formData),
    gallery: parseIdList(formData, "gallery"),
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  const slug = (formData.get("slug") as string | null)?.trim() || slugify(parsed.data.title);

  let event;
  try {
    event = await eventRepository.createEvent({ slug, ...toInput(parsed.data) });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

  const themeIds = parseIdList(formData, "themeIds");
  if (themeIds.length > 0) await eventRepository.setEventThemes(event.id, themeIds);
  const subThemeIds = parseIdList(formData, "subThemeIds");
  if (subThemeIds.length > 0) await eventRepository.setEventSubThemes(event.id, subThemeIds);
  const projectIds = parseIdList(formData, "projectIds");
  if (projectIds.length > 0) await eventRepository.setEventProjects(event.id, projectIds);
  const formatIds = parseIdList(formData, "formatIds");
  if (formatIds.length > 0) await activityFormatRepository.setActivityFormats(event.id, formatIds);
  const animators = parseAnimators(formData);
  if (animators.length > 0) await authorRepository.setEventAnimators(event.id, animators);

  await logAction("create", { entityType: "event", summary: `Événement créé : ${parsed.data.title}` });
  revalidatePath("/admin/evenements");
  redirect("/admin/evenements");
}

export async function updateEventAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = schema.safeParse({
    title: formData.get("title"),
    format: formData.get("format"),
    status: formData.get("status") || "draft",
    progressStatus: formData.get("progressStatus") || null,
    date: formData.get("date") || null,
    startTime: formData.get("startTime") || null,
    endTime: formData.get("endTime") || null,
    location: formData.get("location") || null,
    capacity: formData.get("capacity") || null,
    eventbriteUrl: formData.get("eventbriteUrl") || null,
    registrationStatus: (formData.get("registrationStatus") as string | null) || null,
    description: formData.get("description") || null,
    body: formData.get("body") || null,
    speakers: parseSpeakers(formData),
    gallery: parseIdList(formData, "gallery"),
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  try {
    await eventRepository.updateEvent(id, toInput(parsed.data));
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

  await eventRepository.setEventThemes(id, parseIdList(formData, "themeIds"));
  await eventRepository.setEventSubThemes(id, parseIdList(formData, "subThemeIds"));
  await eventRepository.setEventProjects(id, parseIdList(formData, "projectIds"));
  await activityFormatRepository.setActivityFormats(id, parseIdList(formData, "formatIds"));
  await authorRepository.setEventAnimators(id, parseAnimators(formData));

  await logAction("update", {
    entityType: "event",
    entityId: id,
    summary: `Événement modifié : ${parsed.data.title}`,
  });
  revalidatePath("/admin/evenements");
  redirect("/admin/evenements");
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await eventRepository.deleteEvent(id);
  await logAction("delete", { entityType: "event", entityId: id, summary: "Événement supprimé" });
  revalidatePath("/admin/evenements");
}

export async function toggleEventStatusAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const status = (formData.get("status") as string | null)?.trim();
  if (!id || !status) return;
  await eventRepository.toggleStatus(id, status);
  revalidatePath("/admin/evenements");
}

export async function toggleEventFeaturedAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const featured = formData.get("featured") === "true";
  if (!id) return;
  // Garde-fou : maximum 2 événements en vedette sur l'accueil.
  if (featured) {
    const all = await eventRepository.listEvents(true);
    const count = all.filter((e) => e.featured).length;
    if (count >= 2) return;
  }
  await eventRepository.updateEvent(id, { featured });
  revalidatePath("/admin/evenements");
  revalidatePath("/");
}
