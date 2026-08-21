import Link from "next/link";
import { eventRepository } from "@/repositories/eventRepository";
import { EventCalendar } from "./EventCalendar";

export default async function CalendarPage() {
  const events = await eventRepository.listEvents(true);

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Calendrier des événements</h1>
          <p>Vue mensuelle de tous les événements planifiés</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/admin/evenements" className="button">
            Liste
          </Link>
          <Link href="/admin/evenements/new" className="button primary">
            Nouvel événement
          </Link>
        </div>
      </div>
      <EventCalendar events={events} />
    </section>
  );
}
