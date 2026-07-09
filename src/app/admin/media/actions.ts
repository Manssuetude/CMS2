"use server";

import { revalidatePath } from "next/cache";
import { mediaRepository } from "@/repositories/mediaRepository";

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await mediaRepository.remove(id);
  revalidatePath("/admin/media");
}
