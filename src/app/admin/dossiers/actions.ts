"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { dossierRepository } from "@/repositories/dossierRepository";
import { logAction } from "@/lib/audit";
import { slugify } from "@/utils/slug";

const itemSchema = z.object({
  entityType: z.enum(["production", "activity", "project", "resource", "journal_entry"]),
  entityId: z.string().min(1),
});

const schema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  mode: z.enum(["libre", "guide"]).default("libre"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  description: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
  items: z.string().optional().nullable(),
});

function parseItems(raw: string | null | undefined) {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      const result = itemSchema.safeParse(entry);
      return result.success ? [{ entityType: result.data.entityType, entityId: result.data.entityId }] : [];
    });
  } catch {
    return [];
  }
}

function toInput(data: z.infer<typeof schema>) {
  return {
    title: data.title,
    mode: data.mode,
    status: data.status,
    description: data.description || null,
    image_id: data.imageId || null,
  };
}

function fromForm(formData: FormData) {
  return {
    title: formData.get("title"),
    mode: formData.get("mode") || "libre",
    status: formData.get("status") || "draft",
    description: formData.get("description") || null,
    imageId: formData.get("imageId") || null,
    items: formData.get("items") || null,
  };
}

export async function createDossierAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = schema.safeParse(fromForm(formData));
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  const slug = (formData.get("slug") as string | null)?.trim() || slugify(parsed.data.title);
  const items = parseItems(parsed.data.items);

  let dossier;
  try {
    dossier = await dossierRepository.createDossier({ slug, ...toInput(parsed.data) });
    await dossierRepository.setDossierItems(dossier.id, items);
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }

  await logAction("create", {
    entityType: "dossier",
    entityId: dossier.id,
    summary: `Dossier créé : ${dossier.title}`,
  });
  revalidatePath("/admin/dossiers");
  redirect("/admin/dossiers");
}

export async function updateDossierAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = schema.safeParse(fromForm(formData));
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  const items = parseItems(parsed.data.items);

  try {
    await dossierRepository.updateDossier(id, toInput(parsed.data));
    await dossierRepository.setDossierItems(id, items);
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }

  await logAction("update", { entityType: "dossier", entityId: id, summary: `Dossier modifié : ${parsed.data.title}` });
  revalidatePath("/admin/dossiers");
  redirect("/admin/dossiers");
}

export async function deleteDossierAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await dossierRepository.deleteDossier(id);
  await logAction("delete", { entityType: "dossier", entityId: id, summary: "Dossier supprimé" });
  revalidatePath("/admin/dossiers");
}
