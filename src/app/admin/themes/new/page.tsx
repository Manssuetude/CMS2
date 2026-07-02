import Link from "next/link";
import { NewThemeForm } from "@/components/admin/NewThemeForm";
import { createThemeAction } from "../actions";

export default function NewThemePage() {
  return (
    <section className="admin-panel">
      <Link href="/admin/themes" className="admin-back">
        ← Retour aux thèmes
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouveau thème</h1>
          <p>Créer un thème éditorial</p>
        </div>
      </div>
      <NewThemeForm action={createThemeAction} />
    </section>
  );
}
