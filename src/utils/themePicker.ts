import type { Theme } from "@/types/cms";

// Sélecteurs de thème de l'admin : les thèmes archivés ne sont plus proposés,
// sauf ceux déjà rattachés au contenu (affichés avec « (archivé) »).

export type SelectableThemes = { themes: Theme[]; archivedHiddenCount: number };

export function selectableThemes(all: Theme[], attachedIds: string[] = []): SelectableThemes {
  const attached = new Set(attachedIds);
  const themes = all.filter((theme) => theme.status !== "archived" || attached.has(theme.id));
  return { themes, archivedHiddenCount: all.length - themes.length };
}

/** Libellé d'un thème dans un sélecteur (« Titre (archivé) » pour un thème archivé rattaché). */
export function themeOptionLabel(theme: Pick<Theme, "title" | "status">): string {
  return theme.status === "archived" ? `${theme.title} (archivé)` : theme.title;
}

export function archivedHiddenLabel(count: number): string | null {
  if (count <= 0) return null;
  return `${count} thème${count > 1 ? "s" : ""} archivé${count > 1 ? "s" : ""} masqué${count > 1 ? "s" : ""}`;
}
