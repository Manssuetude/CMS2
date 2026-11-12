import type { ReactNode } from "react";
import { AnnouncementBanner } from "@/components/public/AnnouncementBanner";
import type { Announcement } from "@/types/cms";
import { fillDateToken } from "@/utils/announcements";

// Coquille du site public (lien d'évitement + bandeau d'annonce éventuel),
// partagée par le layout public et l'aperçu d'annonce de l'admin.
export function PublicChrome({ announcement, children }: { announcement: Announcement | null; children: ReactNode }) {
  const banner = announcement?.bannerEnabled ? announcement : null;
  return (
    <div className={`site-shell${banner ? " site-shell--with-banner" : ""}`}>
      <a href="#main-content" className="skip-link">
        Aller au contenu
      </a>
      {banner ? (
        <AnnouncementBanner
          label={banner.bannerLabel}
          text={fillDateToken(banner.bannerText, banner.endsAt)}
          linkLabel={banner.bannerLinkLabel}
          linkUrl={banner.bannerLinkUrl}
        />
      ) : null}
      {children}
    </div>
  );
}
