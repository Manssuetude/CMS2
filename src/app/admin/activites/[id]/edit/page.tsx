import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { contentRepository } from "@/repositories/contentRepository";
import { ActiviteForm } from "@/components/admin/ActiviteForm";
import { updateActivityAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditActivitePage({ params }: Props) {
  const { id } = await params;
  const item = await contentRepository.getActivityById(id);
  if (!item) notFound();

  return (
    <section className="admin-panel">
      <Link href="/admin/activites" className="admin-back">
        ← Retour aux activités
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier l&apos;activité</h1>
          <p>{item.title}</p>
        </div>
        <a
          href={`/activites/${item.slug}`}
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
      <ActiviteForm initialData={item} action={updateActivityAction} />
    </section>
  );
}
