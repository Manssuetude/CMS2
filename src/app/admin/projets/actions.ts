"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { projectRepository } from "@/repositories/projectRepository";
import { logAction } from "@/lib/audit";
import { slugify } from "@/utils/slug";

const schema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  category: z.string().optional().nullable(),
  progressStatus: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  description: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
});

function toInput(data: z.infer<typeof schema>) {
  return {
    title: data.title,
    status: data.status,
    category: data.category || null,
    progress_status: data.progressStatus || null,
    priority: data.priority || null,
    featured: data.featured,
    description: data.description || null,
    body: data.body || null,
  };
}

function parseIdList(formData: FormData, field: string): string[] {
  return ((formData.get(field) as string | null) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createProjectAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    status: formData.get("status") || "draft",
    category: formData.get("category") || null,
    progressStatus: formData.get("progressStatus") || null,
    priority: formData.get("priority") || null,
    featured: formData.get("featured") === "on",
    description: formData.get("description") || null,
    body: formData.get("body") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  const slug = (formData.get("slug") as string | null)?.trim() || slugify(parsed.data.title);

  let project;
  try {
    project = await projectRepository.createProject({ slug, ...toInput(parsed.data) });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

  const themeIds = parseIdList(formData, "themeIds");
  if (themeIds.length > 0) await projectRepository.setProjectThemes(project.id, themeIds);
  const productionIds = parseIdList(formData, "productionIds");
  if (productionIds.length > 0) await projectRepository.setProjectProductions(project.id, productionIds);
  const activityIds = parseIdList(formData, "activityIds");
  if (activityIds.length > 0) await projectRepository.setProjectActivities(project.id, activityIds);

  await logAction("create", { entityType: "project", summary: `Projet créé : ${parsed.data.title}` });
  revalidatePath("/admin/projets");
  redirect("/admin/projets");
}

export async function updateProjectAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = schema.safeParse({
    title: formData.get("title"),
    status: formData.get("status") || "draft",
    category: formData.get("category") || null,
    progressStatus: formData.get("progressStatus") || null,
    priority: formData.get("priority") || null,
    featured: formData.get("featured") === "on",
    description: formData.get("description") || null,
    body: formData.get("body") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  try {
    await projectRepository.updateProject(id, toInput(parsed.data));
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

  await projectRepository.setProjectThemes(id, parseIdList(formData, "themeIds"));
  await projectRepository.setProjectProductions(id, parseIdList(formData, "productionIds"));
  await projectRepository.setProjectActivities(id, parseIdList(formData, "activityIds"));

  await logAction("update", { entityType: "project", entityId: id, summary: `Projet modifié : ${parsed.data.title}` });
  revalidatePath("/admin/projets");
  redirect("/admin/projets");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await projectRepository.deleteProject(id);
  await logAction("delete", { entityType: "project", entityId: id, summary: "Projet supprimé" });
  revalidatePath("/admin/projets");
}

export async function toggleProjectStatusAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const status = (formData.get("status") as string | null)?.trim();
  if (!id || !status) return;
  await projectRepository.toggleStatus(id, status);
  revalidatePath("/admin/projets");
}
