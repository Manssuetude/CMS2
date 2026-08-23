import type { Metadata } from "next";
import { CardGrid } from "@/components/cards/CardGrid";
import { dossierRepository } from "@/repositories/dossierRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Dossiers — Manssuétude",
  description: "Des sélections de contenus organisées autour d'un même sujet, à parcourir librement ou pas à pas.",
};

export default async function DossiersPage() {
  try {
    const dossiers = await dossierRepository.listDossiers();

    return (
      <>
        <section className="hero hero--detail">
          <div className="hero-copy">
            <p className="eyebrow">Dossiers</p>
            <h1>Explorer un sujet en profondeur</h1>
            <p>Des sélections de contenus organisées par nos équipes — à parcourir librement ou pas à pas.</p>
          </div>
        </section>

        {dossiers.length > 0 ? (
          <CardGrid
            title="Tous les dossiers"
            items={dossiers.map((d) => ({
              title: d.title,
              description: d.description?.replace(/<[^>]+>/g, "").slice(0, 180) ?? null,
              href: `/dossiers/${d.slug}`,
              meta: d.mode === "guide" ? "Parcours guidé" : null,
              imageUrl: d.imageUrl,
            }))}
          />
        ) : (
          <section className="section">
            <p style={{ color: "var(--ed-muted)" }}>Aucun dossier publié pour l&apos;instant.</p>
          </section>
        )}
      </>
    );
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
