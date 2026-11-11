import Link from "next/link";
import { CalendarDays, CalendarPlus, Clock3, Images, MapPin, Users, ArrowUpRight } from "lucide-react";
import type { EventFacts } from "@/utils/eventFacts";
import { ShareButtons } from "@/components/public/ShareButtons";

// Carte « Infos pratiques » du style Classique (colonne latérale, collante sur
// ordinateur) : infos à icône, statut unique, action principale, partage, thèmes.
export function EventInfoCard({
  facts,
  shareUrl,
  title,
  themes,
}: {
  facts: EventFacts;
  shareUrl: string;
  title: string;
  themes: ThemeChip[];
}) {
  return (
    <aside className="event-infocard" aria-labelledby="event-infocard-title">
      <h2 id="event-infocard-title">Infos pratiques</h2>
      <ul className="event-infocard-facts">
        <li className={facts.dateLabel ? undefined : "is-pending"}>
          <CalendarDays size={18} strokeWidth={1.6} aria-hidden="true" />
          <span>{facts.dateLabel ?? "Date à confirmer"}</span>
        </li>
        <li className={facts.timeLabel ? undefined : "is-pending"}>
          <Clock3 size={18} strokeWidth={1.6} aria-hidden="true" />
          <span>{facts.timeLabel ?? "Horaire à confirmer"}</span>
        </li>
        <li className={facts.location ? undefined : "is-pending"}>
          <MapPin size={18} strokeWidth={1.6} aria-hidden="true" />
          <span>
            {facts.location ?? "Lieu à confirmer"}
            {facts.mapsUrl && (
              <a className="event-maps-link" href={facts.mapsUrl} target="_blank" rel="noopener noreferrer">
                Voir sur la carte
              </a>
            )}
          </span>
        </li>
        <li className={facts.capacity ? undefined : "is-pending"}>
          <Users size={18} strokeWidth={1.6} aria-hidden="true" />
          <span>{facts.capacity ?? "Places à confirmer"}</span>
        </li>
      </ul>

      <span className={`event-status event-status--${facts.status}`}>{facts.statusLabel}</span>

      {facts.cta && (
        <a
          className="event-infocard-cta"
          href={facts.cta.href}
          {...(facts.cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {facts.cta.kind === "photos" ? (
            <Images size={18} strokeWidth={1.7} aria-hidden="true" />
          ) : (
            <ArrowUpRight size={18} strokeWidth={1.7} aria-hidden="true" />
          )}
          {facts.cta.label}
        </a>
      )}
      {facts.icsHref && (
        <a className="event-infocard-secondary" href={facts.icsHref} download>
          <CalendarPlus size={16} strokeWidth={1.7} aria-hidden="true" />
          Ajouter à mon agenda
        </a>
      )}

      <div className="event-infocard-block">
        <h3>Partager</h3>
        <ShareButtons url={shareUrl} title={title} networks={["linkedin", "facebook", "email"]} copyFirst />
      </div>

      {themes.length > 0 && (
        <div className="event-infocard-block event-infocard-themes">
          <h3>Thèmes</h3>
          <EventThemeChips themes={themes} />
        </div>
      )}
    </aside>
  );
}

// Thème ou sous-thème relié à l'événement, avec son lien public.
export type ThemeChip = { id: string; title: string; href: string };

export function EventThemeChips({ themes }: { themes: ThemeChip[] }) {
  return (
    <ul className="event-theme-chips">
      {themes.map((theme) => (
        <li key={theme.id}>
          <Link href={theme.href}>{theme.title}</Link>
        </li>
      ))}
    </ul>
  );
}
