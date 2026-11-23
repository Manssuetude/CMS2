import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { formSubmissionRepository } from "@/repositories/formSubmissionRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { formDefinitions, FORM_TYPE_LABEL, type PublicFormType } from "@/constants/forms";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import {
  isPendingSubmission,
  matchesInboxFilter,
  resolveInboxFilter,
  submissionEmail,
  submissionExcerpt,
  submissionSenderName,
  type InboxFilter,
} from "@/utils/formSubmission";
import {
  deleteFormSubmissionAction,
  saveFormNoteAction,
  setFormHandledAction,
  updateFormDigestSettingsAction,
} from "./actions";

// Formulaires reçus en boîte de réception : liste filtrable à gauche
// (À traiter, Traités, Tous), message complet à droite avec note interne.

const FILTERS: Array<{ id: InboxFilter; label: string }> = [
  { id: "a-traiter", label: "À traiter" },
  { id: "traites", label: "Traités" },
  { id: "tous", label: "Tous" },
];

// Champs techniques jamais affichés dans le détail (consentement, pot de miel,
// jeton anti-robot).
const HIDDEN_FIELDS = new Set(["consent", "website", "cf-turnstile-response"]);

function fieldLabel(formType: string, key: string): string {
  const type = (formType === "donation" ? "don" : formType) as PublicFormType;
  return formDefinitions[type]?.find((field) => field.name === key)?.label ?? key;
}

function formatDate(value: string, withYear = true): string {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

function fieldValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  return String(value);
}

