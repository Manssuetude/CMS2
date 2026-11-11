import type { Event, EventAnimator, GalleryPhoto } from "@/types/cms";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";

// Données de la page événement (EvenementDetail), assemblées à partir
// d'identifiants. La page publique passe ceux enregistrés en base ; l'aperçu
// admin passe ceux du formulaire, même non enregistrés. Lecture seule.

export type EventRelations = {
  formatIds: string[];
  themeIds: string[];
  subThemeIds: string[];
  animators: EventAnimator[];
};

// Affiche + photos de galerie en une seule requête. L'affiche est retirée de la
// galerie publique si elle y figure aussi (pas d'image affichée deux fois).
export async function loadEventMedia(
  posterId: string | null | undefined,
  galleryIds: string[],
): Promise<{ poster: GalleryPhoto | null; gallery: GalleryPhoto[] }> {
  const photos = await mediaRepository.getGalleryPhotos(posterId ? [posterId, ...galleryIds] : galleryIds);
  const poster = posterId ? (photos.find((photo) => photo.id === posterId) ?? null) : null;
  return { poster, gallery: photos.filter((photo) => photo.id !== posterId) };
}

export async function loadEventRelations(eventId: string): Promise<EventRelations> {
  const [formatIds, themeIds, subThemeIds, animators] = await Promise.all([
    activityFormatRepository.getActivityFormatIds(eventId),
    eventRepository.getEventThemeIds(eventId),
    eventRepository.getEventSubThemeIds(eventId),
    authorRepository.getEventAnimators(eventId),
  ]);
  return { formatIds, themeIds, subThemeIds, animators };
}

export async function buildEventPageProps(item: Event, relations: EventRelations) {
  const [allFormats, authors, media, allThemes, allSubThemes] = await Promise.all([
    activityFormatRepository.listFormats(),
    authorRepository.listAuthors(),
    loadEventMedia(item.posterId, item.gallery),
    themeRepository.listThemes(),
    subThemeRepository.listSubThemes(),
  ]);
  const authorsById = new Map(authors.map((a) => [a.id, a]));
  return {
    item,
    formats: allFormats.filter((f) => relations.formatIds.includes(f.id)),
    allFormats,
    animators: relations.animators.flatMap((link) => {
      const author = authorsById.get(link.authorId);
      return author ? [{ author, contribution: link.contribution }] : [];
    }),
    poster: media.poster,
    gallery: media.gallery,
    themes: allThemes.filter((t) => relations.themeIds.includes(t.id)),
    subThemes: allSubThemes.filter((st) => relations.subThemeIds.includes(st.id)),
    allThemes,
  };
}
