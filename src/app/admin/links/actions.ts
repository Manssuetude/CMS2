"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { linkRepository } from "@/repositories/linkRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { logAction } from "@/lib/audit";

const schema = z.object({
  label: z.string().min(1, "Le libellé est requis."),
  url: z.string().url("L'URL doit être valide (ex. https://...)."),
  icon: z.string().min(1).default("link"),
  position: z.coerce.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

function fromForm(formData: FormData) {
  return {
    label: formData.get("label"),
    url: formData.get("url"),
    icon: formData.get("icon") || "link",
    position: formData.get("position") || 0,
    status: formData.get("status") || "draft",
  };
}

export async function createLinkAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = schema.safeParse(fromForm(formData));
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  let item;
  try {
    item = await linkRepository.createLink(parsed.data);
  } catch {
    return "Erreur lors de la création. Veuillez réessayer.";
  }

  await logAction("create", { entityType: "link_item", entityId: item.id, summary: `Lien créé : ${item.label}` });
  revalidatePath("/admin/links");
  revalidatePath("/link");
  redirect("/admin/links");
}

export async function updateLinkAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = schema.safeParse(fromForm(formData));
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  try {
    await linkRepository.updateLink(id, parsed.data);
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }

  await logAction("update", { entityType: "link_item", entityId: id, summary: "Lien modifié" });
  revalidatePath("/admin/links");
  revalidatePath("/link");
  redirect("/admin/links");
}

export async function deleteLinkAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await linkRepository.deleteLink(id);
  await logAction("delete", { entityType: "link_item", entityId: id, summary: "Lien supprimé" });
  revalidatePath("/admin/links");
  revalidatePath("/link");
}

export async function updateLinkPageDescriptionAction(formData: FormData): Promise<void> {
  const description = (formData.get("description") as string | null)?.trim();
  if (description == null) return;
  await siteSettingsRepository.updateLinkPageDescription(description);
  revalidatePath("/admin/links");
  revalidatePath("/link");
  redirect("/admin/links?saved=1");
}
