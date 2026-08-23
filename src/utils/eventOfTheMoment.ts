import type { Event } from "@/types/cms";

function startOfWeek(now: Date): Date {
  const date = new Date(now);
  const day = date.getDay(); // 0 = dimanche
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Exportée pour être réutilisée par le filtre « En cours » de /evenements.
export function isThisWeek(dateStr: string, now: Date): boolean {
  const start = startOfWeek(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const d = new Date(dateStr);
  return d >= start && d < end;
}

function closestByDate<T extends { date: string }>(items: T[], now: Date): T {
  return items.reduce((closest, current) => {
    const closestDiff = Math.abs(new Date(closest.date).getTime() - now.getTime());
    const currentDiff = Math.abs(new Date(current.date).getTime() - now.getTime());
    return currentDiff < closestDiff ? current : closest;
  });
}

/**
 * "Événement du moment" (accueil), par ordre de priorité :
 * 1. Un événement a lieu cette semaine (lundi-dimanche) → le plus proche d'aujourd'hui.
 * 2. Sinon, l'événement choisi en admin comme repli (`fallback`), si défini.
 * 3. Sinon, l'événement le plus proche d'aujourd'hui toutes dates confondues
 *    (mieux vaut montrer un événement passé/lointain que rien du tout).
 */
export function pickEventOfTheMoment(
  events: Event[],
  fallback: Event | null = null,
  now: Date = new Date(),
): Event | null {
  const dated = events.filter((e): e is Event & { date: string } => Boolean(e.date));

  const thisWeek = dated.filter((e) => isThisWeek(e.date, now));
  if (thisWeek.length > 0) return closestByDate(thisWeek, now);

  if (fallback) return fallback;

  if (dated.length === 0) return null;
  return closestByDate(dated, now);
}
