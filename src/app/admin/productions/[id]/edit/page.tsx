import { notFound } from "next/navigation";
import { productionRepository } from "@/repositories/productionRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { ProductionForm } from "@/components/admin/ProductionForm";
import { AdminFicheHeader } from "@/components/admin/AdminFicheHeader";
import { duplicateProductionAction, updateProductionAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductionPage({ params }: Props) {
  const { id } = await params;
  const [item, subThemes, authors, media, initialSubThemeIds, initialAuthorIds, initialResourceIds] = await Promise.all(
    [
      productionRepository.getProductionById(id),
      subThemeRepository.listSubThemes(true),
      authorRepository.listAuthors(),
      mediaRepository.list(),
      productionRepository.getProductionSubThemeIds(id),
      authorRepository.getProductionAuthorIds(id),
      productionRepository.getProductionResourceIds(id),
    ],
  );
  if (!item) notFound();
  // Thèmes rattachés : ceux des sous-thèmes de la production (gardés même archivés).
  const attachedThemeIds = subThemes.filter((st) => initialSubThemeIds.includes(st.id)).map((st) => st.themeId);
  const [{ themes, archivedHiddenCount }, pdf] = await Promise.all([
    themeRepository.listSelectableThemes(attachedThemeIds),
    item.fileId ? mediaRepository.getById(item.fileId) : Promise.resolve(null),
  ]);

  return (
    <section className="admin-panel">
      <AdminFicheHeader
        section={{ label: "Productions", href: "/admin/productions" }}
        title={item.title}
        status={item.status}
        publicHref={item.status === "published" ? `/productions/${item.slug}` : undefined}
        duplicate={{ action: duplicateProductionAction, id: item.id }}
      />
      <ProductionForm
        initialData={item}
        action={updateProductionAction}
        themes={themes}
        archivedHiddenCount={archivedHiddenCount}
        subThemes={subThemes}
        initialSubThemeIds={initialSubThemeIds}
        authors={authors}
        initialAuthorIds={initialAuthorIds}
        mediaItems={media}
        initialResourceIds={initialResourceIds}
        initialPdfName={pdf ? pdf.filename || pdf.title : null}
      />
    </section>
  );
}
