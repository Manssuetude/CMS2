"use client";

import { toggleThemeFeaturedAction } from "@/app/admin/themes/actions";

export function FeaturedToggleButton({ id, featured }: { id: string; featured: boolean }) {
  const next = !featured;
  const message = featured
    ? "Retirer ce thème de la mise en avant ?"
    : "Mettre ce thème en avant sur la page d'accueil ?";

  return (
    <form action={toggleThemeFeaturedAction} style={{ display: "inline-flex" }}>
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
