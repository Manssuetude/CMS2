import Link from "next/link";
import { contentRepository } from "@/repositories/contentRepository";
import { ProductionForm } from "@/components/admin/ProductionForm";
import { createProductionAction } from "../actions";

export default async function NewProductionPage() {
  const themes = await contentRepository.listThemes(true);

  return (
    <section className="admin-panel">
      <Link href="/admin/productions" className="admin-back">
        Retour aux productions
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouvelle production</h1>
          <p>Créez un article, rapport, vidéo ou podcast. Elle sera en brouillon jusqu&apos;à publication.</p>
        </div>
      </div>
      <ProductionForm action={createProductionAction} themes={themes} />
    </section>
  );
}
