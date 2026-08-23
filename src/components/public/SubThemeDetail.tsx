import Link from "next/link";
import type { Theme, SubTheme, Production } from "@/types/cms";
import { CtaButton } from "@/components/forms/CtaButton";
import { CardGrid } from "@/components/cards/CardGrid";
import { titleFontSize } from "@/utils/titleSize";

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
  theme: Theme;
  item: SubTheme;
  productions: Production[];
  allSubThemes?: SubTheme[];
}

export function SubThemeDetail({ theme, item, productions, allSubThemes = [] }: Props) {
  const subThemeOptions = allSubThemes.map((st) => st.title);
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero hero--detail">
        <div className="hero-copy">
          <p className="eyebrow">
            <Link href={`/themes/${theme.slug}`} style={{ color: "inherit" }}>
              {theme.title}
            </Link>{" "}
            · Sous-thème
          </p>
          <h1 style={{ fontSize: titleFontSize(item.title) }}>{item.title}</h1>
          {(item.longDescription ?? item.description) && <p>{item.longDescription ?? item.description}</p>}
          {item.date && (
            <div className="detail-meta">
              <span className="meta-pill">Sujet traité le {formatDate(item.date)}</span>
            </div>
          )}
          <div className="actions">
            <CtaButton label="Retour au thème" target={`/themes/${theme.slug}`} variant="secondary" />
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

      {/* ── Productions associées ─────────────────────────────── */}
      {productions.length > 0 ? (
        <CardGrid
          title="Production sur ce thème"
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
          <p style={{ color: "var(--ed-muted)" }}>Aucune production publiée sur ce sous-thème pour l&apos;instant.</p>
        </section>
      )}

      {/* ── CTA bas de page ───────────────────────────────────── */}
      <section className="section" style={{ textAlign: "center", padding: "48px 0" }}>
        <p className="eyebrow">Manssuétude</p>
        <h2 style={{ maxWidth: 640, margin: "12px auto 24px" }}>Vous avez des travaux sur ce sujet ?</h2>
        <div className="actions" style={{ justifyContent: "center" }}>
          <CtaButton
            label="Proposer une contribution"
            target="contribution"
            variant="primary"
            selectOptions={{ subTheme: subThemeOptions }}
          />
        </div>
      </section>
    </>
  );
}
