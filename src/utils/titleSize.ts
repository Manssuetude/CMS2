// Réduit la taille d'un grand titre (h1 de fiche détail) quand le texte est long,
// pour éviter un rendu disproportionné. Calculé côté serveur (pas de JS client).
export function titleFontSize(title: string): string | undefined {
  const len = title.length;
  if (len > 45) return "clamp(1.7rem, 1.1rem + 2.1vw, 2.4rem)";
  if (len > 28) return "clamp(2rem, 1.2rem + 2.8vw, 2.9rem)";
  return undefined; // taille par défaut (--ed-step-5)
}

// Même principe pour un chapô (eyebrow) qui doit tenir sur une seule ligne
// (ex. « Nom du thème parent · Sous-thème ») — le texte complet affiché
// (breadcrumb inclus) détermine le rétrécissement, pas seulement le titre.
export function eyebrowFontSize(text: string): string | undefined {
  const len = text.length;
  if (len > 55) return "clamp(0.6rem, 0.4rem + 0.7vw, 0.8125rem)";
  if (len > 40) return "clamp(0.68rem, 0.5rem + 0.55vw, 0.8125rem)";
  return undefined; // taille par défaut (--ed-step-small)
}
