import { ExternalLink, MapPin, Users } from "lucide-react";
import type { Event, ActivityFormat, Author, SubTheme, Theme } from "@/types/cms";
import { CtaButton } from "@/components/forms/CtaButton";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { resolveRegistrationStatus, registrationStatusLabel } from "@/utils/registrationStatus";
import { JsonLd } from "@/components/public/JsonLd";
import { buildEventJsonLd } from "@/lib/jsonLd";
import { resolveActivityFormatIcon } from "@/utils/activityFormatIcons";
import { injectFormatBubbles } from "@/utils/formatBubbles";
import Link from "next/link";

const FORMAT_LABEL: Record<string, string> = {
  "Debat & Conference": "Débat & Conférence",
  "Atelier & Seance de travail": "Atelier & Séance de travail",
  "Formation & Masterclass": "Formation & Masterclass",
  "Visite & Immersion": "Visite & Immersion",
  "Rencontre & Networking": "Rencontre & Networking",
};

const PROGRESS_LABEL: Record<string, string> = {
  idea: "À l'étude",
  preparation: "En préparation",
  active: "En cours",
  completed: "Terminée",
  paused: "En pause",
};

export type ResolvedAnimator = { author: Author; contribution?: string | null };

export function EvenementDetail({
  item,
  formats = [],
  allFormats = formats,
  animators = [],
  gallery = [],
  themes = [],
  subThemes = [],
  allThemes = themes,
}: {
  item: Event;
  formats?: ActivityFormat[];
  allFormats?: ActivityFormat[];
  animators?: ResolvedAnimator[];
  gallery?: string[];
  themes?: Theme[];
  subThemes?: SubTheme[];
  allThemes?: Theme[];
}) {
  const themeById = new Map(allThemes.map((t) => [t.id, t]));
  const now = new Date();
  const eventDate = item.date ? new Date(item.date) : null;
  // Sans date, on ne peut pas déduire "passé" du simple fait qu'il ne soit
  // pas "à venir" — le statut d'avancement (renseigné par l'équipe) est le
  // signal fiable pour savoir si un compte-rendu a du sens.
  const isPast = item.progressStatus === "completed" || (eventDate ? eventDate < now : false);
  const isUpcoming = !isPast && (eventDate ? eventDate >= now : false);
  const formatLabel = FORMAT_LABEL[item.format] ?? item.format;
  const registrationStatus = resolveRegistrationStatus(item.registrationStatus, item.date, now);

  return (
    <>
      <JsonLd
        data={buildEventJsonLd({
          title: item.title,
          description: item.description,
          path: `/evenements/${item.slug}`,
          startDate: item.date ? (item.startTime ? `${item.date}T${item.startTime}` : item.date) : null,
          endDate: item.date && item.endTime ? `${item.date}T${item.endTime}` : null,
          location: item.location,
        })}
      />
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero hero--detail">
        <div className="hero-copy">
          <p className="eyebrow">{formatLabel}</p>
          <h1>{item.title}</h1>
          {item.description && <p>{item.description}</p>}
          <div className="detail-meta">
            {eventDate && (
              <span className="meta-pill">
                {isUpcoming ? "" : "✓ "}
                {eventDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {item.startTime && ` · ${item.startTime}${item.endTime ? `–${item.endTime}` : ""}`}
              </span>
            )}
            {item.location && (
              <span className="meta-pill">
                <MapPin size={13} strokeWidth={1.75} style={{ marginRight: 4 }} />
                {item.location}
              </span>
            )}
            {item.capacity && (
              <span className="meta-pill">
                <Users size={13} strokeWidth={1.75} style={{ marginRight: 4 }} />
                {item.capacity}
              </span>
            )}
            {registrationStatus && <span className="meta-pill">{registrationStatusLabel(registrationStatus)}</span>}
            {item.progressStatus && (
              <span className="meta-pill">{PROGRESS_LABEL[item.progressStatus] ?? item.progressStatus}</span>
            )}
          </div>
          <div className="actions">
            <CtaButton label="Retour aux événements" target="/evenements" variant="secondary" />
            {item.eventbriteUrl ? (
              <a href={item.eventbriteUrl} target="_blank" rel="noopener noreferrer" className="button primary">
                <ExternalLink size={15} strokeWidth={1.75} />
                S&apos;inscrire sur EventBrite
              </a>
            ) : (
              isUpcoming && <CtaButton label="Nous rejoindre" target="memberApplication" variant="primary" />
            )}
          </div>
        </div>
        <div className="hero-image" aria-hidden="true" />
      </section>

      {/* ── Corps ────────────────────────────────────────────── */}
      {item.body && (
        <section className="section">
          <div className="detail-layout no-sidebar">
            <div
              className="rich-text"
              dangerouslySetInnerHTML={{ __html: injectFormatBubbles(sanitizeHtml(item.body), allFormats) }}
            />
          </div>
        </section>
      )}

      {/* ── Thèmes & sous-thèmes ─────────────────────────────── */}
      {(themes.length > 0 || subThemes.length > 0) && (
        <section className="section">
          <div className="section-head">
            <h2>Thèmes</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {themes.map((theme) => (
              <Link key={theme.id} href={`/themes/${theme.slug}`} className="theme-chip">
                {theme.title}
              </Link>
            ))}
            {subThemes.map((st) => {
              const parentTheme = themeById.get(st.themeId);
              return parentTheme ? (
                <Link key={st.id} href={`/themes/${parentTheme.slug}/${st.slug}`} className="theme-chip">
                  {st.title}
                </Link>
              ) : null;
            })}
          </div>
        </section>
      )}

      {/* ── Intervenants ─────────────────────────────────────── */}
      {item.speakers.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Intervenants</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {item.speakers.map((speaker, i) => (
              <div key={i}>
                <p style={{ margin: 0, fontWeight: 600, color: "var(--ed-ink)" }}>{speaker.name}</p>
                {speaker.role && <p style={{ margin: 0, fontSize: 13, color: "var(--ed-muted)" }}>{speaker.role}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Animateurs ───────────────────────────────────────── */}
      {animators.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Animateurs</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {animators.map(({ author, contribution }) => (
              <div key={author.id}>
                <p style={{ margin: 0, fontWeight: 600, color: "var(--ed-ink)" }}>{author.name}</p>
                {contribution && <p style={{ margin: 0, fontSize: 13, color: "var(--ed-muted)" }}>{contribution}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Formats/techniques d'animation ─────────────────────── */}
      {formats.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Formats d&apos;activité</h2>
          </div>
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
            D&apos;autres formats d&apos;animation font partie du répertoire de l&apos;association.{" "}
            <Link href="/activites/formats-d-activites" className="format-chip-list-link">
              Les découvrir
            </Link>
          </p>
        </section>
      )}

      {/* ── Galerie photo (compte-rendu) ──────────────────────── */}
      {isPast && gallery.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Compte-rendu en images</h2>
          </div>
          <div className="event-gallery">
            {gallery.map((url, i) => (
              <img key={i} src={url} alt={`${item.title} — photo ${i + 1}`} loading="lazy" />
            ))}
          </div>
        </section>
      )}

      {/* ── Documents ─────────────────────────────────────────── */}
      {item.documents.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Documents</h2>
          </div>
          <div style={{ display: "grid", gap: 10, maxWidth: 560 }}>
            {item.documents.map((doc, i) => (
              <a
                key={i}
                href={doc}
                className="button"
                target="_blank"
                rel="noreferrer"
                style={{ justifyContent: "flex-start" }}
              >
                {doc.split("/").pop() ?? `Document ${i + 1}`}
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
