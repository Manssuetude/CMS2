import Link from "next/link";
import { contentRepository } from "@/repositories/contentRepository";
import { ActivityCalendar } from "./ActivityCalendar";

export default async function CalendarPage() {
  const activities = await contentRepository.listActivities(true);

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Calendrier des activités</h1>
          <p>Vue mensuelle de toutes les activités planifiées</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/admin/activites" className="button">
            Liste
          </Link>
          <Link href="/admin/activites/new" className="button primary">
            Nouvelle activité
          </Link>
        </div>
      </div>
      <ActivityCalendar activities={activities} />
    </section>
  );
}
