import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { announcementRepository } from "@/repositories/announcementRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { createAnnouncementAction } from "../actions";

export default async function NewAnnouncementPage() {
  await requirePermission("annonces:create");
  const [others, media] = await Promise.all([announcementRepository.list().catch(() => []), mediaRepository.list()]);

  return (
    <section className="admin-panel">
      <Link href="/admin/annonces" className="admin-back">
        ← Retour aux annonces
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouvelle annonce</h1>
          <p>Remplissez les sections utiles. L&apos;aperçu est disponible après le premier enregistrement.</p>
        </div>
      </div>
      <AnnouncementForm
        others={others}
        images={media.filter((m) => m.type === "image")}
        action={createAnnouncementAction}
      />
    </section>
  );
}
