import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { CtaButton } from "@/components/forms/CtaButton";
import { KeyFiguresBand } from "@/components/public/KeyFiguresBand";
import type { Announcement, GalleryPhoto, JoinPageContent, KeyFigures, Page, SlotPhoto } from "@/types/cms";
import { cropToImageStyle, cropZoom } from "@/utils/imageCrop";
import { joinSlots, type JoinSlots } from "@/utils/joinPage";

// Page /nous-rejoindre (permanente). Une annonce qui s'applique à la page ne
// fait que REMPLACER des valeurs dans des emplacements fixes (étiquette,
// titre, sous-titre, bouton, clôture) : aucune section n'apparaît, ne
// disparaît ni ne change d'apparence. Voir joinSlots et tests/joinPage.test.ts.

function SlotImage({
  photo,
  resolved,
  className,
  sizes,
  priority = false,
}: {
  photo: SlotPhoto;
  resolved: Pick<GalleryPhoto, "url" | "width" | "height"> | null;
  className: string;
  sizes: (zoom: number) => string;
  priority?: boolean;
}) {
  if (!resolved?.url) {
    // Photo pas encore choisie dans l'admin : cadre teinté, même place.
    return <div className={`${className} join-photo--empty`} aria-hidden="true" />;
  }
  const zoom = cropZoom(photo.crop);
  return (
    <figure className={className}>
      <Image
        src={resolved.url}
        alt={photo.alt}
        width={resolved.width ?? 1600}
        height={resolved.height ?? 1200}
        sizes={sizes(zoom)}
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        style={cropToImageStyle(photo.crop)}
      />
    </figure>
  );
}

function Title({ slots }: { slots: JoinSlots }) {
  return (
    <>
      {slots.title}
      {slots.titleAccent ? (
        <>
          {" "}
          <em>{slots.titleAccent}</em>
        </>
      ) : null}
    </>
  );
}

function Deadline({ text }: { text: string | null }) {
  // N'existe que pendant l'annonce : absente, elle ne laisse aucun espace.
  if (!text) return null;
  return (
    <p className="join-deadline">
      <Clock size={16} strokeWidth={1.75} aria-hidden="true" />
      {text}
    </p>
  );
}

