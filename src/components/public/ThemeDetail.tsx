import type { Theme, SubTheme } from "@/types/cms";
import { CtaButton } from "@/components/forms/CtaButton";
import { CardGrid } from "@/components/cards/CardGrid";
import { titleFontSize } from "@/utils/titleSize";

interface Props {
  item: Theme;
  subThemes: SubTheme[];
}

export function ThemeDetail({ item, subThemes }: Props) {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero hero--detail">
        <div className="hero-copy">
          <p className="eyebrow">Thème éditorial</p>
          <h1 style={{ fontSize: titleFontSize(item.title) }}>{item.title}</h1>
          {(item.longDescription ?? item.description) && <p>{item.longDescription ?? item.description}</p>}
          <div className="actions">
            <CtaButton label="Retour aux thèmes" target="/themes" variant="secondary" />
            <CtaButton label="Contribuer" target="contribution" variant="primary" />
          </div>
        </div>
        <div className="hero-image" aria-hidden="true" />
      </section>

      {/* ── Sous-thèmes ──────────────────────────────────────────── */}
      {subThemes.length > 0 ? (
        <CardGrid
          title={`Sujets traités sur « ${item.title} »`}
          items={subThemes.map((st) => ({
            title: st.title,
            description: st.description,
            href: `/themes/${item.slug}/${st.slug}`,
            tags: st.tags,
          }))}
        />
      ) : (
        <section className="section">
          <div className="section-head">
            <h2>Sous-thèmes</h2>
          </div>
          <p style={{ color: "var(--ed-muted)" }}>Aucun sous-thème publié sur ce thème pour l&apos;instant.</p>
        </section>
      )}
    </>
  );
}
