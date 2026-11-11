import Link from "next/link";
import type { GalleryPhoto } from "@/types/cms";
import type { EventFacts } from "@/utils/eventFacts";
import { EventHeaderImage } from "@/components/public/EventHeaderImage";
import { EventInfoBar } from "@/components/public/EventInfoBar";

// En-tête « Bannière » : image bord à bord, dégradé sombre en bas, texte blanc
// par-dessus (aligné sur le bord gauche du contenu), puis la barre d'infos.
// N'est utilisé qu'avec une image paysage (voir utils/eventHeader).
export function EventHeaderBanner({
  title,
  eyebrow,
  lead,
  image,
  facts,
}: {
  title: string;
  eyebrow: string;
  lead?: string | null;
  image: GalleryPhoto;
  facts: EventFacts;
}) {
  return (
    <header className="event-header event-header--banner">
      <div className="event-banner">
        <EventHeaderImage
          photo={image}
          title={title}
          isPoster={false}
          fit="cover"
          sizes="100vw"
          className="event-header-image--banner"
        />
        <div className="event-banner-text">
          <nav className="event-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/evenements">Événements</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>
          <p className="event-eyebrow">{eyebrow}</p>
          <h1 className="event-title">{title}</h1>
          {lead && <p className="event-lead">{lead}</p>}
        </div>
      </div>
      <EventInfoBar facts={facts} />
    </header>
  );
}
