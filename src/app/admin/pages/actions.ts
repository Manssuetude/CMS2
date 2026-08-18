"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pageRepository } from "@/repositories/pageRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { requirePermission } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { MAIN_NAV_ITEMS } from "@/constants/site";

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
  await requirePermission("pages:edit");
  const slug = String(formData.get("slug") ?? "");
  const imageId = formData.get("image_id") || null;
  const imageCrop = formData.get("image_crop") || null;
  if (!slug) return;
  await pageRepository.updatePage(slug, { image_id: imageId, image_crop: imageCrop });
  await logAction("update", { entityType: "page", entityId: slug, summary: `Photo de la page « ${slug} » modifiée` });
  revalidatePath(SLUG_TO_PATH[slug] ?? `/${slug}`);
  redirect("/admin/pages?saved=1");
}

export async function savePageContentAction(formData: FormData): Promise<void> {
  await requirePermission("pages:edit");
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  const fields: Record<string, unknown> = {
    title: formData.get("title") || null,
    eyebrow: formData.get("eyebrow") || null,
    body: formData.get("body") || null,
    image_id: formData.get("image_id") || null,
    image_crop: formData.get("image_crop") || null,
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  };
  await pageRepository.updatePage(slug, fields);
  await logAction("update", { entityType: "page", entityId: slug, summary: `Contenu de la page « ${slug} » modifié` });
  revalidatePath(SLUG_TO_PATH[slug] ?? `/${slug}`);
  redirect(`/admin/pages/${slug}?saved=1`);
}

export async function saveNavVisibilityAction(formData: FormData): Promise<void> {
  await requirePermission("pages:edit");
  const visibility: Record<string, boolean> = {};
  for (const item of MAIN_NAV_ITEMS) {
    if (!item.togglable) continue;
    visibility[item.key] = formData.get(`nav_${item.key}`) === "on";
  }
  await siteSettingsRepository.updateNavVisibility(visibility);
  await logAction("update", { entityType: "site_settings", summary: "Visibilité du menu modifiée" });
  revalidatePath("/", "layout");
  redirect("/admin/pages?saved=1");
}
