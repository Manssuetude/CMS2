import type { Metadata } from "next";
import { requireProductionEditor } from "@/lib/productionAccess";
import { renderProductionPreview } from "@/app/admin/productions/preview";
import { PagePreviewFrame } from "@/components/admin/PagePreviewFrame";
import { ArticleReader } from "@/components/public/ArticleReader";

// Contenu de l'iframe d'aperçu d'une production (voir ProductionPreviewModal) :
// reçoit les valeurs du formulaire par postMessage et affiche la page de
// lecture publique de la partie demandée. Réservé à qui peut éditer les productions.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aperçu de la production",
  robots: { index: false, follow: false },
};

// Comme pour l'aperçu d'événement : ArticleReader est importé ici pour que ses
// composants client (colonne des parties, partage, citation) fassent partie du
// manifeste client de cette route.
export default async function ProductionPreviewPage() {
  await requireProductionEditor();
  return <PagePreviewFrame render={renderProductionPreview} rendererName={ArticleReader.name} />;
}
