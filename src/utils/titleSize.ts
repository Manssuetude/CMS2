// Réduit la taille d'un grand titre (h1 de fiche détail) quand le texte est long,
// pour éviter un rendu disproportionné. Calculé côté serveur (pas de JS client).
export function titleFontSize(title: string): string | undefined {
  const len = title.length;
  if (len > 45) return "clamp(1.7rem, 1.1rem + 2.1vw, 2.4rem)";
  if (len > 28) return "clamp(2rem, 1.2rem + 2.8vw, 2.9rem)";
  return undefined; // taille par défaut (--ed-step-5)
}
