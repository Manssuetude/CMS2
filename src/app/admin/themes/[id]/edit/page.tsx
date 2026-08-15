import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { themeRepository } from "@/repositories/themeRepository";
import { ThemeForm } from "@/components/admin/ThemeForm";
import { updateThemeAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditThemePage({ params }: Props) {
  const { id } = await params;
  const item = await themeRepository.getThemeById(id);
  if (!item) notFound();

  return (
    <section className="admin-panel">
      <Link href="/admin/themes" className="admin-back">
        ← Retour aux thèmes
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier le thème</h1>
          <p>{item.title}</p>
        </div>
        <a
          href={`/themes/${item.slug}`}
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
      <ThemeForm initialData={item} action={updateThemeAction} />
    </section>
  );
}
