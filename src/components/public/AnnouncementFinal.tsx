import { ArrowRight } from "lucide-react";
import { SmartLink } from "@/components/public/SmartLink";
import type { Announcement } from "@/types/cms";
import { fillDateToken } from "@/utils/announcements";

// Bloc final sombre de l'accueil pendant une annonce (remplace « Rejoindre une communauté… »).
export function AnnouncementFinal({ announcement: a }: { announcement: Announcement }) {
  const text = fillDateToken(a.finalText, a.endsAt);
  return (
    <section className="ann-final" aria-labelledby="ann-final-title">
      <div className="ann-final-inner">
        {a.finalEyebrow ? <p className="eyebrow">{a.finalEyebrow}</p> : null}
        <h2 id="ann-final-title">{a.finalTitle}</h2>
        {text ? <p className="ann-final-text">{text}</p> : null}
        {a.finalCtaLabel && a.finalCtaUrl ? (
          <SmartLink className="button primary ann-btn" href={a.finalCtaUrl}>
            {a.finalCtaLabel}
            <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </SmartLink>
        ) : null}
      </div>
    </section>
  );
}
