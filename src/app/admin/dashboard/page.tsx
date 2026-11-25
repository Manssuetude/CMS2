import Link from "next/link";
import { Check, ChevronDown, Plus } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";

// Tableau de bord : ce qui reste à faire (calculé à chaque chargement), ce qui
// est en ce moment sur le site, et quelques chiffres.

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const plural = (count: number, one: string, many: string) => (count > 1 ? many : one);

export default async function DashboardPage() {
  const { todo, todoTotal, liveAnnouncement, nextEvent, eventOfTheMoment, figures } =
    await dashboardService.getDashboard();

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <div>
          <h1>Tableau de bord</h1>
          <p>
            {todoTotal > 0
              ? `${todoTotal} ${plural(todoTotal, "chose", "choses")} à faire, rangées par priorité.`
              : "Rien à faire, tout est à jour."}
          </p>
        </div>
        <div className="dashboard-head-actions">
          <Link href="/admin/evenements/new" className="button primary">
            <Plus size={15} strokeWidth={2} aria-hidden="true" /> Nouvel événement
          </Link>
          <Link href="/admin/productions/new" className="button">
            <Plus size={15} strokeWidth={2} aria-hidden="true" /> Nouvelle production
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card" aria-labelledby="todo-title">
          <div className="dashboard-card-head">
            <h2 id="todo-title">À faire</h2>
            <span>Mis à jour automatiquement</span>
          </div>
          {todo.length === 0 ? (
            <p className="todo-empty">
              <span className="todo-count is-done" aria-hidden="true">
                <Check size={14} strokeWidth={2.5} />
              </span>
              Rien à faire, tout est à jour.
            </p>
          ) : (
            <ol className="todo-list">
              {todo.map((category, index) => (
                <li key={category.id}>
                  <details className="todo-category" open={index === 0}>
                    <summary>
                      <span className={`todo-count${index === 0 ? " is-first" : ""}`}>{category.items.length}</span>
                      <span className="todo-text">
                        <strong>{category.title}</strong>
                        <span>{category.description}</span>
                      </span>
                      <ChevronDown className="todo-chevron" size={18} strokeWidth={2} aria-hidden="true" />
                    </summary>
                    <ul className="todo-items">
                      {category.items.map((item) => (
                        <li key={`${category.id}-${item.id}`}>
                          <span className="todo-item-title">{item.title}</span>
                          <Link href={item.href}>
                            {category.actionLabel} <span aria-hidden="true">→</span>
                            <span className="sr-only"> : {item.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="dashboard-side">
          <section className="dashboard-card dashboard-now" aria-labelledby="now-title">
            <h2 id="now-title">En ce moment sur le site</h2>
            <div className="dashboard-now-block">
              <p className="dashboard-now-label is-live">{liveAnnouncement ? "Annonce en ligne" : "Annonce"}</p>
              {liveAnnouncement ? (
                <>
                  <p className="dashboard-now-title">{liveAnnouncement.name}</p>
                  <p className="dashboard-now-meta">
                    {liveAnnouncement.endsAt ? `Jusqu'au ${formatDate(liveAnnouncement.endsAt)} · ` : ""}
                    <Link href={`/admin/annonces/${liveAnnouncement.id}/edit`}>Modifier</Link>
                  </p>
                </>
              ) : (
                <p className="dashboard-now-meta">
                  Aucune annonce en ligne. <Link href="/admin/annonces">Voir les annonces</Link>
                </p>
              )}
            </div>
            <div className="dashboard-now-block">
              <p className="dashboard-now-label">Prochain événement</p>
              {nextEvent ? (
                <>
                  <p className="dashboard-now-title">{nextEvent.title}</p>
                  <p className="dashboard-now-meta">
                    {formatDate(nextEvent.date)} · <Link href={`/admin/evenements/${nextEvent.id}/edit`}>Modifier</Link>
                  </p>
                </>
              ) : (
                <>
                  <p className="dashboard-now-title">Aucun événement à venir n&apos;est publié.</p>
                  <p className="dashboard-now-meta">
                    <Link href="/admin/evenements/new">
                      Programmer le prochain <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </>
              )}
            </div>
            <div className="dashboard-now-block">
              <p className="dashboard-now-label">Événement du moment (accueil)</p>
              <p className="dashboard-now-title">{eventOfTheMoment ? eventOfTheMoment.title : "Aucun"}</p>
            </div>
          </section>

          <section className="dashboard-card" aria-label="Chiffres">
            <dl className="dashboard-figures">
              <div>
                <dt>{plural(figures.publishedProductions, "production publiée", "productions publiées")}</dt>
                <dd>{figures.publishedProductions}</dd>
              </div>
              <div>
                <dt>
                  {plural(figures.events, "événement", "événements")}, dont {figures.draftEvents}{" "}
                  {plural(figures.draftEvents, "brouillon", "brouillons")}
                </dt>
                <dd>{figures.events}</dd>
              </div>
              <div>
                <dt>{plural(figures.projects, "projet", "projets")}</dt>
                <dd>{figures.projects}</dd>
              </div>
              <div>
                <dt>{plural(figures.media, "média", "médias")}</dt>
                <dd>{figures.media}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
