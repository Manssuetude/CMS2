"use client";

import type { HeaderStyle } from "@/utils/eventHeader";

// Choix du style d'en-tête de la page événement : deux cartes radio (vrais
// <input type="radio">, navigables au clavier) avec une mini-vignette SVG.
// `warning` : message si la bannière ne pourra pas s'afficher (repli Classique).

const OPTIONS: Array<{ value: HeaderStyle; title: string; help: string }> = [
  {
    value: "classic",
    title: "Classique",
    help: "Titre puis grande image. Fonctionne avec une photo ou une affiche.",
  },
  {
    value: "banner",
    title: "Bannière",
    help: "Photo plein écran avec le titre par-dessus. Utilise la 1re photo de la galerie (en paysage), jamais l'affiche.",
  },
];

function Thumb({ style }: { style: HeaderStyle }) {
  return style === "classic" ? (
    <svg viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      <rect x="10" y="8" width="22" height="4" rx="2" className="thumb-accent" />
      <rect x="10" y="16" width="70" height="7" rx="2" className="thumb-ink" />
      <rect x="10" y="27" width="50" height="4" rx="2" className="thumb-soft" />
      <rect x="10" y="37" width="100" height="36" rx="3" className="thumb-image" />
    </svg>
  ) : (
    <svg viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="120" height="56" className="thumb-image" />
      <rect x="0" y="30" width="120" height="26" className="thumb-scrim" />
      <rect x="10" y="34" width="20" height="3" rx="1.5" className="thumb-accent" />
      <rect x="10" y="40" width="64" height="6" rx="2" className="thumb-light" />
      <rect x="10" y="49" width="44" height="3" rx="1.5" className="thumb-light" />
      <rect x="8" y="60" width="104" height="12" rx="2" className="thumb-bar" />
    </svg>
  );
}

export function EventHeaderStyleField({
  value,
  onChange,
  warning,
}: {
  value: HeaderStyle;
  onChange: (value: HeaderStyle) => void;
  warning: string | null;
}) {
  return (
    <fieldset className="header-style-field">
      <legend>Style d&apos;en-tête</legend>
      <div className="header-style-options">
        {OPTIONS.map((option) => (
          <label key={option.value} className={`header-style-option${value === option.value ? " is-selected" : ""}`}>
            <input
              type="radio"
              name="headerStyle"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <Thumb style={option.value} />
            <span className="header-style-option-title">{option.title}</span>
            <span className="header-style-option-help">{option.help}</span>
          </label>
        ))}
      </div>
      {value === "banner" && warning && (
        <p className="header-style-warning" role="status">
          {warning}
        </p>
      )}
    </fieldset>
  );
}
