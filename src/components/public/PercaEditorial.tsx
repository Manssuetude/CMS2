import type { Page } from "@/types/cms";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { PercaStepsInteractive } from "@/components/public/PercaStepsInteractive";

export function PercaEditorial({ page }: { page: Page }) {
  return (
    <div className="perca-page">
      <header className="perca-header">
        {page.eyebrow ? <p className="eyebrow">{page.eyebrow}</p> : null}
        <h1>{page.title}</h1>
      </header>

      <PercaStepsInteractive steps={page.percaSteps ?? []} />

      {page.body ? (
        <div className="perca-body rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
      ) : null}
    </div>
  );
}
