"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { activityRepository } from "@/repositories/activityRepository";
import { logAction } from "@/lib/audit";
import { slugify } from "@/utils/slug";

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

export async function createActivityAction(_: string | null, formData: FormData): Promise<string | null> {
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
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  const slug = (formData.get("slug") as string | null)?.trim() || slugify(parsed.data.title);

  let activity;
  try {
    activity = await activityRepository.createActivity({ slug, ...toInput(parsed.data) });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

  const themeIds = parseIdList(formData, "themeIds");
  if (themeIds.length > 0) await activityRepository.setActivityThemes(activity.id, themeIds);
  const projectIds = parseIdList(formData, "projectIds");
  if (projectIds.length > 0) await activityRepository.setActivityProjects(activity.id, projectIds);

  await logAction("create", { entityType: "activity", summary: `Activité créée : ${parsed.data.title}` });
  revalidatePath("/admin/activites");
  redirect("/admin/activites");
}

export async function updateActivityAction(_: string | null, formData: FormData): Promise<string | null> {
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
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  try {
    await activityRepository.updateActivity(id, toInput(parsed.data));
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

  await activityRepository.setActivityThemes(id, parseIdList(formData, "themeIds"));
  await activityRepository.setActivityProjects(id, parseIdList(formData, "projectIds"));

  await logAction("update", {
    entityType: "activity",
    entityId: id,
    summary: `Activité modifiée : ${parsed.data.title}`,
  });
  revalidatePath("/admin/activites");
  redirect("/admin/activites");
}

export async function deleteActivityAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await activityRepository.deleteActivity(id);
  await logAction("delete", { entityType: "activity", entityId: id, summary: "Activité supprimée" });
  revalidatePath("/admin/activites");
}

export async function toggleActivityStatusAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const status = (formData.get("status") as string | null)?.trim();
  if (!id || !status) return;
  await activityRepository.toggleStatus(id, status);
  revalidatePath("/admin/activites");
}

export async function toggleActivityFeaturedAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const featured = formData.get("featured") === "true";
  if (!id) return;
  // Garde-fou : maximum 3 activités en vedette sur l'accueil.
  if (featured) {
    const all = await activityRepository.listActivities(true);
    const count = all.filter((a) => a.featured).length;
    if (count >= 3) return;
  }
  await activityRepository.updateActivity(id, { featured });
  revalidatePath("/admin/activites");
  revalidatePath("/");
}
