"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { activityRepository } from "@/repositories/activityRepository";
import { logAction } from "@/lib/audit";
import { slugify } from "@/utils/slug";

const schema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  format: z.string().min(1, "Le format est requis."),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  progressStatus: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
});

function toInput(data: z.infer<typeof schema>) {
  return {
    title: data.title,
    format: data.format,
    status: data.status,
    progress_status: data.progressStatus || null,
    date: data.date || null,
    description: data.description || null,
    body: data.body || null,
  };
}

export async function createActivityAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    format: formData.get("format"),
    status: formData.get("status") || "draft",
    progressStatus: formData.get("progressStatus") || null,
    date: formData.get("date") || null,
    description: formData.get("description") || null,
    body: formData.get("body") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  const slug = (formData.get("slug") as string | null)?.trim() || slugify(parsed.data.title);

  try {
    await activityRepository.createActivity({ slug, ...toInput(parsed.data) });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

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
    description: formData.get("description") || null,
    body: formData.get("body") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  try {
    await activityRepository.updateActivity(id, toInput(parsed.data));
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

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
