import type { Page } from "@/types/cms";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export function HistoryEditorial({ page }: { page: Page }) {
  return (
    <div className="history-page">
      <header className="history-header">
        {page.eyebrow ? <p className="eyebrow">{page.eyebrow}</p> : null}
        <h1>{page.title}</h1>
      </header>
      {page.body ? (
        <div className="history-body rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
      ) : null}
    </div>
  );
}
