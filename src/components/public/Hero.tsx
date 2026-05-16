import { CtaButton } from "@/components/forms/CtaButton";
import type { CtaTarget } from "@/types/cms";

export function Hero({
  eyebrow,
  title,
  body,
  imageUrl,
  imageAlt,
  quote,
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
  quote?: string | null;
  primaryLabel?: string | null;
  primaryTarget?: CtaTarget | null;
  secondaryLabel?: string | null;
  secondaryTarget?: CtaTarget | null;
}) {
  return (
    <section className="hero">
      <div className="hero-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {body ? <p>{body}</p> : null}
        <div className="actions">
          {primaryLabel && primaryTarget ? (
            <CtaButton label={primaryLabel} target={primaryTarget} variant="primary" />
          ) : null}
          {secondaryLabel && secondaryTarget ? (
            <CtaButton label={secondaryLabel} target={secondaryTarget} variant="secondary" />
          ) : null}
        </div>
      </div>
      <div className="hero-image">
        {imageUrl ? <img src={imageUrl} alt={imageAlt || title} loading="eager" /> : null}
        {quote ? <blockquote>{quote}</blockquote> : null}
      </div>
    </section>
  );
}
