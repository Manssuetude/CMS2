import type { Announcement } from "@/types/cms";
import { logger } from "@/lib/logger";
import { announcementRepository } from "@/repositories/announcementRepository";
import { pickLiveAnnouncement } from "@/utils/announcements";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isAnnouncementId(value: string | null | undefined): value is string {
  return Boolean(value && UUID.test(value));
}

export const announcementService = {
  /**
   * Annonce en ligne à l'instant `now` : activée et `starts_at <= now < ends_at`.
   * Si plusieurs se chevauchent, la plus récemment démarrée gagne
   * (pickLiveAnnouncement, testée dans tests/announcements.test.ts).
   * Ne lève jamais : base injoignable ou table absente (migration pas encore
   * exécutée) → aucune annonce, le site garde son affichage normal.
   */
  async getLive(now: Date = new Date()): Promise<Announcement | null> {
    try {
      const candidates = await announcementRepository.listActiveAt(now.toISOString());
      return pickLiveAnnouncement(candidates, now);
    } catch (error) {
      const reason = (error as { message?: unknown } | null)?.message;
      logger.warn("Annonce en ligne indisponible", { reason: typeof reason === "string" ? reason : "inconnue" });
      return null;
    }
  },

  /** Annonce affichée « comme si elle était en ligne » (aperçu admin), sans contrôle de dates. */
  async getForPreview(id: string | null | undefined): Promise<Announcement | null> {
    if (!isAnnouncementId(id)) return null;
    return announcementRepository.getById(id);
  },
};
