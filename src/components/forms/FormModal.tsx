"use client";

import { useState } from "react";
import { formDefinitions, toSubmissionFormType, type PublicFormType } from "@/constants/forms";
import { formClientService } from "@/services/formClientService";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";

// Message affiché après envoi — plus détaillé pour la candidature (chapitre 8
// du plan V2 : "page de confirmation expliquant la suite"), générique sinon.
const SUCCESS_MESSAGES: Partial<Record<PublicFormType, string>> = {
  join: "Merci pour votre candidature ! L'équipe Manssuétude va l'étudier et reviendra vers vous par email sous 1 à 2 semaines pour vous proposer un premier échange. Vous recevez aussi un email de confirmation.",
};
const DEFAULT_SUCCESS_MESSAGE =
  "Merci. Votre réponse a bien été enregistrée. Vous recevez aussi un email de confirmation.";

export function FormModal({
  formType,
  onClose,
  contextFields,
}: {
  formType: string;
  onClose: () => void;
  // Valeurs de contexte (ex. thème parent) injectées en champs cachés plutôt
  // que saisies par le visiteur — voir ProposeSection/CtaButton. Doivent
  // correspondre à des noms de champs déclarés dans formDefinitions pour ce
  // type, afin d'être exclues de la liste des champs visibles ci-dessous et
  // de bénéficier du même libellé français côté admin.
  contextFields?: Record<string, string>;
}) {
  const [sent, setSent] = useState(false);
  const safeFormType = formType in formDefinitions ? (formType as PublicFormType) : "join";
  const visibleFields = formDefinitions[safeFormType].filter(
    (field) => !contextFields || !(field.name in contextFields),
  );

  async function submit(formData: FormData) {
    await formClientService.submit(formData);
    setSent(true);
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
        <button type="button" className="button" onClick={onClose}>
          Fermer
        </button>
        <p className="eyebrow">Formulaire Manssuétude</p>
        <h2 id="form-title">{formType === "don" ? "Faire un don" : "Envoyer une demande"}</h2>
        {sent ? (
          <p>{SUCCESS_MESSAGES[safeFormType] ?? DEFAULT_SUCCESS_MESSAGE}</p>
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
            <button className="button primary" type="submit">
              Envoyer
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
