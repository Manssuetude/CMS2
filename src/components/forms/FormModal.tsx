"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { formDefinitions, toSubmissionFormType, type PublicFormType } from "@/constants/forms";
import { formClientService } from "@/services/formClientService";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";

// Message affiché après envoi, adapté à ce que le visiteur peut réellement
// attendre ensuite : un vrai échange à venir pour les demandes qui en
// nécessitent un (candidature, partenariat, don, contribution production,
// contact), une simple prise en compte éditoriale pour les propositions qui
// alimentent un contenu existant (thème, sous-thème, événement, activité,
// contenu). Toujours complété par l'email de confirmation (src/lib/email.ts).
const SUCCESS_MESSAGES: Record<PublicFormType, string> = {
  join: "Merci pour votre candidature ! L'équipe Manssuétude va l'étudier et reviendra vers vous par email sous 1 à 2 semaines pour vous proposer un premier échange.",
  project:
    "Merci pour votre proposition de projet ! Quelqu'un de l'équipe va l'étudier et reviendra vers vous par email pour en discuter.",
  content: "Merci pour votre contribution ! Elle est prise en compte et sera étudiée par l'équipe éditoriale.",
  partner:
    "Merci pour votre demande de partenariat ! Quelqu'un de l'équipe vous recontactera par email pour en discuter.",
  don: "Merci pour votre message ! Quelqu'un de l'équipe vous recontactera par email pour organiser votre don.",
  theme: "Merci pour votre proposition de thème ! Elle est prise en compte et sera étudiée par l'équipe éditoriale.",
  sub_theme:
    "Merci pour votre proposition de sous-thème ! Elle est prise en compte et sera étudiée par l'équipe éditoriale.",
  event: "Merci pour votre proposition d'événement ! Elle est prise en compte et sera étudiée par l'équipe.",
  activity: "Merci pour votre proposition d'activité ! Elle est prise en compte et sera étudiée par l'équipe.",
  production: "Merci pour votre contribution ! Quelqu'un de l'équipe vous recontactera par email pour en discuter.",
  contact: "Merci pour votre message ! Nous vous répondrons par email dans les meilleurs délais.",
};

export function FormModal({
  formType,
  onClose,
  contextFields,
  selectOptions,
}: {
  formType: string;
  onClose: () => void;
  // Valeurs de contexte (ex. thème parent) injectées en champs cachés plutôt
  // que saisies par le visiteur — voir ProposeSection/CtaButton. Doivent
  // correspondre à des noms de champs déclarés dans formDefinitions pour ce
  // type, afin d'être exclues de la liste des champs visibles ci-dessous et
  // de bénéficier du même libellé français côté admin.
  contextFields?: Record<string, string>;
  // Options réelles (contenu de la base, ex. liste des sous-thèmes) pour un
  // champ de type "select" — clé = nom du champ dans formDefinitions.
  selectOptions?: Record<string, string[]>;
}) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const safeFormType = formType in formDefinitions ? (formType as PublicFormType) : "join";
  const visibleFields = formDefinitions[safeFormType].filter(
    (field) => !contextFields || !(field.name in contextFields),
  );

  async function submit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      await formClientService.submit(formData);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Merci de réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <p className="eyebrow">Formulaire Manssuétude</p>
          <button type="button" className="button" onClick={onClose}>
            Fermer
          </button>
        </div>
        <h2 id="form-title">
          {sent ? "Demande envoyée" : formType === "don" ? "Faire un don" : "Envoyer une demande"}
        </h2>
        {sent ? (
          <div className="modal-success">
            <span className="modal-success-icon" aria-hidden>
              <Check size={22} strokeWidth={2.5} />
            </span>
            <p>{SUCCESS_MESSAGES[safeFormType]}</p>
            <p className="modal-success-note">Vous recevez aussi un email de confirmation.</p>
          </div>
        ) : (
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              submit(new FormData(event.currentTarget));
            }}
          >
            <input type="hidden" name="formType" value={toSubmissionFormType(safeFormType)} />
            {/* Honeypot anti-spam : champ invisible pour un visiteur humain, souvent
                rempli automatiquement par les bots. Une valeur ici = soumission rejetée
                silencieusement côté serveur (voir /api/forms). */}
            <input
              type="text"
              name="website"
              className="honeypot-field"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            {contextFields &&
              Object.entries(contextFields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
            {visibleFields.map((field) => {
              if (field.type === "checkbox") {
                return (
                  <div key={field.name} style={{ gridColumn: "1 / -1" }}>
                    <label>
                      {field.hint ? (
                        <span className="hint-tip" tabIndex={0} aria-label={field.hint}>
                          {field.label}
                          {field.required ? <span className="required-mark">*</span> : null}
                          <span className="hint-tip__bubble" role="tooltip">
                            {field.hint}
                          </span>
                        </span>
                      ) : (
                        <span>
                          {field.label}
                          {field.required ? <span className="required-mark">*</span> : null}
                        </span>
                      )}
                      <input name={field.name} type="checkbox" required={field.required} />
                    </label>
                    {field.name === "consent" ? (
                      <a
                        href="/politique-de-confidentialite"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="field-hint-link"
                      >
                        En savoir plus sur l&apos;utilisation de vos données
                      </a>
                    ) : null}
                  </div>
                );
              }
              if (field.type === "textarea") {
                return (
                  <label key={field.name} style={{ gridColumn: "1 / -1" }}>
                    <span>
                      {field.label}
                      {field.required ? <span className="required-mark">*</span> : null}
                    </span>
                    <textarea name={field.name} required={field.required} rows={6} placeholder={field.hint} />
                  </label>
                );
              }
              if (field.type === "select") {
                const options = selectOptions?.[field.name] ?? [];
                return (
                  <label key={field.name}>
                    <span>
                      {field.label}
                      {field.required ? <span className="required-mark">*</span> : null}
                    </span>
                    <select name={field.name} required={field.required} defaultValue="">
                      <option value="" disabled={field.required}>
                        Choisir...
                      </option>
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }
              return (
                <label key={field.name}>
                  <span>
                    {field.label}
                    {field.required ? <span className="required-mark">*</span> : null}
                  </span>
                  <input name={field.name} type={field.type} required={field.required} />
                </label>
              );
            })}
            <TurnstileWidget />
            {error && (
              <p className="field-error" style={{ gridColumn: "1 / -1" }}>
                {error}
              </p>
            )}
            <button className="button primary" type="submit" disabled={submitting}>
              {submitting ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
