import Link from "next/link";
import { contentRepository } from "@/repositories/contentRepository";
import { SubThemeForm } from "@/components/admin/SubThemeForm";
import { createSubThemeAction } from "../actions";

export default async function NewSubThemePage() {
  const themes = await contentRepository.listThemes(true);

  return (
    <section className="admin-panel">
      <Link href="/admin/sousthemes" className="admin-back">
        ← Retour aux sous-thèmes
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouveau sous-thème</h1>
          <p>Créer un sujet traité au sein d&apos;un thème</p>
        </div>
      </div>
      <SubThemeForm action={createSubThemeAction} themes={themes} />
    </section>
  );
}
