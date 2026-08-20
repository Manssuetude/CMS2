import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/public/Hero";
import { FilterBar } from "@/components/public/FilterBar";
import { ViewToggle } from "@/components/public/ViewToggle";
import { PublicEventCalendar } from "@/components/public/PublicEventCalendar";
import { CardGrid } from "@/components/cards/CardGrid";
import { ProposeSection } from "@/components/public/ProposeSection";
import { CtaButton } from "@/components/forms/CtaButton";
import { activityRepository } from "@/repositories/activityRepository";
import { pageRepository } from "@/repositories/pageRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

const FORMAT_LABEL: Record<string, string> = {
  "Debat & Conference": "Débat & Conférence",
  "debat & conference": "Débat & Conférence",
  debat: "Débat & Conférence",
  "Atelier & Seance de travail": "Atelier & Séance de travail",
  atelier: "Atelier & Séance de travail",
  "Formation & Masterclass": "Formation & Masterclass",
  formation: "Formation & Masterclass",
  "Visite & Immersion": "Visite & Immersion",
  visite: "Visite & Immersion",
  "Rencontre & Networking": "Rencontre & Networking",
  rencontre: "Rencontre & Networking",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await pageRepository.getPage("activites");
    if (!page) return {};
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function ActivitesPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string; view?: string; when?: string }>;
}) {
  try {
    const { format, view, when } = await searchParams;
    const page = await pageRepository.getPage("activites");
    const all = await activityRepository.listActivities();
    if (!page) notFound();

    // Bascule automatique passé/à venir — calculée à partir de la date, pas d'un
    // statut à faire évoluer manuellement.
    const now = new Date();
    const isPastActivity = (a: (typeof all)[number]) => Boolean(a.date && new Date(a.date) < now);
    const showPast = when === "passees";
    const showAll = when === "all";
    const byTime = showAll ? all : all.filter((a) => isPastActivity(a) === showPast);

    const filtered = format ? byTime.filter((a) => a.format === format) : byTime;
    const isCalendar = view === "calendar";

    const uniqueFormats = [...new Set(all.map((a) => a.format))];
    const formatOptions = uniqueFormats.map((f) => ({ value: f, label: FORMAT_LABEL[f] ?? f }));

    return (
      <>
        <Hero
          eyebrow={page.eyebrow}
          title={page.title}
          body={page.body}
          imageUrl={page.imageUrl ?? undefined}
          imageCrop={page.imageCrop}
          quote={page.quote}
        />
        <Suspense>
          <FilterBar
            param="when"
            options={[
              { value: "passees", label: "Passées" },
              { value: "all", label: "Toutes" },
            ]}
            allLabel="À venir"
          />
          <FilterBar param="format" options={formatOptions} allLabel="Tous les formats" />
        </Suspense>
        {isCalendar ? (
          <section className="section">
            <div className="section-head">
              <h2>Calendrier des activités</h2>
              <Suspense>
                <ViewToggle />
              </Suspense>
            </div>
            <PublicEventCalendar activities={filtered} />
          </section>
        ) : (
          <CardGrid
            title={
              format
                ? (FORMAT_LABEL[format] ?? format)
                : showAll
                  ? "Toutes les activités"
                  : showPast
                    ? "Activités passées"
                    : "Activités à venir"
            }
            headerActions={
              <Suspense>
                <ViewToggle />
              </Suspense>
            }
            items={filtered.map((item) => ({
              title: item.title,
              description: item.description,
              href: `/activites/${item.slug}`,
              meta: FORMAT_LABEL[item.format] ?? item.format,
            }))}
          />
        )}
        <section className="propose-section">
          <p className="propose-lead">Vous voulez découvrir tous nos formats d&apos;activité ?</p>
          <CtaButton
            label="Voir le répertoire des formats"
            target="/activites/formats-d-activites"
            variant="secondary"
          />
        </section>
        <ProposeSection
          lead="Vous avez une idée d'activité à proposer ?"
          label="Proposer une activité"
          target="FORM:activity"
        />
      </>
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    return <MaintenanceNotice />;
  }
}
