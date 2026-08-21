"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { journalRepository } from "@/repositories/journalRepository";
import { logAction } from "@/lib/audit";
import { slugify } from "@/utils/slug";

const schema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  category: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  thumbnailId: z.string().optional().nullable(),
  themeId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  eventId: z.string().optional().nullable(),
  productionId: z.string().optional().nullable(),
  featured: z.boolean().default(false),
});

function toInput(data: z.infer<typeof schema>) {
  return {
    title: data.title,
    status: data.status,
    category: data.category || null,
    author_id: data.authorId || null,
    date: data.date || null,
    excerpt: data.excerpt || null,
    body: data.body || null,
    thumbnail_id: data.thumbnailId || null,
    theme_id: data.themeId || null,
    project_id: data.projectId || null,
    event_id: data.eventId || null,
    production_id: data.productionId || null,
    featured: data.featured,
  };
}

function fromForm(formData: FormData) {
  return {
    title: formData.get("title"),
    status: formData.get("status") || "draft",
    category: formData.get("category") || null,
    authorId: formData.get("authorId") || null,
    date: formData.get("date") || null,
    excerpt: formData.get("excerpt") || null,
    body: formData.get("body") || null,
    thumbnailId: formData.get("thumbnailId") || null,
    themeId: formData.get("themeId") || null,
    projectId: formData.get("projectId") || null,
    eventId: formData.get("eventId") || null,
    productionId: formData.get("productionId") || null,
    featured: formData.get("featured") === "on",
  };
}

export async function createJournalEntryAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = schema.safeParse(fromForm(formData));
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  const slug = (formData.get("slug") as string | null)?.trim() || slugify(parsed.data.title);

  let entry;
  try {
    entry = await journalRepository.createEntry({ slug, ...toInput(parsed.data) });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }

  await logAction("create", {
    entityType: "journal_entry",
    entityId: entry.id,
    summary: `Entrée créée : ${entry.title}`,
  });
  revalidatePath("/admin/journal");
  redirect("/admin/journal");
}

export async function updateJournalEntryAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = schema.safeParse(fromForm(formData));
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  try {
    await journalRepository.updateEntry(id, toInput(parsed.data));
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }

  await logAction("update", {
    entityType: "journal_entry",
    entityId: id,
    summary: `Entrée modifiée : ${parsed.data.title}`,
  });
  revalidatePath("/admin/journal");
  redirect("/admin/journal");
}

export async function deleteJournalEntryAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await journalRepository.deleteEntry(id);
  await logAction("delete", { entityType: "journal_entry", entityId: id, summary: "Entrée supprimée" });
  revalidatePath("/admin/journal");
}

export async function toggleJournalEntryStatusAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const status = (formData.get("status") as string | null)?.trim();
  if (!id || !status) return;
  await journalRepository.toggleStatus(id, status);
  revalidatePath("/admin/journal");
}
