"use server";

import { revalidatePath } from "next/cache";
import { contentRepository } from "@/repositories/contentRepository";

export async function savePercaFieldsAction(formData: FormData): Promise<void> {
  const fields: Record<string, unknown> = {
    eyebrow: formData.get("eyebrow") || null,
    title: formData.get("title") || null,
    body: formData.get("body") || null,
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  };
  await contentRepository.updatePage("perca", fields);
  revalidatePath("/perca");
}