export function JoinEditorial({
  page,
  content,
  photos,
  keyFigures,
  announcement,
}: {
  page: Page;
  content: JoinPageContent;
  photos: Record<string, Pick<GalleryPhoto, "url" | "width" | "height">>;
  keyFigures: KeyFigures;
  announcement: Announcement | null;
}) {
  const slots = joinSlots(page, content, announcement);
  const photoOf = (photo: SlotPhoto) => (photo.imageId ? (photos[photo.imageId] ?? null) : null);
  const heroPhoto: SlotPhoto = { imageId: page.imageId ?? null, crop: page.imageCrop ?? null, alt: content.heroAlt };
  const heroResolved = page.imageUrl
    ? { url: page.imageUrl, width: page.imageWidth ?? null, height: page.imageHeight ?? null }
    : null;

  return (
    <div className="join">
      {/* 1 — Hero */}
      <section className="join-hero" data-section="hero" aria-labelledby="join-title">
        <nav className="event-breadcrumb join-breadcrumb" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Nous rejoindre</span>
        </nav>
        <div className="join-hero-grid">
          <div className="join-hero-copy">
            <p className="eyebrow">{slots.eyebrow}</p>
            <h1 id="join-title" className="join-hero-title">
              <Title slots={slots} />
            </h1>
            <p className="join-hero-subtitle">{slots.subtitle}</p>
          </div>
          <div className="join-hero-action">
            <CtaButton label={slots.cta.label} target={slots.cta.target} variant="primary" />
            <Deadline text={slots.deadline} />
          </div>
        </div>
        <SlotImage
          photo={heroPhoto}
          resolved={heroResolved}
          className="join-photo join-banner"
          sizes={(zoom) => `${Math.round(94 * zoom)}vw`}
          priority
        />
      </section>

      {/* 2 — Notre point de départ */}
      <section className="join-start" data-section="depart" aria-labelledby="join-start-title">
        <div className="join-start-copy">
          <p className="eyebrow">{content.start.eyebrow}</p>
          <h2 id="join-start-title">{content.start.title}</h2>
          <p className="join-lead">{content.start.text}</p>
        </div>
        <SlotImage
          photo={content.start.photo}
          resolved={photoOf(content.start.photo)}
          className="join-photo join-start-photo"
          sizes={(zoom) => `(max-width: 820px) ${Math.round(94 * zoom)}vw, ${Math.round(50 * zoom)}vw`}
        />
      </section>

      {/* 3 — Chiffres clés (réglage du site) */}
      <KeyFiguresBand figures={keyFigures} variant="join" id="join-chiffres" />

      {/* 4 — Une expérience collective */}
      <section className="join-experience" data-section="experience" aria-labelledby="join-experience-title">
        <div className="join-section-head">
          <p className="eyebrow">{content.experience.eyebrow}</p>
          <h2 id="join-experience-title">{content.experience.title}</h2>
          <p className="join-lead">{content.experience.text}</p>
        </div>
        <ul className="join-experience-grid">
          {content.experience.items.map((item, index) => (
            <li key={index}>
              <SlotImage
                photo={item.photo}
                resolved={photoOf(item.photo)}
                className="join-photo join-photo--portrait"
                sizes={(zoom) => `(max-width: 820px) ${Math.round(94 * zoom)}vw, ${Math.round(32 * zoom)}vw`}
              />
              <p className="join-experience-label">{item.label}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 5 — Le cap que nous nous donnons (fond sombre) */}
      <section className="join-ambition" data-section="cap" aria-labelledby="join-ambition-title">
        <div className="join-ambition-inner">
          <div className="join-section-head">
            <p className="eyebrow">{content.ambition.eyebrow}</p>
            <h2 id="join-ambition-title">{content.ambition.title}</h2>
            <p className="join-lead">{content.ambition.text}</p>
          </div>
          <ol className="join-ambition-list">
            {content.ambition.items.map((item, index) => (
              <li key={index}>
                <span className="join-num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6 — Pour qui ? Qu'attendons-nous ? */}
      <section className="join-audience" data-section="profil" aria-labelledby="join-audience-title">
        <div className="join-section-head">
          <p className="eyebrow">{content.audience.eyebrow}</p>
          <h2 id="join-audience-title">{content.audience.title}</h2>
        </div>
        <div className="join-audience-cols">
          <div>
            <h3>{content.audience.whoTitle}</h3>
            <p>{content.audience.whoText}</p>
          </div>
          <div>
            <h3>{content.audience.expectTitle}</h3>
            <p>{content.audience.expectText}</p>
            <ul className="join-qualities" aria-label="Qualités attendues">
              {content.audience.qualities.map((quality) => (
                <li key={quality}>{quality}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7 — Comment rejoindre ? */}
      <section className="join-steps" data-section="etapes" aria-labelledby="join-steps-title">
        <div className="join-section-head">
          <p className="eyebrow">{content.steps.eyebrow}</p>
          <h2 id="join-steps-title">{content.steps.title}</h2>
        </div>
        <ol className="join-steps-list">
          {content.steps.items.map((step, index) => (
            <li key={index}>
              <span className="join-step-num" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="join-steps-note">{content.steps.note}</p>
      </section>

      {/* 8 — Rejoindre (ancre #candidater) */}
      <section className="join-final" id="candidater" data-section="candidater" aria-labelledby="join-final-title">
        <SlotImage
          photo={content.final.photo}
          resolved={photoOf(content.final.photo)}
          className="join-photo join-photo--portrait join-final-photo"
          sizes={(zoom) => `(max-width: 820px) ${Math.round(94 * zoom)}vw, ${Math.round(40 * zoom)}vw`}
        />
        <div className="join-final-copy">
          <p className="eyebrow">{content.final.eyebrow}</p>
          <h2 id="join-final-title">{content.final.title}</h2>
          <p className="join-lead">{content.final.text}</p>
          <div className="join-cta-lg">
            <CtaButton label={slots.cta.label} target={slots.cta.target} variant="primary" />
          </div>
          <Deadline text={slots.deadline} />
        </div>
      </section>
    </div>
  );
}
