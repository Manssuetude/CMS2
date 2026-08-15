import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { contentRepository } from "@/repositories/contentRepository";
import { SubThemeForm } from "@/components/admin/SubThemeForm";
import { updateSubThemeAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSubThemePage({ params }: Props) {
  const { id } = await params;
  const [item, themes] = await Promise.all([contentRepository.getSubThemeById(id), contentRepository.listThemes(true)]);
  if (!item) notFound();
  const parentTheme = themes.find((t) => t.id === item.themeId);

  return (
    <section className="admin-panel">
      <Link href="/admin/sousthemes" className="admin-back">
        ← Retour aux sous-thèmes
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier le sous-thème</h1>
          <p>{item.title}</p>
        </div>
        {parentTheme && (
          <a
            href={`/themes/${parentTheme.slug}/${item.slug}`}
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
        )}
      </div>
      <SubThemeForm initialData={item} action={updateSubThemeAction} themes={themes} />
    </section>
  );
}
