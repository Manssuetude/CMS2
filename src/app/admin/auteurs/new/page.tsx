import Link from "next/link";
import { mediaRepository } from "@/repositories/mediaRepository";
import { AuthorForm } from "@/components/admin/AuthorForm";
import { createAuthorAction } from "../actions";

export default async function NewAuthorPage() {
  const media = await mediaRepository.list();
  const images = media.filter((m) => m.type === "image");

  return (
    <section className="admin-panel">
      <Link href="/admin/auteurs" className="admin-back">
        ← Retour aux auteurs
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouvel auteur</h1>
          <p>Créer une fiche auteur réutilisable</p>
        </div>
      </div>
      <AuthorForm action={createAuthorAction} images={images} />
    </section>
  );
}
