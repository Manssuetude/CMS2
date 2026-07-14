"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Choice = "light" | "dark" | null;

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle({ className }: { className?: string }) {
  const [choice, setChoice] = useState<Choice>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ms-theme");
    setChoice(saved === "dark" || saved === "light" ? saved : null);
    setMounted(true);
  }, []);

  // Avant le montage, le serveur et le client rendent un état identique (thème clair
  // par défaut) : on ne lit la préférence système qu'après montage, sinon les attributs
  // aria-label/title/icône divergent → erreur d'hydratation.
  const effectiveDark = mounted ? (choice ? choice === "dark" : systemPrefersDark()) : false;

  function toggle() {
    const next = effectiveDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ms-theme", next);
    setChoice(next);
  }

  return (
    <button
      type="button"
      className={`theme-toggle${className ? ` ${className}` : ""}`}
      onClick={toggle}
      aria-label={effectiveDark ? "Passer en thème clair" : "Passer en thème sombre"}
      title={effectiveDark ? "Thème clair" : "Thème sombre"}
      suppressHydrationWarning
    >
      {effectiveDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
