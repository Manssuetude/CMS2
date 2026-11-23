import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import type { Author, Production, SubTheme, Theme } from "@/types/cms";
import type { ArticlePart } from "@/utils/articleParts";
import { partPath, partProgressPercent } from "@/utils/articleParts";
import { formatPageCount, splitArticleTitle } from "@/utils/articleNavigation";
import { estimateReadingTime } from "@/utils/readingTime";
import { getEmbedUrl } from "@/utils/videoEmbed";
import { productionTypeLabel } from "@/constants/productionTypes";
import { SITE_URL } from "@/constants/site";
import { buildArticleJsonLd } from "@/lib/jsonLd";
import { ArticlePartsNav } from "@/components/public/ArticlePartsNav";
import { CardGrid } from "@/components/cards/CardGrid";
import { CiteButton } from "@/components/public/CiteButton";
import { JsonLd } from "@/components/public/JsonLd";
import { QuoteShareBar } from "@/components/public/QuoteShareBar";
import { ReadingProgressBar } from "@/components/public/ReadingProgressBar";
import { ShareButtons } from "@/components/public/ShareButtons";
import { TableOfContents } from "@/components/public/TableOfContents";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

interface Props {
  item: Production & { subThemeIds: string[] };
  parts: ArticlePart[];
  currentIndex: number;
  allThemes: Theme[];
  allSubThemes: SubTheme[];
  authors: Author[];
  relatedProductions: Production[];
  nextArticle: Pick<Production, "slug" | "title"> | null;
  fileUrl: string | null;
  imageUrl: string | null;
}

