// « Utilisé dans » (médiathèque) : pour chaque média, les contenus qui le
// référencent. Les sources sont normalisées en amont (colonnes d'images,
// listes d'identifiants, et texte JSON des pages et réglages).

export type MediaUsageSource = { label: string; href: string; ids: string[]; text?: string };
export type MediaUsage = { label: string; href: string };

export function collectMediaUsage(mediaIds: string[], sources: MediaUsageSource[]): Record<string, MediaUsage[]> {
  const usage: Record<string, MediaUsage[]> = {};
  for (const id of mediaIds) {
    const seen = new Set<string>();
    const list: MediaUsage[] = [];
    for (const source of sources) {
      if (!source.ids.includes(id) && !source.text?.includes(id)) continue;
      const key = `${source.label}|${source.href}`;
      if (seen.has(key)) continue;
      seen.add(key);
      list.push({ label: source.label, href: source.href });
    }
    usage[id] = list;
  }
  return usage;
}

export type MediaFilter = "tout" | "images" | "documents" | "sans-alt";

export function matchesMediaFilter(item: { type: string; alt?: string | null }, filter: MediaFilter): boolean {
  if (filter === "images") return item.type === "image";
  if (filter === "documents") return item.type !== "image";
  if (filter === "sans-alt") return item.type === "image" && !item.alt?.trim();
  return true;
}
