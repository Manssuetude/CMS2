// Duplication d'un contenu (événement, production) : titre et slug de la copie.

export function copyTitle(title: string): string {
  return `Copie de ${title}`;
}

/** Slug libre : `base`, sinon `base-2`, `base-3`… */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const root = base || "copie";
  if (!used.has(root)) return root;
  for (let n = 2; ; n += 1) {
    const candidate = `${root}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
}
