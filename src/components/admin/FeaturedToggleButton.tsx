"use client";

import { toggleThemeFeaturedAction } from "@/app/admin/themes/actions";
import { toggleProductionFeaturedAction } from "@/app/admin/productions/actions";

type Kind = "theme" | "production";

export function FeaturedToggleButton({ id, featured, kind = "theme" }: { id: string; featured: boolean; kind?: Kind }) {
  const next = !featured;
  const action = kind === "production" ? toggleProductionFeaturedAction : toggleThemeFeaturedAction;
  const noun = kind === "production" ? "cette production" : "ce thème";
  const message = featured
    ? `Retirer ${noun} de la mise en avant ?`
    : `Mettre ${noun} en avant sur la page d'accueil ?`;

  return (
    <form action={action} style={{ display: "inline-flex" }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="featured" value={String(next)} />
      <button
        type="submit"
        className={`featured-star${featured ? " is-on" : ""}`}
        aria-label={message}
        aria-pressed={featured}
        title={featured ? "En avant — cliquer pour retirer" : "Cliquer pour mettre en avant"}
        onClick={(e) => {
          if (!window.confirm(message)) e.preventDefault();
        }}
      >
        {featured ? "★" : "☆"}
      </button>
    </form>
  );
}
