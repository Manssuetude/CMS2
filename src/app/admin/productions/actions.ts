"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { productionRepository } from "@/repositories/productionRepository";
import { logAction } from "@/lib/audit";
import { slugify } from "@/utils/slug";

export async function toggleProductionFeaturedAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const featured = formData.get("featured") === "true";
  if (!id) return;
  // Garde-fou : maximum 4 productions en vedette sur l'accueil.
  if (featured) {
    const all = await productionRepository.listProductions(true);
    const count = all.filter((p) => p.featured).length;
    if (count >= 4) return;
  }
  await productionRepository.updateProduction(id, { featured });
  revalidatePath("/admin/productions");
  revalidatePath("/");
}

const schema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  type: z.string().min(1, "Le type est requis."),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  author: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  readingTime: z.string().optional().nullable(),
  pages: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  description: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  subThemeId: z.string().optional().nullable(),
});

function toInput(data: z.infer<typeof schema>) {
  return {
    title: data.title,
    type: data.type,
    status: data.status,
    author: data.author || null,
    date: data.date || null,
    reading_time: data.readingTime || null,
    pages: data.pages || null,
    featured: data.featured,
    description: data.description || null,
    body: data.body || null,
    sub_theme_id: data.subThemeId || null,
  };
}

export async function createProductionAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    status: formData.get("status") || "draft",
    author: formData.get("author") || null,
    date: formData.get("date") || null,
    readingTime: formData.get("readingTime") || null,
    pages: formData.get("pages") || null,
    featured: formData.get("featured") === "on",
    description: formData.get("description") || null,
    body: formData.get("body") || null,
    subThemeId: formData.get("subThemeId") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  const slug = (formData.get("slug") as string | null)?.trim() || slugify(parsed.data.title);

  let production;
  try {
    production = await productionRepository.createProduction({ slug, ...toInput(parsed.data) });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

  await logAction("create", {
    entityType: "production",
    entityId: production.id,
    summary: `Production créée : ${parsed.data.title}`,
  });
  revalidatePath("/admin/productions");
  redirect("/admin/productions");
}

export async function updateProductionAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = schema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    status: formData.get("status") || "draft",
    author: formData.get("author") || null,
    date: formData.get("date") || null,
    readingTime: formData.get("readingTime") || null,
    pages: formData.get("pages") || null,
    featured: formData.get("featured") === "on",
    description: formData.get("description") || null,
    body: formData.get("body") || null,
    subThemeId: formData.get("subThemeId") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  try {
    await productionRepository.updateProduction(id, toInput(parsed.data));
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

  await logAction("update", {
    entityType: "production",
    entityId: id,
    summary: `Production modifiée : ${parsed.data.title}`,
  });
  revalidatePath("/admin/productions");
  redirect("/admin/productions");
}

export async function deleteProductionAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await productionRepository.deleteProduction(id);
  await logAction("delete", { entityType: "production", entityId: id, summary: "Production supprimée" });
  revalidatePath("/admin/productions");
}

export async function toggleProductionStatusAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const status = (formData.get("status") as string | null)?.trim();
  if (!id || !status) return;
  await productionRepository.toggleStatus(id, status);
  revalidatePath("/admin/productions");
}
