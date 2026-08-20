"use client";

import { useState } from "react";
import { formClientService } from "@/services/formClientService";
import { HONEYPOT_FIELD_NAME } from "@/lib/honeypot";

type Fields = { name: string; email: string; subject: string; message: string; consent: boolean };
type Errors = Partial<Record<keyof Fields, string>>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [fields, setFields] = useState<Fields>({ name: "", email: "", subject: "", message: "", consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const e: Errors = {};
    if (!fields.name.trim()) e.name = "Indiquez votre nom.";
    if (!fields.email.trim()) e.email = "Indiquez votre email.";
    else if (!emailRe.test(fields.email)) e.email = "Email invalide.";
    if (!fields.message.trim()) e.message = "Écrivez votre message.";
    if (!fields.consent) e.consent = "Vous devez accepter pour envoyer.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    setSending(true);
    try {
      const formData = new FormData();
      formData.set("formType", "contact");
      formData.set("name", fields.name);
      formData.set("email", fields.email);
      formData.set("subject", fields.subject);
      formData.set("message", fields.message);
      formData.set(HONEYPOT_FIELD_NAME, "");
      await formClientService.submit(formData);
      setSent(true);
    } catch {
      setSubmitError("L'envoi a échoué. Réessayez, ou écrivez-nous directement par email.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="contact-success" role="status">
        <p className="eyebrow">Message envoyé</p>
        <h3>Merci, nous revenons vers vous.</h3>
        <p>Votre message a bien été pris en compte. L&apos;équipe de Manssuétude vous répondra rapidement.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="cf-name">Nom</label>
        <input
          id="cf-name"
          type="text"
          required
          aria-required="true"
          value={fields.name}
          onChange={(e) => setFields({ ...fields, name: e.target.value })}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "cf-name-error" : undefined}
        />
        {errors.name ? (
          <span className="field-error" id="cf-name-error">
            {errors.name}
          </span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          type="email"
          required
          aria-required="true"
          value={fields.email}
          onChange={(e) => setFields({ ...fields, email: e.target.value })}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "cf-email-error" : undefined}
        />
        {errors.email ? (
          <span className="field-error" id="cf-email-error">
            {errors.email}
          </span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="cf-subject">Sujet</label>
        <input
          id="cf-subject"
          type="text"
          value={fields.subject}
          onChange={(e) => setFields({ ...fields, subject: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          rows={6}
          required
          aria-required="true"
          value={fields.message}
          onChange={(e) => setFields({ ...fields, message: e.target.value })}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "cf-message-error" : undefined}
        />
        {errors.message ? (
          <span className="field-error" id="cf-message-error">
            {errors.message}
          </span>
        ) : null}
      </div>

      <div className="field-checkbox">
        <input
          id="cf-consent"
          type="checkbox"
          required
          aria-required="true"
          checked={fields.consent}
          onChange={(e) => setFields({ ...fields, consent: e.target.checked })}
          aria-invalid={!!errors.consent}
          aria-describedby={errors.consent ? "cf-consent-error" : undefined}
        />
        <label htmlFor="cf-consent">
          J&apos;accepte que mes informations soient utilisées pour être recontacté(e).
        </label>
      </div>
      <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer" className="field-hint-link">
        En savoir plus sur l&apos;utilisation de vos données
      </a>
      {errors.consent ? (
        <span className="field-error" id="cf-consent-error">
          {errors.consent}
        </span>
      ) : null}
      {submitError ? <span className="field-error">{submitError}</span> : null}

      <button className="button primary" type="submit" disabled={sending}>
        {sending ? "Envoi..." : "Envoyer le message"}
      </button>
    </form>
  );
}
