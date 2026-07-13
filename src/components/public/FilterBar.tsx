"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface Props {
  param: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}

export function FilterBar({ param, options, allLabel = "Tous" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get(param) ?? "";

  const select = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(param, value);
      } else {
        params.delete(param);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, param],
  );

  return (
    <div className="filter-bar">
      <button className={`filter-chip${active === "" ? " active" : ""}`} onClick={() => select("")} type="button">
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`filter-chip${active === opt.value ? " active" : ""}`}
          onClick={() => select(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
