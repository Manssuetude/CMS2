import type { RegistrationStatus } from "@/types/cms";

const LABELS: Record<RegistrationStatus, string> = {
  "a-venir": "À venir",
  ouvertes: "Inscriptions ouvertes",
  complet: "Complet",
  termine: "Terminé",
};

// Le statut saisi manuellement en admin prend toujours le dessus (ex. "complet").
// À défaut, on déduit "à venir"/"terminé" depuis la date — cohérent avec le badge
// à venir/passée déjà utilisé sur les fiches événement.
export function resolveRegistrationStatus(
  manual: RegistrationStatus | null | undefined,
  date: string | null | undefined,
  now: Date = new Date(),
): RegistrationStatus | null {
  if (manual) return manual;
  if (!date) return null;
  return new Date(date) >= now ? "a-venir" : "termine";
}

export function registrationStatusLabel(status: RegistrationStatus): string {
  return LABELS[status] ?? status;
}
