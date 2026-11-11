import { CalendarDays, Images, MapPin, Users, ArrowUpRight } from "lucide-react";
import type { EventFacts } from "@/utils/eventFacts";

// Barre d'infos horizontale du style Bannière : date, lieu, places, statut et
// action. Grille de 2 colonnes sur mobile, action en pleine largeur dessous.
export function EventInfoBar({ facts }: { facts: EventFacts }) {
  const date = facts.dateLabel ? `${facts.dateLabel}${facts.timeLabel ? `, ${facts.timeLabel}` : ""}` : null;
  return (
    <div className="event-infobar">
      <ul className="event-infobar-facts">
        <li className={date ? undefined : "is-pending"}>
          <CalendarDays size={18} strokeWidth={1.6} aria-hidden="true" />
          {date ?? "Date à confirmer"}
        </li>
        <li className={facts.location ? undefined : "is-pending"}>
          <MapPin size={18} strokeWidth={1.6} aria-hidden="true" />
          {facts.location ?? "Lieu à confirmer"}
        </li>
        <li className={facts.capacity ? undefined : "is-pending"}>
          <Users size={18} strokeWidth={1.6} aria-hidden="true" />
          {facts.capacity ?? "Places à confirmer"}
        </li>
      </ul>
      <span className={`event-status event-status--${facts.status}`}>{facts.statusLabel}</span>
      {facts.cta && (
        <a
          className="event-infobar-cta"
          href={facts.cta.href}
          {...(facts.cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {facts.cta.kind === "photos" ? (
            <Images size={18} strokeWidth={1.6} aria-hidden="true" />
          ) : (
            <ArrowUpRight size={18} strokeWidth={1.6} aria-hidden="true" />
          )}
          {facts.cta.label}
        </a>
      )}
    </div>
  );
}
