import type { ContentStatus } from "@/types/cms";

/** Bouton-formulaire qui fait basculer le statut d'un contenu (publié → brouillon → …). */
export function StatusToggleButton({
  action,
  id,
  status,
  blockedReason,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  status: ContentStatus;
  /** Passage en « Publié » impossible (ex. production sans Word ou PDF) : bouton désactivé, raison en infobulle. */
  blockedReason?: string | null;
}) {
  const label = status === "published" ? "Publié" : status === "archived" ? "Archivé" : "Brouillon";
  if (blockedReason && status !== "published") {
    return (
      <span className={`btn-toggle ${status}`} aria-disabled="true" title={blockedReason}>
        {label}
        <span className="sr-only"> ({blockedReason})</span>
      </span>
    );
  }
  return (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={`btn-toggle ${status}`} title="Changer le statut">
        {label}
      </button>
    </form>
  );
}
