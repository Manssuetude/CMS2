"use server";

import { revalidatePath } from "next/cache";
import { contentRepository } from "@/repositories/contentRepository";
import type { ContentBlock } from "@/types/cms";

export async function savePageBlocksAction(slug: string, blocks: ContentBlock[]): Promise<void> {
  await contentRepository.updatePageSections(slug, blocks);
  revalidatePath("/");
  revalidatePath(`/${slug === "accueil" ? "" : slug}`);
}

export async function saveHomepageFieldsAction(formData: FormData): Promise<void> {
  const fields: Record<string, unknown> = {
    body: formData.get("body") || null,
    eyebrow: formData.get("eyebrow") || null,
    title: formData.get("title") || null,
    quote: formData.get("quote") || null,
    primary_cta_label: formData.get("primary_cta_label") || null,
    primary_cta_target: formData.get("primary_cta_target") || null,
    secondary_cta_label: formData.get("secondary_cta_label") || null,
    secondary_cta_target: formData.get("secondary_cta_target") || null,
    image_id: formData.get("image_id") || null,
    seo_image_id: formData.get("seo_image_id") || null,
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  };
  await contentRepository.updatePage("accueil", fields);
  revalidatePath("/");
}
