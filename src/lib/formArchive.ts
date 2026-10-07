import { formSubmissionRepository } from "@/repositories/formSubmissionRepository";
import { logger } from "@/lib/logger";

const ARCHIVE_AFTER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

// Archive automatiquement les soumissions marquées "traité" depuis au moins
// une semaine (basé sur updated_at, mis à jour à chaque changement de statut —
// voir formSubmissionRepository.updateFormStatus). Appelé par le même cron
// quotidien que l'envoi groupé (voir api/cron/form-digest), pour ne pas
// consommer un deuxième créneau de cron pour une tâche aussi légère.
export async function archiveProcessedFormSubmissions(): Promise<{ archived: number }> {
  const all = await formSubmissionRepository.listFormSubmissions();
  const cutoff = Date.now() - ARCHIVE_AFTER_DAYS * DAY_MS;
  const toArchive = all.filter((s) => s.status === "traité" && new Date(s.updatedAt).getTime() <= cutoff);

  for (const submission of toArchive) {
    await formSubmissionRepository.updateFormStatus(submission.id, "archivé");
  }

  if (toArchive.length > 0) {
    logger.info("formArchive.archived", { count: toArchive.length });
  }
  return { archived: toArchive.length };
}
