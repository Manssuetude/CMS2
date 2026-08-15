"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pageRepository } from "@/repositories/pageRepository";
import { logAction } from "@/lib/audit";

export async function savePercaFieldsAction(formData: FormData): Promise<void> {
  const fields: Record<string, unknown> = {
    eyebrow: formData.get("eyebrow") || null,
    title: formData.get("title") || null,
    body: formData.get("body") || null,
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  };
  await pageRepository.updatePage("perca", fields);
  await logAction("update", { entityType: "page", entityId: "perca", summary: "Page PERCA modifiée" });
  revalidatePath("/perca");
  redirect("/admin/perca?saved=1");
}
