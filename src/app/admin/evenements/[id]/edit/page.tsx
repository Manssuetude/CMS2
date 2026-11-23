import { notFound } from "next/navigation";
import { eventRepository } from "@/repositories/eventRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { EvenementForm } from "@/components/admin/EvenementForm";
import { AdminFicheHeader } from "@/components/admin/AdminFicheHeader";
import { isPastEvent, needsEventReport, parisToday } from "@/utils/eventReport";
import { duplicateEventAction, updateEventAction } from "../../actions";

function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEvenementPage({ params }: Props) {
  const { id } = await params;
  const [item, initialThemeIdsList, subThemes, projects, activityFormats, authors, images] = await Promise.all([
    eventRepository.getEventById(id),
    eventRepository.getEventThemeIds(id),
    subThemeRepository.listSubThemes(true),
    projectRepository.listProjects(true),
    activityFormatRepository.listFormats(true),
    authorRepository.listAuthors(),
    mediaRepository.list(),
  ]);
  if (!item) notFound();
  const initialThemeIds = initialThemeIdsList;
  const [{ themes, archivedHiddenCount }, initialSubThemeIds, initialProjectIds, initialFormatIds, initialAnimators] =
    await Promise.all([
      themeRepository.listSelectableThemes(initialThemeIds),
      eventRepository.getEventSubThemeIds(id),
      eventRepository.getEventProjectIds(id),
      activityFormatRepository.getActivityFormatIds(id),
      authorRepository.getEventAnimators(id),
    ]);

  const today = parisToday();
  const past = isPastEvent(item, today);

  return (
    <section className="admin-panel">
      <AdminFicheHeader
        section={{ label: "Événements", href: "/admin/evenements" }}
        title={item.title}
        status={item.status}
        badges={past && item.date ? [`Passé · ${formatShortDate(item.date)}`] : []}
        publicHref={`/evenements/${item.slug}`}
        duplicate={{ action: duplicateEventAction, id: item.id }}
        notice={
          needsEventReport(item, today) ? (
            <p className="fiche-notice">
              <strong>Événement passé :</strong>
              <span>ajoutez les photos et le compte-rendu pour la page de l&apos;événement.</span>
              <a href="#photos">
                Ajouter les photos <span aria-hidden="true">→</span>
              </a>
            </p>
          ) : null
        }
      />
      <EvenementForm
        initialData={item}
        action={updateEventAction}
        themes={themes}
        archivedHiddenCount={archivedHiddenCount}
        initialThemeIds={initialThemeIds}
        subThemes={subThemes}
        initialSubThemeIds={initialSubThemeIds}
        projects={projects}
        initialProjectIds={initialProjectIds}
        activityFormats={activityFormats}
        initialFormatIds={initialFormatIds}
        authors={authors}
        initialAnimators={initialAnimators}
        images={images.filter((m) => m.type === "image")}
      />
    </section>
  );
}
