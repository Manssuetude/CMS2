"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { themeRepository } from "@/repositories/themeRepository";
import { logAction } from "@/lib/audit";
import { requirePermission } from "@/lib/auth";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { checkThemeDeletion } from "@/utils/themeDeletion";

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
  redirect("/admin/themes?saved=1");
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
    return parsed.error.errors[0]?.message ?? "Données invalides.";
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
    return "Erreur lors de l'enregistrement. Veuillez réessayer.";
  }

  await logAction("update", { entityType: "theme", entityId: id, summary: "Thème modifié" });
  revalidatePath("/admin/themes");
  redirect("/admin/themes?saved=1");
}

function revalidateThemes(slug?: string) {
  revalidatePath("/admin/themes");
  revalidatePath("/admin/sousthemes");
  revalidatePath("/themes");
  if (slug) revalidatePath(`/themes/${slug}`, "layout");
}

// Suppression : refusée côté serveur tant que le thème a des sous-thèmes
// (ON DELETE CASCADE, voir utils/themeDeletion.ts).
export async function deleteThemeAction(formData: FormData): Promise<void> {
  await requirePermission("themes:delete");
  const id = (formData.get("id") as string | null)?.trim();
  const theme = id ? await themeRepository.getThemeById(id) : null;
  if (!theme) redirect("/admin/themes");
  const [subThemes, linkCounts] = await Promise.all([
    subThemeRepository.listSubThemesByTheme(theme.id, true),
    themeRepository.listThemeLinkCounts(),
  ]);
  const check = checkThemeDeletion({
    subThemeCount: subThemes.length,
    eventCount: linkCounts[theme.id]?.events ?? 0,
    projectCount: linkCounts[theme.id]?.projects ?? 0,
  });
  if (!check.allowed) redirect("/admin/themes?erreur=sous-themes");
  await themeRepository.deleteTheme(theme.id);
  await logAction("delete", { entityType: "theme", entityId: theme.id, summary: `Thème supprimé : ${theme.title}` });
  revalidateThemes(theme.slug);
  redirect("/admin/themes?saved=1");
}

export async function archiveThemeAction(formData: FormData): Promise<void> {
  await requirePermission("themes:edit");
  const id = (formData.get("id") as string | null)?.trim();
  const theme = id ? await themeRepository.getThemeById(id) : null;
  if (!theme) redirect("/admin/themes");
  await themeRepository.updateTheme(theme.id, { status: "archived", featured: false });
  await logAction("update", { entityType: "theme", entityId: theme.id, summary: `Thème archivé : ${theme.title}` });
  revalidateThemes(theme.slug);
  redirect("/admin/themes?saved=1");
}

/** Rattache les sous-thèmes d'un thème à un autre (le thème peut ensuite être supprimé). */
export async function reattachSubThemesAction(formData: FormData): Promise<void> {
  await requirePermission("sousthemes:edit");
  const id = (formData.get("id") as string | null)?.trim();
  const targetId = (formData.get("targetThemeId") as string | null)?.trim();
  const [theme, target] = await Promise.all([
    id ? themeRepository.getThemeById(id) : null,
    targetId ? themeRepository.getThemeById(targetId) : null,
  ]);
  if (!theme || !target || theme.id === target.id) redirect("/admin/themes");
  await subThemeRepository.moveSubThemes(theme.id, target.id);
  await logAction("update", {
    entityType: "theme",
    entityId: theme.id,
    summary: `Sous-thèmes de « ${theme.title} » rattachés à « ${target.title} »`,
  });
  revalidateThemes(theme.slug);
  revalidatePath(`/themes/${target.slug}`, "layout");
  redirect("/admin/themes?saved=1");
}
