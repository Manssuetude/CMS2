import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { productionRepository } from "@/repositories/productionRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { ProductionForm } from "@/components/admin/ProductionForm";
import { updateProductionAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductionPage({ params }: Props) {
  const { id } = await params;
  const [item, themes, subThemes] = await Promise.all([
    productionRepository.getProductionById(id),
    themeRepository.listThemes(true),
    subThemeRepository.listSubThemes(true),
  ]);
  if (!item) notFound();
  const initialSubThemeIds = await productionRepository.getProductionSubThemeIds(id);

  return (
    <section className="admin-panel">
      <Link href="/admin/productions" className="admin-back">
        ← Retour aux productions
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier la production</h1>
          <p>{item.title}</p>
        </div>
        <a
          href={`/productions/${item.slug}`}
          target="_blank"
          rel="noreferrer"
          className="btn-sm"
          title="Voir la page publique dans un nouvel onglet"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Prévisualiser
          {item.status !== "published" && (
            <span className="badge-status badge-draft" style={{ marginLeft: 4 }}>
              {item.status === "archived" ? "Archivé" : "Brouillon"}
            </span>
          )}
        </a>
      </div>
      <ProductionForm
        initialData={item}
        action={updateProductionAction}
        themes={themes}
        subThemes={subThemes}
        initialSubThemeIds={initialSubThemeIds}
      />
    </section>
  );
}
