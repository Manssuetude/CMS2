"use client";

import { useEffect } from "react";

const BUBBLE_SELECTOR = ".format-chip, .format-chip-tip";

// Rend cliquables les bulles de description d'un format d'activité — que ce
// soit une puce en bas d'une fiche activité (JSX) ou un repère inséré dans le
// texte (HTML brut de l'éditeur, hors de portée de React : d'où une
// délégation d'événements globale plutôt qu'un onClick par élément). Le
// survol (desktop, voir detail.css) reste un aperçu rapide ; le clic bascule
// un état persistant — seul moyen d'ouvrir la bulle sur tactile.
export function FormatBubbleInteractivity() {
  useEffect(() => {
    function closeAll(except?: Element) {
      document.querySelectorAll(`${BUBBLE_SELECTOR}.is-open`).forEach((el) => {
        if (el !== except) {
          el.classList.remove("is-open");
          el.setAttribute("aria-expanded", "false");
        }
      });
    }

    function toggle(el: Element) {
      const nowOpen = !el.classList.contains("is-open");
      closeAll(nowOpen ? el : undefined);
      el.classList.toggle("is-open", nowOpen);
      el.setAttribute("aria-expanded", String(nowOpen));
    }

    function handleClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest(BUBBLE_SELECTOR);
      if (!target) {
        closeAll();
        return;
      }
      event.preventDefault();
      toggle(target);
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeAll();
        return;
      }
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = (event.target as HTMLElement | null)?.closest(BUBBLE_SELECTOR);
      if (!target) return;
      event.preventDefault();
      toggle(target);
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  return null;
}
