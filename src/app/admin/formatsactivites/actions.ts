"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { logAction } from "@/lib/audit";
import { slugify } from "@/utils/slug";

const schema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  position: z.coerce.number().int().min(0).default(0),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

function toInput(data: z.infer<typeof schema>) {
  return {
    title: data.title,
    description: data.description || null,
    icon: data.icon || null,
    position: data.position,
    status: data.status,
  };
}

function fromForm(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description") || null,
    icon: formData.get("icon") || null,
    position: formData.get("position") || 0,
    status: formData.get("status") || "draft",
  };
}

export async function createActivityFormatAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = schema.safeParse(fromForm(formData));
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  const slug = (formData.get("slug") as string | null)?.trim() || slugify(parsed.data.title);

  let format;
  try {
    format = await activityFormatRepository.createFormat({ slug, ...toInput(parsed.data) });
  } catch {
    return "Erreur lors de la création. Vérifiez que l'identifiant n'existe pas déjà.";
  }

  await logAction("create", {
    entityType: "activity_format",
    entityId: format.id,
    summary: `Format créé : ${format.title}`,
  });
  revalidatePath("/admin/formatsactivites");
  revalidatePath("/activites/formats-d-activites");
  redirect("/admin/formatsactivites");
}

export async function updateActivityFormatAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = schema.safeParse(fromForm(formData));
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  try {
    await activityFormatRepository.updateFormat(id, toInput(parsed.data));
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }

  await logAction("update", { entityType: "activity_format", entityId: id, summary: "Format modifié" });
  revalidatePath("/admin/formatsactivites");
  revalidatePath("/activites/formats-d-activites");
  redirect("/admin/formatsactivites");
}

export async function deleteActivityFormatAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await activityFormatRepository.deleteFormat(id);
  await logAction("delete", { entityType: "activity_format", entityId: id, summary: "Format supprimé" });
  revalidatePath("/admin/formatsactivites");
  revalidatePath("/activites/formats-d-activites");
}
