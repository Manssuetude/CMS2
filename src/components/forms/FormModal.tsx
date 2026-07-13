"use client";

import { useState } from "react";
import { formDefinitions, toSubmissionFormType, type PublicFormType } from "@/constants/forms";
import { formClientService } from "@/services/formClientService";

export function FormModal({ formType, onClose }: { formType: string; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const safeFormType = formType in formDefinitions ? (formType as PublicFormType) : "join";

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
          <p>Merci. Votre réponse a bien été enregistrée.</p>
        ) : (
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              submit(new FormData(event.currentTarget));
            }}
          >
            <input type="hidden" name="formType" value={toSubmissionFormType(safeFormType)} />
            {formDefinitions[safeFormType].map((field) => {
              if (field.type === "checkbox") {
                return (
                  <label key={field.name}>
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
            <button className="button primary" type="submit">
              Envoyer
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
