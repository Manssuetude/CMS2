import type { CSSProperties } from "react";
import Link from "next/link";
import { CtaButton } from "@/components/forms/CtaButton";
import { ProductionsCarousel } from "@/components/public/ProductionsCarousel";
import { NewsletterForm } from "@/components/public/NewsletterForm";
import { CardGrid } from "@/components/cards/CardGrid";
import type { Dossier, Page, Production, Activity, Theme, JournalEntry } from "@/types/cms";
import { cropToImageStyle } from "@/utils/imageCrop";
import { DOSSIER_ITEM_KIND_LABEL, type ResolvedDossierItem } from "@/utils/dossierItems";

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
  focusTheme = null,
  activities = [],
  productions = [],
  journalEntries = [],
  featuredDossiers = [],
}: {
  page: Page;
  heroImageUrl?: string | null;
  focusImageUrl?: string | null;
  focusTheme?: Theme | null;
  activities?: Activity[];
  productions?: Production[];
  journalEntries?: JournalEntry[];
  featuredDossiers?: Array<{ dossier: Dossier; items: ResolvedDossierItem[] }>;
}) {
  // L'identité de l'association vit dans `body` (demande de René : l'asso d'abord).
  const sentences = (page.body || "").split(/\.\s+/).filter(Boolean);
  const headline = sentences[0] ? `${sentences[0]}.` : page.body;
  const intro = sentences.slice(1).join(". ");

  return (
    <div className="home">
      {/* 1 — Hero : identité de l'association */}
      <section className={`home-hero${heroImageUrl ? "" : " home-hero--no-image"}`}>
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
            <img src={heroImageUrl} alt="" loading="eager" style={cropToImageStyle(page.imageCrop)} />
          </figure>
        ) : null}
      </section>

      {/* 1bis — Chiffres clés (facultatif, saisis en admin) */}
      {page.impactStats && page.impactStats.length > 0 && (
        <section className="home-impact" aria-label="Chiffres clés">
          {page.impactStats.map((stat, index) => (
            <div className="home-impact-stat" key={index}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>
      )}

      {/* 2 — Sujet du moment : le thème sélectionné en admin (carte cliquable, image optionnelle) */}
      {focusTheme ? (
        <Link
          className={`home-focus${focusImageUrl ? "" : " home-focus--no-image"}`}
          href={`/themes/${focusTheme.slug}`}
        >
          {focusImageUrl ? (
            <div className="home-focus-media">
              <img src={focusImageUrl} alt="" loading="lazy" style={cropToImageStyle(page.focusImageCrop)} />
            </div>
          ) : null}
          <div className="home-focus-copy">
            {page.eyebrow ? <p className="eyebrow">{page.eyebrow}</p> : null}
            <h2>{focusTheme.title}</h2>
            {focusTheme.description ? <p className="home-focus-desc">{focusTheme.description}</p> : null}
            <span className="home-focus-link">
              Explorer ce thème
              <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      ) : null}

      {/* 2bis — Sélections éditoriales nommées (dossiers mis en avant en admin) */}
      {featuredDossiers.map(({ dossier, items }) => (
        <CardGrid
          key={dossier.id}
          title={dossier.title}
          items={items.map((entry) => ({
            title: entry.title,
            description: entry.description,
            href: entry.href,
            meta: DOSSIER_ITEM_KIND_LABEL[entry.entityType],
            imageUrl: entry.imageUrl,
          }))}
          headerActions={
            <Link href={`/dossiers/${dossier.slug}`} className="home-section-more">
              Voir le dossier
              <span aria-hidden>→</span>
            </Link>
          }
        />
      ))}

      {/* 3 — Productions récentes */}
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

      {/* 4 — Activités récentes */}
      {activities.length ? (
        <section className="home-section home-activities">
          <div className="home-section-head">
            <h2>Activités récentes</h2>
            <Link className="home-section-more" href="/activites">
              Toutes les activités <span aria-hidden>→</span>
            </Link>
          </div>
          <ul className="home-activity-list" style={{ "--acount": activities.slice(0, 3).length } as CSSProperties}>
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

      {/* 4bis — Journal (dernières entrées) */}
      {journalEntries.length ? (
        <section className="home-section home-journal">
          <div className="home-section-head">
            <h2>Le Journal</h2>
            <Link className="home-section-more" href="/journal">
              Tout le Journal <span aria-hidden>→</span>
            </Link>
          </div>
          <ul className="home-activity-list" style={{ "--acount": journalEntries.slice(0, 3).length } as CSSProperties}>
            {journalEntries.slice(0, 3).map((e) => {
              const date = formatDate(e.date);
              return (
                <li key={e.id}>
                  <Link href={`/journal/${e.slug}`}>
                    <div className="home-activity-meta">
                      {e.category ? <span className="home-activity-format">{e.category}</span> : null}
                      {date ? <span className="home-activity-date">{date}</span> : null}
                    </div>
                    <h3>{e.title}</h3>
                    {e.excerpt ? <p>{e.excerpt}</p> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
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
        </div>
      </section>

      {/* 6 — Newsletter */}
      <section className="home-section home-newsletter">
        <div className="home-newsletter-panel">
          <div className="home-newsletter-text">
            <p className="eyebrow">Newsletter</p>
            <h2>Recevez nos actualités</h2>
            <p>Productions, activités et entrées du Journal — un email de temps en temps, pas plus.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

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
