import type { Metadata } from "next";
import { cmsPageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { PercaEditorial } from "@/components/public/PercaEditorial";
import { pageRepository } from "@/repositories/pageRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    slug: "perca",
    path: "/perca",
    fallbackTitle: "PERCA",
    fallbackDescription:
      "PERCA, la méthode Manssuétude en cinq étapes : Penser, Exprimer, Relier, Concrétiser, Ancrer. Un cadre pour passer de la réflexion collective à l'action.",
  });
}

export default async function PercaPage() {
  try {
    const page = await pageRepository.getPage("perca");
    if (!page) notFound();
    return <PercaEditorial page={page} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
