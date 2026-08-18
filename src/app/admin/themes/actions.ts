"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { themeRepository } from "@/repositories/themeRepository";
import { logAction } from "@/lib/audit";

const schema = z.object({
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
});

const createSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  slug: z
    .string()
    .min(1, "L'identifiant est requis.")
    .regex(/^[a-z0-9-]+$/, "Identifiant invalide (minuscules, chiffres, tirets)."),
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
});

export async function createThemeAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = createSchema.safeParse({
    title: formData.get("title") || "",
    slug: formData.get("slug") || "",
    description: formData.get("description") || null,
    longDescription: formData.get("longDescription") || null,
    status: formData.get("status") || "draft",
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  try {
    await themeRepository.createTheme({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      long_description: parsed.data.longDescription ?? null,
      status: parsed.data.status,
      featured: parsed.data.featured,
    });
  } catch {
    return "Erreur lors de la création. Vérifiez que l'identifiant n'existe pas déjà.";
  }

  await logAction("create", { entityType: "theme", summary: `Thème créé : ${parsed.data.title}` });
  revalidatePath("/admin/themes");
  redirect("/admin/themes");
}

export async function toggleThemeFeaturedAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const featured = formData.get("featured") === "true";
  if (!id) return;
  await themeRepository.updateTheme(id, { featured });
  revalidatePath("/admin/themes");
  revalidatePath("/");
}

export async function updateThemeAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = schema.safeParse({
    description: formData.get("description") || null,
    longDescription: formData.get("longDescription") || null,
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
    status: formData.get("status") || "draft",
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Donnees invalides.";
  }

  try {
    await themeRepository.updateTheme(id, {
      description: parsed.data.description || null,
      long_description: parsed.data.longDescription || null,
      seo_title: parsed.data.seoTitle || null,
      seo_description: parsed.data.seoDescription || null,
      status: parsed.data.status,
      featured: parsed.data.featured,
    });
  } catch {
    return "Erreur lors de la sauvegarde. Veuillez reessayer.";
  }

  await logAction("update", { entityType: "theme", entityId: id, summary: "Thème modifié" });
  revalidatePath("/admin/themes");
  redirect("/admin/themes");
}
