import type { Project } from "@/types/cms";
import { CtaButton } from "@/components/forms/CtaButton";

const PROGRESS_LABEL: Record<string, string> = {
  idea: "Idée",
  preparation: "En préparation",
  active: "Actif",
  completed: "Complété",
  paused: "En pause",
};

const PROGRESS_PCT: Record<string, number> = {
  idea: 10,
  preparation: 25,
  active: 60,
  completed: 100,
  paused: 40,
};

const PRIORITY_COLOR: Record<string, string> = {
  Haute: "var(--orange)",
  Moyenne: "#92400e",
  Basse: "var(--muted)",
};

export function ProjetDetail({ item }: { item: Project }) {
  const progress = item.progressStatus ? (PROGRESS_PCT[item.progressStatus] ?? 0) : 0;
  const progressLabel = item.progressStatus ? (PROGRESS_LABEL[item.progressStatus] ?? item.progressStatus) : null;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero hero--detail">
        <div className="hero-copy">
          <p className="eyebrow">{item.category ?? "Projet de recherche"}</p>
          <h1>{item.title}</h1>
          {item.description && <p>{item.description}</p>}
          <div className="detail-meta">
            {progressLabel && <span className="meta-pill">{progressLabel}</span>}
            {item.priority && (
              <span className="meta-pill" style={{ borderColor: PRIORITY_COLOR[item.priority] ?? undefined }}>
                Priorité {item.priority.toLowerCase()}
              </span>
            )}
          </div>
          <div className="actions">
            <CtaButton label="← Projets" target="/projets" variant="secondary" />
            <CtaButton label="Proposer un projet" target="projectProposal" variant="primary" />
          </div>
        </div>
        <div className="hero-image" aria-hidden="true">
          {progress > 0 && (
            <div className="hero-progress">
              <span>{progress}%</span>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: "4px 0 12px" }}>{progressLabel}</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Corps ────────────────────────────────────────────── */}
      {item.body && (
        <section className="section">
          <div className="detail-layout no-sidebar">
            <div className="rich-text" dangerouslySetInnerHTML={{ __html: item.body }} />
          </div>
        </section>
      )}

      {/* ── Objectifs & Livrables ─────────────────────────────── */}
      {(item.objectives.length > 0 || item.deliverables.length > 0) && (
        <section className="section">
          <div className="objectives-grid">
            {item.objectives.length > 0 && (
              <div className="objectives-card">
                <h2>Objectifs</h2>
                <ul className="objectives-list">
                  {item.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
            {item.deliverables.length > 0 && (
              <div className="objectives-card">
                <h2>Livrables attendus</h2>
                <ul className="objectives-list">
                  {item.deliverables.map((del, i) => (
                    <li key={i}>{del}</li>
                  ))}
                </ul>
              </div>
            )}
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
