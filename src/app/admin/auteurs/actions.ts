"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authorRepository } from "@/repositories/authorRepository";
import { logAction } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  bio: z.string().optional().nullable(),
  photoId: z.string().optional().nullable(),
});

export async function createAuthorAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = schema.safeParse({
    name: formData.get("name") || "",
    bio: formData.get("bio") || null,
    photoId: formData.get("photoId") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  let author;
  try {
    author = await authorRepository.createAuthor({
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      photo_id: parsed.data.photoId || null,
    });
  } catch {
    return "Erreur lors de la création. Veuillez réessayer.";
  }

  await logAction("create", { entityType: "author", entityId: author.id, summary: `Auteur créé : ${author.name}` });
  revalidatePath("/admin/auteurs");
  redirect("/admin/auteurs");
}

export async function updateAuthorAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = schema.safeParse({
    name: formData.get("name") || "",
    bio: formData.get("bio") || null,
    photoId: formData.get("photoId") || null,
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  try {
    await authorRepository.updateAuthor(id, {
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      photo_id: parsed.data.photoId || null,
    });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }

  await logAction("update", { entityType: "author", entityId: id, summary: "Auteur modifié" });
  revalidatePath("/admin/auteurs");
  redirect("/admin/auteurs");
}

export async function deleteAuthorAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await authorRepository.deleteAuthor(id);
  await logAction("delete", { entityType: "author", entityId: id, summary: "Auteur supprimé" });
  revalidatePath("/admin/auteurs");
}
