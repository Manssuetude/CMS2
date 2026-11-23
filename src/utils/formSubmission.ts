// Affichage d'un formulaire reçu : nom de l'expéditeur, tiré des champs saisis.

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function submissionSenderName(data: Record<string, unknown>): string {
  const full = [text(data.firstName), text(data.lastName)].filter(Boolean).join(" ") || text(data.name);
  if (full) return full;
  return text(data.email) || "Expéditeur inconnu";
}

export function submissionEmail(data: Record<string, unknown>): string | null {
  const email = text(data.email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
