import Link from "next/link";
import { ArrowUpRight, Copy } from "lucide-react";
import type { ReactNode } from "react";
import type { ContentStatus } from "@/types/cms";

// En-tête d'une fiche de l'admin : fil d'Ariane, titre, statut, badges,
// « Dupliquer » et « Voir sur le site ». `notice` : bandeau sous le titre.

const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Brouillon",
  review: "En relecture",
  validated: "Validé",
  published: "Publié",
  archived: "Archivé",
};

interface Props {
  section: { label: string; href: string };
  title: string;
  status?: ContentStatus;
  badges?: string[];
  publicHref?: string | null;
  duplicate?: { action: (formData: FormData) => void | Promise<void>; id: string };
  notice?: ReactNode;
}

export function AdminFicheHeader({ section, title, status, badges = [], publicHref, duplicate, notice }: Props) {
  return (
    <header className="fiche-header">
      <nav className="fiche-breadcrumb" aria-label="Fil d'Ariane">
        <Link href={section.href}>{section.label}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>
      <div className="fiche-header-row">
        <h1>{title}</h1>
        <div className="fiche-header-actions">
          {status && <span className={`badge-status badge-${status}`}>{STATUS_LABELS[status]}</span>}
          {badges.map((badge) => (
            <span key={badge} className="fiche-badge">
              {badge}
            </span>
          ))}
          {duplicate && (
            <form action={duplicate.action}>
              <input type="hidden" name="id" value={duplicate.id} />
              <button type="submit" className="button">
                <Copy size={14} strokeWidth={1.75} aria-hidden="true" />
                Dupliquer
              </button>
            </form>
          )}
          {publicHref && (
            <a href={publicHref} target="_blank" rel="noopener noreferrer" className="fiche-public-link">
              Voir sur le site
              <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          )}
        </div>
      </div>
      {notice}
    </header>
  );
}
