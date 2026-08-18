import Link from "next/link";
import type { Dossier } from "@/types/cms";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { CardGrid } from "@/components/cards/CardGrid";
import { Hero } from "@/components/public/Hero";
import type { ResolvedDossierItem } from "@/utils/dossierItems";

const KIND_LABEL: Record<ResolvedDossierItem["entityType"], string> = {
  production: "Production",
  activity: "Activité",
  project: "Projet",
  resource: "Ressource",
  journal_entry: "Journal",
};

interface Props {
  item: Dossier;
  items: ResolvedDossierItem[];
}

export function DossierDetail({ item, items }: Props) {
  const sanitizedDescription = item.description ? sanitizeHtml(item.description) : "";

  return (
    <>
      <Hero
        eyebrow={item.mode === "guide" ? "Dossier · Parcours guidé" : "Dossier"}
        title={item.title}
        imageUrl={item.imageUrl}
      />

      {sanitizedDescription && (
        <section className="section">
          <div className="detail-body">
            <div className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
          </div>
        </section>
      )}

      {items.length === 0 ? (
        <section className="section">
          <p style={{ color: "var(--ed-muted)" }}>Ce dossier ne contient pas encore de contenu.</p>
        </section>
      ) : item.mode === "guide" ? (
        <section className="section">
          <div className="section-head">
            <h2>
              Parcours ({items.length} étape{items.length > 1 ? "s" : ""})
            </h2>
          </div>
          <ol className="dossier-guide-list">
            {items.map((entry, index) => (
              <li key={`${entry.entityType}-${entry.entityId}`} className="dossier-guide-item">
                <span className="dossier-guide-step">{index + 1}</span>
                <Link href={entry.href} className="dossier-guide-link">
                  <span className="dossier-guide-kind">{KIND_LABEL[entry.entityType]}</span>
                  <span className="dossier-guide-title">{entry.title}</span>
                  {entry.description && <span className="dossier-guide-desc">{entry.description}</span>}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <CardGrid
          title="Contenus du dossier"
          items={items.map((entry) => ({
            title: entry.title,
            description: entry.description,
            href: entry.href,
            meta: KIND_LABEL[entry.entityType],
            imageUrl: entry.imageUrl,
          }))}
        />
      )}
    </>
  );
}
