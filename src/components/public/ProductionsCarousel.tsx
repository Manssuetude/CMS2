"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Production } from "@/types/cms";

export function ProductionsCarousel({ productions }: { productions: Production[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isMobile = window.matchMedia("(max-width: 820px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!isMobile.matches || reduce.matches) return;

    let paused = false;
    let resumeTimer: number | undefined;
    const pause = () => {
      paused = true;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        paused = false;
      }, 4500);
    };

    el.addEventListener("pointerdown", pause);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("wheel", pause, { passive: true });

    const interval = window.setInterval(() => {
      if (paused) return;
      const card = el.querySelector<HTMLElement>(".home-production-card");
      const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: "smooth" });
    }, 3200);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(resumeTimer);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("wheel", pause);
    };
  }, []);

  return (
    <div className="home-production-grid" ref={ref}>
      {productions.slice(0, 4).map((p) => (
        <Link key={p.id} className="home-production-card" href={`/productions/${p.slug}`}>
          <span className="home-production-type">{p.type}</span>
          <h3>{p.title}</h3>
          {p.description ? <p>{p.description}</p> : null}
          {p.author ? <span className="home-production-author">{p.author}</span> : null}
        </Link>
      ))}
    </div>
  );
}
