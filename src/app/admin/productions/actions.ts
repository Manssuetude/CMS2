"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { productionRepository } from "@/repositories/productionRepository";
import { authorRepository } from "@/repositories/authorRepository";
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
  fileId: z.string().optional().nullable(),
  downloadLabel: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
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
    file_id: data.fileId || null,
    download_label: data.downloadLabel || null,
    video_url: data.videoUrl || null,
    seo_title: data.seoTitle || null,
    seo_description: data.seoDescription || null,
  };
}

function parseIdList(formData: FormData, field: string): string[] {
  return ((formData.get(field) as string | null) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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
    fileId: formData.get("fileId") || null,
    downloadLabel: formData.get("downloadLabel") || null,
    videoUrl: formData.get("videoUrl") || null,
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
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

  const subThemeIds = parseIdList(formData, "subThemeIds");
  if (subThemeIds.length > 0) {
    await productionRepository.setProductionSubThemes(production.id, subThemeIds);
  }
  const authorIds = parseIdList(formData, "authorIds");
  if (authorIds.length > 0) {
    await authorRepository.setProductionAuthors(production.id, authorIds);
  }
  const resourceIds = parseIdList(formData, "resourceIds");
  if (resourceIds.length > 0) {
    await productionRepository.setProductionResources(production.id, resourceIds);
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
    fileId: formData.get("fileId") || null,
    downloadLabel: formData.get("downloadLabel") || null,
    videoUrl: formData.get("videoUrl") || null,
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  try {
    await productionRepository.updateProduction(id, toInput(parsed.data));
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

  await productionRepository.setProductionSubThemes(id, parseIdList(formData, "subThemeIds"));
  await authorRepository.setProductionAuthors(id, parseIdList(formData, "authorIds"));
  await productionRepository.setProductionResources(id, parseIdList(formData, "resourceIds"));

  await logAction("update", {
    entityType: "production",
    entityId: id,
    summary: `Production modifiée : ${parsed.data.title}`,
  });
  revalidatePath("/admin/productions");
  redirect("/admin/productions");
}

export async function updateProductionBodyAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";
  const body = (formData.get("body") as string | null) ?? "";

  try {
    await productionRepository.updateProduction(id, { body: body || null });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }

  await logAction("update", { entityType: "production", entityId: id, summary: "Contenu de la production modifié" });
  revalidatePath("/admin/productions");
  revalidatePath(`/admin/productions/${id}/edit`);
  return null;
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
