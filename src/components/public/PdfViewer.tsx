"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Copié dans public/ (voir node_modules/pdfjs-dist/build/pdf.worker.min.mjs) —
// évite de dépendre de la résolution d'assets du bundler ou d'un CDN externe.
// À resynchroniser si la version de pdfjs-dist embarquée par react-pdf change.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export function PdfViewer({ url, title }: { url: string; title: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [width, setWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.floor(w));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sur téléphone, feuilleter page par page (flèches) plutôt que défiler un
  // long document empilé : plus confortable sur petit écran.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [url]);

  if (error) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-viewer-status">
          <p>L&apos;aperçu du PDF n&apos;a pas pu être chargé.</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="button primary">
            <FileDown size={16} strokeWidth={1.75} />
            Ouvrir le PDF
          </a>
        </div>
      </div>
    );
  }

  const showPager = isMobile && numPages;

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer-toolbar">
        <span>{numPages ? `${numPages} page${numPages > 1 ? "s" : ""}` : "Chargement…"}</span>
        {showPager ? (
          <div className="pdf-viewer-pager">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              aria-label="Page précédente"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <span>
              Page {currentPage} / {numPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              aria-label="Page suivante"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        ) : null}
      </div>
      <div className="pdf-viewer-pages" ref={containerRef} role="region" aria-label={`Aperçu PDF : ${title}`}>
        <Document
          file={url}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          onLoadError={() => setError(true)}
          loading={<p>Chargement du document…</p>}
          noData={null}
        >
          {numPages &&
            width > 0 &&
            (isMobile ? [currentPage] : Array.from({ length: numPages }, (_, i) => i + 1)).map((pageNumber) => (
              <Page
                key={pageNumber}
                pageNumber={pageNumber}
                width={width}
                className="pdf-viewer-page"
                renderAnnotationLayer
                renderTextLayer
                loading=""
              />
            ))}
        </Document>
      </div>
    </div>
  );
}
