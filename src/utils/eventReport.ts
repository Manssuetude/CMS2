// Événement passé sans compte-rendu : ni photos (galerie), ni documents.
// Signalé en haut de la fiche et dans « À faire » du tableau de bord.

export type EventReportInput = {
  date?: string | null;
  gallery?: string[] | null;
  documents?: string[] | null;
};

/** Date du jour (AAAA-MM-JJ) à Paris. */
export function parisToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(now);
}

export function isPastEvent(event: Pick<EventReportInput, "date">, today: string): boolean {
  return !!event.date && event.date.slice(0, 10) < today;
}

export function needsEventReport(event: EventReportInput, today: string): boolean {
  return isPastEvent(event, today) && !event.gallery?.length && !event.documents?.length;
}
