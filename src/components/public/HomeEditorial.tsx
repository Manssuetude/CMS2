import Link from "next/link";
import { CtaButton } from "@/components/forms/CtaButton";
import { ProductionsCarousel } from "@/components/public/ProductionsCarousel";
import type { Page, Production, Activity, Theme } from "@/types/cms";

const percaLetters = ["P", "E", "R", "C", "A"] as const;

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function HomeEditorial({
  page,
  heroImageUrl,
  focusImageUrl,
  activities = [],
  productions = [],
}: {
  page: Page;
  heroImageUrl?: string | null;
  focusImageUrl?: string | null;
  activities?: Activity[];
  productions?: Production[];
  themes?: Theme[];
}) {
  // L'identité de l'association vit dans `body` (demande de René : l'asso d'abord).
  const sentences = (page.body || "").split(/\.\s+/).filter(Boolean);
  const headline = sentences[0] ? `${sentences[0]}.` : page.body;
  const intro = sentences.slice(1).join(". ");

  return (
    <div className="home">
      {/* 1 — Hero : identité de l'association */}
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>
            <span className="home-hero-initial">{(headline || "").charAt(0)}</span>
            {(headline || "").slice(1)}
          </h1>
          {intro ? <p className="home-hero-intro">{intro}</p> : null}
          <div className="home-hero-actions">
            {page.primaryCtaLabel && page.primaryCtaTarget ? (
              <CtaButton label={page.primaryCtaLabel} target={page.primaryCtaTarget} variant="primary" />
            ) : null}
            {page.secondaryCtaLabel && page.secondaryCtaTarget ? (
              <CtaButton label={page.secondaryCtaLabel} target={page.secondaryCtaTarget} variant="secondary" />
            ) : null}
          </div>
        </div>
        {heroImageUrl ? (
          <figure className="home-hero-media">
            <img src={heroImageUrl} alt="" loading="eager" />
          </figure>
        ) : null}
      </section>

      {/* 2 — Sujet du moment : thème + sujet + média de la séance à venir */}
      <section className="home-focus">
        <div className="home-focus-media">
          {focusImageUrl ? <img src={focusImageUrl} alt="" loading="lazy" /> : null}
        </div>
        <div className="home-focus-copy">
          {page.eyebrow ? <p className="eyebrow">{page.eyebrow}</p> : null}
          <h2>{page.title}</h2>
          {page.quote ? (
            <Link className="home-focus-link" href={`/themes/${page.quote}`}>
              Explorer ce thème
              <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>
      </section>

      {/* 3 — Activités récentes */}
      {activities.length ? (
        <section className="home-section home-activities">
          <div className="home-section-head">
            <h2>Activités récentes</h2>
            <Link className="home-section-more" href="/activites">
              Toutes les activités <span aria-hidden>→</span>
            </Link>
          </div>
          <ul className="home-activity-list">
            {activities.slice(0, 3).map((a) => {
              const date = formatDate(a.date);
              return (
                <li key={a.id}>
                  <Link href={`/activites/${a.slug}`}>
                    <div className="home-activity-meta">
                      <span className="home-activity-format">{a.format}</span>
                      {date ? <span className="home-activity-date">{date}</span> : null}
                    </div>
                    <h3>{a.title}</h3>
                    {a.description ? <p>{a.description}</p> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* 4 — Productions récentes */}
      {productions.length ? (
        <section className="home-section home-productions">
          <div className="home-section-head">
            <h2>Productions récentes</h2>
            <Link className="home-section-more" href="/productions">
              Toutes les productions <span aria-hidden>→</span>
            </Link>
          </div>
          <ProductionsCarousel productions={productions} />
        </section>
      ) : null}

      {/* 5 — Notre méthode PERCA (teaser vers À propos) */}
      <section className="home-method">
        <div className="home-method-inner">
          <p className="home-method-label">Notre méthode</p>
          <div className="home-method-letters" aria-hidden>
            {percaLetters.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
          <p className="home-method-text">
            PERCA structure notre façon de partir d&apos;un dossier pour apprendre, débattre, produire et créer du lien.
          </p>
          <Link className="home-method-link" href="/a-propos">
            Découvrir notre approche <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* 6 — Appel à rejoindre */}
      <section className="home-join">
        <h2>Rejoindre une communauté qui pense, débat et produit.</h2>
        <div className="home-join-actions">
          <Link className="cta" href="/nous-rejoindre">
            Rejoindre Manssuétude
          </Link>
          <Link className="btn secondary" href="/nous-soutenir">
            Nous soutenir
          </Link>
        </div>
      </section>
    </div>
  );
}
