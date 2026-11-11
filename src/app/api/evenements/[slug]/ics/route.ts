import { eventRepository } from "@/repositories/eventRepository";
import { AppError, errorResponse } from "@/lib/errors";
import { SITE_URL } from "@/constants/site";
import { buildIcs } from "@/utils/ics";

// « Ajouter à mon agenda » (page événement) : fichier .ics d'un événement
// publié et daté. Mis en cache comme les pages publiques (ISR 60 s).
export const revalidate = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const events = await eventRepository.listEvents(false);
    const item = events.find((event) => event.slug === slug);
    if (!item || !item.date) throw new AppError("Événement introuvable.", 404, "EVENT_NOT_FOUND");
    const ics = buildIcs({
      uid: `${item.id}@manssuetude.com`,
      title: item.title,
      description: item.description,
      location: item.location,
      url: `${SITE_URL}/evenements/${item.slug}`,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
    });
    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${item.slug}.ics"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
