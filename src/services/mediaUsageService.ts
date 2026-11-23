import { mediaUsageRepository } from "@/repositories/mediaUsageRepository";
import { PAGE_DIRECTORY } from "@/constants/site";
import { collectMediaUsage, type MediaUsage, type MediaUsageSource } from "@/utils/mediaUsage";

// « Utilisé dans » pour chaque média de la médiathèque. Les images placées
// dans le texte des productions (import Word) ne sont pas recherchées : il
// faudrait lire tous les textes complets.

type Row = Record<string, unknown>;
const str = (value: unknown) => (typeof value === "string" ? value : "");
const ids = (...values: unknown[]) =>
  values.flatMap((v) => (Array.isArray(v) ? v : [v])).filter((v): v is string => typeof v === "string" && !!v);

function linked(rows: Row[], ownerKey: string, ownerId: string): string[] {
  return rows.filter((r) => str(r[ownerKey]) === ownerId).map((r) => str(r.resource_id));
}

export const mediaUsageService = {
  async getUsage(mediaIds: string[]): Promise<Record<string, MediaUsage[]>> {
    const refs = await mediaUsageRepository.listReferences();
    const sources: MediaUsageSource[] = [
      ...refs.announcements.map((r) => ({
        label: `Annonce · ${str(r.name)}`,
        href: `/admin/annonces/${str(r.id)}/edit`,
        ids: ids(r.image_id),
      })),
      ...refs.events.map((r) => ({
        label: `Événement · ${str(r.title)}`,
        href: `/admin/evenements/${str(r.id)}/edit`,
        ids: ids(r.poster_id, r.gallery, r.documents, linked(refs.eventResources, "event_id", str(r.id))),
      })),
      ...refs.productions.map((r) => ({
        label: `Production · ${str(r.title)}`,
        href: `/admin/productions/${str(r.id)}/edit`,
        ids: ids(r.file_id, r.thumbnail_id, linked(refs.productionResources, "production_id", str(r.id))),
      })),
      ...refs.projects.map((r) => ({
        label: `Projet · ${str(r.title)}`,
        href: `/admin/projets/${str(r.id)}/edit`,
        ids: ids(r.documents, linked(refs.projectResources, "project_id", str(r.id))),
      })),
      ...refs.themes.map((r) => ({
        label: `Thème · ${str(r.title)}`,
        href: `/admin/themes/${str(r.id)}/edit`,
        ids: ids(r.hero_image_id, r.thumbnail_id),
      })),
      ...refs.authors.map((r) => ({
        label: `Auteur · ${str(r.name)}`,
        href: `/admin/auteurs/${str(r.id)}/edit`,
        ids: ids(r.photo_id),
      })),
      ...refs.dossiers.map((r) => ({
        label: `Dossier · ${str(r.title)}`,
        href: `/admin/dossiers/${str(r.id)}/edit`,
        ids: ids(r.image_id),
      })),
      ...refs.journal.map((r) => ({
        label: `Journal · ${str(r.title)}`,
        href: `/admin/journal/${str(r.id)}/edit`,
        ids: ids(r.thumbnail_id),
      })),
      ...refs.pages.map((r) => {
        const slug = str(r.slug);
        const entry = PAGE_DIRECTORY[slug];
        return {
          label: `Page ${entry?.label ?? (str(r.title) || slug)}`,
          href: entry?.editorPath ?? `/admin/pages/${slug}`,
          ids: ids(r.image_id, r.seo_image_id),
          text: r.content ? JSON.stringify(r.content) : undefined,
        };
      }),
      ...refs.settings.map((r) => ({
        label: "Réglages du site (accueil, logo)",
        href: "/admin/homepage",
        ids: [],
        text: JSON.stringify(r),
      })),
    ];
    return collectMediaUsage(mediaIds, sources);
  },
};
