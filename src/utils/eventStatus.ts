import type { ProgressStatus, RegistrationStatus } from "@/types/cms";

// Statut unique affiché sur la page événement. Fusionne le statut d'inscription
// (saisi en admin) et le statut d'avancement, qui s'affichaient auparavant tous
// les deux (« Terminé » + « Terminée »). Testé dans tests/eventStatus.test.ts.

export type EventDisplayStatus = "a-venir" | "ouvertes" | "complet" | "termine";

const LABELS: Record<EventDisplayStatus, string> = {
  "a-venir": "À venir",
  ouvertes: "Inscriptions ouvertes",
  complet: "Complet",
  termine: "Terminé",
};

// Un événement est passé à la fin de sa journée (heure locale du serveur).
function isPastDate(date: string | null | undefined, now: Date): boolean {
  if (!date) return false;
  const end = new Date(`${date.slice(0, 10)}T23:59:59`);
  return !Number.isNaN(end.getTime()) && end < now;
}

export function resolveEventStatus(input: {
  registrationStatus?: RegistrationStatus | null;
  progressStatus?: ProgressStatus | null;
  date?: string | null;
  now?: Date;
}): EventDisplayStatus {
  const now = input.now ?? new Date();
  if (input.progressStatus === "completed" || input.registrationStatus === "termine") return "termine";
  if (isPastDate(input.date, now)) return "termine";
  if (input.registrationStatus === "complet") return "complet";
  if (input.registrationStatus === "ouvertes") return "ouvertes";
  return "a-venir";
}

export function eventStatusLabel(status: EventDisplayStatus): string {
  return LABELS[status];
}
