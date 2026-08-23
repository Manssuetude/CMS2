import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { pageRepository } from "@/repositories/pageRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { PAGE_DIRECTORY } from "@/constants/site";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { savePageContentAction } from "../actions";

// Slugs sans éditeur dédié (accueil/perca/history en ont un et n'atterrissent
// jamais ici — voir DEDICATED_EDITOR sur /admin/pages).
const PAGE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_DIRECTORY)
    .filter(([, entry]) => !entry.editorPath)
    .map(([slug, entry]) => [slug, entry.label]),
);

export default async function EditPageBySlug({ params }: { params: Promise<{ slug: string }> }) {
  await requirePermission("pages:edit");
  const { slug } = await params;
  if (!PAGE_LABELS[slug]) notFound();

  const [page, media] = await Promise.all([pageRepository.getPage(slug), mediaRepository.list()]);
  const images = media.filter((m) => m.type === "image");

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/pages" className="btn-sm" style={{ marginBottom: 10 }}>
            ← Toutes les pages
          </Link>
          <h1>Modifier : {PAGE_LABELS[slug]}</h1>
          <p>Éditez le texte, la photo hero et le SEO de cette page.</p>
        </div>
        <a
          href={PAGE_DIRECTORY[slug]?.publicPath ?? "/"}
          target="_blank"
          rel="noreferrer"
          className="btn-sm"
          title="Voir la page publique dans un nouvel onglet"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Voir le rendu final
        </a>
      </div>

      <PageContentForm
        slug={slug}
        label={PAGE_LABELS[slug]}
        page={page}
        images={images}
        action={savePageContentAction}
      />
    </section>
  );
}
