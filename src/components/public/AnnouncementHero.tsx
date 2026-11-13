import Image from "next/image";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { SmartLink } from "@/components/public/SmartLink";
import type { Announcement, KeyFigure } from "@/types/cms";
import { cropToImageStyle, cropZoom } from "@/utils/imageCrop";
import { fillDateToken, formatDeadline } from "@/utils/announcements";
import { isMeaningfulAlt } from "@/utils/gallery";

// Hero de l'accueil pendant une annonce : même grille que le hero habituel
// (texte à gauche, photo à droite ; photo en haut sur téléphone).
export function AnnouncementHero({
  announcement: a,
  firstFigure,
  figureEyebrow,
}: {
  announcement: Announcement;
  firstFigure?: KeyFigure | null;
  figureEyebrow?: string | null;
}) {
  const deadline = a.showDeadline ? formatDeadline(a.endsAt) : null;
  const subtitle = fillDateToken(a.subtitle, a.endsAt);
  const zoom = cropZoom(a.imageCrop);
  const headline = [a.title, a.titleAccent].filter(Boolean).join(" ");

  return (
    <section className={`home-hero ann-hero${a.imageUrl ? "" : " home-hero--no-image"}`}>
      <div className="home-hero-copy ann-hero-copy">
        {a.eyebrow ? (
          <p className="ann-tag">
            <span className="ann-dot" aria-hidden="true" />
            {a.eyebrow}
          </p>
        ) : null}
        <h1 className="ann-title">
          {/* Initiale calligraphiée orange, comme le « M » du hero habituel de l'accueil. */}
          {a.title ? (
            <>
              <span className="home-hero-initial">{a.title.charAt(0)}</span>
              {a.title.slice(1)}
            </>
          ) : null}
          {a.titleAccent ? (
            <>
              {" "}
              <em>{a.titleAccent}</em>
            </>
          ) : null}
        </h1>
        {subtitle ? <p className="ann-hero-subtitle">{subtitle}</p> : null}
        {(a.primaryCtaLabel && a.primaryCtaUrl) || (a.secondaryCtaLabel && a.secondaryCtaUrl) ? (
          <div className="ann-actions">
            {a.primaryCtaLabel && a.primaryCtaUrl ? (
              <SmartLink className="button primary ann-btn" href={a.primaryCtaUrl}>
                {fillDateToken(a.primaryCtaLabel, a.endsAt)}
                <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
              </SmartLink>
            ) : null}
            {a.secondaryCtaLabel && a.secondaryCtaUrl ? (
              <SmartLink className="button secondary ann-btn" href={a.secondaryCtaUrl}>
                {a.secondaryCtaLabel}
              </SmartLink>
            ) : null}
          </div>
        ) : null}
        {a.periodLabel || deadline ? (
          <ul className="ann-meta">
            {a.periodLabel ? (
              <li>
                <CalendarDays size={18} strokeWidth={1.75} aria-hidden="true" />
                {a.periodLabel}
              </li>
            ) : null}
            {deadline ? (
              <li>
                <Clock size={18} strokeWidth={1.75} aria-hidden="true" />
                Clôture le {deadline}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
      {a.imageUrl ? (
        <div className="ann-hero-visual">
          <figure className="home-hero-media ann-hero-media">
            {/* Image LCP de l'accueil pendant l'annonce : seule image prioritaire. */}
            <Image
              src={a.imageUrl}
              alt={isMeaningfulAlt(a.imageAlt) ? a.imageAlt : headline || a.name}
              width={a.imageWidth ?? 1600}
              height={a.imageHeight ?? 1200}
              sizes={`(max-width: 820px) ${Math.round(100 * zoom)}vw, ${Math.round(760 * zoom)}px`}
              priority
              fetchPriority="high"
              style={cropToImageStyle(a.imageCrop)}
            />
          </figure>
          {firstFigure ? (
            <p className="ann-figure-card">
              {figureEyebrow ? <span className="ann-figure-eyebrow">{figureEyebrow}</span> : null}
              <span className="ann-figure-text">
                {firstFigure.value} {firstFigure.label}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
