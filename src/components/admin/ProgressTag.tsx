const PROGRESS_LABELS: Record<string, string> = {
  idea: "Idée",
  preparation: "En prep.",
  active: "En cours",
  completed: "Terminé",
  paused: "En pause",
};

/** Étiquette d'avancement (idée, en cours, terminé…) pour activités et projets. */
export function ProgressTag({ status }: { status: string | null | undefined }) {
  if (!status) return <span style={{ color: "var(--muted)" }}>-</span>;
  return <span className="progress-tag">{PROGRESS_LABELS[status] ?? status}</span>;
}