// Lecture d'un article découpé en parties (une par <h2> du `body`). La partie 1
// est servie sur /productions/[slug], les suivantes sur /productions/[slug]/[partie].
// Un article sans <h2> s'affiche en page simple (sans colonne des parties).
export function ArticleReader({
  item,
  parts,
  currentIndex,
  allThemes,
  allSubThemes,
  authors,
  relatedProductions,
  nextArticle,
  fileUrl,
  imageUrl,
}: Props) {
  const basePath = `/productions/${item.slug}`;
  const part = parts[currentIndex];
  const total = parts.length;
  const isMultiPart = total > 1;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;
  const percent = partProgressPercent(currentIndex, total);
  const typeLabel = productionTypeLabel(item.type);
  const { main: shortTitle, subtitle } = splitArticleTitle(item.title);
  const authorNames = authors.map((a) => a.name).join(", ") || item.author || "";
  const readingTime = item.readingTime || estimateReadingTime(item.body);
  const articleUrl = `${SITE_URL}${basePath}`;
  const partUrl = `${SITE_URL}${partPath(basePath, parts, currentIndex)}`;
  const pageCount = formatPageCount(item.pages);
  const nextPart = isMultiPart && !isLast ? parts[currentIndex + 1] : null;
  const isAudioFile = item.videoUrl ? /\.(mp3|wav|m4a|ogg)$/i.test(item.videoUrl) : false;
  const videoEmbedUrl = item.videoUrl && !isAudioFile ? getEmbedUrl(item.videoUrl) : null;
  const themeById = new Map(allThemes.map((t) => [t.id, t]));
  const subThemes = allSubThemes.filter((st) => item.subThemeIds.includes(st.id));
  // Retour (téléphone) : vers le début de l'article depuis une partie, vers la
  // liste des productions depuis la première partie.
  const backLink = isFirst ? { href: "/productions", label: "Productions" } : { href: basePath, label: shortTitle };

  return (
    <>
      {isFirst && (
        <JsonLd
          data={buildArticleJsonLd({
            title: item.title,
            description: item.description,
            path: basePath,
            imageUrl,
            authorName: authorNames,
            datePublished: item.date,
            dateModified: item.updatedAt,
          })}
        />
      )}
      {!isMultiPart && <ReadingProgressBar slug={item.slug} />}

      <div className={`article-reader${isMultiPart ? "" : " article-reader--single"}`}>
        {isMultiPart && (
          <ArticlePartsNav
            typeLabel={typeLabel}
            shortTitle={shortTitle}
            parts={parts.map((p, index) => ({ title: p.title, href: partPath(basePath, parts, index) }))}
            currentIndex={currentIndex}
            percent={percent}
          />
        )}

        <article className="article-reader-main">
          <nav className="article-breadcrumb" aria-label="Fil d'Ariane">
            {/* Téléphone : un seul lien de retour au lieu du fil complet. */}
            <Link href={backLink.href} className="article-breadcrumb-back">
              <span aria-hidden="true">←</span> {backLink.label}
            </Link>
            <ol>
              <li className="article-breadcrumb-home">
                <Link href="/">Accueil</Link>
              </li>
              <li>
                <Link href="/productions">Productions</Link>
              </li>
              {isMultiPart ? (
                <>
                  <li>
                    <Link href={basePath}>{shortTitle}</Link>
                  </li>
                  <li className="article-breadcrumb-part">
                    <span aria-current="page">{part.title}</span>
                  </li>
                </>
              ) : (
                <li>
                  <span aria-current="page">{shortTitle}</span>
                </li>
              )}
            </ol>
          </nav>

          {isFirst ? (
            <header className="article-header">
              <p className="article-type">{typeLabel}</p>
              <h1 className="article-title">
                {shortTitle}
                {subtitle && <span className="article-subtitle">{subtitle}</span>}
              </h1>
              {item.description && <p className="article-standfirst">{item.description}</p>}
              <div className="article-meta">
                {authorNames && <span className="article-meta-author">{authorNames}</span>}
                {item.date && <span>{formatDate(item.date)}</span>}
                <span>
                  {isMultiPart && `${total} parties · `}
                  {readingTime} de lecture
                </span>
                <details className="article-share">
                  <summary>Partager</summary>
                  <div className="article-share-panel">
                    <ShareButtons url={articleUrl} title={item.title} />
                  </div>
                </details>
              </div>
            </header>
          ) : (
            // Un seul <h1> par page (le titre de l'article), pour une hiérarchie de
            // titres continue : h1 article → h2 partie → h3 du contenu.
            <h1 className="sr-only">{item.title}</h1>
          )}

          {isFirst && videoEmbedUrl && (
            <div className="video-embed">
              <iframe
                src={videoEmbedUrl}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {isFirst && isAudioFile && item.videoUrl && (
            <audio controls src={item.videoUrl} className="audio-player">
              Votre navigateur ne prend pas en charge la lecture audio.
            </audio>
          )}

          {isMultiPart && (
            <div className="article-part-heading">
              <p className="article-part-eyebrow">
                Partie {currentIndex + 1} sur {total}
              </p>
              <h2 className="article-part-title">{part.title}</h2>
            </div>
          )}

          <div className="article-part-body">
            <TableOfContents headings={part.headings} />
            <QuoteShareBar url={partUrl}>
              <div className="rich-text" dangerouslySetInnerHTML={{ __html: part.html }} />
            </QuoteShareBar>
          </div>

          {isLast && (
            <div className="article-end">
              <CiteButton title={item.title} author={authorNames} date={item.date} url={articleUrl} />
              {(subThemes.length > 0 || item.tags.length > 0) && (
                <div className="article-topics">
                  {subThemes.map((st) => {
                    const parentTheme = themeById.get(st.themeId);
                    return parentTheme ? (
                      <Link key={st.id} href={`/themes/${parentTheme.slug}/${st.slug}`} className="theme-chip">
                        {st.title}
                      </Link>
                    ) : null;
                  })}
                  {item.tags.map((tag) => (
                    <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="article-tag">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {nextPart ? (
            <Link href={partPath(basePath, parts, currentIndex + 1)} className="article-next">
              <span className="article-next-text">
                <span className="article-next-label">
                  Partie suivante · {currentIndex + 2} sur {total}
                </span>
                <span className="article-next-title">{nextPart.title}</span>
                <span className="article-next-hint">Continuer la lecture</span>
              </span>
              <span className="article-next-arrow" aria-hidden="true">
                <ArrowRight size={22} strokeWidth={2} />
              </span>
            </Link>
          ) : (
            nextArticle && (
              <Link href={`/productions/${nextArticle.slug}`} className="article-next">
                <span className="article-next-text">
                  <span className="article-next-label">Fin de l&apos;article · Article suivant</span>
                  <span className="article-next-title">{nextArticle.title}</span>
                  <span className="article-next-hint">Lire l&apos;article</span>
                </span>
                <span className="article-next-arrow" aria-hidden="true">
                  <ArrowRight size={22} strokeWidth={2} />
                </span>
              </Link>
            )
          )}
        </article>
      </div>

      {isLast && relatedProductions.length > 0 && (
        <CardGrid
          title="À lire aussi"
          items={relatedProductions.slice(0, 3).map((p) => ({
            title: p.title,
            description: p.description,
            href: `/productions/${p.slug}`,
            meta: productionTypeLabel(p.type),
            tags: p.tags,
          }))}
        />
      )}

      {fileUrl && (
        <section className="article-pdf-band" aria-label="Télécharger l'article complet">
          <div className="article-pdf-band-inner">
            <span className="article-pdf-icon" aria-hidden="true">
              PDF
            </span>
            <div className="article-pdf-text">
              <p className="article-pdf-title">Télécharger l&apos;article complet</p>
              <p className="article-pdf-meta">
                {isMultiPart ? `Les ${total} parties en un seul document` : "L'article en un seul document"} · PDF
                {pageCount && ` · ${pageCount}`}
              </p>
            </div>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="article-pdf-button">
              <Download size={18} strokeWidth={2} aria-hidden="true" />
              {item.downloadLabel || "Télécharger le PDF"}
            </a>
          </div>
        </section>
      )}
    </>
  );
}
