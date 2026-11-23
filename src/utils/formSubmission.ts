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

export type InboxFilter = "a-traiter" | "traites" | "tous";

export function resolveInboxFilter(value: string | undefined): InboxFilter {
  return value === "traites" || value === "tous" ? value : "a-traiter";
}

/** Un message « à traiter » : reçu ou en cours. */
export function isPendingSubmission(status: string): boolean {
  return status === "reçu" || status === "en cours";
}

export function matchesInboxFilter(status: string, filter: InboxFilter): boolean {
  if (filter === "tous") return true;
  return filter === "a-traiter" ? isPendingSubmission(status) : !isPendingSubmission(status);
}

/** Début du message (liste de la boîte de réception). */
export function submissionExcerpt(data: Record<string, unknown>, max = 90): string {
  const preferred = ["message", "motivation", "description", "proposal", "comment"];
  const value =
    preferred.map((key) => text(data[key])).find(Boolean) ??
    Object.entries(data)
      .filter(
        ([key]) =>
          !["email", "firstName", "lastName", "name", "phone", "consent", "website", "cf-turnstile-response"].includes(
            key,
          ),
      )
      .map(([, v]) => text(v))
      .find((v) => v.length > 20) ??
    "";
  const single = value.replace(/\s+/g, " ");
  return single.length > max ? `${single.slice(0, max - 1)}…` : single;
}
