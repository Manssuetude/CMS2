/**
 * Ratios (largeur / hauteur) des conteneurs d'image, partagés entre l'éditeur de
 * recadrage (admin) et l'affichage public, pour garantir un aperçu fidèle (WYSIWYG).
 * L'éditeur crope à ce ratio ET le conteneur d'affichage l'impose : le cadrage
 * enregistré correspond exactement à ce qui est rendu.
 */
export const HERO_ASPECT = 5 / 4;

/** /nous-rejoindre : photo principale en bandeau (~1080 × 405). */
export const JOIN_BANNER_ASPECT = 8 / 3;
/** /nous-rejoindre : photo « Notre point de départ ». */
export const JOIN_START_ASPECT = 4 / 3;
/** /nous-rejoindre : photos verticales (expérience collective, bloc « Rejoindre »). */
export const PORTRAIT_ASPECT = 4 / 5;
