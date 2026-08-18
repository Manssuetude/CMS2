"use server";

import { revalidatePath } from "next/cache";
import { mediaRepository } from "@/repositories/mediaRepository";

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await mediaRepository.remove(id);
  revalidatePath("/admin/media");
}

export async function renameMediaAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const title = (formData.get("title") as string | null)?.trim();
  if (!id || !title) return;
  await mediaRepository.rename(id, title);
  revalidatePath("/admin/media");
}
