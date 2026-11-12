"use client";

import { usePathname } from "next/navigation";
import { SmartLink } from "@/components/public/SmartLink";
import { internalPath } from "@/utils/announcements";

// Bandeau d'annonce, au-dessus du header de toutes les pages publiques.
// Toute la barre est cliquable ; masqué sur la page vers laquelle il pointe.
export function AnnouncementBanner({
  label,
  text,
  linkLabel,
  linkUrl,
}: {
  label: string | null;
  text: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
}) {
  const pathname = usePathname() ?? "/";
  const target = internalPath(linkUrl);
  // L'aperçu admin sert la page sous /apercu/annonce/<id>/nous-rejoindre :
  // on compare aussi la fin du chemin.
  if (target && (pathname === target || (target !== "/" && pathname.endsWith(target)))) return null;
  if (!label && !text) return null;

  const content = (
    <span className="ann-banner-inner">
      <span className="ann-dot" aria-hidden="true" />
      {label ? <strong className="ann-banner-label">{label}</strong> : null}
      {text ? <span className="ann-banner-text">{text}</span> : null}
      {linkUrl && linkLabel ? <span className="ann-banner-link">{linkLabel}</span> : null}
      {/* Téléphone : le libellé du lien est masqué visuellement (toute la barre est le lien). */}
      {linkUrl ? (
        <span className="ann-banner-arrow" aria-hidden="true">
          →
        </span>
      ) : null}
    </span>
  );

  if (!linkUrl) {
    return (
      <div className="ann-banner" role="note">
        {content}
      </div>
    );
  }
  return (
    <SmartLink className="ann-banner" href={linkUrl}>
      {content}
    </SmartLink>
  );
}
