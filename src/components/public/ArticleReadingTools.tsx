"use client";

import { Download } from "lucide-react";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { remainingReadingLabel } from "@/utils/readingTime";
import { readingToolBlocks } from "@/utils/readingTools";
import { CiteButton } from "@/components/public/CiteButton";
import { ShareButtons } from "@/components/public/ShareButtons";

interface Props {
  /** Lien de téléchargement du PDF (route /telecharger) ; null sans PDF. */
  pdfHref: string | null;
  pdfLabel: string;
  /** « 24 pages », si connu. */
  pageCount: string | null;
  /** Durée totale de l'article en minutes ; null sans texte (page de secours). */
  totalMinutes: number | null;
  shareUrl: string;
  title: string;
  citation: { title: string; author: string; date: string | null; url: string };
}

// Colonne outils (≥ 1440 px) : télécharger le PDF, temps de lecture restant
// (même progression que le menu des parties), partager, citer.
export function ArticleReadingTools({ pdfHref, pdfLabel, pageCount, totalMinutes, shareUrl, title, citation }: Props) {
  const { percent } = useReadingProgress();
  const blocks = readingToolBlocks({ pdfHref, totalMinutes });

  return (
    <aside className="article-tools" aria-label="Outils de lecture">
      {pdfHref && blocks.includes("pdf") && (
        <div className="article-tools-block">
          <a href={pdfHref} className="article-tools-pdf">
            <Download size={18} strokeWidth={2} aria-hidden="true" />
            {pdfLabel}
          </a>
          <p className="article-tools-meta">{pageCount ? `${pageCount} · PDF` : "PDF"}</p>
        </div>
      )}

      {totalMinutes !== null && blocks.includes("time") && (
        <div className="article-tools-block">
          <p className="article-tools-label">Temps de lecture restant</p>
          <p className="article-tools-value">{remainingReadingLabel(totalMinutes, percent)}</p>
        </div>
      )}

      <div className="article-tools-block">
        <p className="article-tools-label">Partager</p>
        <ShareButtons url={shareUrl} title={title} />
      </div>

      <div className="article-tools-block article-tools-cite">
        <p className="article-tools-label">Citer</p>
        <CiteButton title={citation.title} author={citation.author} date={citation.date} url={citation.url} />
      </div>
    </aside>
  );
}
