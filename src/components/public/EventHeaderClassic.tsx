import Link from "next/link";
import type { GalleryPhoto } from "@/types/cms";
import { EventHeaderImage } from "@/components/public/EventHeaderImage";

// En-tête « Classique » : fil d'Ariane, surtitre, grand titre, chapô, puis
// l'image sur toute la largeur du contenu (affiche entière, photo recadrée).
export function EventHeaderClassic({
  title,
  eyebrow,
  lead,
  image,
  isPoster,
  fit,
}: {
  title: string;
  eyebrow: string;
  lead?: string | null;
  image: GalleryPhoto | null;
  isPoster: boolean;
  fit: "contain" | "cover";
}) {
  return (
    <header className="event-header event-header--classic">
      <div className="event-header-text">
        <nav className="event-breadcrumb" aria-label="Fil d'Ariane">
          <Link href="/evenements">Événements</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>
        <p className="event-eyebrow">{eyebrow}</p>
        <h1 className="event-title">{title}</h1>
        {lead && <p className="event-lead">{lead}</p>}
      </div>
      {image && (
        <EventHeaderImage
          photo={image}
          title={title}
          isPoster={isPoster}
          fit={fit}
          sizes="(min-width: 1024px) 94vw, 100vw"
          className="event-header-image--classic"
        />
      )}
    </header>
  );
}
