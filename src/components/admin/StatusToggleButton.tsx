import type { ContentStatus } from "@/types/cms";

/** Bouton-formulaire qui fait basculer le statut d'un contenu (publié → brouillon → …). */
export function StatusToggleButton({
  action,
  id,
  status,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  status: ContentStatus;
}) {
  return (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={`btn-toggle ${status}`} title="Changer le statut">
        {status === "published" ? "Publié" : status === "archived" ? "Archivé" : "Brouillon"}
      </button>
    </form>
  );
}
