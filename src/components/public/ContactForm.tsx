"use client";

import { useState } from "react";

type Fields = { name: string; email: string; subject: string; message: string; consent: boolean };
type Errors = Partial<Record<keyof Fields, string>>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [fields, setFields] = useState<Fields>({ name: "", email: "", subject: "", message: "", consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

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

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    // NOTE (E4) : brancher l'envoi réel sur l'admin (POST /api/forms, type "contact"
    // à ajouter à l'enum form_type + destinataire). Pour l'instant : confirmation UI.
    setSent(true);
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
          value={fields.name}
          onChange={(e) => setFields({ ...fields, name: e.target.value })}
          aria-invalid={!!errors.name}
        />
        {errors.name ? <span className="field-error">{errors.name}</span> : null}
      </div>

      <div className="field">
        <label htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          type="email"
          value={fields.email}
          onChange={(e) => setFields({ ...fields, email: e.target.value })}
          aria-invalid={!!errors.email}
        />
        {errors.email ? <span className="field-error">{errors.email}</span> : null}
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
          value={fields.message}
          onChange={(e) => setFields({ ...fields, message: e.target.value })}
          aria-invalid={!!errors.message}
        />
        {errors.message ? <span className="field-error">{errors.message}</span> : null}
      </div>

      <div className="field-checkbox">
        <input
          id="cf-consent"
          type="checkbox"
          checked={fields.consent}
          onChange={(e) => setFields({ ...fields, consent: e.target.checked })}
          aria-invalid={!!errors.consent}
        />
        <label htmlFor="cf-consent">
          J&apos;accepte que mes informations soient utilisées pour être recontacté(e).
        </label>
      </div>
      {errors.consent ? <span className="field-error">{errors.consent}</span> : null}

      <button className="button primary" type="submit">
        Envoyer le message
      </button>
    </form>
  );
}
