import Link from "next/link";
import { FileDown } from "lucide-react";
import type { Author, Production, SubTheme, Theme } from "@/types/cms";
import { CtaButton } from "@/components/forms/CtaButton";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { CardGrid } from "@/components/cards/CardGrid";
import { estimateReadingTime } from "@/utils/readingTime";
import { extractHeadings } from "@/utils/tableOfContents";
import { TableOfContents } from "@/components/public/TableOfContents";
import { ShareButtons } from "@/components/public/ShareButtons";
import { ReadingProgressBar } from "@/components/public/ReadingProgressBar";
import { CiteButton } from "@/components/public/CiteButton";
import { QuoteShareBar } from "@/components/public/QuoteShareBar";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/constants/site";
import { getEmbedUrl } from "@/utils/videoEmbed";
import { buildArticleJsonLd } from "@/lib/jsonLd";
import { PdfViewer } from "@/components/public/PdfViewerLoader";

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
  allSubThemes: SubTheme[];
  authors?: Author[];
  relatedProductions?: Production[];
  fileUrl?: string | null;
}

export function ProductionDetail({
  item,
  allThemes,
  allSubThemes,
  authors = [],
  relatedProductions = [],
  fileUrl,
}: Props) {
  const themeById = new Map(allThemes.map((t) => [t.id, t]));
  const subThemes = allSubThemes.filter((st) => item.subThemeIds?.includes(st.id));
  const typeLabel = TYPE_LABEL[item.type] ?? item.type;
  const authorNames = authors.map((a) => a.name).join(", ");
  const hasAside = subThemes.length > 0 || item.tags.length > 0;
  const readingTime = item.readingTime || estimateReadingTime(item.body);
  const sanitizedBody = item.body ? sanitizeHtml(item.body) : "";
  const headings = sanitizedBody ? extractHeadings(sanitizedBody) : [];
  const isAudioFile = item.videoUrl ? /\.(mp3|wav|m4a|ogg)$/i.test(item.videoUrl) : false;
  const videoEmbedUrl = item.videoUrl && !isAudioFile ? getEmbedUrl(item.videoUrl) : null;
  const isPdfFile = fileUrl ? /\.pdf($|\?)/i.test(fileUrl) : false;
  const pageUrl = `${SITE_URL}/productions/${item.slug}`;

  return (
    <>
      <JsonLd
        data={buildArticleJsonLd({
          title: item.title,
          description: item.description,
          path: `/productions/${item.slug}`,
          authorName: authorNames || item.author,
          datePublished: item.date,
          dateModified: item.updatedAt,
        })}
      />
      {item.body && <ReadingProgressBar />}
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={`hero hero--detail${hasAside ? " hero--detail-split" : ""}`}>
        <div className="hero-copy">
          <p className="eyebrow">{typeLabel}</p>
          <h1>{item.title}</h1>
          {item.description && <p>{item.description}</p>}
          <div className="detail-meta">
            {item.date && <span className="meta-pill">{formatDate(item.date)}</span>}
            {(authorNames || item.author) && <span className="meta-pill">{authorNames || item.author}</span>}
            <span className="meta-pill">{readingTime} de lecture</span>
            {item.pages && <span className="meta-pill">{item.pages} pages</span>}
          </div>
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button primary"
              style={{ marginBottom: 16 }}
            >
              <FileDown size={16} strokeWidth={1.75} />
              {item.downloadLabel || "Télécharger le PDF"}
            </a>
          )}
          <div className="actions">
            <CtaButton label="Retour aux productions" target="/productions" variant="secondary" />
            <CtaButton label="Contribuer" target="contribution" variant="primary" />
          </div>
        </div>

        {hasAside && (
          <aside className="hero-aside">
            {subThemes.length > 0 && (
              <div className="detail-sidebar-card">
                <p className="detail-sidebar-label">Sous-thèmes</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {subThemes.map((st) => {
                    const parentTheme = themeById.get(st.themeId);
                    return parentTheme ? (
                      <Link key={st.id} href={`/themes/${parentTheme.slug}/${st.slug}`} className="theme-chip">
                        {st.title}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {item.tags.length > 0 && (
              <div className="detail-sidebar-card">
                <p className="detail-sidebar-label">Tags</p>
                <div className="tags" style={{ marginTop: 0 }}>
                  {item.tags.map((tag) => (
                    <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="detail-sidebar-card">
              <p className="detail-sidebar-label">Partager</p>
              <ShareButtons url={`${SITE_URL}/productions/${item.slug}`} title={item.title} />
            </div>
          </aside>
        )}
      </section>

      {/* ── Vidéo ────────────────────────────────────────────────── */}
      {videoEmbedUrl && (
        <section className="section">
          <div className="detail-body">
            <div className="video-embed">
              <iframe
                src={videoEmbedUrl}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Audio (podcast) ─────────────────────────────────────── */}
      {isAudioFile && item.videoUrl && (
        <section className="section">
          <div className="detail-body">
            <audio controls src={item.videoUrl} className="audio-player">
              Votre navigateur ne prend pas en charge la lecture audio.
            </audio>
          </div>
        </section>
      )}

      {/* ── Aperçu PDF ───────────────────────────────────────────── */}
      {isPdfFile && fileUrl && (
        <section className="section">
          <div className="detail-body">
            <PdfViewer url={fileUrl} title={item.title} />
          </div>
        </section>
      )}

      {/* ── Contenu principal ──────────────────────────────────── */}
      <section className="section">
        <div className="detail-body">
          {item.body ? (
            <>
              <TableOfContents headings={headings} />
              <QuoteShareBar url={pageUrl}>
                <div className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
              </QuoteShareBar>
              <CiteButton title={item.title} author={authorNames || item.author} date={item.date} url={pageUrl} />
            </>
          ) : item.description ? (
            <p className="rich-text">{item.description}</p>
          ) : (
            <p style={{ color: "var(--ed-muted)" }}>Aucun contenu détaillé disponible pour cette production.</p>
          )}
        </div>
      </section>

      {/* ── Productions liées ─────────────────────────────────── */}
      {relatedProductions.length > 0 && (
        <CardGrid
          title="À lire aussi"
          items={relatedProductions.slice(0, 3).map((p) => ({
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
