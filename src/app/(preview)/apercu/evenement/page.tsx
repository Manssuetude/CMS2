import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { EventPreviewFrame } from "@/components/admin/EventPreviewFrame";
import { EvenementDetail } from "@/components/public/EvenementDetail";

// Contenu de l'iframe d'aperçu d'un événement (voir EventPreviewModal) : reçoit
// les valeurs du formulaire par postMessage et affiche la page publique
// correspondante. Réservé aux personnes autorisées à éditer les événements.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aperçu de l'événement",
  robots: { index: false, follow: false },
};

// renderEventPreview (server action) renvoie un <EvenementDetail> rendu côté
// serveur : ses composants client (image d'en-tête, galerie, partage, icônes)
// doivent faire partie du manifeste client de CETTE route, sinon React ne sait
// pas les hydrater (« Could not find the module … in the React Client
// Manifest »). Les importer ici, via le composant passé au cadre, suffit.
export default async function EventPreviewPage() {
  await requirePermission("evenements:edit");
  return <EventPreviewFrame detailComponent={EvenementDetail.name} />;
}
