import type { Event, Project, Theme, SubTheme } from "@/types/cms";
import { CtaButton } from "@/components/forms/CtaButton";
import { CardGrid } from "@/components/cards/CardGrid";
import { ProposeSection } from "@/components/public/ProposeSection";
import { titleFontSize } from "@/utils/titleSize";

interface Props {
  item: Theme;
  subThemes: SubTheme[];
  allSubThemes?: SubTheme[];
  events?: Event[];
  projects?: Project[];
}

export function ThemeDetail({ item, subThemes, allSubThemes = [], events = [], projects = [] }: Props) {
  const subThemeOptions = allSubThemes.map((st) => st.title);
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
            <CtaButton
              label="Contribuer"
              target="contribution"
              variant="primary"
              selectOptions={{ subTheme: subThemeOptions }}
            />
          </div>
        </div>
        <div className="hero-image" aria-hidden="true" />
      </section>

      {/* ── Sous-thèmes ──────────────────────────────────────────── */}
      {subThemes.length > 0 ? (
        <CardGrid
          title="Sujets traités sur ce thème"
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

      {/* ── Projets liés ─────────────────────────────────────────── */}
      {projects.length > 0 && (
        <CardGrid
          title="Projets liés"
          items={projects.map((p) => ({
            title: p.title,
            description: p.description,
            href: `/projets/${p.slug}`,
            meta: p.category,
          }))}
        />
      )}

      {/* ── Événements liés ──────────────────────────────────────── */}
      {events.length > 0 && (
        <CardGrid
          title="Événements liés"
          items={events.map((e) => ({
            title: e.title,
            description: e.description,
            href: `/evenements/${e.slug}`,
            meta: e.format,
          }))}
        />
      )}

      {/* ── Proposer un sous-thème ───────────────────────────────── */}
      <ProposeSection
        lead={`Vous souhaitez proposer un sous-thème pour « ${item.title} » ?`}
        label="Proposer un sous-thème"
        target="FORM:sub_theme"
        contextFields={{ themeTitle: item.title }}
      />
    </>
  );
}
