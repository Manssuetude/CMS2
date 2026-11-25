"use server";

import { requireProductionEditor } from "@/lib/productionAccess";
import { productionRepository } from "@/repositories/productionRepository";
import { buildProductionPageData, productionBasePath } from "@/services/productionReadingService";
import { ArticleReader } from "@/components/public/ArticleReader";
import type { PreviewResult } from "@/constants/preview";
import type { Production } from "@/types/cms";
import { partPath } from "@/utils/articleParts";
import { slugify } from "@/utils/slug";
import { parseIdList, productionFormSchema, readProductionForm } from "./productionForm";

// Aperçu de la page de lecture d'une production avec les valeurs du
// formulaire, même non enregistrées (texte importé du Word compris). Même
// validation que l'enregistrement, mêmes composants que la page publique.
// LECTURE SEULE : aucune écriture en base.
//
// Champs ajoutés par la fiche : `partIndex` (partie affichée) et, après un
// import pas encore enregistré, `body`. Sans `body`, le texte enregistré est utilisé.
export async function renderProductionPreview(entries: Record<string, string>): Promise<PreviewResult> {
  await requireProductionEditor();

  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) formData.set(key, value);

  const parsed = productionFormSchema.safeParse(readProductionForm(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Données invalides." };
  const data = parsed.data;

  const id = entries.id?.trim() || "";
  const existing = id ? await productionRepository.getProductionById(id) : null;
  const body = "body" in entries ? entries.body : (existing?.body ?? "");
  if (!body?.trim()) {
    return { ok: false, error: "pas encore de texte. Importez le Word pour voir la page de lecture." };
  }
  const now = new Date().toISOString();

  const item: Production = {
    id: id || "apercu",
    slug: existing?.slug || entries.slug?.trim() || slugify(data.title) || "apercu",
    title: data.title,
    type: data.type,
    description: data.description || null,
    body,
    contentBlocks: existing?.contentBlocks ?? [],
    author: data.author || null,
    date: data.date || null,
    thumbnailId: existing?.thumbnailId ?? null,
    fileId: data.fileId || null,
    downloadLabel: data.downloadLabel || null,
    videoUrl: data.videoUrl || null,
    readingTime: data.readingTime || null,
    pages: data.pages || null,
    tags: existing?.tags ?? [],
    status: data.status,
    featured: data.featured,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const pageData = await buildProductionPageData(item, {
    subThemeIds: parseIdList(formData, "subThemeIds"),
    authorIds: parseIdList(formData, "authorIds"),
  });
  const { parts } = pageData;
  if (parts.length === 0) return { ok: false, error: "le texte importé est vide." };

  const requested = Number.parseInt(entries.partIndex ?? "0", 10);
  const currentIndex = Number.isFinite(requested) ? Math.min(Math.max(requested, 0), parts.length - 1) : 0;
  const basePath = productionBasePath(item.slug);

  return {
    ok: true,
    node: <ArticleReader {...pageData} currentIndex={currentIndex} />,
    links: parts.map((_, index) => partPath(basePath, parts, index)),
  };
}
