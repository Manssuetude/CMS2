import Link from "next/link";
import { Layers, Users } from "lucide-react";
import type { Event, ActivityFormat, Author, GalleryPhoto, SubTheme, Theme } from "@/types/cms";
import { SITE_URL } from "@/constants/site";
import { PhotoGallery } from "@/components/public/PhotoGallery";
import { EventHeaderClassic } from "@/components/public/EventHeaderClassic";
import { EventHeaderBanner } from "@/components/public/EventHeaderBanner";
import { EventInfoCard, EventThemeChips, type ThemeChip } from "@/components/public/EventInfoCard";
import { JsonLd } from "@/components/public/JsonLd";
import { buildEventJsonLd } from "@/lib/jsonLd";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { toParisIsoDateTime } from "@/utils/seoText";
import { resolveActivityFormatIcon } from "@/utils/activityFormatIcons";
import { injectFormatBubbles } from "@/utils/formatBubbles";
import { headerImageFit, pickHeaderImage, resolveHeaderStyle } from "@/utils/eventHeader";
import { buildEventFacts, GALLERY_ANCHOR } from "@/utils/eventFacts";
import { aboutHeading, eventFormatLabel } from "@/utils/eventLabels";

export type ResolvedAnimator = { author: Author; contribution?: string | null };

