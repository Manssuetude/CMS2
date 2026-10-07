"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormStatus } from "@/types/cms";
import { formSubmissionRepository } from "@/repositories/formSubmissionRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { logAction } from "@/lib/audit";

const VALID_STATUSES: FormStatus[] = ["reçu", "en cours", "traité", "archivé"];

export async function updateFormStatusAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const status = formData.get("status") as string | null;
  if (!id || !status || !VALID_STATUSES.includes(status as FormStatus)) return;
  await formSubmissionRepository.updateFormStatus(id, status as FormStatus);
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
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
}

export async function updateFormDigestSettingsAction(formData: FormData): Promise<void> {
  const recipientEmail = (formData.get("recipientEmail") as string | null)?.trim();
  const intervalDays = Number(formData.get("intervalDays"));
  if (!recipientEmail || !Number.isFinite(intervalDays) || intervalDays < 1) return;
  await siteSettingsRepository.updateFormDigestSettings({ recipientEmail, intervalDays });
  revalidatePath("/admin/forms");
  redirect("/admin/forms?saved=1");
}
