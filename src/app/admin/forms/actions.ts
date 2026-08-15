"use server";

import { revalidatePath } from "next/cache";
import type { FormStatus } from "@/types/cms";
import { formSubmissionRepository } from "@/repositories/formSubmissionRepository";

const VALID_STATUSES: FormStatus[] = ["reçu", "en cours", "traité", "archivé"];

export async function updateFormStatusAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const status = formData.get("status") as string | null;
  if (!id || !status || !VALID_STATUSES.includes(status as FormStatus)) return;
  await formSubmissionRepository.updateFormStatus(id, status as FormStatus);
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
}
