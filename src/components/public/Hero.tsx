import { CtaButton } from "@/components/forms/CtaButton";
import type { CtaTarget, ImageCrop } from "@/types/cms";
import { cropToImageStyle } from "@/utils/imageCrop";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export function Hero({
  eyebrow,
  title,
  body,
  imageUrl,
  imageAlt,
  imageCrop,
  primaryLabel,
  primaryTarget,
  secondaryLabel,
  secondaryTarget,
}: {
  eyebrow?: string | null;
  title: string;
  body?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageCrop?: ImageCrop | null;
  quote?: string | null;
  primaryLabel?: string | null;
  primaryTarget?: CtaTarget | null;
  secondaryLabel?: string | null;
  secondaryTarget?: CtaTarget | null;
}) {
  return (
    <section className={`hero${imageUrl ? "" : " hero--no-image"}`}>
      <div className="hero-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {body ? <div className="hero-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(body) }} /> : null}
        <div className="actions">
          {primaryLabel && primaryTarget ? (
            <CtaButton label={primaryLabel} target={primaryTarget} variant="primary" />
          ) : null}
          {secondaryLabel && secondaryTarget ? (
            <CtaButton label={secondaryLabel} target={secondaryTarget} variant="secondary" />
          ) : null}
        </div>
      </div>
      {imageUrl ? (
        <div className="hero-image">
          <img
            src={imageUrl}
            alt={imageAlt || title}
            loading="eager"
            style={{ objectFit: "cover", ...cropToImageStyle(imageCrop) }}
          />
        </div>
      ) : null}
    </section>
  );
}
