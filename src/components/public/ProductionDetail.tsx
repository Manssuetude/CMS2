import Link from "next/link";
import type { Production, Theme } from "@/types/cms";
import { CtaButton } from "@/components/forms/CtaButton";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { CardGrid } from "@/components/cards/CardGrid";

const TYPE_LABEL: Record<string, string> = {
  Article: "Article",
  "Note & Synthese": "Note & Synthèse",
  "Etude & Rapport": "Étude & Rapport",
  Video: "Vidéo",
  Podcast: "Podcast",
  Infographie: "Infographie",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

interface Props {
  item: Production;
  allThemes: Theme[];
  relatedProductions?: Production[];
}

export function ProductionDetail({ item, allThemes, relatedProductions = [] }: Props) {
  const themes = allThemes.filter((t) => item.themeIds?.includes(t.id));
  const typeLabel = TYPE_LABEL[item.type] ?? item.type;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero hero--detail">
        <div className="hero-copy">
          <p className="eyebrow">{typeLabel}</p>
          <h1>{item.title}</h1>
          {item.description && <p>{item.description}</p>}
          <div className="detail-meta">
            {item.date && <span className="meta-pill">{formatDate(item.date)}</span>}
            {item.author && <span className="meta-pill">{item.author}</span>}
            {item.readingTime && <span className="meta-pill">{item.readingTime} de lecture</span>}
            {item.pages && <span className="meta-pill">{item.pages} pages</span>}
          </div>
          <div className="actions">
            <CtaButton label="Retour aux productions" target="/productions" variant="secondary" />
            <CtaButton label="Contribuer" target="contribution" variant="primary" />
          </div>
        </div>
        <div className="hero-image" aria-hidden="true">
          <div className="hero-type-badge">{typeLabel}</div>
        </div>
      </section>

      {/* ── Contenu principal ──────────────────────────────────── */}
      <section className="section">
        <div className={`detail-layout${themes.length === 0 && item.tags.length === 0 ? " no-sidebar" : ""}`}>
          {/* Corps */}
          <div>
            {item.body ? (
              <div className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.body) }} />
            ) : item.description ? (
              <p className="rich-text">{item.description}</p>
            ) : (
              <p style={{ color: "var(--ed-muted)" }}>Aucun contenu détaillé disponible pour cette production.</p>
            )}
          </div>

          {/* Sidebar */}
          {(themes.length > 0 || item.tags.length > 0) && (
            <aside>
              {themes.length > 0 && (
                <div className="detail-sidebar-card">
                  <p className="detail-sidebar-label">Thèmes</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {themes.map((t) => (
                      <Link key={t.id} href={`/themes/${t.slug}`} className="theme-chip">
                        {t.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {item.tags.length > 0 && (
                <div className="detail-sidebar-card">
                  <p className="detail-sidebar-label">Tags</p>
                  <div className="tags" style={{ marginTop: 0 }}>
                    {item.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="detail-sidebar-card">
                <p className="detail-sidebar-label">Partager</p>
                <p style={{ fontSize: 13, color: "var(--ed-muted)", margin: 0 }}>
                  Vous trouvez cette production utile ?{" "}
                  <CtaButton label="Contribuer" target="contribution" variant="secondary" />
                </p>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* ── Productions liées ─────────────────────────────────── */}
      {relatedProductions.length > 0 && (
        <CardGrid
          title="Dans le même thème"
          items={relatedProductions
            .filter((p) => p.id !== item.id)
            .slice(0, 3)
            .map((p) => ({
              title: p.title,
              description: p.description,
              href: `/productions/${p.slug}`,
              meta: TYPE_LABEL[p.type] ?? p.type,
              tags: p.tags,
            }))}
        />
      )}
    </>
  );
}
