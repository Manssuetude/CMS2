import type { KeyFigures } from "@/types/cms";

// Chiffres clés par défaut (site_settings.homepage_config.keyFigures absent).
// Saisis une seule fois depuis /admin/homepage, affichés sur l'accueil pendant
// une annonce et toujours sur /nous-rejoindre.
export const DEFAULT_KEY_FIGURES: KeyFigures = {
  eyebrow: "Depuis septembre 2025",
  title: "Du chemin parcouru.",
  items: [
    { value: "20", label: "rencontres thématiques" },
    { value: "1", label: "débat public" },
    { value: "6", label: "publications en 2026" },
    { value: "~40", label: "membres" },
  ],
};

export const KEY_FIGURES_MIN = 2;
export const KEY_FIGURES_MAX = 4;
