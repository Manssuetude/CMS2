"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { announcementRepository } from "@/repositories/announcementRepository";
import { duplicateAnnouncement, readAnnouncementForm, validateAnnouncement } from "@/utils/announcements";

// Le bandeau et le badge vivent dans le layout public : on revalide tout le
// site, en plus de l'accueil et de /nous-rejoindre (hero, chiffres, bloc final).
function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/nous-rejoindre");
  revalidatePath("/", "layout");
  revalidatePath("/admin/annonces");
}

export async function createAnnouncementAction(_: string | null, formData: FormData): Promise<string | null> {
  await requirePermission("annonces:create");
  const input = readAnnouncementForm(formData);
  const error = validateAnnouncement(input);
  if (error) return error;

  let created;
  try {
    created = await announcementRepository.create(input);
  } catch {
    return "Erreur lors de la création. Veuillez réessayer.";
  }
  await logAction("create", {
    entityType: "announcement",
    entityId: created.id,
    summary: `Annonce créée : ${input.name}`,
  });
  revalidatePublic();
  redirect("/admin/annonces?saved=1");
}

export async function updateAnnouncementAction(_: string | null, formData: FormData): Promise<string | null> {
  await requirePermission("annonces:edit");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return "Identifiant manquant.";
  const input = readAnnouncementForm(formData);
  const error = validateAnnouncement(input);
  if (error) return error;

  try {
    await announcementRepository.update(id, input);
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez réessayer.";
  }
  await logAction("update", { entityType: "announcement", entityId: id, summary: `Annonce modifiée : ${input.name}` });
  revalidatePublic();
  redirect("/admin/annonces?saved=1");
}

export async function duplicateAnnouncementAction(formData: FormData): Promise<void> {
  await requirePermission("annonces:create");
  const id = String(formData.get("id") ?? "").trim();
  const source = id ? await announcementRepository.getById(id) : null;
  if (!source) redirect("/admin/annonces");
  const copy = await announcementRepository.create(duplicateAnnouncement(source));
  await logAction("create", {
    entityType: "announcement",
    entityId: copy.id,
    summary: `Annonce dupliquée : ${source.name}`,
  });
  revalidatePath("/admin/annonces");
  redirect(`/admin/annonces/${copy.id}/edit?saved=1`);
}

export async function deleteAnnouncementAction(formData: FormData): Promise<void> {
  await requirePermission("annonces:delete");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const existing = await announcementRepository.getById(id);
  await announcementRepository.remove(id);
  await logAction("delete", {
    entityType: "announcement",
    entityId: id,
    summary: `Annonce supprimée : ${existing?.name ?? id}`,
  });
  revalidatePublic();
}
