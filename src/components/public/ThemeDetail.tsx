import type { Theme, Production } from "@/types/cms";
import { CtaButton } from "@/components/forms/CtaButton";
import { CardGrid } from "@/components/cards/CardGrid";

const TYPE_LABEL: Record<string, string> = {
  Article: "Article",
  "Note & Synthese": "Note & Synthèse",
  "Etude & Rapport": "Étude & Rapport",
  Video: "Vidéo",
  Podcast: "Podcast",
  Infographie: "Infographie",
};

interface Props {
  item: Theme;
  productions: Production[];
}

export function ThemeDetail({ item, productions }: Props) {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero hero--detail">
        <div className="hero-copy">
          <p className="eyebrow">Thème éditorial</p>
          <h1>{item.title}</h1>
          {(item.longDescription ?? item.description) && <p>{item.longDescription ?? item.description}</p>}
          <div className="actions">
            <CtaButton label="Retour aux thèmes" target="/themes" variant="secondary" />
            <CtaButton label="Contribuer" target="contribution" variant="primary" />
          </div>
        </div>
        <div className="hero-image" aria-hidden="true" />
      </section>

      {/* ── Productions associées ─────────────────────────────── */}
      {productions.length > 0 ? (
        <CardGrid
          title={`Productions sur « ${item.title} »`}
          items={productions.map((p) => ({
            title: p.title,
            description: p.description,
            href: `/productions/${p.slug}`,
            meta: TYPE_LABEL[p.type] ?? p.type,
            tags: p.tags,
          }))}
        />
      ) : (
        <section className="section">
          <div className="section-head">
            <h2>Productions</h2>
          </div>
          <p style={{ color: "var(--ed-muted)" }}>Aucune production publiée sur ce thème pour l&apos;instant.</p>
        </section>
      )}

      {/* ── CTA bas de page ───────────────────────────────────── */}
      <section className="section" style={{ textAlign: "center", padding: "48px 0" }}>
        <p className="eyebrow">Manssuétude</p>
        <h2 style={{ maxWidth: 640, margin: "12px auto 24px" }}>Vous avez des travaux sur ce thème ?</h2>
        <div className="actions" style={{ justifyContent: "center" }}>
          <CtaButton label="Proposer une contribution" target="contribution" variant="primary" />
          <CtaButton label="Rejoindre le think tank" target="memberApplication" variant="secondary" />
        </div>
      </section>
    </>
  );
}
