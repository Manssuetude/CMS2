"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eventRepository } from "@/repositories/eventRepository";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { logAction } from "@/lib/audit";
import { slugify } from "@/utils/slug";
import { eventFormSchema, parseAnimators, parseIdList, readEventForm, toEventInput } from "./eventForm";

export async function createEventAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = eventFormSchema.safeParse(readEventForm(formData));

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  const slug = (formData.get("slug") as string | null)?.trim() || slugify(parsed.data.title);

  let event;
  try {
    event = await eventRepository.createEvent({ slug, ...toEventInput(parsed.data) });
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

  const parsed = eventFormSchema.safeParse(readEventForm(formData));

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  try {
    // Le lien (slug) suit le titre tant que l'événement est encore en
    // brouillon — se fige dès la première publication.
    const current = await eventRepository.getEventById(id);
    const input = toEventInput(parsed.data);
    const slugSync = current?.status === "draft" ? { slug: slugify(parsed.data.title) } : {};
    await eventRepository.updateEvent(id, { ...input, ...slugSync });
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
