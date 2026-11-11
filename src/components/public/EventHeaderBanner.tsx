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
          <p className="event-eyebrow">{eyebrow}</p>
          <h1 className="event-title">{title}</h1>
          {/* Chapô sur l'image à partir de 768px ; en dessous, il passe sous la
              bannière (fond crème) pour garder une bannière courte et lisible. */}
          {lead && <p className="event-lead event-lead--overlay">{lead}</p>}
        </div>
      </div>
      {lead && <p className="event-lead event-lead--below">{lead}</p>}
      <EventInfoBar facts={facts} />
    </header>
  );
}
