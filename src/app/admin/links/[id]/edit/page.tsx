import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { linkRepository } from "@/repositories/linkRepository";
import { LinkItemForm } from "@/components/admin/LinkItemForm";
import { updateLinkAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditLinkPage({ params }: Props) {
  const { id } = await params;
  const item = await linkRepository.getLinkById(id);
  if (!item) notFound();

  return (
    <section className="admin-panel">
      <Link href="/admin/links" className="admin-back">
        ← Retour aux liens
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier : {item.label}</h1>
          <p>Éditez ce lien.</p>
        </div>
        <a
          href="/links"
          target="_blank"
          rel="noreferrer"
          className="btn-sm"
          title="Voir la page publique dans un nouvel onglet"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Voir le rendu final
        </a>
      </div>
      <LinkItemForm initialData={item} action={updateLinkAction} />
    </section>
  );
}
