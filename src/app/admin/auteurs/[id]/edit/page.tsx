import Link from "next/link";
import { notFound } from "next/navigation";
import { authorRepository } from "@/repositories/authorRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { AuthorForm } from "@/components/admin/AuthorForm";
import { updateAuthorAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditAuthorPage({ params }: Props) {
  const { id } = await params;
  const [item, media] = await Promise.all([authorRepository.getAuthorById(id), mediaRepository.list()]);
  if (!item) notFound();
  const images = media.filter((m) => m.type === "image");

  return (
    <section className="admin-panel">
      <Link href="/admin/auteurs" className="admin-back">
        ← Retour aux auteurs
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier l&apos;auteur</h1>
          <p>{item.name}</p>
        </div>
      </div>
      <AuthorForm initialData={item} action={updateAuthorAction} images={images} />
    </section>
  );
}
