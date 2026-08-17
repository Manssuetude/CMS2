"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Activity } from "@/types/cms";
import { buildCalendarCells, groupByDateKey, isSameDay } from "@/utils/calendarGrid";

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function PublicEventCalendar({ activities }: { activities: Activity[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const cells = buildCalendarCells(year, month);
  const byDate = groupByDateKey(activities, (a) => a.date);

  return (
    <div className="event-calendar">
      <div className="event-calendar-nav">
        <button type="button" className="btn-sm" onClick={prevMonth} aria-label="Mois précédent">
          <ChevronLeft size={16} strokeWidth={1.75} />
        </button>
        <span className="event-calendar-title">
          {MONTHS_FR[month]} {year}
        </span>
        <button type="button" className="btn-sm" onClick={nextMonth} aria-label="Mois suivant">
          <ChevronRight size={16} strokeWidth={1.75} />
        </button>
      </div>

      <div className="event-calendar-grid">
        {DAYS_FR.map((d) => (
          <div key={d} className="event-calendar-day-header">
            {d}
          </div>
        ))}
        {cells.map(({ date, current }, i) => {
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const events = byDate.get(key) ?? [];
          return (
            <div
              key={i}
              className={`event-calendar-cell${!current ? " is-outside" : ""}${isSameDay(date, today) ? " is-today" : ""}`}
            >
              <span className="event-calendar-daynum">{date.getDate()}</span>
              {events.map((ev) => (
                <Link key={ev.id} href={`/activites/${ev.slug}`} className="event-calendar-event" title={ev.title}>
                  {ev.title}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
