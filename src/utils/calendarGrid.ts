// Grille de calendrier mensuel (semaines lundi→dimanche) — logique pure,
// partagée entre le calendrier admin (EventCalendar) et le calendrier
// public des événements, qui n'ont pas le même rendu/CSS mais le même besoin
// de calcul de grille.

export type CalendarCell = { date: Date; current: boolean };

export function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Lundi = 0 … Dimanche = 6
  const startDow = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;

  const cells: CalendarCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(year, month, 1 - startDow + i);
    cells.push({ date: d, current: d.getMonth() === month });
  }
  return cells;
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function groupByDateKey<T>(items: T[], getDate: (item: T) => string | null | undefined): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const date = getDate(item);
    if (!date) continue;
    const key = date.slice(0, 10);
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  return map;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}
