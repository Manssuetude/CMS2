/**
 * Ratios (largeur / hauteur) des conteneurs d'image, partagés entre l'éditeur de
 * recadrage (admin) et l'affichage public, pour garantir un aperçu fidèle (WYSIWYG).
 * L'éditeur crope à ce ratio ET le conteneur d'affichage l'impose : le cadrage
 * enregistré correspond exactement à ce qui est rendu.
 */
export const HERO_ASPECT = 3 / 2;
export const FOCUS_ASPECT = 4 / 3;
export const CARD_ASPECT = 16 / 10;
