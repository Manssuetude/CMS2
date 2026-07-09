import Link from "next/link";
import { ProjetForm } from "@/components/admin/ProjetForm";
import { createProjectAction } from "../actions";

export default function NewProjetPage() {
  return (
    <section className="admin-panel">
      <Link href="/admin/projets" className="admin-back">
        Retour aux projets
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouveau projet</h1>
          <p>Créez un nouveau projet. Il sera en brouillon jusqu&apos;à publication.</p>
        </div>
      </div>
      <ProjetForm action={createProjectAction} />
    </section>
  );
}
