"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pageRepository } from "@/repositories/pageRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { requirePermission } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { MAIN_NAV_ITEMS, PAGE_DIRECTORY } from "@/constants/site";

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
  revalidatePath(PAGE_DIRECTORY[slug]?.publicPath ?? `/${slug}`);
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
