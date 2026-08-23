import type { Metadata } from "next";
import { CtaButton } from "@/components/forms/CtaButton";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { resolveActivityFormatIcon } from "@/utils/activityFormatIcons";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Formats d'activités — Manssuétude",
  description:
    "Le répertoire des techniques d'animation utilisées par Manssuétude pour débattre, échanger, partager et transmettre.",
};

export default async function ActivityFormatsPage() {
  try {
    const formats = await activityFormatRepository.listFormats();

    return (
      <>
        <section className="hero hero--detail">
          <div className="hero-copy">
            <p className="eyebrow">Activités</p>
            <h1>Formats d&apos;activités</h1>
            <p>
              Manssuétude propose plusieurs formats pour débattre, échanger, partager et transmettre. Voici les
              techniques d&apos;animation du répertoire de l&apos;association.
            </p>
            <div className="actions">
              <CtaButton label="Retour aux activités" target="/activites" variant="secondary" />
            </div>
          </div>
        </section>

        {formats.length > 0 ? (
          <section className="section">
            <div className="format-grid">
              {formats.map((format) => {
                const Icon = resolveActivityFormatIcon(format.icon);
                return (
                  <article className="format-card" key={format.id}>
                    <div className="format-card-icon" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.75} />
                    </div>
                    <h2>{format.title}</h2>
                    {format.description && <p>{format.description}</p>}
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="section">
            <p style={{ color: "var(--ed-muted)" }}>Aucun format publié pour l&apos;instant.</p>
          </section>
        )}
      </>
    );
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
