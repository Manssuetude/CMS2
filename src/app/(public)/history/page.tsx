import type { Metadata } from "next";
import { cmsPageMetadata } from "@/lib/seo";
import { HistoryEditorial } from "@/components/public/HistoryEditorial";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { pageRepository } from "@/repositories/pageRepository";

// Cette page bascule dynamiquement entre "en cours de rédaction" et le contenu réel
// dès la première rédaction ; le rendu doit donc toujours refléter l'état actuel de la
// base, sans dépendre d'un cache ISR intermédiaire.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    slug: "history",
    path: "/history",
    fallbackTitle: "Notre histoire",
    fallbackDescription:
      "L'histoire de Manssuétude : comment une jeunesse africaine et diasporique a créé un lieu pour prendre du recul, déconstruire les idées reçues et agir.",
  });
}

export default async function HistoryPage() {
  try {
    const page = await pageRepository.getPage("history");
    if (!page) {
      return (
        <MaintenanceNotice
          eyebrow="Notre histoire"
          title="Cette page est en cours de rédaction."
          body="Le contenu de notre histoire arrive bientôt. Revenez d'ici peu."
        />
      );
    }
    return <HistoryEditorial page={page} />;
  } catch {
    return <MaintenanceNotice />;
  }
}
