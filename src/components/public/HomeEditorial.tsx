import type { CSSProperties } from "react";
import Link from "next/link";
import { CtaButton } from "@/components/forms/CtaButton";
import { ProductionsCarousel } from "@/components/public/ProductionsCarousel";
import { NewsletterForm } from "@/components/public/NewsletterForm";
import type { Page, Production, Event, JournalEntry } from "@/types/cms";
import { cropToImageStyle } from "@/utils/imageCrop";

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
  eventOfTheMoment = null,
  events = [],
  productions = [],
  journalEntries = [],
}: {
  page: Page;
  heroImageUrl?: string | null;
  eventOfTheMoment?: Event | null;
  events?: Event[];
  productions?: Production[];
  journalEntries?: JournalEntry[];
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

      {/* 2 — Événement du moment : l'événement le plus proche d'aujourd'hui
             (à venir ou passé), calculé automatiquement — pas de sélection
             admin, se met à jour seul. */}
      {eventOfTheMoment ? (
        <Link className="home-focus home-focus--no-image" href={`/evenements/${eventOfTheMoment.slug}`}>
          <div className="home-focus-copy">
            <p className="eyebrow">Événement du moment</p>
            <h2>{eventOfTheMoment.title}</h2>
            <p className="home-focus-desc">
              {[formatDate(eventOfTheMoment.date), eventOfTheMoment.description].filter(Boolean).join(" · ")}
            </p>
            <span className="home-focus-link">
              Découvrir cet événement
              <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      ) : null}

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

      {/* 4 — Événements récents */}
      {events.length ? (
        <section className="home-section home-events">
          <div className="home-section-head">
            <h2>Événements récents</h2>
            <Link className="home-section-more" href="/evenements">
              Tous les événements <span aria-hidden>→</span>
            </Link>
          </div>
          <ul className="home-event-list" style={{ "--acount": events.slice(0, 3).length } as CSSProperties}>
            {events.slice(0, 3).map((e) => {
              const date = formatDate(e.date);
              return (
                <li key={e.id}>
                  <Link href={`/evenements/${e.slug}`}>
                    <div className="home-event-meta">
                      <span className="home-event-format">{e.format}</span>
                      {date ? <span className="home-event-date">{date}</span> : null}
                    </div>
                    <h3>{e.title}</h3>
                    {e.description ? <p>{e.description}</p> : null}
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
          <ul className="home-event-list" style={{ "--acount": journalEntries.slice(0, 3).length } as CSSProperties}>
            {journalEntries.slice(0, 3).map((e) => {
              const date = formatDate(e.date);
              return (
                <li key={e.id}>
                  <Link href={`/journal/${e.slug}`}>
                    <div className="home-event-meta">
                      {e.category ? <span className="home-event-format">{e.category}</span> : null}
                      {date ? <span className="home-event-date">{date}</span> : null}
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
          <Link href="/perca" className="home-method-link">
            Découvrir la méthode PERCA
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* 6 — Newsletter */}
      <section className="home-section home-newsletter">
        <div className="home-newsletter-panel">
          <div className="home-newsletter-text">
            <p className="eyebrow">Newsletter</p>
            <h2>Recevez nos actualités</h2>
            <p>Productions, événements et entrées du Journal, un email de temps en temps, pas plus.</p>
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