export default async function AdminFormsPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string; message?: string }>;
}) {
  const { filtre, message } = await searchParams;
  const filter = resolveInboxFilter(filtre);
  const [all, digestSettings] = await Promise.all([
    formSubmissionRepository.listFormSubmissions(),
    siteSettingsRepository.getFormDigestSettings(),
  ]);
  const counts = {
    "a-traiter": all.filter((f) => isPendingSubmission(f.status)).length,
    traites: all.filter((f) => !isPendingSubmission(f.status)).length,
    tous: all.length,
  };
  const list = all.filter((f) => matchesInboxFilter(f.status, filter));
  const selected = all.find((f) => f.id === message) ?? list[0] ?? null;
  const hrefFor = (params: { filtre?: InboxFilter; message?: string }) => {
    const query = new URLSearchParams();
    const nextFilter = params.filtre ?? filter;
    if (nextFilter !== "a-traiter") query.set("filtre", nextFilter);
    if (params.message) query.set("message", params.message);
    const qs = query.toString();
    return `/admin/forms${qs ? `?${qs}` : ""}`;
  };

  const email = selected ? submissionEmail(selected.data) : null;
  const pending = selected ? isPendingSubmission(selected.status) : false;
  const fields = selected
    ? Object.entries(selected.data).filter(
        ([key, value]) => !HIDDEN_FIELDS.has(key) && value !== "" && value != null && key !== "email",
      )
    : [];

  return (
    <section className="admin-panel">
      <div className="inbox-top">
        <a className="button" href="/api/forms/export" download>
          <Download size={15} strokeWidth={1.75} aria-hidden="true" />
          Exporter CSV
        </a>
        <a href="#notifications" className="inbox-settings-link">
          Réglages des notifications
        </a>
      </div>

      <div className="inbox">
        <div className="inbox-list">
          <h1>Formulaires reçus</h1>
          <nav className="inbox-filters" aria-label="Filtrer les messages">
            {FILTERS.map((f) => (
              <Link
                key={f.id}
                href={hrefFor({ filtre: f.id })}
                className={`filter-chip${filter === f.id ? " active" : ""}`}
                aria-current={filter === f.id ? "page" : undefined}
              >
                {f.label} ({counts[f.id]})
              </Link>
            ))}
          </nav>
          {list.length === 0 ? (
            <p className="inbox-empty">
              {filter === "a-traiter" ? "Aucun message à traiter. Tout est à jour." : "Aucun message."}
            </p>
          ) : (
            <ul>
              {list.map((f) => {
                const isSelected = selected?.id === f.id;
                return (
                  <li key={f.id}>
                    <Link
                      href={hrefFor({ message: f.id })}
                      className={`inbox-item${isSelected ? " is-selected" : ""}`}
                      aria-current={isSelected ? "true" : undefined}
                    >
                      <span
                        className={`inbox-dot${isPendingSubmission(f.status) ? " is-pending" : ""}`}
                        aria-hidden="true"
                      />
                      <span className="inbox-item-text">
                        <span className="inbox-item-name">{submissionSenderName(f.data)}</span>
                        <span className={`inbox-type inbox-type--${f.formType}`}>
                          {FORM_TYPE_LABEL[f.formType] ?? f.formType}
                        </span>
                        <span className="inbox-item-excerpt">{submissionExcerpt(f.data)}</span>
                      </span>
                      <span className="inbox-item-date">{formatDate(f.receivedAt, false)}</span>
                      {isPendingSubmission(f.status) && <span className="sr-only">(à traiter)</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="inbox-detail">
          {selected ? (
            <article aria-labelledby="inbox-detail-name">
              <div className="inbox-detail-head">
                <div>
                  <p className={`inbox-type inbox-type--${selected.formType}`}>
                    {FORM_TYPE_LABEL[selected.formType] ?? selected.formType}
                  </p>
                  <h2 id="inbox-detail-name">{submissionSenderName(selected.data)}</h2>
                  <p className="inbox-detail-meta">
                    {email ?? "Sans adresse e-mail"} · reçu le {formatDate(selected.receivedAt)}
                  </p>
                </div>
                <span className={`inbox-status${pending ? " is-pending" : ""}`}>
                  {pending ? "À traiter" : "Traité"}
                </span>
              </div>

              <dl className="inbox-fields">
                {fields.map(([key, value]) => (
                  <div key={key}>
                    <dt>{fieldLabel(selected.formType, key)}</dt>
                    <dd>
                      {typeof value === "string" && /^https?:\/\//.test(value) ? (
                        <a href={value} target="_blank" rel="noopener noreferrer">
                          Ouvrir le fichier
                        </a>
                      ) : (
                        fieldValue(value)
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <form action={saveFormNoteAction} className="inbox-note">
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="filtre" value={filter === "a-traiter" ? "" : filter} />
                <label className="field-label" htmlFor="inbox-note">
                  Note interne
                </label>
                <p className="field-hint" id="inbox-note-hint">
                  Visible seulement dans l&apos;admin : qui s&apos;en occupe, ce qui a été répondu.
                </p>
                <textarea
                  id="inbox-note"
                  name="notes"
                  rows={3}
                  defaultValue={selected.notes ?? ""}
                  aria-describedby="inbox-note-hint"
                  placeholder="Ex. : rappelée le 25/11, invitée à la prochaine séance"
                />
                <button type="submit" className="button">
                  Enregistrer la note
                </button>
              </form>

              <div className="inbox-actions">
                <form action={setFormHandledAction}>
                  <input type="hidden" name="id" value={selected.id} />
                  <input type="hidden" name="handled" value={pending ? "true" : "false"} />
                  <input type="hidden" name="filtre" value={filter === "a-traiter" ? "" : filter} />
                  <button type="submit" className={pending ? "button primary" : "button"}>
                    {pending ? "Marquer comme traité" : "Remettre à traiter"}
                  </button>
                </form>
                {email && (
                  <a className="button" href={`mailto:${email}`}>
                    <Mail size={15} strokeWidth={1.75} aria-hidden="true" />
                    Répondre par e-mail
                  </a>
                )}
                <form action={deleteFormSubmissionAction} className="inbox-delete">
                  <input type="hidden" name="id" value={selected.id} />
                  <input type="hidden" name="filtre" value={filter === "a-traiter" ? "" : filter} />
                  <ConfirmDeleteButton />
                </form>
              </div>
            </article>
          ) : (
            <p className="inbox-empty">Sélectionnez un message pour l&apos;afficher.</p>
          )}
        </div>
      </div>

      <div id="notifications" style={{ marginTop: 24 }}>
        <div className="form-section">
          <p className="form-section-title">Notifications</p>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: -8, marginBottom: 16 }}>
            Un email récapitulatif des nouvelles inscriptions (toutes origines confondues) est envoyé automatiquement,
            avec un lien pour télécharger le détail en CSV, valable 14 jours. Rien n&apos;est envoyé s&apos;il n&apos;y
            a aucune nouvelle inscription depuis le dernier email.
          </p>
          <form action={updateFormDigestSettingsAction}>
            <div className="form-row">
              <div className="form-field">
                <label className="field-label" htmlFor="recipientEmail">
                  Adresse destinataire
                </label>
                <input
                  id="recipientEmail"
                  type="email"
                  name="recipientEmail"
                  defaultValue={digestSettings.recipientEmail}
                  required
                />
              </div>
              <div className="form-field" style={{ maxWidth: 220 }}>
                <label className="field-label" htmlFor="intervalDays">
                  Intervalle entre deux emails (jours)
                </label>
                <input
                  id="intervalDays"
                  type="number"
                  name="intervalDays"
                  defaultValue={digestSettings.intervalDays}
                  min={1}
                  required
                />
              </div>
            </div>
            <button type="submit" className="button" style={{ marginTop: 8 }}>
              Enregistrer
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
