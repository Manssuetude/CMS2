"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirectRepository } from "@/repositories/redirectRepository";
import { requirePermission } from "@/lib/auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  fromPath: z
    .string()
    .min(1, "Le chemin source est requis.")
    .regex(/^\/\S*$/, "Doit commencer par / et ne pas contenir d'espace."),
  toPath: z
    .string()
    .min(1, "Le chemin cible est requis.")
    .regex(/^(\/\S*|https?:\/\/\S+)$/, "Doit être un chemin commençant par / ou une URL complète."),
});

export async function createRedirectAction(_: string | null, formData: FormData): Promise<string | null> {
  await requirePermission("redirects:edit");
  const parsed = schema.safeParse({
    fromPath: (formData.get("fromPath") as string | null)?.trim(),
    toPath: (formData.get("toPath") as string | null)?.trim(),
  });
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }
  if (parsed.data.fromPath === parsed.data.toPath) {
    return "Le chemin source et le chemin cible ne peuvent pas être identiques (boucle).";
  }

  try {
    await redirectRepository.createRedirect(parsed.data.fromPath, parsed.data.toPath);
  } catch {
    return "Erreur lors de la création. Ce chemin source existe peut-être déjà.";
  }

  await logAction("create", {
    entityType: "redirect",
    summary: `Redirection créée : ${parsed.data.fromPath} → ${parsed.data.toPath}`,
  });
  revalidatePath("/admin/redirects");
  return null;
}

export async function deleteRedirectAction(formData: FormData): Promise<void> {
  await requirePermission("redirects:edit");
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await redirectRepository.deleteRedirect(id);
  await logAction("delete", { entityType: "redirect", entityId: id, summary: "Redirection supprimée" });
  revalidatePath("/admin/redirects");
}
