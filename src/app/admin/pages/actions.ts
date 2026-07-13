"use server";

import { revalidatePath } from "next/cache";
import { contentRepository } from "@/repositories/contentRepository";

const SLUG_TO_PATH: Record<string, string> = {
  accueil: "/",
  "a-propos": "/a-propos",
  "nous-rejoindre": "/nous-rejoindre",
  "nous-soutenir": "/nous-soutenir",
  activites: "/activites",
  productions: "/productions",
  projets: "/projets",
  themes: "/themes",
};

export async function savePageImageAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const imageId = formData.get("image_id") || null;
  if (!slug) return;
  await contentRepository.updatePage(slug, { image_id: imageId });
  const path = SLUG_TO_PATH[slug] ?? `/${slug}`;
  revalidatePath(path);
}

export async function savePageContentAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  const fields: Record<string, unknown> = {
    title: formData.get("title") || null,
    eyebrow: formData.get("eyebrow") || null,
    body: formData.get("body") || null,
    image_id: formData.get("image_id") || null,
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  };
  await contentRepository.updatePage(slug, fields);
  const path = SLUG_TO_PATH[slug] ?? `/${slug}`;
  revalidatePath(path);
}
