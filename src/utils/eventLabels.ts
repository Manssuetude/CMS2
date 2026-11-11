// Libellés de la page événement dérivés du format saisi en admin
// (« Debat & Conference », « Atelier & Seance de travail »…).

export const EVENT_FORMAT_LABEL: Record<string, string> = {
  "Debat & Conference": "Débat & Conférence",
  "Atelier & Seance de travail": "Atelier & Séance de travail",
  "Formation & Masterclass": "Formation & Masterclass",
  "Visite & Immersion": "Visite & Immersion",
  "Rencontre & Networking": "Rencontre & Networking",
};

export function eventFormatLabel(format: string): string {
  return EVENT_FORMAT_LABEL[format] ?? format;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// Titre de la section principale : « À propos de l'atelier », « du débat »…
export function aboutHeading(format: string): string {
  const f = normalize(format);
  if (f.includes("atelier")) return "À propos de l'atelier";
  if (f.includes("debat")) return "À propos du débat";
  if (f.includes("conference")) return "À propos de la conférence";
  if (f.includes("formation") || f.includes("masterclass")) return "À propos de la formation";
  if (f.includes("visite")) return "À propos de la visite";
  if (f.includes("rencontre")) return "À propos de la rencontre";
  return "À propos de l'événement";
}
