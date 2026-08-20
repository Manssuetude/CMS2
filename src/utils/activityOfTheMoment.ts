import type { Activity } from "@/types/cms";

function startOfWeek(now: Date): Date {
  const date = new Date(now);
  const day = date.getDay(); // 0 = dimanche
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isThisWeek(dateStr: string, now: Date): boolean {
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
 * "Activité du moment" (accueil), par ordre de priorité :
 * 1. Une activité a lieu cette semaine (lundi-dimanche) → la plus proche d'aujourd'hui.
 * 2. Sinon, l'activité choisie en admin comme repli (`fallback`), si définie.
 * 3. Sinon, l'activité la plus proche d'aujourd'hui toutes dates confondues
 *    (mieux vaut montrer une activité passée/lointaine que rien du tout).
 */
export function pickActivityOfTheMoment(
  activities: Activity[],
  fallback: Activity | null = null,
  now: Date = new Date(),
): Activity | null {
  const dated = activities.filter((a): a is Activity & { date: string } => Boolean(a.date));

  const thisWeek = dated.filter((a) => isThisWeek(a.date, now));
  if (thisWeek.length > 0) return closestByDate(thisWeek, now);

  if (fallback) return fallback;

  if (dated.length === 0) return null;
  return closestByDate(dated, now);
}
