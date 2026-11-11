// En-tête de la page événement — choix de l'image et du style effectif.
// Fonctions pures, partagées par la page publique, l'aperçu admin et
// l'avertissement en direct du formulaire (tests/eventHeader.test.ts).

export type HeaderStyle = "classic" | "banner";

export const HEADER_STYLES: readonly HeaderStyle[] = ["classic", "banner"];

// En dessous de ce ratio largeur/hauteur, une image ne remplit pas une bannière
// bord à bord sans perdre l'essentiel (portrait, carré, affiche) : repli Classique.
export const BANNER_MIN_RATIO = 1.2;

type Sized = { width?: number | null; height?: number | null };

export function toHeaderStyle(value: unknown): HeaderStyle {
  return value === "banner" ? "banner" : "classic";
}

// Image d'en-tête : l'affiche, sinon la 1re photo de la galerie, sinon aucune.
export function pickHeaderImage<T>(poster: T | null | undefined, gallery: T[]): { image: T | null; isPoster: boolean } {
  if (poster) return { image: poster, isPoster: true };
  return { image: gallery[0] ?? null, isPoster: false };
}

export function isBannerCompatible(image: Sized | null | undefined): boolean {
  if (!image?.width || !image.height) return false;
  return image.width / image.height >= BANNER_MIN_RATIO;
}

// Style réellement affiché : la Bannière n'est retenue que si l'image existe et
// est assez large (dimensions connues) ; sinon la page s'affiche en Classique.
export function resolveHeaderStyle(requested: HeaderStyle, image: Sized | null | undefined): HeaderStyle {
  return requested === "banner" && isBannerCompatible(image) ? "banner" : "classic";
}

// Classique : une affiche (texte dedans) s'affiche toujours entière ; une photo
// peut être recadrée. La Bannière recadre toujours (image déjà paysage).
export function headerImageFit(style: HeaderStyle, isPoster: boolean): "contain" | "cover" {
  return style === "classic" && isPoster ? "contain" : "cover";
}

// Image de fond de la bannière : JAMAIS l'affiche (elle contient du texte,
// le titre superposé la rendrait illisible) — 1re photo de la galerie, affiche
// déjà exclue en amont (loadEventMedia).
export function pickBannerImage<T>(gallery: T[]): T | null {
  return gallery[0] ?? null;
}

// En-tête réellement affiché : Bannière seulement avec une 1re photo de galerie
// assez large ; sinon Classique, avec l'affiche (ou à défaut la 1re photo).
export function resolveEventHeader<T extends Sized>(
  requested: HeaderStyle,
  poster: T | null | undefined,
  gallery: T[],
): { style: HeaderStyle; image: T | null; isPoster: boolean } {
  const bannerImage = pickBannerImage(gallery);
  if (requested === "banner" && isBannerCompatible(bannerImage)) {
    return { style: "banner", image: bannerImage, isPoster: false };
  }
  return { style: "classic", ...pickHeaderImage(poster, gallery) };
}

// Avertissement de l'admin quand la Bannière est choisie mais ne pourra pas
// s'afficher (null : la bannière s'affichera).
export function bannerWarning(gallery: Sized[]): string | null {
  const image = pickBannerImage(gallery);
  if (!image) return "La bannière utilise la 1re photo de la galerie, pas l'affiche. Ajoutez au moins une photo.";
  if (!isBannerCompatible(image))
    return "La 1re photo de la galerie n'est pas assez large pour la bannière : la page s'affichera en style Classique.";
  return null;
}