// Page événement — utilisée telle quelle par la page publique ET par l'aperçu
// admin (renderEventPreview) : ce qui est prévisualisé est exactement ce qui
// sera publié. Deux styles d'en-tête (Classique / Bannière, repli automatique
// vers Classique si l'image ne convient pas), corps commun en grille 8 + 4.
export function EvenementDetail({
  item,
  formats = [],
  allFormats = formats,
  animators = [],
  poster = null,
  gallery = [],
  themes = [],
  subThemes = [],
  allThemes = themes,
  now = new Date(),
}: {
  item: Event;
  formats?: ActivityFormat[];
  allFormats?: ActivityFormat[];
  animators?: ResolvedAnimator[];
  // Affiche (posterId résolu) ; déjà retirée de `gallery` si elle y figurait.
  poster?: GalleryPhoto | null;
  gallery?: GalleryPhoto[];
  themes?: Theme[];
  subThemes?: SubTheme[];
  allThemes?: Theme[];
  now?: Date;
}) {
  const facts = buildEventFacts(item, { photoCount: gallery.length, now });
  const showGallery = facts.status === "termine" && gallery.length > 0;
  const { image, isPoster } = pickHeaderImage(poster, gallery);
  const style = resolveHeaderStyle(item.headerStyle, image);
  const eyebrow = eventFormatLabel(item.format);
  const pageUrl = `${SITE_URL}/evenements/${item.slug}`;

  const themeById = new Map(allThemes.map((t) => [t.id, t]));
  const themeChips: ThemeChip[] = [
    ...themes.map((t) => ({ id: t.id, title: t.title, href: `/themes/${t.slug}` })),
    ...subThemes.flatMap((st) => {
      const parent = themeById.get(st.themeId);
      return parent ? [{ id: st.id, title: st.title, href: `/themes/${parent.slug}/${st.slug}` }] : [];
    }),
  ];

  // Intervenants : invités saisis sur l'événement + animateurs (fiches auteurs).
  const people = [
    ...item.speakers.map((s, i) => ({ key: `s-${i}`, name: s.name, role: s.role ?? null })),
    ...animators.map(({ author, contribution }) => ({ key: author.id, name: author.name, role: contribution ?? null })),
  ];

  const intervenants = (
    <section className="event-section" aria-labelledby="event-people">
      <h2 id="event-people">Intervenants</h2>
      {people.length > 0 ? (
        <ul className="event-people">
          {people.map((person) => (
            <li key={person.key}>
              <Users size={18} strokeWidth={1.6} aria-hidden="true" />
              <span>
                <strong>{person.name}</strong>
                {person.role && <span className="event-people-role">{person.role}</span>}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="event-people event-people--pending">
          <Users size={18} strokeWidth={1.6} aria-hidden="true" />À confirmer
        </p>
      )}
    </section>
  );

  const formatsSection = formats.length > 0 && (
    <section className="event-section" aria-labelledby="event-formats">
      <h2 id="event-formats">Formats d&apos;activité</h2>
      <div className="format-chip-list">
        {formats.map((format) => {
          const Icon = resolveActivityFormatIcon(format.icon);
          return (
            <span
              key={format.id}
              className="format-chip"
              tabIndex={0}
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <Icon size={14} strokeWidth={1.75} />
              {format.title}
              {format.description && (
                <span className="format-chip__bubble" role="tooltip">
                  {format.description}
                </span>
              )}
            </span>
          );
        })}
      </div>
      <p className="format-chip-list-hint">
        <Layers size={14} strokeWidth={1.75} aria-hidden="true" /> D&apos;autres formats font partie du répertoire de
        l&apos;association.{" "}
        <Link href="/activites/formats-d-activites" className="format-chip-list-link">
          Les découvrir
        </Link>
      </p>
    </section>
  );

  const themesSection = themeChips.length > 0 && (
    <section className="event-section" aria-labelledby="event-themes">
      <h2 id="event-themes">Thèmes</h2>
      <EventThemeChips themes={themeChips} />
    </section>
  );

  const documents = item.documents.length > 0 && (
    <section className="event-section" aria-labelledby="event-documents">
      <h2 id="event-documents">Documents</h2>
      <ul className="event-documents">
        {item.documents.map((doc, i) => (
          <li key={i}>
            <a href={doc} target="_blank" rel="noreferrer">
              {doc.split("/").pop() ?? `Document ${i + 1}`}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <article className={`event-page event-page--${style}`}>
      <JsonLd
        data={buildEventJsonLd({
          title: item.title,
          description: item.description,
          path: `/evenements/${item.slug}`,
          startDate: toParisIsoDateTime(item.date, item.startTime),
          endDate: item.endTime ? toParisIsoDateTime(item.date, item.endTime) : null,
          location: item.location,
          imageUrl: poster?.url ?? gallery[0]?.url,
          registrationUrl: item.eventbriteUrl,
        })}
      />

      {style === "banner" && image ? (
        <EventHeaderBanner title={item.title} eyebrow={eyebrow} lead={item.description} image={image} facts={facts} />
      ) : (
        <EventHeaderClassic
          title={item.title}
          eyebrow={eyebrow}
          lead={item.description}
          image={image}
          isPoster={isPoster}
          fit={headerImageFit("classic", isPoster)}
        />
      )}

      <div className="event-layout">
        {style === "classic" && (
          <div className="event-aside event-aside--sticky">
            <EventInfoCard facts={facts} shareUrl={pageUrl} title={item.title} themes={themeChips} />
          </div>
        )}

        <div className="event-main">
          <section className="event-section event-section--about" aria-labelledby="event-about">
            <h2 id="event-about">{aboutHeading(item.format)}</h2>
            {item.body ? (
              <div
                className="rich-text event-body"
                dangerouslySetInnerHTML={{ __html: injectFormatBubbles(sanitizeHtml(item.body), allFormats) }}
              />
            ) : (
              <p className="event-pending">Programme détaillé à confirmer.</p>
            )}
          </section>
          {style === "classic" && intervenants}
          {style === "classic" && formatsSection}
          {/* Classique : les thèmes sont dans la carte latérale ; sur mobile ils
              sont repris ici, après les intervenants (ordre de lecture mobile). */}
          {style === "classic" && themesSection && <div className="event-mobile-only">{themesSection}</div>}
          {documents}
        </div>

        {style === "banner" && (
          <div className="event-aside event-aside--ruled">
            {intervenants}
            {formatsSection}
            {themesSection}
          </div>
        )}
      </div>

      {showGallery && (
        <PhotoGallery photos={gallery} title={item.title} heading="Compte-rendu en images" anchorId={GALLERY_ANCHOR} />
      )}
    </article>
  );
}
