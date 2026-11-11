"use server";

import type { ReactNode } from "react";
import { requirePermission } from "@/lib/auth";
import { eventRepository } from "@/repositories/eventRepository";
import { buildEventPageProps } from "@/services/eventPageService";
import { EvenementDetail } from "@/components/public/EvenementDetail";
import type { Event } from "@/types/cms";
import { slugify } from "@/utils/slug";
import { toHeaderStyle } from "@/utils/eventHeader";
import { eventFormSchema, parseAnimators, parseIdList, readEventForm } from "./eventForm";

export type EventPreviewResult = { ok: true; node: ReactNode } | { ok: false; error: string };

// Aperçu de la page événement avec les valeurs du formulaire, même non
// enregistrées. Même schéma de validation que l'enregistrement, mêmes
// composants que la page publique. LECTURE SEULE : aucune écriture en base.
export async function renderEventPreview(entries: Record<string, string>): Promise<EventPreviewResult> {
  await requirePermission("evenements:edit");

  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) formData.set(key, value);

  const parsed = eventFormSchema.safeParse(readEventForm(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Données invalides." };
  const data = parsed.data;

  // Événement existant : on conserve ce que le formulaire ne modifie pas.
  const id = entries.id?.trim() || "";
  const existing = id ? await eventRepository.getEventById(id) : null;
  const now = new Date().toISOString();

  const item: Event = {
    id: id || "apercu",
    slug: existing?.slug || entries.slug?.trim() || slugify(data.title) || "apercu",
    title: data.title,
    format: data.format,
    description: data.description || null,
    body: data.body || null,
    date: data.date || null,
    startTime: data.startTime || null,
    endTime: data.endTime || null,
    location: data.location || null,
    capacity: data.capacity || null,
    eventbriteUrl: data.eventbriteUrl || null,
    registrationStatus: data.registrationStatus || null,
    status: data.status,
    progressStatus: (data.progressStatus || null) as Event["progressStatus"],
    posterId: data.posterId || null,
    headerStyle: toHeaderStyle(data.headerStyle),
    gallery: data.gallery,
    documents: existing?.documents ?? [],
    speakers: data.speakers,
    featured: existing?.featured ?? false,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const props = await buildEventPageProps(item, {
    formatIds: parseIdList(formData, "formatIds"),
    themeIds: parseIdList(formData, "themeIds"),
    subThemeIds: parseIdList(formData, "subThemeIds"),
    animators: parseAnimators(formData),
  });
  return { ok: true, node: <EvenementDetail {...props} /> };
}
