import type { Metadata } from "next";
import { HistoryEditorial } from "@/components/public/HistoryEditorial";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { contentRepository } from "@/repositories/contentRepository";

// Cette page bascule dynamiquement entre "en cours de rédaction" et le contenu réel
// dès la première rédaction ; le rendu doit donc toujours refléter l'état actuel de la
// base, sans dépendre d'un cache ISR intermédiaire.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await contentRepository.getPage("history");
    if (!page) return { title: "Notre histoire" };
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return { title: "Notre histoire" };
  }
}

export default async function HistoryPage() {
  try {
    const page = await contentRepository.getPage("history");
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
