import Link from "next/link";
import { CalendarDays, FileText, FolderKanban, Inbox, Clock, ArrowRight } from "lucide-react";
import { contentRepository } from "@/repositories/contentRepository";

const STATUS_LABEL: Record<string, string> = {
  published: "Publié",
  draft: "Brouillon",
  archived: "Archivé",
};

const FORM_TYPE_LABEL: Record<string, string> = {
  join: "Adhésion",
  project: "Projet",
  content: "Contenu",
  partner: "Partenariat",
  donation: "Don",
};

export default async function DashboardPage() {
  const { activities, productions, projects, forms } = await contentRepository.getMetrics();

  const now = new Date();

  const actPublished = activities.filter((a) => a.status === "published").length;
  const actDraft = activities.filter((a) => a.status === "draft").length;
  const actUpcoming = activities.filter((a) => a.date && new Date(a.date) >= now).length;

  const prodPublished = productions.filter((p) => p.status === "published").length;
  const prodDraft = productions.filter((p) => p.status === "draft").length;

  const projTotal = projects.length;
  const projDraft = projects.filter((p) => p.status === "draft").length;

  const formsNew = forms.filter((f) => f.status === "reçu").length;
  const formsTotal = forms.length;

  const recent = [
    ...activities.slice(0, 6).map((a) => ({ ...a, type: "Activité", href: `/admin/activites/${a.id}/edit` })),
    ...productions.slice(0, 6).map((p) => ({ ...p, type: "Production", href: `/admin/productions/${p.id}/edit` })),
    ...projects.slice(0, 6).map((p) => ({ ...p, type: "Projet", href: `/admin/projets/${p.id}/edit` })),
  ]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);

  const upcoming = activities
    .filter((a) => a.date && new Date(a.date) >= now)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 5);

  const pendingForms = forms.filter((f) => f.status === "reçu").slice(0, 5);

  return (
    <div style={{ maxWidth: 1100, marginLeft: "auto", marginRight: "auto" }}>
      {/* Metrics */}
      <div className="admin-metrics">
        <Link href="/admin/activites" className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-label">Activités</div>
              <div className="metric-card-count">{actPublished + actDraft}</div>
            </div>
            <div className="metric-icon orange">
              <CalendarDays size={18} strokeWidth={1.75} />
            </div>
          </div>
          <div className={`metric-card-sub${actUpcoming > 0 ? " alert" : ""}`}>
            {actUpcoming > 0 ? `${actUpcoming} à venir` : "Aucune à venir"} &middot; {actDraft} brouillon
            {actDraft !== 1 ? "s" : ""}
          </div>
        </Link>

        <Link href="/admin/productions" className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-label">Productions</div>
              <div className="metric-card-count">{prodPublished + prodDraft}</div>
            </div>
            <div className="metric-icon blue">
              <FileText size={18} strokeWidth={1.75} />
            </div>
          </div>
          <div className="metric-card-sub">
            {prodPublished} publiée{prodPublished !== 1 ? "s" : ""} &middot; {prodDraft} brouillon
            {prodDraft !== 1 ? "s" : ""}
          </div>
        </Link>

        <Link href="/admin/projets" className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-label">Projets</div>
              <div className="metric-card-count">{projTotal}</div>
            </div>
            <div className="metric-icon purple">
              <FolderKanban size={18} strokeWidth={1.75} />
            </div>
          </div>
          <div className="metric-card-sub">
            {projDraft} brouillon{projDraft !== 1 ? "s" : ""}
          </div>
        </Link>

        <Link href="/admin/forms" className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-label">Formulaires</div>
              <div className="metric-card-count">{formsTotal}</div>
            </div>
            <div className="metric-icon amber">
              <Inbox size={18} strokeWidth={1.75} />
            </div>
          </div>
          <div className={`metric-card-sub${formsNew > 0 ? " alert" : ""}`}>
            {formsNew > 0 ? `${formsNew} non traité${formsNew !== 1 ? "s" : ""}` : "Tous traités"}
          </div>
        </Link>
      </div>

      {/* Recent content */}
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <h2 className="admin-section-card-title">
            <Clock size={13} />
            Contenus récents
          </h2>
        </div>
        {recent.length === 0 ? (
          <div className="admin-empty">
            <p>Aucun contenu pour l&apos;instant.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Modifié le</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td className="col-title">{item.title}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{item.type}</td>
                  <td>
                    <span className={`badge-status badge-${item.status}`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {new Date(item.updated_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <Link href={item.href} className="btn-sm">
                      <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upcoming activities */}
      {upcoming.length > 0 && (
        <div className="admin-section-card">
          <div className="admin-section-card-header">
            <h2 className="admin-section-card-title">
              <CalendarDays size={13} />
              Prochaines activités
            </h2>
            <Link href="/admin/activites/calendar" className="btn-sm">
              Calendrier
            </Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Activité</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((a) => (
                <tr key={a.id}>
                  <td className="col-title">
                    <Link href={`/admin/activites/${a.id}/edit`} style={{ color: "inherit" }}>
                      {a.title}
                    </Link>
                  </td>
                  <td style={{ fontSize: 13, color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {new Date(a.date!).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                    })}
                  </td>
                  <td>
                    <span className={`badge-status badge-${a.status}`}>{STATUS_LABEL[a.status] ?? a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending forms */}
      {pendingForms.length > 0 && (
        <div className="admin-section-card">
          <div className="admin-section-card-header">
            <h2 className="admin-section-card-title">
              <Inbox size={13} />
              Formulaires en attente
            </h2>
            <Link href="/admin/forms" className="btn-sm">
              Voir tout
            </Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Type</th>
                <th>Reçu le</th>
              </tr>
            </thead>
            <tbody>
              {pendingForms.map((f) => (
                <tr key={f.id}>
                  <td className="col-title">{String(f.data?.name ?? f.data?.email ?? "Anonyme")}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{FORM_TYPE_LABEL[f.form_type] ?? f.form_type}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {new Date(f.received_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
