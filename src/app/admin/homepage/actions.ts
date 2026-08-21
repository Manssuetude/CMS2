"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pageRepository } from "@/repositories/pageRepository";
import { logAction } from "@/lib/audit";
import type { ContentBlock } from "@/types/cms";

export async function savePageBlocksAction(slug: string, blocks: ContentBlock[]): Promise<void> {
  await pageRepository.updatePageSections(slug, blocks);
  revalidatePath("/");
  revalidatePath(`/${slug === "accueil" ? "" : slug}`);
}

export async function saveHomepageFieldsAction(formData: FormData): Promise<void> {
  const fields: Record<string, unknown> = {
    body: formData.get("body") || null,
    featured_event_id: formData.get("featured_event_id") || null,
    image_id: formData.get("image_id") || null,
    image_crop: formData.get("image_crop") || null,
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  };
  await pageRepository.updatePage("accueil", fields);
  await logAction("update", { entityType: "page", entityId: "accueil", summary: "Page d'accueil modifiée" });
  revalidatePath("/");
  redirect("/admin/homepage?saved=1");
}
