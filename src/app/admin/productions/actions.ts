"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productionRepository } from "@/repositories/productionRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { logAction } from "@/lib/audit";
import { slugify } from "@/utils/slug";
import { partPath, splitIntoParts } from "@/utils/articleParts";
import type { ContentStatus, Production } from "@/types/cms";
import {
  checkProductionPublication,
  publicationBlockedMessage,
  type ProductionFilesState,
} from "@/utils/productionPublication";
import {
  importedBodyFromForm,
  parseIdList,
  productionFormSchema,
  readProductionForm,
  toProductionColumns,
} from "./productionForm";

// Pages publiques d'une production : l'article (partie 1) et chacune de ses
// parties. "layout" couvre aussi les anciennes URL de parties renommées (elles
// se mettent alors à rediriger vers la partie 1).
function revalidateProductionPages(production: Pick<Production, "slug" | "body">) {
  const basePath = `/productions/${production.slug}`;
  revalidatePath(basePath, "layout");
  const parts = splitIntoParts(production.body);
  parts.forEach((_, index) => revalidatePath(partPath(basePath, parts, index)));
  revalidatePath("/productions");
}

// Colonnes du texte importé depuis le Word (uniquement après un import).
function bodyColumns(imported: ReturnType<typeof importedBodyFromForm>) {
  if (!imported) return {};
  return {
    body: imported.body,
    body_source_name: imported.body ? imported.sourceName : null,
    body_imported_at: imported.body ? new Date().toISOString() : null,
  };
}

// Refus côté serveur d'un passage en « Publié » sans Word ni PDF (l'interface
// le bloque déjà, mais elle peut être contournée).
function publicationError(
  previousStatus: ContentStatus | null,
  nextStatus: ContentStatus,
  files: ProductionFilesState,
) {
  const check = checkProductionPublication({ previousStatus, nextStatus, files });
  return check.allowed ? null : `${publicationBlockedMessage(check.missing)}.`;
}

export async function toggleProductionFeaturedAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const featured = formData.get("featured") === "true";
  if (!id) return;
  // Garde-fou : maximum 3 productions en vedette sur l'accueil.
  if (featured) {
    const all = await productionRepository.listProductions(true);
    const count = all.filter((p) => p.featured).length;
    if (count >= 3) return;
  }
  await productionRepository.updateProduction(id, { featured });
  revalidatePath("/admin/productions");
  revalidatePath("/");
}

export async function createProductionAction(_: string | null, formData: FormData): Promise<string | null> {
  const parsed = productionFormSchema.safeParse(readProductionForm(formData));

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  const imported = importedBodyFromForm(formData);
  const blocked = publicationError(null, parsed.data.status, {
    hasWord: !!imported?.body,
    hasPdf: !!parsed.data.fileId,
  });
  if (blocked) return blocked;

  const slug = (formData.get("slug") as string | null)?.trim() || slugify(parsed.data.title);

  let production;
  try {
    production = await productionRepository.createProduction({
      slug,
      ...toProductionColumns(parsed.data),
      ...bodyColumns(imported),
    });
  } catch {
    return "Erreur lors de l'enregistrement. Veuillez réessayer.";
  }

  const subThemeIds = parseIdList(formData, "subThemeIds");
  if (subThemeIds.length > 0) {
    await productionRepository.setProductionSubThemes(production.id, subThemeIds);
  }
  const authorIds = parseIdList(formData, "authorIds");
  if (authorIds.length > 0) {
    await authorRepository.setProductionAuthors(production.id, authorIds);
  }
  const resourceIds = parseIdList(formData, "resourceIds");
  if (resourceIds.length > 0) {
    await productionRepository.setProductionResources(production.id, resourceIds);
  }

  await logAction("create", {
    entityType: "production",
    entityId: production.id,
    summary: `Production créée : ${parsed.data.title}`,
  });
  revalidatePath("/admin/productions");
  revalidateProductionPages(production);
  redirect("/admin/productions?saved=1");
}

export async function updateProductionAction(_: string | null, formData: FormData): Promise<string | null> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return "Identifiant manquant.";

  const parsed = productionFormSchema.safeParse(readProductionForm(formData));

  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? "Données invalides.";
  }

  const current = await productionRepository.getProductionById(id);
  if (!current) return "Production introuvable.";
  const imported = importedBodyFromForm(formData);
  const blocked = publicationError(current.status, parsed.data.status, {
    hasWord: imported ? !!imported.body : !!current.body?.trim(),
    hasPdf: !!parsed.data.fileId,
  });
  if (blocked) return blocked;

  let updated: Production;
  try {
    // Le lien (slug) suit le titre tant que le contenu est encore en
    // brouillon (jamais publié) : évite qu'un titre provisoire (ex. "aaaa")
    // reste figé dans l'URL. Se fige dès la première publication, pour ne
    // jamais casser un lien déjà partagé/indexé.
    const slugSync = current.status === "draft" ? { slug: slugify(parsed.data.title) } : {};
    updated = await productionRepository.updateProduction(id, {
      ...toProductionColumns(parsed.data),
      ...slugSync,
      ...bodyColumns(imported),
    });
  } catch {
    return "Erreur lors de l'enregistrement. Veuillez réessayer.";
  }

  await productionRepository.setProductionSubThemes(id, parseIdList(formData, "subThemeIds"));
  await authorRepository.setProductionAuthors(id, parseIdList(formData, "authorIds"));
  await productionRepository.setProductionResources(id, parseIdList(formData, "resourceIds"));

  await logAction("update", {
    entityType: "production",
    entityId: id,
    summary: `Production modifiée : ${parsed.data.title}`,
  });
  revalidatePath("/admin/productions");
  revalidateProductionPages(updated);
  redirect("/admin/productions?saved=1");
}

export async function deleteProductionAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  await productionRepository.deleteProduction(id);
  await logAction("delete", { entityType: "production", entityId: id, summary: "Production supprimée" });
  revalidatePath("/admin/productions");
}

export async function toggleProductionStatusAction(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string | null)?.trim();
  const status = (formData.get("status") as string | null)?.trim();
  if (!id || !status) return;
  // Bascule vers « Publié » : même règle que la fiche (Word et PDF requis).
  if (status !== "published") {
    const current = await productionRepository.getProductionById(id);
    if (!current) return;
    const blocked = publicationError(current.status, "published", {
      hasWord: !!current.body?.trim(),
      hasPdf: !!current.fileId,
    });
    if (blocked) return;
  }
  await productionRepository.toggleStatus(id, status);
  revalidatePath("/admin/productions");
}
