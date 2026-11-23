import { z } from "zod";

// Lecture et validation du formulaire production, partagées par
// l'enregistrement (actions.ts) et l'aperçu (preview.tsx). Pas de
// "use server" ici : ce module exporte aussi des valeurs non asynchrones.

export const productionFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  type: z.string().min(1, "Le type est requis."),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  author: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  readingTime: z.string().optional().nullable(),
  pages: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  description: z.string().optional().nullable(),
  fileId: z.string().optional().nullable(),
  downloadLabel: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export type ProductionFormData = z.infer<typeof productionFormSchema>;

export function readProductionForm(formData: FormData) {
  return {
    title: formData.get("title"),
    type: formData.get("type"),
    status: formData.get("status") || "draft",
    author: formData.get("author") || null,
    date: formData.get("date") || null,
    readingTime: formData.get("readingTime") || null,
    pages: formData.get("pages") || null,
    featured: formData.get("featured") === "on",
    description: formData.get("description") || null,
    fileId: formData.get("fileId") || null,
    downloadLabel: formData.get("downloadLabel") || null,
    videoUrl: formData.get("videoUrl") || null,
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
  };
}

/** Colonnes de la table `productions` correspondant aux champs du formulaire. */
export function toProductionColumns(data: ProductionFormData) {
  return {
    title: data.title,
    type: data.type,
    status: data.status,
    author: data.author || null,
    date: data.date || null,
    reading_time: data.readingTime || null,
    pages: data.pages || null,
    featured: data.featured,
    description: data.description || null,
    file_id: data.fileId || null,
    download_label: data.downloadLabel || null,
    video_url: data.videoUrl || null,
    seo_title: data.seoTitle || null,
    seo_description: data.seoDescription || null,
  };
}

export function parseIdList(formData: FormData, field: string): string[] {
  return ((formData.get(field) as string | null) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Texte importé depuis le Word : présent dans le formulaire seulement après un
 * import (champ caché `body`), avec le nom du fichier (`bodySourceName`).
 * Sans import, le texte enregistré n'est pas touché.
 */
export function importedBodyFromForm(formData: FormData): { body: string | null; sourceName: string | null } | null {
  if (!formData.has("body")) return null;
  const body = ((formData.get("body") as string | null) ?? "").trim();
  const sourceName = ((formData.get("bodySourceName") as string | null) ?? "").trim();
  return { body: body || null, sourceName: sourceName || null };
}
