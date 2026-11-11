import type { Event } from "@/types/cms";
import { shortDateLabel, timeRangeLabel } from "@/utils/eventLabels";
import { eventStatusLabel, resolveEventStatus, type EventDisplayStatus } from "@/utils/eventStatus";

// Infos pratiques d'un événement, partagées par la carte « Infos pratiques »
// (style Classique) et la barre d'infos (style Bannière). Une info absente vaut
// null : l'affichage montre alors « … à confirmer » au lieu de la masquer.

export type EventCta = { label: string; href: string; external: boolean; kind: "photos" | "register" };

export type EventFacts = {
  dateLabel: string | null;
  timeLabel: string | null;
  // Versions courtes de la barre d'infos mobile : « Mer. 23 sept. 2026 », « 17h30 à 22h00 ».
  shortDateLabel: string | null;
  timeRangeLabel: string | null;
  location: string | null;
  mapsUrl: string | null;
  capacity: string | null;
  status: EventDisplayStatus;
  statusLabel: string;
  cta: EventCta | null;
  // « Ajouter à mon agenda » : uniquement avec un bouton d'inscription.
  icsHref: string | null;
};

export const GALLERY_ANCHOR = "photos";

function formatTime(time: string): string {
  return time.slice(0, 5).replace(":", " h ");
}

export function buildEventFacts(
  item: Pick<
    Event,
    | "slug"
    | "date"
    | "startTime"
    | "endTime"
    | "location"
    | "capacity"
    | "eventbriteUrl"
    | "registrationStatus"
    | "progressStatus"
  >,
  options: { photoCount: number; now?: Date },
): EventFacts {
  const status = resolveEventStatus({
    registrationStatus: item.registrationStatus,
    progressStatus: item.progressStatus,
    date: item.date,
    now: options.now,
  });
  const date = item.date ? new Date(`${item.date.slice(0, 10)}T12:00:00`) : null;
  const dateLabel =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : null;
  const timeLabel = item.startTime
    ? `${formatTime(item.startTime)}${item.endTime ? ` – ${formatTime(item.endTime)}` : ""}`
    : null;
  const location = item.location?.trim() || null;

  let cta: EventCta | null = null;
  let icsHref: string | null = null;
  if (status === "termine") {
    if (options.photoCount > 0)
      cta = { label: "Voir les photos", href: `#${GALLERY_ANCHOR}`, external: false, kind: "photos" };
  } else if (item.eventbriteUrl) {
    cta = { label: "S'inscrire", href: item.eventbriteUrl, external: true, kind: "register" };
    if (item.date && item.slug) icsHref = `/api/evenements/${item.slug}/ics`;
  }

  return {
    dateLabel: dateLabel ? dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1) : null,
    timeLabel,
    shortDateLabel: shortDateLabel(item.date),
    timeRangeLabel: timeRangeLabel(item.startTime, item.endTime),
    location,
    mapsUrl: location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}` : null,
    capacity: item.capacity?.trim() || null,
    status,
    statusLabel: eventStatusLabel(status),
    cta,
    icsHref,
  };
}
