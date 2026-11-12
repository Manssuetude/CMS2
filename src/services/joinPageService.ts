import type { Announcement, GalleryPhoto } from "@/types/cms";
import { mediaRepository } from "@/repositories/mediaRepository";
import { pageRepository } from "@/repositories/pageRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { joinPhotoIds, parseJoinPageContent } from "@/utils/joinPage";

// Données de /nous-rejoindre (JoinEditorial), partagées entre la page publique
// et l'aperçu d'une annonce. L'annonce n'est retenue que si elle s'applique à
// la page (`applies_to_join_page`). Lecture seule.
export async function loadJoinPage(announcement: Announcement | null) {
  const page = await pageRepository.getPage("nous-rejoindre");
  if (!page) return null;
  const content = parseJoinPageContent(page.content);
  const [photos, keyFigures] = await Promise.all([
    mediaRepository.getGalleryPhotos(joinPhotoIds(content)),
    siteSettingsRepository.getKeyFigures(),
  ]);
  return {
    page,
    content,
    photos: Object.fromEntries(photos.map((p) => [p.id, p])) as Record<string, GalleryPhoto>,
    keyFigures,
    announcement: announcement?.appliesToJoinPage ? announcement : null,
  };
}
