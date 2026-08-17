"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export function SortToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("sort") === "asc" ? "asc" : "desc";

  const select = useCallback(
    (value: "asc" | "desc") => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "desc") {
        params.delete("sort");
      } else {
        params.set("sort", value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="sort-toggle">
      <button
        type="button"
        className={`filter-chip${active === "desc" ? " active" : ""}`}
        onClick={() => select("desc")}
      >
        Plus récent
      </button>
      <button type="button" className={`filter-chip${active === "asc" ? " active" : ""}`} onClick={() => select("asc")}>
        Plus ancien
      </button>
    </div>
  );
}
