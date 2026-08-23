"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { mediaRepository } from "@/repositories/mediaRepository";
import { parseTags } from "@/utils/tags";

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await mediaRepository.remove(id);
  revalidatePath("/admin/media");
}

export async function renameMediaAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const title = (formData.get("title") as string | null)?.trim();
  if (!id || !title) return;
  await mediaRepository.updateMetadata(id, { title });
  revalidatePath("/admin/media");
}

const updateSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  author: z.string().optional().nullable(),
  institution: z.string().optional().nullable(),
  publishedDate: z.string().optional().nullable(),
  themeId: z.string().optional().nullable(),
  alt: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  visibility: z.enum(["draft", "public", "private"]).default("draft"),
});

export async function updateMediaMetadataAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = updateSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author") || null,
    institution: formData.get("institution") || null,
    publishedDate: formData.get("publishedDate") || null,
    themeId: formData.get("themeId") || null,
    alt: formData.get("alt") || null,
    caption: formData.get("caption") || null,
    description: formData.get("description") || null,
    tags: formData.get("tags") || null,
    visibility: formData.get("visibility") || "draft",
  });
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  try {
    await mediaRepository.updateMetadata(id, {
      title: parsed.data.title,
      author: parsed.data.author || null,
      institution: parsed.data.institution || null,
      published_date: parsed.data.publishedDate || null,
      theme_id: parsed.data.themeId || null,
      alt: parsed.data.alt || null,
      caption: parsed.data.caption || null,
      description: parsed.data.description || null,
      tags: parseTags(parsed.data.tags ?? ""),
      visibility: parsed.data.visibility,
    });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }

  revalidatePath("/admin/media");
  redirect("/admin/media");
}
