"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Activity } from "@/types/cms";

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

interface Props {
  activities: Activity[];
}

export function ActivityCalendar({ activities }: Props) {
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
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  // Build calendar grid (Mon-Sun weeks)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-first: 0=Mon … 6=Sun
  const startDow = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;

  const cells: Array<{ date: Date; current: boolean }> = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(year, month, 1 - startDow + i);
    cells.push({ date: d, current: d.getMonth() === month });
  }

  // Map activities by date string "YYYY-MM-DD"
  const byDate = new Map<string, Activity[]>();
  for (const a of activities) {
    if (!a.date) continue;
    const key = a.date.slice(0, 10);
    (byDate.get(key) ?? byDate.set(key, []).get(key)!).push(a);
  }

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  const dateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return (
    <div>
      <div className="calendar-nav">
        <div className="calendar-nav-center">
          <button type="button" className="btn-sm" onClick={prevMonth}>
            <ChevronLeft size={14} />
          </button>
          <span className="calendar-month-title">
            {MONTHS_FR[month]} {year}
          </span>
          <button type="button" className="btn-sm" onClick={nextMonth}>
            <ChevronRight size={14} />
          </button>
        </div>
        <button type="button" className="btn-sm" onClick={goToday}>
          Aujourd&apos;hui
        </button>
      </div>

      <div className="calendar-grid-wrap">
        <div className="calendar-grid">
          {DAYS_FR.map((d) => (
            <div key={d} className="calendar-day-header">
              {d}
            </div>
          ))}

          {cells.map(({ date, current }, i) => {
            const key = dateKey(date);
            const events = byDate.get(key) ?? [];
            return (
              <div key={i} className={`calendar-day${!current ? " other-month" : ""}${isToday(date) ? " today" : ""}`}>
                <div className="calendar-day-num">{date.getDate()}</div>
                {events.map((ev) => (
                  <Link
                    key={ev.id}
                    href={`/admin/activites/${ev.id}/edit`}
                    className={`calendar-event ${ev.status}`}
                    title={ev.title}
                  >
                    {ev.title}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 14, fontSize: 11, color: "var(--muted)" }}>
        <span>
          <span
            className="calendar-event published"
            style={{ marginRight: 5, display: "inline-block", width: 10, height: 10, borderRadius: 3 }}
          />
          Publié
        </span>
        <span>
          <span
            className="calendar-event draft"
            style={{ marginRight: 5, display: "inline-block", width: 10, height: 10, borderRadius: 3 }}
          />
          Brouillon
        </span>
        <span>
          <span
            className="calendar-event archived"
            style={{ marginRight: 5, display: "inline-block", width: 10, height: 10, borderRadius: 3 }}
          />
          Archivé
        </span>
      </div>
    </div>
  );
}
