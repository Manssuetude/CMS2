/**
 * Ratios (largeur / hauteur) des conteneurs d'image, partagés entre l'éditeur de
 * recadrage (admin) et l'affichage public, pour garantir un aperçu fidèle (WYSIWYG).
 * L'éditeur crope à ce ratio ET le conteneur d'affichage l'impose : le cadrage
 * enregistré correspond exactement à ce qui est rendu.
 */
export const HERO_ASPECT = 5 / 4;
