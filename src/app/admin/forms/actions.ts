"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formSubmissionRepository } from "@/repositories/formSubmissionRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { logAction } from "@/lib/audit";

// Boîte de réception : retour sur le message affiché, avec le même filtre.
function inboxPath(formData: FormData, id?: string): string {
  const filter = (formData.get("filtre") as string | null) ?? "";
  const params = new URLSearchParams();
  if (filter) params.set("filtre", filter);
  if (id) params.set("message", id);
  params.set("saved", "1");
  return `/admin/forms?${params}`;
}

/** « Marquer comme traité » / « Remettre à traiter ». */
export async function setFormHandledAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  const handled = formData.get("handled") === "true";
  await formSubmissionRepository.updateFormStatus(id, handled ? "traité" : "reçu");
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
  redirect(inboxPath(formData, id));
}

/** Note interne (visible seulement dans l'admin). */
export async function saveFormNoteAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  const notes = ((formData.get("notes") as string | null) ?? "").trim().slice(0, 5000);
  await formSubmissionRepository.updateFormNotes(id, notes || null);
  revalidatePath("/admin/forms");
  redirect(inboxPath(formData, id));
}

export async function deleteFormSubmissionAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await formSubmissionRepository.deleteFormSubmission(id);
  await logAction("delete", {
    entityType: "form_submission",
    entityId: id,
    summary: "Soumission de formulaire supprimée (demande d'effacement)",
  });
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
  redirect(inboxPath(formData));
}

export async function updateFormDigestSettingsAction(formData: FormData): Promise<void> {
  const recipientEmail = (formData.get("recipientEmail") as string | null)?.trim();
  const intervalDays = Number(formData.get("intervalDays"));
  if (!recipientEmail || !Number.isFinite(intervalDays) || intervalDays < 1) return;
  await siteSettingsRepository.updateFormDigestSettings({ recipientEmail, intervalDays });
  revalidatePath("/admin/forms");
  redirect("/admin/forms?saved=1");
}
