import Link from "next/link";
import { notFound } from "next/navigation";
import { mediaRepository } from "@/repositories/mediaRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { MediaEditForm } from "@/components/admin/MediaEditForm";
import { updateMediaMetadataAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditMediaPage({ params }: Props) {
  const { id } = await params;
  const item = await mediaRepository.getById(id);
  if (!item) notFound();
  const { themes } = await themeRepository.listSelectableThemes(item.themeId ? [item.themeId] : []);

  return (
    <section className="admin-panel">
      <Link href="/admin/media" className="admin-back">
        ← Retour à la médiathèque
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier le média</h1>
          <p>{item.title}</p>
        </div>
      </div>
      <MediaEditForm item={item} themes={themes} action={updateMediaMetadataAction} />
    </section>
  );
}
