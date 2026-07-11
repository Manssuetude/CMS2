import type { Activity } from "@/types/cms";
import { CtaButton } from "@/components/forms/CtaButton";

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

export function ActiviteDetail({ item }: { item: Activity }) {
  const now = new Date();
  const eventDate = item.date ? new Date(item.date) : null;
  const isUpcoming = eventDate ? eventDate >= now : false;
  const formatLabel = FORMAT_LABEL[item.format] ?? item.format;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero hero--detail">
        <div className="hero-copy">
          <p className="eyebrow">{formatLabel}</p>
          <h1>{item.title}</h1>
          {item.description && <p>{item.description}</p>}
          <div className="detail-meta">
            {eventDate && (
              <span className="meta-pill">
                {isUpcoming ? "📅 " : "✓ "}
                {eventDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {isUpcoming && (
              <span
                className="meta-pill"
                style={{ background: "rgba(255,77,18,0.18)", borderColor: "var(--orange)", color: "#fff" }}
              >
                À venir
              </span>
            )}
            {!isUpcoming && eventDate && <span className="meta-pill">Passée</span>}
            {item.progressStatus && (
              <span className="meta-pill">{PROGRESS_LABEL[item.progressStatus] ?? item.progressStatus}</span>
            )}
          </div>
          <div className="actions">
            <CtaButton label="Retour aux activités" target="/activites" variant="secondary" />
            {isUpcoming && <CtaButton label="Nous rejoindre" target="memberApplication" variant="primary" />}
          </div>
        </div>
        <div className="hero-image" aria-hidden="true" />
      </section>

      {/* ── Corps ────────────────────────────────────────────── */}
      {item.body && (
        <section className="section">
          <div className="detail-layout no-sidebar">
            <div className="rich-text" dangerouslySetInnerHTML={{ __html: item.body }} />
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
