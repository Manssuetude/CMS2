"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { LayoutGrid, CalendarDays } from "lucide-react";

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("view") === "calendar" ? "calendar" : "list";

  const select = useCallback(
    (value: "list" | "calendar") => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "list") {
        params.delete("view");
      } else {
        params.set("view", value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="sort-toggle">
      <button
        type="button"
        className={`filter-chip${active === "list" ? " active" : ""}`}
        onClick={() => select("list")}
      >
        <LayoutGrid size={13} strokeWidth={2} />
        Liste
      </button>
      <button
        type="button"
        className={`filter-chip${active === "calendar" ? " active" : ""}`}
        onClick={() => select("calendar")}
      >
        <CalendarDays size={13} strokeWidth={2} />
        Calendrier
      </button>
    </div>
  );
}
