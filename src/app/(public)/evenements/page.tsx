import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/public/Hero";
import { FilterBar } from "@/components/public/FilterBar";
import { ViewToggle } from "@/components/public/ViewToggle";
import { PublicEventCalendar } from "@/components/public/PublicEventCalendar";
import { CardGrid } from "@/components/cards/CardGrid";
import { ProposeSection } from "@/components/public/ProposeSection";
import { eventRepository } from "@/repositories/eventRepository";
import { pageRepository } from "@/repositories/pageRepository";
import { isThisWeek } from "@/utils/eventOfTheMoment";
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
    const page = await pageRepository.getPage("evenements");
    if (!page) return {};
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function EvenementsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; when?: string }>;
}) {
  try {
    const { view, when } = await searchParams;
    const page = await pageRepository.getPage("evenements");
    const all = await eventRepository.listEvents();
    if (!page) notFound();

    // Filtres temporels — pas de filtre par format sur cette page.
    const now = new Date();
    const isPastEvent = (e: (typeof all)[number]) => Boolean(e.date && new Date(e.date) < now);
    const showPast = when === "passees";
    const showCurrent = when === "encours";
    const showAll = when === "all";

    let filtered = all;
    if (showCurrent) {
      filtered = all.filter((e) => e.date && isThisWeek(e.date, now));
    } else if (!showAll) {
      filtered = all.filter((e) => isPastEvent(e) === showPast);
    }

    const isCalendar = view === "calendar";

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
              { value: "encours", label: "En cours" },
              { value: "all", label: "Toutes" },
            ]}
            allLabel="À venir"
          />
        </Suspense>
        {isCalendar ? (
          <section className="section">
            <div className="section-head">
              <h2>Calendrier des événements</h2>
              <Suspense>
                <ViewToggle />
              </Suspense>
            </div>
            <PublicEventCalendar events={filtered} />
          </section>
        ) : filtered.length > 0 ? (
          <CardGrid
            title={
              showAll
                ? "Tous les événements"
                : showCurrent
                  ? "Événements en cours"
                  : showPast
                    ? "Événements passés"
                    : "Événements à venir"
            }
            headerActions={
              <Suspense>
                <ViewToggle />
              </Suspense>
            }
            items={filtered.map((item) => ({
              title: item.title,
              description: item.description,
              href: `/evenements/${item.slug}`,
              meta: FORMAT_LABEL[item.format] ?? item.format,
            }))}
          />
        ) : (
          <section className="section">
            <div className="section-head">
              <h2>
                {showAll
                  ? "Tous les événements"
                  : showCurrent
                    ? "Événements en cours"
                    : showPast
                      ? "Événements passés"
                      : "Événements à venir"}
              </h2>
              <Suspense>
                <ViewToggle />
              </Suspense>
            </div>
            <p style={{ color: "var(--ed-muted)" }}>
              {showPast
                ? "Aucun événement passé pour l'instant."
                : showCurrent
                  ? "Aucun événement en cours cette semaine."
                  : "Aucun événement à venir pour l'instant — revenez bientôt."}
            </p>
          </section>
        )}
        <ProposeSection
          lead="Vous avez une idée d'événement à proposer ?"
          label="Proposer un événement"
          target="FORM:event"
        />
      </>
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    return <MaintenanceNotice />;
  }
}
