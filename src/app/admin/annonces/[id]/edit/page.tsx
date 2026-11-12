import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { announcementRepository } from "@/repositories/announcementRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { isAnnouncementId } from "@/services/announcementService";
import { announcementStatusLabel } from "@/utils/announcements";
import { updateAnnouncementAction } from "../../actions";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("annonces:edit");
  const { id } = await params;
  if (!isAnnouncementId(id)) notFound();
  const [item, others, media] = await Promise.all([
    announcementRepository.getById(id),
    announcementRepository.list(),
    mediaRepository.list(),
  ]);
  if (!item) notFound();

  return (
    <section className="admin-panel">
      <Link href="/admin/annonces" className="admin-back">
        ← Retour aux annonces
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier : {item.name}</h1>
          <p>{announcementStatusLabel(item, new Date())}</p>
        </div>
      </div>
      <AnnouncementForm
        initialData={item}
        others={others}
        images={media.filter((m) => m.type === "image")}
        action={updateAnnouncementAction}
      />
    </section>
  );
}
