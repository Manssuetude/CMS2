import { toParisIsoDateTime } from "@/utils/seoText";

// Fichier iCalendar (.ics, RFC 5545) d'un événement, pour « Ajouter à mon
// agenda ». Heures saisies en heure de Paris, converties en UTC. Testé dans
// tests/ics.test.ts.

export type IcsEventInput = {
  uid: string;
  title: string;
  description?: string | null;
  location?: string | null;
  url?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  now?: Date;
};

// Échappement des valeurs texte : \ ; , et retours à la ligne.
export function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

// Lignes limitées à 75 octets, continuées par un espace (RFC 5545 §3.1).
export function foldIcsLine(line: string): string {
  const bytes = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74;
    if (bytes.encode(current + char).length > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function toUtcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function compactDate(date: string): string {
  return date.slice(0, 10).replace(/-/g, "");
}

function nextDay(date: string): string {
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function buildIcs(input: IcsEventInput): string {
  const now = input.now ?? new Date();
  const timing: string[] = [];
  const start = toParisIsoDateTime(input.date, input.startTime);
  if (input.startTime && start) {
    const startDate = new Date(start);
    const end = input.endTime ? toParisIsoDateTime(input.date, input.endTime) : null;
    // Sans heure de fin : durée par défaut de 2 heures.
    const endDate = end ? new Date(end) : new Date(startDate.getTime() + 2 * 3_600_000);
    timing.push(`DTSTART:${toUtcStamp(startDate)}`, `DTEND:${toUtcStamp(endDate)}`);
  } else {
    timing.push(
      `DTSTART;VALUE=DATE:${compactDate(input.date)}`,
      `DTEND;VALUE=DATE:${compactDate(nextDay(input.date))}`,
    );
  }
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Manssuetude//Evenements//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `DTSTAMP:${toUtcStamp(now)}`,
    ...timing,
    `SUMMARY:${escapeIcsText(input.title)}`,
    input.description ? `DESCRIPTION:${escapeIcsText(input.description)}` : null,
    input.location ? `LOCATION:${escapeIcsText(input.location)}` : null,
    input.url ? `URL:${input.url}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}
