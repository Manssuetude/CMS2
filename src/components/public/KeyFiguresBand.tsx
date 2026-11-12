import type { CSSProperties } from "react";
import type { KeyFigures } from "@/types/cms";

// Bande de chiffres clés (site_settings.homepage_config.keyFigures).
// « home » : sous le hero d'annonce de l'accueil ; « join » : section 3 de /nous-rejoindre.
export function KeyFiguresBand({
  figures,
  variant,
  id = "chiffres-cles",
}: {
  figures: KeyFigures;
  variant: "home" | "join";
  id?: string;
}) {
  const titleId = `${id}-titre`;
  return (
    <section className={`key-figures key-figures--${variant}`} aria-labelledby={titleId} data-section="chiffres">
      <div className="key-figures-inner">
        <div className="key-figures-head">
          <p className="eyebrow">{figures.eyebrow}</p>
          <h2 id={titleId}>{figures.title}</h2>
        </div>
        <ul className="key-figures-list" style={{ "--kf-count": figures.items.length } as CSSProperties}>
          {figures.items.map((item, index) => (
            <li key={`${item.value}-${index}`}>
              <strong className="key-figure-value">{item.value}</strong>
              <span className="key-figure-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
