import { announcementService } from "@/services/announcementService";
import { dashboardRepository } from "@/repositories/dashboardRepository";
import { eventRepository } from "@/repositories/eventRepository";
import { pageRepository } from "@/repositories/pageRepository";
import { FORM_TYPE_LABEL } from "@/constants/forms";
import type { Announcement, Event } from "@/types/cms";
import { pickEventOfTheMoment } from "@/utils/eventOfTheMoment";
import { parisToday } from "@/utils/eventReport";
import { submissionSenderName } from "@/utils/formSubmission";
import { buildTodoList, todoCount, type TodoCategory, type TodoSources } from "@/utils/todo";

// Tableau de bord : « À faire » (règles pures dans utils/todo.ts),
// « En ce moment sur le site » et quelques chiffres.

export type DashboardData = {
  todo: TodoCategory[];
  todoTotal: number;
  liveAnnouncement: Announcement | null;
  nextEvent: Event | null;
  eventOfTheMoment: Event | null;
  figures: { publishedProductions: number; events: number; draftEvents: number; projects: number; media: number };
};

async function loadTodo(now: Date) {
  const sources = await dashboardRepository.getDashboardSources();
  const todoSources: TodoSources = {
    productions: sources.productions,
    events: sources.events,
    projects: sources.projects,
    forms: sources.forms.map((f) => ({
      id: f.id,
      status: f.status,
      label: `${FORM_TYPE_LABEL[f.formType] ?? f.formType} · ${submissionSenderName(f.data)}`,
    })),
  };
  return { sources, todo: buildTodoList(todoSources, now, parisToday(now)) };
}

export const dashboardService = {
  async getDashboard(now: Date = new Date()): Promise<DashboardData> {
    const [{ sources, todo }, liveAnnouncement, publishedEvents, homePage] = await Promise.all([
      loadTodo(now),
      announcementService.getLive(now),
      eventRepository.listEvents(),
      pageRepository.getPage("accueil").catch(() => null),
    ]);
    const today = parisToday(now);
    const nextEvent =
      publishedEvents
        .filter((e) => e.date && e.date.slice(0, 10) >= today)
        .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))[0] ?? null;
    const fallback = homePage?.featuredEventId
      ? (publishedEvents.find((e) => e.id === homePage.featuredEventId) ?? null)
      : null;
    return {
      todo,
      todoTotal: todoCount(todo),
      liveAnnouncement,
      nextEvent,
      eventOfTheMoment: pickEventOfTheMoment(publishedEvents, fallback, now),
      figures: {
        publishedProductions: sources.productions.filter((p) => p.status === "published").length,
        events: sources.events.length,
        draftEvents: sources.events.filter((e) => e.status === "draft").length,
        projects: sources.projects.length,
        media: sources.mediaCount,
      },
    };
  },

  /** Nombre de choses à faire (compteur du menu). */
  async getTodoCount(now: Date = new Date()): Promise<number> {
    return todoCount((await loadTodo(now)).todo);
  },
};
