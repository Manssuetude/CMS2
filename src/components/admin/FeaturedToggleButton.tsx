"use client";

import { useState } from "react";
import { toggleThemeFeaturedAction } from "@/app/admin/themes/actions";
import { toggleProductionFeaturedAction } from "@/app/admin/productions/actions";
import { toggleActivityFeaturedAction } from "@/app/admin/activites/actions";

type Kind = "theme" | "production" | "activity";

const ACTIONS = {
  theme: toggleThemeFeaturedAction,
  production: toggleProductionFeaturedAction,
  activity: toggleActivityFeaturedAction,
} as const;

const NOUNS: Record<Kind, string> = {
  theme: "ce thème",
  production: "cette production",
  activity: "cette activité",
};

export function FeaturedToggleButton({
  id,
  featured,
  kind = "theme",
  count,
  max = 4,
}: {
  id: string;
  featured: boolean;
  kind?: Kind;
  count?: number;
  max?: number;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const next = !featured;
  const action = ACTIONS[kind];
  const noun = NOUNS[kind];

  // Limite active uniquement si un compteur est fourni (productions).
  const atLimit = typeof count === "number" && !featured && count >= max;
  const confirmMsg = featured
    ? `Retirer ${noun} de la mise en avant ?`
    : `Mettre ${noun} en avant sur la page d'accueil ?`;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (atLimit) {
      e.preventDefault();
      setNotice(`Maximum ${max} en vedette. Retirez-en une avant d'en ajouter une autre.`);
      window.setTimeout(() => setNotice(null), 4000);
      return;
    }
    if (!window.confirm(confirmMsg)) e.preventDefault();
  }

  return (
    <>
      <form action={action} style={{ display: "inline-flex" }}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="featured" value={String(next)} />
        <button
          type="submit"
          className={`featured-star${featured ? " is-on" : ""}${atLimit ? " is-limited" : ""}`}
          aria-label={confirmMsg}
          aria-pressed={featured}
          title={
            atLimit
              ? `Maximum ${max} en vedette`
              : featured
                ? "En avant — cliquer pour retirer"
                : "Cliquer pour mettre en avant"
          }
          onClick={handleClick}
        >
          {featured ? "★" : "☆"}
        </button>
      </form>
      {notice ? (
        <div className="featured-toast" role="status" aria-live="polite">
          {notice}
        </div>
      ) : null}
    </>
  );
}
