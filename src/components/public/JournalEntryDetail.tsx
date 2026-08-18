import Link from "next/link";
import type { Activity, Author, JournalEntry, Project } from "@/types/cms";
import { CtaButton } from "@/components/forms/CtaButton";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { ShareButtons } from "@/components/public/ShareButtons";
import { ReadingProgressBar } from "@/components/public/ReadingProgressBar";
import { CiteButton } from "@/components/public/CiteButton";
import { QuoteShareBar } from "@/components/public/QuoteShareBar";
import { SITE_URL } from "@/constants/site";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

interface Props {
  item: JournalEntry;
  author?: Author | null;
  imageUrl?: string | null;
  project?: Project | null;
  activity?: Activity | null;
}

export function JournalEntryDetail({ item, author, imageUrl, project, activity }: Props) {
  const sanitizedBody = item.body ? sanitizeHtml(item.body) : "";
  const pageUrl = `${SITE_URL}/journal/${item.slug}`;

  return (
    <>
      {item.body && <ReadingProgressBar />}
      <section className="hero hero--detail hero--detail-split">
        <div className="hero-copy">
          <p className="eyebrow">{item.category ?? "Journal"}</p>
          <h1>{item.title}</h1>
          {item.excerpt && <p>{item.excerpt}</p>}
          <div className="detail-meta">
            {item.date && <span className="meta-pill">{formatDate(item.date)}</span>}
            {author && <span className="meta-pill">{author.name}</span>}
          </div>
          <div className="actions">
            <CtaButton label="Retour au Journal" target="/journal" variant="secondary" />
          </div>
        </div>
        <aside className="hero-aside">
          <div className="detail-sidebar-card">
            <p className="detail-sidebar-label">Partager</p>
            <ShareButtons url={`${SITE_URL}/journal/${item.slug}`} title={item.title} />
          </div>
        </aside>
      </section>

      {imageUrl && (
        <section className="section">
          <div className="detail-body">
            <img
              src={imageUrl}
              alt={item.title}
              style={{ width: "100%", borderRadius: "var(--ed-radius-lg)", marginBottom: "2rem" }}
            />
          </div>
        </section>
      )}

      <section className="section">
        <div className="detail-body">
          {item.body ? (
            <>
              <QuoteShareBar url={pageUrl}>
                <div className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
              </QuoteShareBar>
              <CiteButton title={item.title} author={author?.name} date={item.date} url={pageUrl} />
            </>
          ) : (
            <p style={{ color: "var(--ed-muted)" }}>Aucun contenu détaillé pour cette entrée.</p>
          )}
        </div>
      </section>

      {(project || activity) && (
        <section className="section">
          <div className="section-head">
            <h2>Voir aussi</h2>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {project && (
              <Link href={`/projets/${project.slug}`} className="theme-chip">
                {project.title}
              </Link>
            )}
            {activity && (
              <Link href={`/activites/${activity.slug}`} className="theme-chip">
                {activity.title}
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  );
}
