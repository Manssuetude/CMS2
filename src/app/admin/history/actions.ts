"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pageRepository } from "@/repositories/pageRepository";
import { logAction } from "@/lib/audit";

export async function saveHistoryFieldsAction(formData: FormData): Promise<void> {
  const payload: Record<string, unknown> = {
    slug: "history",
    title: (formData.get("title") as string)?.trim() || "Notre histoire",
    eyebrow: formData.get("eyebrow") || null,
    body: formData.get("body") || null,
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
    status: "published",
    updated_at: new Date().toISOString(),
  };
  // upsert : crée la page « history » au premier enregistrement, la met à jour ensuite.
  await pageRepository.upsertPage(payload);
  await logAction("update", { entityType: "page", entityId: "history", summary: "Page Histoire modifiée" });
  revalidatePath("/history");
  redirect("/admin/history?saved=1");
}
