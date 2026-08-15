"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { contentRepository } from "@/repositories/contentRepository";
import { logAction } from "@/lib/audit";

const updateSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  themeId: z.string().min(1, "Le thème parent est requis."),
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

const createSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  slug: z
    .string()
    .min(1, "L'identifiant est requis.")
    .regex(/^[a-z0-9-]+$/, "Identifiant invalide (minuscules, chiffres, tirets)."),
  themeId: z.string().min(1, "Le thème parent est requis."),
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export async function createSubThemeAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = createSchema.safeParse({
    title: formData.get("title") || "",
    slug: formData.get("slug") || "",
    themeId: formData.get("themeId") || "",
    description: formData.get("description") || null,
    longDescription: formData.get("longDescription") || null,
    date: formData.get("date") || null,
    status: formData.get("status") || "draft",
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  let subTheme;
  try {
    subTheme = await contentRepository.createSubTheme({
      title: parsed.data.title,
      slug: parsed.data.slug,
      theme_id: parsed.data.themeId,
      description: parsed.data.description ?? null,
      long_description: parsed.data.longDescription ?? null,
      date: parsed.data.date || null,
      status: parsed.data.status,
    });
  } catch {
    return "Erreur lors de la création. Vérifiez que l'identifiant n'existe pas déjà.";
  }

  await logAction("create", {
    entityType: "sub_theme",
    entityId: subTheme.id,
    summary: `Sous-thème créé : ${parsed.data.title}`,
  });
  revalidatePath("/admin/sousthemes");
  redirect("/admin/sousthemes");
}

export async function updateSubThemeAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = updateSchema.safeParse({
    title: formData.get("title") || "",
    themeId: formData.get("themeId") || "",
    description: formData.get("description") || null,
    longDescription: formData.get("longDescription") || null,
    date: formData.get("date") || null,
    status: formData.get("status") || "draft",
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  try {
    await contentRepository.updateSubTheme(id, {
      title: parsed.data.title,
      theme_id: parsed.data.themeId,
      description: parsed.data.description || null,
      long_description: parsed.data.longDescription || null,
      date: parsed.data.date || null,
      status: parsed.data.status,
    });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }

  await logAction("update", { entityType: "sub_theme", entityId: id, summary: "Sous-thème modifié" });
  revalidatePath("/admin/sousthemes");
  redirect("/admin/sousthemes");
}

export async function deleteSubThemeAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await contentRepository.deleteSubTheme(id);
  await logAction("delete", { entityType: "sub_theme", entityId: id, summary: "Sous-thème supprimé" });
  revalidatePath("/admin/sousthemes");
}
